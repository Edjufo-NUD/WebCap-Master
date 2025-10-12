import React, { useState, useEffect } from "react";
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
    region: "",
    durationHours: "",
    durationMinutes: "",
    durationSeconds: "",
    performers: "",
    music: "",
    costumes: ""
  });
  const [previewVideo, setPreviewVideo] = useState(null);
  const [figureVideos, setFigureVideos] = useState([]);
  const [danceImage, setDanceImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // Get current user role to determine if approval is needed
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userRole = currentUser?.role;

  // Block navigation if uploading or form is dirty, show correct modal
  useEffect(() => {
    // Helper: is form dirty (any field filled or file selected)?
    const isFormDirty = () => {
      return Object.values(formData).some(v => v) || previewVideo || figureVideos.length > 0 || danceImage;
    };

    const handleBeforeUnload = (e) => {
      if (isSubmitting || isFormDirty()) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.interceptSetActiveItem = (itemId) => {
      if ((isSubmitting || isFormDirty()) && itemId !== 'dance-upload') {
        setPendingNavigation({ targetItem: itemId, targetPath: getPathFromItem(itemId) });
        setShowNavigationModal(true);
        return false;
      }
      return true;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      delete window.interceptSetActiveItem;
    };
  }, [isSubmitting, formData, previewVideo, figureVideos, danceImage]);

  // Helper function to get path from item ID
  const getPathFromItem = (itemId) => {
    const pathMap = {
      'manage-dance': '/manage-dance',
      'dance-upload': '/dance-upload',
      'dance-request': '/dance-request',
      'dance-approval': '/dance-approval',
      'analytics': '/analytics',
      'user-ratings': '/user-ratings',
      'user-management': '/user-management'
    };
    return pathMap[itemId] || '/';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (file, type) => {
    // File validation constants
    const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_FIGURE_VIDEOS = 10; // Maximum number of figure videos
    
    // Validate file type
    if (type === 'preview' || type === 'figures') {
      if (!file.type.startsWith('video/')) {
        showNotification('Please select a valid video file. Supported formats: MP4, WebM, AVI, MOV', 'error');
        return;
      }
    } else if (type === 'image') {
      if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file. Supported formats: JPG, PNG, GIF, WebP', 'error');
        return;
      }
    }
    
    // Validate file size
    if ((type === 'preview' || type === 'figures') && file.size > MAX_VIDEO_SIZE) {
      showNotification(`Video file is too large. Maximum size allowed is ${Math.round(MAX_VIDEO_SIZE / (1024 * 1024))}MB`, 'error');
      return;
    }
    
    if (type === 'image' && file.size > MAX_IMAGE_SIZE) {
      showNotification(`Image file is too large. Maximum size allowed is ${Math.round(MAX_IMAGE_SIZE / (1024 * 1024))}MB`, 'error');
      return;
    }
    
    // Check if file is too small (likely corrupted)
    if (file.size < 1024) { // 1KB minimum
      showNotification('File appears to be corrupted or too small. Please select a different file.', 'error');
      return;
    }
    
    // Additional validation for figure videos limit
    if (type === 'figures' && figureVideos.length >= MAX_FIGURE_VIDEOS) {
      showNotification(`Maximum ${MAX_FIGURE_VIDEOS} figure videos allowed. Please remove some videos before adding new ones.`, 'error');
      return;
    }
    
    // Check for duplicate files (same name and size)
    if (type === 'figures') {
      const isDuplicate = figureVideos.some(video => 
        video.name === file.name && video.file.size === file.size
      );
      if (isDuplicate) {
        showNotification('This video has already been uploaded. Please select a different file.', 'error');
        return;
      }
    }
    
    try {
      const fileUrl = URL.createObjectURL(file);

      switch (type) {
        case 'preview':
          // Remove previous video URL to prevent memory leaks
          if (previewVideo) {
            URL.revokeObjectURL(previewVideo.url);
          }
          setPreviewVideo({ file, url: fileUrl, name: file.name, size: formatFileSize(file.size) });
          break;
        case 'figures':
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
          // Remove previous image URL to prevent memory leaks
          if (danceImage) {
            URL.revokeObjectURL(danceImage.url);
          }
          setDanceImage({ file, url: fileUrl, name: file.name, size: formatFileSize(file.size) });
          break;
        default:
          showNotification('Unknown file type. Please try again.', 'error');
          break;
      }
    } catch (error) {
      console.error('File upload error:', error);
      showNotification('Failed to process the file. Please try again with a different file.', 'error');
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
    const videoToRemove = figureVideos.find(video => video.id === id);
    if (videoToRemove) {
      // Revoke the object URL to free up memory
      URL.revokeObjectURL(videoToRemove.url);
      setFigureVideos(prev => prev.filter(video => video.id !== id));
    }
    // Clear the file input to allow re-uploading the same file
    const figuresInput = document.getElementById('figures-input');
    if (figuresInput) figuresInput.value = '';
  };

  const removePreviewVideo = () => {
    if (previewVideo) {
      URL.revokeObjectURL(previewVideo.url);
      setPreviewVideo(null);
      // Clear the file input to allow re-uploading the same file
      const previewInput = document.getElementById('preview-video-input');
      if (previewInput) previewInput.value = '';
    }
  };

  const removeDanceImage = () => {
    if (danceImage) {
      URL.revokeObjectURL(danceImage.url);
      setDanceImage(null);
      // Clear the file input to allow re-uploading the same file
      const imageInput = document.getElementById('image-input');
      if (imageInput) imageInput.value = '';
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

    // Check if any files were dropped
    if (files.length === 0) {
      showNotification('No files were detected. Please try dropping the file again.', 'error');
      return;
    }

    // Check if multiple files were dropped
    if (files.length > 1) {
      showNotification('Please drop only one file at a time.', 'error');
      return;
    }

    const file = files[0];
    
    // Validate file type before passing to handleFileUpload
    if (type === 'figures' || type === 'preview') {
      if (!file.type.startsWith('video/')) {
        showNotification('Invalid file type. Please drop a video file (MP4, WebM, AVI, MOV).', 'error');
        return;
      }
    } else if (type === 'image') {
      if (!file.type.startsWith('image/')) {
        showNotification('Invalid file type. Please drop an image file (JPG, PNG, GIF, WebP).', 'error');
        return;
      }
    }

    // File passed basic validation, now handle the upload
    handleFileUpload(file, type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    showNotification('Uploading dance...', 'warning');

    try {
      // Validate required text fields
      const requiredFields = [
        { field: 'title', name: 'Dance Title' },
        { field: 'references', name: 'References' },
        { field: 'region', name: 'Island' },
        { field: 'durationMinutes', name: 'Duration (Minutes)' },
        { field: 'performers', name: 'Number of Performers' },
        { field: 'music', name: 'Music & Instruments' },
        { field: 'costumes', name: 'Traditional Costumes' }
      ];

      for (const { field, name } of requiredFields) {
        if (!formData[field] || formData[field].toString().trim() === '') {
          showNotification(`${name} is required. Please fill in this field.`, 'error');
          setIsSubmitting(false);
          return;
        }
      }

      // Validate history field (separate check since it's often forgotten)
      if (!formData.history || formData.history.trim() === '') {
        showNotification('History is required. Please provide information about the dance origins.', 'error');
        setIsSubmitting(false);
        return;
      }

      // Validate duration values
      const hours = parseInt(formData.durationHours) || 0;
      const minutes = parseInt(formData.durationMinutes) || 0;
      const seconds = parseInt(formData.durationSeconds) || 0;

      if (minutes === 0 && seconds === 0) {
        showNotification('Please specify a valid duration. At least minutes or seconds must be greater than 0.', 'error');
        setIsSubmitting(false);
        return;
      }

      if (minutes > 59 || seconds > 59) {
        showNotification('Invalid duration format. Minutes and seconds cannot exceed 59.', 'error');
        setIsSubmitting(false);
        return;
      }

      // Validate performers count
      const performersCount = parseInt(formData.performers);
      if (!performersCount || performersCount < 1 || performersCount > 50) {
        showNotification('Number of performers must be between 1 and 50.', 'error');
        setIsSubmitting(false);
        return;
      }
      
      // Format duration
      const formattedDuration = hours > 0 
        ? `${hours}h ${minutes}m ${seconds}s` 
        : minutes > 0 
          ? `${minutes}m ${seconds}s`
          : `${seconds}s`;

      // Validate preview video
      if (!previewVideo) {
        showNotification('Preview video is required. Please upload a video file.', 'error');
        setIsSubmitting(false);
        return;
      }

      // Validate figure videos
      if (figureVideos.length < 1) {
        showNotification('At least one figure video is required. Please upload figure videos.', 'error');
        setIsSubmitting(false);
        return;
      }

      // Validate dance image
      if (!danceImage) {
        showNotification('Dance image is required. Please upload an image file.', 'error');
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
        showNotification('A dance with this title already exists.', 'error');
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

      // Set status based on user role - superadmin uploads are auto-approved
      const danceStatus = userRole === 'superadmin' ? 'approved' : 'pending';

      const { data: dance, error: danceError } = await supabase
        .from('dances')
        .insert([{
          user_id: userId,
          title: formData.title,
          history: formData.history,
          references: formData.references,
          main_video_url: mainVideoUrl,
          island: formData.region,
          duration: formattedDuration,
          performers: formData.performers,
          music: formData.music,
          costumes: formData.costumes,
          status: danceStatus
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

      // Show different message based on user role
      if (userRole === 'superadmin') {
        showNotification('Upload successful. The dance has been directly published!', 'success');
        navigate('/manage-dance');
      } else {
        showNotification('Upload successful. The dance has been submitted for approval.', 'success');
        navigate('/dance-request');
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      // Provide more specific error messages based on error type
      let errorMessage = 'Upload failed. Please try again.';
      
      if (error.message) {
        if (error.message.includes('413') || error.message.includes('file too large') || error.message.includes('size')) {
          errorMessage = 'One or more files are too large. Please reduce file size and try again.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error occurred. Please check your connection and try again.';
        } else if (error.message.includes('authentication') || error.message.includes('auth')) {
          errorMessage = 'Authentication error. Please log in again and try uploading.';
        } else if (error.message.includes('storage') || error.message.includes('upload')) {
          errorMessage = 'File upload failed. Please check your files and try again.';
        } else if (error.message.includes('database') || error.message.includes('insert')) {
          errorMessage = 'Database error occurred. Your files were uploaded but dance info could not be saved. Please contact support.';
        } else if (error.message.includes('title already exists')) {
          errorMessage = 'A dance with this title already exists. Please choose a different title.';
        }
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const truncateFileName = (name, maxLength = 18) => {
    if (name.length <= maxLength) return name;
    const extIndex = name.lastIndexOf('.');
    const ext = extIndex !== -1 ? name.slice(extIndex) : '';
    return name.slice(0, maxLength - 3 - ext.length) + '...' + ext;
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleConfirmNavigation = () => {
    // Reset form and files if discarding changes
    if (!isSubmitting) {
      setFormData({
        title: "",
        history: "",
        references: "",
        region: "",
        durationHours: "",
        durationMinutes: "",
        durationSeconds: "",
        performers: "",
        music: "",
        costumes: ""
      });
      setPreviewVideo(null);
      setFigureVideos([]);
      setDanceImage(null);
      showNotification('Upload discarded', 'warning');
    } else {
      // Cancel upload
      setIsSubmitting(false);
      showNotification('Upload cancelled', 'warning');
    }
    
    setShowNavigationModal(false);
    
    // Navigate to the intended destination
    if (pendingNavigation) {
      if (pendingNavigation.targetItem === 'logout') {
        // Handle logout specifically
        localStorage.clear();
        window.dispatchEvent(new Event('authChange'));
        navigate("/login");
      } else {
        setActiveItem(pendingNavigation.targetItem);
        navigate(pendingNavigation.targetPath);
      }
    }
    
    setPendingNavigation(null);
  };

  const handleCancelNavigation = () => {
    setShowNavigationModal(false);
    setPendingNavigation(null);
    // Upload continues
  };

  const handleKeyDown = (e) => {
    // Prevent form submit on Enter for all inputs except textarea
    if (
      e.key === "Enter" &&
      e.target.tagName !== "TEXTAREA"
    ) {
      e.preventDefault();
    }
  };

  return (
    <div className="dance-upload-container">
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            {notification.message}
          </div>
        </div>
      )}
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />

      <div className="dance-upload-content">
        <h1 className="dance-upload-title">
          {userRole === 'superadmin' ? 'Publish Dance' : 'Upload Dance'}
        </h1>
        {userRole === 'superadmin' && (
          <p style={{ 
            textAlign: 'center', 
            color: '#4a5568', 
            fontWeight: '600', 
            marginTop: '8px',
            marginBottom: '24px',
            fontSize: '1.1rem'
          }}>
            Your dance will be published directly without approval.
          </p>
        )}

        <form
          className="dance-upload-form"
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
        >
          {/* Basic Information Section */}
          <div className="form-section">
            <h2 className="form-section-title">
              Dance Information
            </h2>

            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Dance Title<span className="required-asterisk">*</span>
              </label>
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
              <label className="form-label" htmlFor="region">
                Island<span className="required-asterisk">*</span>
              </label>
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

            <div className="duration-performers-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="duration">
                  Duration<span className="required-asterisk">*</span>
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="number"
                      id="durationHours"
                      name="durationHours"
                      className="form-input"
                      value={formData.durationHours || ''}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      max="5"
                      step="1"
                      disabled={isSubmitting}
                      style={{ width: '70px', padding: '12px 8px' }}
                    />
                    <span style={{ fontSize: '0.9rem', color: '#718096', fontWeight: '500' }}>h</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="number"
                      id="durationMinutes"
                      name="durationMinutes"
                      className="form-input"
                      value={formData.durationMinutes || ''}
                      onChange={handleInputChange}
                      placeholder="5"
                      min="0"
                      max="59"
                      step="1"
                      required
                      disabled={isSubmitting}
                      style={{ width: '70px', padding: '12px 8px' }}
                    />
                    <span style={{ fontSize: '0.9rem', color: '#718096', fontWeight: '500' }}>m</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="number"
                      id="durationSeconds"
                      name="durationSeconds"
                      className="form-input"
                      value={formData.durationSeconds || ''}
                      onChange={handleInputChange}
                      placeholder="30"
                      min="0"
                      max="59"
                      step="1"
                      disabled={isSubmitting}
                      style={{ width: '70px', padding: '12px 8px' }}
                    />
                    <span style={{ fontSize: '0.9rem', color: '#718096', fontWeight: '500' }}>s</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="performers">
                  Number of Performers<span className="required-asterisk">*</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="number"
                    id="performers"
                    name="performers"
                    className="form-input"
                    value={formData.performers}
                    onChange={handleInputChange}
                    placeholder="4"
                    min="1"
                    max="50"
                    step="1"
                    required
                    disabled={isSubmitting}
                    style={{ flex: '1' }}
                  />
                  <span style={{ 
                    fontSize: '1rem', 
                    color: '#718096', 
                    fontWeight: '500',
                    minWidth: 'fit-content'
                  }}>
                    dancers
                  </span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="music">
                Music & Instruments<span className="required-asterisk">*</span>
              </label>
              <input
                type="text"
                id="music"
                name="music"
                className="form-input"
                value={formData.music}
                onChange={handleInputChange}
                placeholder="e.g. Traditional Tausug kulintang ensemble"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="costumes">
                Traditional Costumes<span className="required-asterisk">*</span>
              </label>
              <input
                type="text"
                id="costumes"
                name="costumes"
                className="form-input"
                value={formData.costumes}
                onChange={handleInputChange}
                placeholder="e.g. Elaborate Muslim royal attire with intricate embroidery"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="history">
                History<span className="required-asterisk">*</span>
              </label>
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
              <label className="form-label" htmlFor="references">
                References<span className="required-asterisk">*</span>
              </label>
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
              Video Preview<span className="section-required-asterisk">*</span>
            </h2>

            <div
              className="upload-area"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'preview')}
              onClick={() => {
                if (isSubmitting) {
                  showNotification('Please wait, upload in progress. Cannot add files during upload.', 'warning');
                } else {
                  document.getElementById('preview-video-input').click();
                }
              }}
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
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleFileUpload(file, 'preview');
                } else {
                  showNotification('No file selected. Please try again.', 'error');
                }
              }}
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
                <div style={{ 
                  width: '100%', 
                  maxWidth: '600px', 
                  height: 'auto',
                  backgroundColor: '#f0f0f0', 
                  borderRadius: '16px',
                  overflow: 'hidden',
                  position: 'relative',
                  margin: '20px auto'
                }}>
                  <video 
                    controls
                    preload="metadata"
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '400px',
                      objectFit: 'contain',
                      backgroundColor: '#000',
                      display: 'block'
                    }}
                  >
                    <source src={previewVideo.url} type={previewVideo.file.type} />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}
          </div>

          {/* Upload Figures Section */}
          <div className="form-section">
            <h2 className="form-section-title">
              Upload Figures<span className="section-required-asterisk">*</span>
            </h2>

            <div
              className="upload-area"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'figures')}
              onClick={() => {
                if (isSubmitting) {
                  showNotification('Please wait, upload in progress. Cannot add files during upload.', 'warning');
                } else {
                  document.getElementById('figures-input').click();
                }
              }}
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
                const file = e.target.files[0];
                if (file) {
                  handleFileUpload(file, 'figures');
                } else {
                  showNotification('No file selected. Please try again.', 'error');
                }
              }}
              disabled={isSubmitting}
            />

            {figureVideos.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', marginTop: '20px' }}>
                {figureVideos.map((video, idx) => (
                  <div key={video.id} style={{
                    position: 'relative',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: 10, color: '#2d3748' }}>
                      Figure {idx + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFigureVideo(video.id)}
                      title="Remove video"
                      disabled={isSubmitting}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10
                      }}
                    >
                      ×
                    </button>
                    
                    <video 
                      controls
                      style={{
                        width: '100%',
                        height: 'auto',
                        minHeight: '180px',
                        maxHeight: '250px',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        backgroundColor: '#000',
                        border: '2px solid #000',
                        display: 'block'
                      }}
                      onError={(e) => console.error('Video error:', e)}
                      onLoadStart={() => console.log('Video loading started')}
                      onCanPlay={() => console.log('Video can play')}
                    >
                      <source src={video.url} type={video.file.type} />
                      <div style={{ padding: '20px', textAlign: 'center', color: 'white' }}>
                        Video cannot be loaded
                      </div>
                    </video>
                    
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#2d3748', marginBottom: '4px' }}>
                        {truncateFileName(video.name)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#718096' }}>
                        {video.size}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload Image Section */}
          <div className="form-section">
            <h2 className="form-section-title">
              Upload Image<span className="section-required-asterisk">*</span>
            </h2>

            <div
              className="upload-area"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'image')}
              onClick={() => {
                if (isSubmitting) {
                  showNotification('Please wait, upload in progress. Cannot add files during upload.', 'warning');
                } else {
                  document.getElementById('image-input').click();
                }
              }}
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
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleFileUpload(file, 'image');
                } else {
                  showNotification('No file selected. Please try again.', 'error');
                }
              }}
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
            {isSubmitting 
              ? (userRole === 'superadmin' ? 'Publishing...' : 'Uploading...') 
              : (userRole === 'superadmin' ? 'Publish Dance' : 'Upload Dance')
            }
          </button>
        </form>
      </div>

      {/* Navigation Warning Modal */}
      {showNavigationModal && (
        <div className="navigation-modal-overlay">
          <div className="navigation-modal-content">
            <div className="navigation-modal-header">
              <div className="navigation-modal-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="navigation-modal-title">
                {isSubmitting ? 'Cancel Upload?' : 'Discard Upload?'}
              </h3>
            </div>
            <div className="navigation-modal-body">
              <p className="navigation-modal-message">
                {isSubmitting
                  ? "A video is currently uploading. Are you sure you want to cancel the upload and leave this page?"
                  : "You have unsaved changes. Are you sure you want to discard your upload and leave this page?"}
              </p>
              <p className="navigation-modal-submessage">
                This action cannot be undone.
              </p>
            </div>
            <div className="navigation-modal-actions">
              <button 
                className="logout-modal-confirm"
                onClick={handleConfirmNavigation}
              >
                {isSubmitting ? 'Cancel Upload' : 'Discard Upload'}
              </button>
              <button 
                className="logout-modal-cancel"
                onClick={handleCancelNavigation}
              >
                Stay Here
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DanceUpload;