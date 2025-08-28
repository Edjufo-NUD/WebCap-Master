import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import Sidebar from "../Admin/Sidebar";
import "./DanceUpload.css";
import { supabase } from "../supabasebaseClient"; // Import supabase client

const DanceUpload = () => {
  const navigate = useNavigate(); // Add this hook
  const [activeItem, setActiveItem] = useState("dance-upload");
  const [formData, setFormData] = useState({
    title: "",
    history: "",
    description: "",
    region: "" // Added region field
  });
  const [previewVideo, setPreviewVideo] = useState(null);
  const [figureVideos, setFigureVideos] = useState([]);
  const [danceImage, setDanceImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add loading state

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (file, type) => {
    const fileUrl = URL.createObjectURL(file);
    
    switch (type) {
      case 'preview':
        setPreviewVideo({ file, url: fileUrl, name: file.name, size: formatFileSize(file.size) });
        break;
      case 'figures':
        const newFigure = { 
          id: Date.now(), 
          file, 
          url: fileUrl, 
          name: file.name, 
          size: formatFileSize(file.size) 
        };
        setFigureVideos(prev => [...prev, newFigure]);
        break;
      case 'image':
        setDanceImage({ file, url: fileUrl, name: file.name, size: formatFileSize(file.size) });
        break;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFigureVideo = (id) => {
    setFigureVideos(prev => prev.filter(video => video.id !== id));
  };

  const removePreviewVideo = () => {
    if (previewVideo) {
      URL.revokeObjectURL(previewVideo.url);
      setPreviewVideo(null);
    }
  };

  const removeDanceImage = () => {
    if (danceImage) {
      URL.revokeObjectURL(danceImage.url);
      setDanceImage(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    
    if (type === 'figures') {
      files.forEach(file => {
        if (file.type.startsWith('video/')) {
          handleFileUpload(file, type);
        }
      });
    } else {
      const file = files[0];
      if (file) {
        if (type === 'preview' && file.type.startsWith('video/')) {
          handleFileUpload(file, type);
        } else if (type === 'image' && file.type.startsWith('image/')) {
          handleFileUpload(file, type);
        }
      }
    }
  };

  const saveDanceToStorage = (danceData) => {
    // Get existing dances from localStorage
    const existingDances = JSON.parse(localStorage.getItem('uploadedDances') || '[]');
    
    // Add new dance to the array
    const updatedDances = [...existingDances, danceData];
    
    // Save back to localStorage
    localStorage.setItem('uploadedDances', JSON.stringify(updatedDances));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.region) {
        alert('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Create dance object with all data
      const danceData = {
        id: Date.now(), // Simple ID generation
        title: formData.title,
        history: formData.history,
        description: formData.description,
        region: formData.region,
        previewVideo: previewVideo,
        figureVideos: figureVideos,
        image: danceImage,
        uploadDate: new Date().toISOString(),
        status: 'uploaded'
      };

      // Log the data (in real app, this would be sent to backend)
      console.log('Uploading dance:', danceData);

      // 1. Upload main video
      const mainVideoUpload = await supabase.storage.from('dances').upload(`public/${danceData.id}_main.mp4`, previewVideo.file);
      const mainVideoUrl = supabase.storage.from('dances').getPublicUrl(mainVideoUpload.data.path).data.publicUrl;

      // 2. Upload figure videos
      const figureVideoFiles = danceData.figureVideos.map(video => video.file);
      const figureVideoUrls = [];
      for (const file of figureVideoFiles) {
        const upload = await supabase.storage.from('dances').upload(`public/${danceData.id}_figure_${file.name}`, file);
        figureVideoUrls.push(supabase.storage.from('dances').getPublicUrl(upload.data.path).data.publicUrl);
      }

      // 3. Upload images
      const imageFiles = [danceData.image.file];
      const imageUrls = [];
      for (const file of imageFiles) {
        const upload = await supabase.storage.from('dances').upload(`public/${danceData.id}_image_${file.name}`, file);
        imageUrls.push(supabase.storage.from('dances').getPublicUrl(upload.data.path).data.publicUrl);
      }

      // 4. Insert dance record
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      const { data: dance } = await supabase.from('dances').insert([{
        user_id: userId,
        title: danceData.title,
        history: danceData.history,
        description: danceData.description,
        region: danceData.region,
        preview_video_url: mainVideoUrl,
        island: danceData.region,
      }]).select().single();

      // 5. Insert figure videos
      for (let i = 0; i < figureVideoUrls.length; i++) {
        await supabase.from('dance_figures').insert([{
          dance_id: dance.id,
          video_url: figureVideoUrls[i],
          figure_number: i + 1
        }]);
      }

      // 6. Insert images
      for (let i = 0; i < imageUrls.length; i++) {
        await supabase.from('dance_images').insert([{
          dance_id: dance.id,
          image_url: imageUrls[i],
          position: i,
        }]);
      }

      // Show success message
      alert('Dance uploaded successfully!');

      // Navigate to ManageDance page
      navigate('/manage-dance');

    } catch (error) {
      console.error('Upload error:', error);
      alert('There was an error uploading the dance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dance-upload-container">
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      
      <div className="dance-upload-content">
        <h1 className="dance-upload-title">Upload Dance</h1>
        
        <form className="dance-upload-form" onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <div className="form-section">
            <h2 className="form-section-title">
              Dance Information
            </h2>
            
            <div className="form-group">
              <label className="form-label" htmlFor="title">Dance Title</label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-input"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter the dance title"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="region">Island</label>
              <select
                id="region"
                name="region"
                className="form-select"
                value={formData.region}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              >
                <option value="">Select an island</option>
                <option value="luzon">Luzon</option>
                <option value="visayas">Visayas</option>
                <option value="mindanao">Mindanao</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="history">History</label>
              <textarea
                id="history"
                name="history"
                className="form-textarea"
                value={formData.history}
                onChange={handleInputChange}
                placeholder="Tell us about the history and origins of this dance"
                rows="4"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                className="form-textarea"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the dance, its characteristics, and techniques"
                rows="4"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Video Preview Section */}
          <div className="form-section">
            <h2 className="form-section-title">
              Video Preview
            </h2>
            
            <div
              className="upload-area"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'preview')}
              onClick={() => !isSubmitting && document.getElementById('preview-video-input').click()}
            >
              <div className="upload-icon">Video</div>
              <div className="upload-text">Upload Preview Video</div>
              <div className="upload-subtext">Drag and drop a video file or click to browse</div>
            </div>
            
            <input
              type="file"
              id="preview-video-input"
              className="file-input"
              accept="video/*"
              onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'preview')}
              disabled={isSubmitting}
            />

            {previewVideo && (
              <div className="uploaded-files">
                <div className="file-item">
                  <div className="file-info">
                    <span className="file-name">{previewVideo.name}</span>
                    <span className="file-size">{previewVideo.size}</span>
                  </div>
                  <button 
                    type="button" 
                    className="remove-file-btn" 
                    onClick={removePreviewVideo}
                    disabled={isSubmitting}
                  >
                    Remove
                  </button>
                </div>
                <video className="video-preview" controls>
                  <source src={previewVideo.url} type={previewVideo.file.type} />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>

          {/* Upload Figures Section */}
          <div className="form-section">
            <h2 className="form-section-title">
              Upload Figures
            </h2>
            
            <div
              className="upload-area"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'figures')}
              onClick={() => !isSubmitting && document.getElementById('figures-input').click()}
            >
              <div className="upload-icon">Videos</div>
              <div className="upload-text">Upload Figure Videos</div>
              <div className="upload-subtext">Drag and drop multiple video files or click to browse</div>
            </div>
            
            <input
              type="file"
              id="figures-input"
              className="file-input"
              accept="video/*"
              multiple
              onChange={(e) => {
                Array.from(e.target.files).forEach(file => handleFileUpload(file, 'figures'));
              }}
              disabled={isSubmitting}
            />

            {figureVideos.length > 0 && (
              <div className="figures-grid">
                {figureVideos.map((video) => (
                  <div key={video.id} className="figure-item">
                    <button
                      type="button"
                      className="figure-remove-btn"
                      onClick={() => removeFigureVideo(video.id)}
                      title="Remove video"
                      disabled={isSubmitting}
                    >
                      ×
                    </button>
                    <video className="figure-video" controls>
                      <source src={video.url} type={video.file.type} />
                    </video>
                    <div className="file-info">
                      <div className="file-name">{video.name}</div>
                      <div className="file-size">{video.size}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload Image Section */}
          <div className="form-section">
            <h2 className="form-section-title">
              Upload Image
            </h2>
            
            <div
              className="upload-area"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'image')}
              onClick={() => !isSubmitting && document.getElementById('image-input').click()}
            >
              <div className="upload-icon">Image</div>
              <div className="upload-text">Upload Dance Image</div>
              <div className="upload-subtext">Drag and drop an image file or click to browse</div>
            </div>
            
            <input
              type="file"
              id="image-input"
              className="file-input"
              accept="image/*"
              onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'image')}
              disabled={isSubmitting}
            />

            {danceImage && (
              <div className="uploaded-files">
                <div className="file-item">
                  <div className="file-info">
                    <span className="file-name">{danceImage.name}</span>
                    <span className="file-size">{danceImage.size}</span>
                  </div>
                  <button 
                    type="button" 
                    className="remove-file-btn" 
                    onClick={removeDanceImage}
                    disabled={isSubmitting}
                  >
                    Remove
                  </button>
                </div>
                <img className="image-preview" src={danceImage.url} alt="Dance preview" />
              </div>
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Uploading...' : 'Upload Dance'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DanceUpload;