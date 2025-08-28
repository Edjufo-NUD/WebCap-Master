import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Admin/Sidebar";
import "./DanceUpload.css";
import { supabase } from "../supabasebaseClient";

const DanceUpload = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("dance-upload");
  const [formData, setFormData] = useState({
    title: "",
    history: "",
    references: "",
    region: ""
  });
  const [previewVideo, setPreviewVideo] = useState(null);
  const [figureVideos, setFigureVideos] = useState([]);
  const [danceImage, setDanceImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: '' });

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
        // Only allow one file at a time
        const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newFigure = {
          id: uniqueId,
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
      default:
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
      // Only allow one file at a time for figures
      const file = files[0];
      if (file && file.type.startsWith('video/')) {
        handleFileUpload(file, type);
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    showSnackbar('Uploading Video', 'loading');

    try {
      // Validate required fields
      if (!formData.title || !formData.references || !formData.region) {
        alert('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }
      if (!previewVideo) {
        alert('Preview video is required.');
        setIsSubmitting(false);
        return;
      }
      if (figureVideos.length < 1) {
        alert('At least 1 figure video is required.');
        setIsSubmitting(false);
        return;
      }
      if (!danceImage) {
        alert('Dance image is required.');
        setIsSubmitting(false);
        return;
      }

      // --- Check if dance title already exists ---
      const { data: existingDance, error: titleCheckError } = await supabase
        .from('dances')
        .select('id')
        .eq('title', formData.title)
        .maybeSingle();

      if (titleCheckError) throw titleCheckError;
      if (existingDance) {
        showSnackbar('A dance with this title already exists.', 'error');
        setIsSubmitting(false);
        return;
      }
      // --- End title check ---

      // 1. Upload main video
      const mainVideoPath = `main_videos/${Date.now()}_${previewVideo.file.name}`;
      const { data: mainVideoData, error: mainVideoError } = await supabase
        .storage
        .from('dances')
        .upload(mainVideoPath, previewVideo.file);

      if (mainVideoError) throw mainVideoError;
      const mainVideoUrl = supabase.storage.from('dances').getPublicUrl(mainVideoData.path).data.publicUrl;

      // 2. Upload figure videos
      const figureVideoUrls = [];
      for (let i = 0; i < figureVideos.length; i++) {
        const file = figureVideos[i].file;
        const figurePath = `figures/${Date.now()}_${file.name}`;
        const { data, error } = await supabase
          .storage
          .from('dances')
          .upload(figurePath, file);
        if (error) throw error;
        figureVideoUrls.push(supabase.storage.from('dances').getPublicUrl(data.path).data.publicUrl);
      }

      // 3. Upload image
      const imagePath = `images/${Date.now()}_${danceImage.file.name}`;
      const { data: imageData, error: imageError } = await supabase
        .storage
        .from('dances')
        .upload(imagePath, danceImage.file);
      if (imageError) throw imageError;
      const imageUrl = supabase.storage.from('dances').getPublicUrl(imageData.path).data.publicUrl;

      // 4. Insert dance record
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) throw new Error("User not authenticated");

      const { data: dance, error: danceError } = await supabase
        .from('dances')
        .insert([{
          user_id: userId,
          title: formData.title,
          history: formData.history,
          references: formData.references,
          main_video_url: mainVideoUrl,
          island: formData.region,
        }])
        .select()
        .single();
      if (danceError) throw danceError;

      // 5. Insert figure videos
      for (let i = 0; i < figureVideoUrls.length; i++) {
        await supabase.from('dance_figures').insert([{
          dance_id: dance.id,
          video_url: figureVideoUrls[i],
          figure_number: i + 1
        }]);
      }

      // 6. Insert image
      await supabase.from('dance_images').insert([{
        dance_id: dance.id,
        image_url: imageUrl,
        position: 0,
      }]);

      showSnackbar('Upload successful. The dance has been uploaded.', 'success');
      navigate('/manage-dance');
    } catch (error) {
      console.error('Upload error:', error);
      showSnackbar('Upload failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
      if (snackbar.type === 'loading') setSnackbar({ open: false, message: '', type: '' });
    }
  };

  const truncateFileName = (name, maxLength = 18) => {
    if (name.length <= maxLength) return name;
    const extIndex = name.lastIndexOf('.');
    const ext = extIndex !== -1 ? name.slice(extIndex) : '';
    return name.slice(0, maxLength - 3 - ext.length) + '...' + ext;
  };

  const showSnackbar = (message, type = 'info', duration = 3000) => {
    setSnackbar({ open: true, message, type });
    if (type !== 'loading') {
      setTimeout(() => setSnackbar({ open: false, message: '', type: '' }), duration);
    }
  };

  return (
    <div className="dance-upload-container">
      {snackbar.open && (
        <div
          className={`snackbar ${snackbar.type}`}
          style={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            maxWidth: 360,
            minWidth: 220,
            zIndex: 9999,
            padding: '18px 28px',
            textAlign: 'left',
            fontWeight: 600,
            fontSize: '1.1rem',
            background: snackbar.type === 'loading' ? '#fffbe6' : snackbar.type === 'success' ? '#e6ffed' : '#f0f0f0',
            color: snackbar.type === 'loading' ? '#8a6d3b' : snackbar.type === 'success' ? '#155724' : '#333',
            borderRadius: 10,
            boxShadow: '0 4px 16px rgba(0,0,0,0.13)',
            border: '1px solid #eee',
            transition: 'opacity 0.3s'
          }}
        >
          {snackbar.message}
        </div>
      )}
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
                required
                disabled={isSubmitting}
                style={{
                  minHeight: '120px',
                  maxHeight: '240px',
                  overflowY: 'auto',
                  resize: 'vertical'
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="references">References</label>
              <textarea
                id="references"
                name="references"
                className="form-textarea"
                value={formData.references}
                onChange={handleInputChange}
                placeholder="Enter the references for this dance"
                rows="4"
                required
                disabled={isSubmitting}
                style={{
                  minHeight: '120px',
                  maxHeight: '240px',
                  overflowY: 'auto',
                  resize: 'vertical'
                }}
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
              <div className="upload-text">Upload Figure Video</div>
              <div className="upload-subtext">Drag and drop a video file or click to browse (one at a time)</div>
            </div>

            <input
              type="file"
              id="figures-input"
              className="file-input"
              accept="video/*"
              // No 'multiple'
              onChange={(e) => {
                if (e.target.files[0]) handleFileUpload(e.target.files[0], 'figures');
              }}
              disabled={isSubmitting}
            />

            {figureVideos.length > 0 && (
              <div className="figures-grid">
                {figureVideos.map((video, idx) => (
                  <div key={video.id} className="figure-item">
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>
                      Figure {idx + 1}
                    </div>
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
                      <div className="file-name">{truncateFileName(video.name)}</div>
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