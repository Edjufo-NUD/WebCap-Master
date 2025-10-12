import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  Play,
  Pause,
  Star,
  Calendar,
  User,
  Download,
  Upload,
  Check,
  X,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";
import Sidebar from "../Admin/Sidebar";
import { supabase } from "../supabasebaseClient";
import "./ManageDance.css";

const ManageDance = () => {
  const [activeItem, setActiveItem] = useState("manage-dance");
  const [dances, setDances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [dancesPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("dateAdded");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedDance, setSelectedDance] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [danceToDelete, setDanceToDelete] = useState(null);
  const [deleteInput, setDeleteInput] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Video/Image editing states
  const [previewVideo, setPreviewVideo] = useState(null);
  const [figureVideos, setFigureVideos] = useState([]);
  const [danceImage, setDanceImage] = useState(null);
  
  // Existing media states
  const [existingPreviewVideo, setExistingPreviewVideo] = useState(null);
  const [existingFigureVideos, setExistingFigureVideos] = useState([]);
  const [existingDanceImage, setExistingDanceImage] = useState(null);
  
  // Deleted media tracking
  const [deletedPreviewVideo, setDeletedPreviewVideo] = useState(false);
  const [deletedFigureVideos, setDeletedFigureVideos] = useState([]);
  const [deletedDanceImage, setDeletedDanceImage] = useState(false);
  
  // Confirmation modal states
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);
  const [showDiscardConfirmModal, setShowDiscardConfirmModal] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    region: '',
    history: '',
    references: '',
    durationHours: '',
    durationMinutes: '',
    durationSeconds: '',
    performers: '',
    music: '',
    costumes: ''
  });

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({});

  // Get current user role and ID for permission checking
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userRole = currentUser?.role;
  const currentUserId = localStorage.getItem("user_id");

  // Check if current user can edit a dance
  const canEditDance = (dance) => {
    // SuperAdmin can edit any dance
    if (userRole === 'superadmin') return true;
    
    // Admin can only edit their own uploaded dances
    if (userRole === 'admin') {
      return dance.user_id === currentUserId;
    }
    
    // Default: no permission
    return false;
  };

  // Show notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Load dances from localStorage
  useEffect(() => {
    const fetchDances = async () => {
      setLoading(true);
      
      try {
        // Get dances from localStorage
        const storedDances = localStorage.getItem('uploadedDances');
        const uploadedDances = storedDances ? JSON.parse(storedDances) : [];
        
        // Transform the data to match the expected structure
        const transformedDances = uploadedDances.map(dance => ({
          id: dance.id,
          title: dance.title,
          category: dance.region || 'Unknown', // Using region as category
          dateAdded: dance.uploadDate || new Date().toISOString(),
          duration: dance.duration || '', // Use uploaded duration if available
          performers: dance.performers || '',
          music: dance.music || '',
          costumes: dance.costumes || '',
          thumbnail: dance.image?.url || '/api/placeholder/150/100', // Use uploaded image or placeholder
          references: dance.references,
          history: dance.history,
          region: dance.region,
          previewVideo: dance.previewVideo,
          figureVideos: dance.figureVideos,
          image: dance.image
        }));
        
        setDances(transformedDances);
      } catch (error) {
        console.error('Error loading dances:', error);
        setDances([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDances();
  }, []);

  // Example: Get session from localStorage and fetch all data from Supabase
  const accessToken = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) return; // No session, do not fetch

      // Example: fetch approved dances only
      const { data: dances, error } = await supabase
        .from("dances")
        .select("*")
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching data:", error.message);
        setDances([]); // instead of setData([])
      } else {
        setDances(dances); // instead of setData(dances)
      }
    };

    fetchData();
  }, [accessToken]);

  // Fetch dances and related data from Supabase
  const fetchDancesAndRelated = async () => {
    setLoading(true); // <-- Add this line
    // 1. Fetch dances (only approved ones)
    const { data: dancesData, error: dancesError } = await supabase
      .from("dances")
      .select("id, title, island, user_id, created_at, history, references, duration, performers, music, costumes, status")
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    // 2. Fetch users (for uploader info)
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, username");

    // 3. Fetch dance_images (first image per dance)
    const { data: imagesData, error: imagesError } = await supabase
      .from("dance_images")
      .select("dance_id, image_url, position")
      .order("position", { ascending: true });

    if (!dancesError && !usersError && !imagesError) {
      // Map user IDs to usernames
      const userMap = {};
      usersData.forEach((u) => { userMap[u.id] = u.username; });

      // Map dance_id to its first image
      const imageMap = {};
      imagesData.forEach((img) => {
        if (!imageMap[img.dance_id]) {
          imageMap[img.dance_id] = img.image_url;
        }
      });

      // Merge username and image into dances
      const merged = (dancesData || []).map((d) => {
        // Capitalize island/island value
        const island = d.island
          ? d.island.charAt(0).toUpperCase() + d.island.slice(1).toLowerCase()
          : "Unknown";
        return {
          ...d,
          username: userMap[d.user_id] || "Unknown",
          image_url: imageMap[d.id] || null,
          category: island, // Use capitalized island as category
          dateAdded: d.created_at,
          duration: d.duration || '',
          performers: d.performers || '',
          music: d.music || '',
          costumes: d.costumes || '',
          thumbnail: imageMap[d.id] || "/api/placeholder/150/100",
          history: d.history || "",
          references: d.references || "",
          region: island, // for consistency in edit modal
        };
      });

      setDances(merged);
    }
    setLoading(false); // <-- Add this line
  };

  // Fetch on mount
  useEffect(() => {
    fetchDancesAndRelated();
  }, []);

  // Refresh from Supabase when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      fetchDancesAndRelated(); // reload from Supabase
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // Filter and search logic
  const filteredDances = dances.filter(dance => {
    const matchesSearch = dance.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" ||
      (dance.category && dance.category === filterCategory);
    return matchesSearch && matchesCategory;
  });

  // Count dances per island (case-insensitive)
  const luzonCount = dances.filter(d => d.category === "Luzon").length;
  const visayasCount = dances.filter(d => d.category === "Visayas").length;
  const mindanaoCount = dances.filter(d => d.category === "Mindanao").length;

  // Sorting logic
  const sortedDances = [...filteredDances].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === "dateAdded") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination logic
  const indexOfLastDance = currentPage * dancesPerPage;
  const indexOfFirstDance = indexOfLastDance - dancesPerPage;
  const currentDances = sortedDances.slice(indexOfFirstDance, indexOfLastDance);
  const totalPages = Math.ceil(sortedDances.length / dancesPerPage);

  // --- VALIDATION FUNCTION ---
  const validateForm = () => {
    const errors = {};
    const requiredFields = ['title', 'region', 'history', 'references'];

    requiredFields.forEach(field => {
      if (!editForm[field] || editForm[field].trim() === '') {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- FILE HANDLING FUNCTIONS ---
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (file, type) => {
    const fileUrl = URL.createObjectURL(file);

    switch (type) {
      case 'preview':
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
        setDanceImage({ file, url: fileUrl, name: file.name, size: formatFileSize(file.size) });
        break;
      default:
        break;
    }
  };

  const removeFigureVideo = (id) => {
    setFigureVideos(prev => prev.filter(video => video.id !== id));
    // Clear the file input to allow re-uploading the same file
    const figuresInput = document.getElementById('edit-figures-input');
    if (figuresInput) figuresInput.value = '';
  };

  const removePreviewVideo = () => {
    if (previewVideo) {
      URL.revokeObjectURL(previewVideo.url);
      setPreviewVideo(null);
      // Clear the file input to allow re-uploading the same file
      const previewInput = document.getElementById('edit-preview-video-input');
      if (previewInput) previewInput.value = '';
    }
  };

  const removeDanceImage = () => {
    if (danceImage) {
      URL.revokeObjectURL(danceImage.url);
      setDanceImage(null);
      // Clear the file input to allow re-uploading the same file
      const imageInput = document.getElementById('edit-image-input');
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
    if (files.length > 0) {
      const file = files[0];
      if (type === 'preview' && file.type.startsWith('video/')) {
        handleFileUpload(file, 'preview');
      } else if (type === 'figures' && file.type.startsWith('video/')) {
        handleFileUpload(file, 'figures');
      } else if (type === 'image' && file.type.startsWith('image/')) {
        handleFileUpload(file, 'image');
      }
    }
  };

  const truncateFileName = (name, maxLength = 18) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + '...';
  };

  // Load existing media from database
  const loadExistingMedia = async (danceId) => {
    try {
      // Get dance with main video info
      const { data: danceData, error: danceError } = await supabase
        .from('dances')
        .select('main_video_url')
        .eq('id', danceId)
        .single();

      if (danceError) {
        console.error('Error loading dance media:', danceError);
        return;
      }

      // Set existing preview video (main video)
      if (danceData.main_video_url) {
        setExistingPreviewVideo({
          url: danceData.main_video_url,
          name: 'Current Preview Video'
        });
      }

      // Get dance image from dance_images table
      const { data: imageData, error: imageError } = await supabase
        .from('dance_images')
        .select('id, image_url')
        .eq('dance_id', danceId)
        .single();

      if (imageError && imageError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading dance image:', imageError);
      } else if (imageData && imageData.image_url) {
        setExistingDanceImage({
          id: imageData.id,
          url: imageData.image_url,
          name: 'Current Dance Image'
        });
      }

      // Get figure videos from dance_figures table
      const { data: figureData, error: figureError } = await supabase
        .from('dance_figures')
        .select('id, video_url, figure_number')
        .eq('dance_id', danceId)
        .order('figure_number');

      if (figureError) {
        console.error('Error loading figure videos:', figureError);
      } else if (figureData && figureData.length > 0) {
        const existingFigures = figureData.map((video) => ({
          id: video.id,
          url: video.video_url,
          name: `Figure Video ${video.figure_number}`,
          figure_number: video.figure_number,
          isExisting: true
        }));
        setExistingFigureVideos(existingFigures);
      }

    } catch (error) {
      console.error('Error loading existing media:', error);
    }
  };

  // Functions to handle existing media deletion
  const deleteExistingPreviewVideo = () => {
    setExistingPreviewVideo(null);
    setDeletedPreviewVideo(true);
  };

  const deleteExistingDanceImage = () => {
    const imageToDelete = existingDanceImage;
    setExistingDanceImage(null);
    setDeletedDanceImage(imageToDelete); // Store the image object instead of just true
  };

  const deleteExistingFigureVideo = (figureId) => {
    setExistingFigureVideos(prev => prev.filter(video => video.id !== figureId));
    setDeletedFigureVideos(prev => [...prev, figureId]);
  };

  // --- DELETE FUNCTION ---
  const handleDeleteDance = async (danceId) => {
    if (!danceId) return;
    
    // Verify password before proceeding
    try {
      const currentUserEmail = currentUser?.email;
      if (!currentUserEmail || !deletePassword) {
        showNotification('Please enter your password to confirm deletion', 'error');
        return;
      }

      // Verify password by attempting to sign in
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: currentUserEmail,
        password: deletePassword
      });

      if (authError) {
        showNotification('Incorrect password. Please try again.', 'error');
        return;
      }
    } catch (error) {
      showNotification('Password verification failed. Please try again.', 'error');
      return;
    }

    setLoading(true);

    try {
      // 1. Get all images related to this dance
      const { data: images, error: imagesError } = await supabase
        .from("dance_images")
        .select("id, image_url")
        .eq("dance_id", danceId);

      if (imagesError) throw imagesError;

      // 2. Delete images from Supabase Storage
      if (images && images.length > 0) {
        const imagePaths = images.map(img => {
          // Assuming image_url is like "public/dances/filename.jpg"
          // Remove the storage URL prefix if present
          const url = img.image_url;
          // If you store full URLs, extract the path after the bucket name
          // Example: https://xyz.supabase.co/storage/v1/object/public/dances/filename.jpg
          // Should become: "dances/filename.jpg"
          const match = url.match(/\/object\/public\/(.+)$/);
          return match ? match[1] : url;
        });

        // Remove from storage (bucket: "public")
        const { error: storageError } = await supabase.storage
          .from("public")
          .remove(imagePaths);

        if (storageError) {
          // Optionally, handle error but continue with DB deletion
          console.error("Storage delete error:", storageError);
        }
      }

      // 3. Delete dance_images rows
      const { error: deleteImagesError } = await supabase
        .from("dance_images")
        .delete()
        .eq("dance_id", danceId);

      if (deleteImagesError) throw deleteImagesError;

      // 4. Delete the dance itself
      const { error: deleteDanceError } = await supabase
        .from("dances")
        .delete()
        .eq("id", danceId);

      if (deleteDanceError) throw deleteDanceError;

      // 5. Optionally, delete other related info (e.g., comments, likes, etc.) if you have such tables

      // Refresh list
      await fetchDancesAndRelated();
      setShowDeleteModal(false);
      setDanceToDelete(null);
      setDeleteInput("");
      showNotification("Dance deleted successfully", 'success');
    } catch (err) {
      alert("Failed to delete dance: " + (err.message || err));
      showNotification("Failed to delete dance: " + (err.message || err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (dance) => {
    // Check permissions before allowing edit
    if (!canEditDance(dance)) {
      showNotification('You can only edit dances you have uploaded', 'error');
      return;
    }
    
    setSelectedDance(dance);
    
    // Parse existing duration string into components
    let hours = '', minutes = '', seconds = '';
    if (dance.duration) {
      const durationStr = dance.duration;
      const hourMatch = durationStr.match(/(\d+)h/);
      const minMatch = durationStr.match(/(\d+)m/);
      const secMatch = durationStr.match(/(\d+)s/);
      
      if (hourMatch) hours = hourMatch[1];
      if (minMatch) minutes = minMatch[1];
      if (secMatch) seconds = secMatch[1];
    }
    
    setEditForm({
      title: dance.title || '',
      region: dance.region || '',
      history: dance.history || '',
      references: dance.references || '',
      durationHours: hours,
      durationMinutes: minutes,
      durationSeconds: seconds,
      performers: dance.performers || '',
      music: dance.music || '',
      costumes: dance.costumes || ''
    });
    
    // Reset new upload states
    setPreviewVideo(null);
    setFigureVideos([]);
    setDanceImage(null);
    
    // Reset existing media states
    setExistingPreviewVideo(null);
    setExistingFigureVideos([]);
    setExistingDanceImage(null);
    
    // Reset deleted tracking
    setDeletedPreviewVideo(false);
    setDeletedFigureVideos([]);
    setDeletedDanceImage(false);
    
    // Load existing media from database
    await loadExistingMedia(dance.id);
    
    setValidationErrors({}); // Clear any previous validation errors
    setShowEditModal(true);
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // --- CONFIRMATION FUNCTIONS ---
  const handleSaveClick = () => {
    if (!validateForm()) {
      return; // Don't proceed if validation fails
    }
    setShowSaveConfirmModal(true);
  };

  const confirmSave = () => {
    setShowSaveConfirmModal(false);
    handleSaveEdit();
  };

  // --- EDIT FUNCTION ---
  const handleSaveEdit = async () => {
    if (!selectedDance) return;

    // Validate form before saving
    if (!validateForm()) {
      return; // Don't proceed if validation fails
    }

    setLoading(true);

    try {
      // Format duration
      const hours = parseInt(editForm.durationHours) || 0;
      const minutes = parseInt(editForm.durationMinutes) || 0;
      const seconds = parseInt(editForm.durationSeconds) || 0;
      const formattedDuration = hours > 0 
        ? `${hours}h ${minutes}m ${seconds}s` 
        : minutes > 0 
          ? `${minutes}m ${seconds}s`
          : `${seconds}s`;

      // 1. Handle deletions first
      // Delete figure videos that were marked for deletion
      if (deletedFigureVideos.length > 0) {
        const { error: deleteError } = await supabase
          .from('dance_figures')
          .delete()
          .in('id', deletedFigureVideos);

        if (deleteError) {
          console.error('Error deleting figure videos:', deleteError);
          showNotification('Failed to delete some figure videos: ' + deleteError.message, 'warning');
        }
      }

      // Delete dance image if marked for deletion
      if (deletedDanceImage && deletedDanceImage.id) {
        const { error: deleteImageError } = await supabase
          .from('dance_images')
          .delete()
          .eq('id', deletedDanceImage.id);

        if (deleteImageError) {
          console.error('Error deleting dance image:', deleteImageError);
          showNotification('Failed to delete dance image: ' + deleteImageError.message, 'warning');
        }
      }

      // 2. Handle file uploads to Supabase Storage
      let previewVideoUrl = null;
      let figureVideoUrls = [];
      let imageUrl = null;

      // Upload new preview video if exists
      if (previewVideo) {
        const videoFileName = `preview_${Date.now()}_${previewVideo.file.name}`;
        const { data: videoData, error: videoError } = await supabase.storage
          .from('dances')
          .upload(videoFileName, previewVideo.file);

        if (videoError) {
          console.error('Error uploading preview video:', videoError);
          showNotification('Failed to upload preview video: ' + videoError.message, 'error');
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('dances')
            .getPublicUrl(videoFileName);
          previewVideoUrl = publicUrl;
        }
      }

      // Upload new figure videos if exists
      if (figureVideos.length > 0) {
        for (const video of figureVideos) {
          const videoFileName = `figure_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${video.file.name}`;
          const { data: videoData, error: videoError } = await supabase.storage
            .from('dances')
            .upload(videoFileName, video.file);

          if (videoError) {
            console.error('Error uploading figure video:', videoError);
            showNotification('Failed to upload figure video: ' + videoError.message, 'error');
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('dances')
              .getPublicUrl(videoFileName);
            figureVideoUrls.push(publicUrl);
          }
        }
      }

      // Upload new dance image if exists
      if (danceImage) {
        const imageFileName = `image_${Date.now()}_${danceImage.file.name}`;
        const { data: imageData, error: imageError } = await supabase.storage
          .from('dances')
          .upload(imageFileName, danceImage.file);

        if (imageError) {
          console.error('Error uploading image:', imageError);
          showNotification('Failed to upload image: ' + imageError.message, 'error');
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('dances')
            .getPublicUrl(imageFileName);
          imageUrl = publicUrl;
        }
      }

      // 3. Update dance in Supabase database
      const updateData = {
        title: editForm.title,
        island: editForm.region,
        history: editForm.history,
        references: editForm.references,
        duration: formattedDuration,
        performers: editForm.performers,
        music: editForm.music,
        costumes: editForm.costumes
      };

      // Handle main video updates/deletions
      if (previewVideoUrl) {
        updateData.main_video_url = previewVideoUrl;
      } else if (deletedPreviewVideo) {
        updateData.main_video_url = null;
      }

      const { error: updateError } = await supabase
        .from("dances")
        .update(updateData)
        .eq("id", selectedDance.id);

      if (updateError) throw updateError;

      // 4. Handle new figure videos and images
      if (figureVideoUrls.length > 0) {
        // Get the highest existing figure number
        const { data: maxFigureData } = await supabase
          .from('dance_figures')
          .select('figure_number')
          .eq('dance_id', selectedDance.id)
          .order('figure_number', { ascending: false })
          .limit(1);

        let nextFigureNumber = 1;
        if (maxFigureData && maxFigureData.length > 0) {
          nextFigureNumber = maxFigureData[0].figure_number + 1;
        }

        // Insert new figure videos into dance_figures table
        const figureVideoData = figureVideoUrls.map((url, index) => ({
          dance_id: selectedDance.id,
          video_url: url,
          figure_number: nextFigureNumber + index
        }));

        const { error: figureError } = await supabase
          .from('dance_figures')
          .insert(figureVideoData);

        if (figureError) {
          console.error('Error saving figure videos:', figureError);
          showNotification('Dance updated, but failed to save figure videos: ' + figureError.message, 'warning');
        }
      }

      // Handle new dance image
      if (imageUrl) {
        // Insert new dance image (or update if replacing)
        const { error: imageInsertError } = await supabase
          .from('dance_images')
          .insert([{
            dance_id: selectedDance.id,
            image_url: imageUrl,
            position: 0
          }]);

        if (imageInsertError) {
          console.error('Error saving dance image:', imageInsertError);
          showNotification('Dance updated, but failed to save image: ' + imageInsertError.message, 'warning');
        }
      }

    // 5. Update in localStorage
    const storedDances = localStorage.getItem('uploadedDances');
    if (storedDances) {
      const uploadedDances = JSON.parse(storedDances);
      const updatedStoredDances = uploadedDances.map(dance => {
        if (dance.id === selectedDance.id) {
          return {
            ...dance,
            title: editForm.title,
            region: editForm.region,
            history: editForm.history,
            references: editForm.references,
            duration: formattedDuration,
            performers: editForm.performers,
            music: editForm.music,
            costumes: editForm.costumes
          };
        }
        return dance;
      });
      localStorage.setItem('uploadedDances', JSON.stringify(updatedStoredDances));
    }

    // 6. Update UI state
    const updatedDances = dances.map(dance => {
      if (dance.id === selectedDance.id) {
        return {
          ...dance,
          title: editForm.title,
          region: editForm.region,
          category: editForm.region,
          history: editForm.history,
          references: editForm.references,
          duration: formattedDuration,
          performers: editForm.performers,
          music: editForm.music,
          costumes: editForm.costumes
        };
      }
      return dance;
    });
    setDances(updatedDances);

    // 7. Close modal and reset
    // Clear video/image states and revoke URLs
    if (previewVideo) {
      URL.revokeObjectURL(previewVideo.url);
    }
    figureVideos.forEach(video => {
      URL.revokeObjectURL(video.url);
    });
    if (danceImage) {
      URL.revokeObjectURL(danceImage.url);
    }
    
    setShowEditModal(false);
    setSelectedDance(null);
    
    // Reset new upload states
    setPreviewVideo(null);
    setFigureVideos([]);
    setDanceImage(null);
    
    // Reset existing media states
    setExistingPreviewVideo(null);
    setExistingFigureVideos([]);
    setExistingDanceImage(null);
    
    // Reset deletion tracking
    setDeletedPreviewVideo(false);
    setDeletedFigureVideos([]);
    setDeletedDanceImage(false);
    
    setEditForm({
      title: '',
      region: '',
      history: '',
      references: '',
      duration: '',
      performers: '',
      music: '',
      costumes: ''
    });
    setValidationErrors({});
    
    const hasMediaChanges = previewVideo || figureVideos.length > 0 || danceImage || 
                           deletedPreviewVideo || deletedFigureVideos.length > 0 || deletedDanceImage;
    const updatedMessage = hasMediaChanges 
      ? "Dance and media files updated successfully" 
      : "Dance updated successfully";
    showNotification(updatedMessage, 'success');
    setLoading(false);
    } catch (error) {
      console.error('Error updating dance:', error);
      showNotification("Failed to update dance: " + (error.message || error), 'error');
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    const hasChanges = isEditChanged();
    
    if (hasChanges) {
      setShowDiscardConfirmModal(true);
    } else {
      handleCancelEdit();
    }
  };

  const confirmDiscard = () => {
    setShowDiscardConfirmModal(false);
    handleCancelEdit();
  };

  const handleCancelEdit = () => {
    // Clear video/image states and revoke URLs
    if (previewVideo) {
      URL.revokeObjectURL(previewVideo.url);
    }
    figureVideos.forEach(video => {
      URL.revokeObjectURL(video.url);
    });
    if (danceImage) {
      URL.revokeObjectURL(danceImage.url);
    }
    
    setShowEditModal(false);
    setSelectedDance(null);
    
    // Reset new upload states
    setPreviewVideo(null);
    setFigureVideos([]);
    setDanceImage(null);
    
    // Reset existing media states
    setExistingPreviewVideo(null);
    setExistingFigureVideos([]);
    setExistingDanceImage(null);
    
    // Reset deletion tracking
    setDeletedPreviewVideo(false);
    setDeletedFigureVideos([]);
    setDeletedDanceImage(false);
    
    setEditForm({
      title: '',
      region: '',
      history: '',
      references: '',
      duration: '',
      performers: '',
      music: '',
      costumes: ''
    });
    setValidationErrors({});
  };

  const openDeleteModal = (dance) => {
    setDanceToDelete(dance);
    setShowDeleteModal(true);
  };

  // Handle click outside modal to close
  const handleModalOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancelEdit();
    }
  };

  // Function to refresh data (can be called when returning from upload)
  const refreshDances = () => {
    const storedDances = localStorage.getItem('uploadedDances');
    const uploadedDances = storedDances ? JSON.parse(storedDances) : [];
    
    const transformedDances = uploadedDances.map(dance => ({
      id: dance.id,
      title: dance.title,
      category: dance.region || 'Unknown',
      dateAdded: dance.uploadDate || new Date().toISOString(),
      duration: dance.duration || '',
      performers: dance.performers || '',
      music: dance.music || '',
      costumes: dance.costumes || '',
      thumbnail: dance.image?.url || '/api/placeholder/150/100',
      references: dance.references,
      history: dance.history,
      region: dance.region,
      previewVideo: dance.previewVideo,
      figureVideos: dance.figureVideos,
      image: dance.image
    }));
    
    setDances(transformedDances);
  };

  // Listen for focus event to refresh data when returning to the page
  useEffect(() => {
    const handleFocus = () => {
      refreshDances();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Add this function inside your component
  const isEditChanged = () => {
    if (!selectedDance) return false;
    
    // Check for new file uploads
    const hasNewFileChanges = previewVideo !== null || figureVideos.length > 0 || danceImage !== null;
    
    // Check for existing media deletions
    const hasMediaDeletions = deletedPreviewVideo || (deletedDanceImage && deletedDanceImage !== false) || deletedFigureVideos.length > 0;
    
    // Format current duration from form components
    const hours = parseInt(editForm.durationHours) || 0;
    const minutes = parseInt(editForm.durationMinutes) || 0;
    const seconds = parseInt(editForm.durationSeconds) || 0;
    const formattedDuration = hours > 0 
      ? `${hours}h ${minutes}m ${seconds}s`
      : minutes > 0 
      ? `${minutes}m ${seconds}s`
      : `${seconds}s`;
    
    const hasFormChanges = (
      (editForm.title || '').trim() !== (selectedDance.title || '').trim() ||
      (editForm.region || '').trim() !== (selectedDance.region || selectedDance.island || selectedDance.category || '').trim() ||
      (editForm.history || '').trim() !== (selectedDance.history || '').trim() ||
      (editForm.references || '').trim() !== (selectedDance.references || '').trim() ||
      formattedDuration !== (selectedDance.duration || '').trim() ||
      (editForm.performers || '').trim() !== (selectedDance.performers || '').trim() ||
      (editForm.music || '').trim() !== (selectedDance.music || '').trim() ||
      (editForm.costumes || '').trim() !== (selectedDance.costumes || '').trim()
    );
    
    return hasFormChanges || hasNewFileChanges || hasMediaDeletions;
  };

  useEffect(() => {
    if (showEditModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showEditModal]);

  // Reset delete input when modal opens/closes
  useEffect(() => {
    if (!showDeleteModal) {
      setDeleteInput("");
      setDeletePassword("");
      setShowPassword(false);
    }
  }, [showDeleteModal]);

  // Helper function to normalize strings for comparison
  const normalizeString = (str) => {
    return str.trim().toLowerCase().replace(/\s+/g, ' ');
  };

  return (
    <div className="manage-dance-container">
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            {notification.message}
          </div>
        </div>
      )}
      
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      
      <div className="main-content">
        <div className="manage-dance-header">
          <div className="header-top">
            <h1>Manage Dance Content</h1>
          </div>
          
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-value">{dances.length}</div>
              <div className="stat-label">All Dances</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{luzonCount}</div>
              <div className="stat-label">Luzon</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{visayasCount}</div>
              <div className="stat-label">Visayas</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{mindanaoCount}</div>
              <div className="stat-label">Mindanao</div>
            </div>
          </div>
        </div>

        <div className="manage-dance-controls">
          <div className="controls-left">
            <div className="dance-search-container">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search dances..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dance-search-input"
              />
            </div>
            
            {/* Dropdown for filtering by island */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
              style={{ 
                color: '#000000', 
                backgroundColor: '#ffffff',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none'
              }}
            >
              <option value="all" style={{ color: '#000000', backgroundColor: '#ffffff' }}>All Islands</option>
              <option value="Luzon" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Luzon</option>
              <option value="Visayas" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Visayas</option>
              <option value="Mindanao" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Mindanao</option>
            </select>
          </div>
          
          <div className="controls-right">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="sort-select"
              style={{ 
                color: '#000000', 
                backgroundColor: '#ffffff',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none'
              }}
            >
              <option value="dateAdded-desc" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Newest First</option>
              <option value="dateAdded-asc" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Oldest First</option>
              <option value="title-asc" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Title A-Z</option>
              <option value="title-desc" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Title Z-A</option>
            </select>
          </div>
        </div>

        <div className="dance-table-container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading dances...</p>
            </div>
          ) : dances.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Search size={48} />
              </div>
              <h3>No dances found</h3>
              <p>No dance entries found. Upload some dances to get started!</p>
            </div>
          ) : (
            <table className="dance-table">
              <thead>
                <tr>
                  <th>Dance</th>
                  <th>Island</th>
                  <th>Date Added</th>
                  <th>Uploaded By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentDances.map(dance => (
                  <tr key={dance.id}>
                    <td>
                      <div className="dance-info">
                        <img 
                          src={dance.thumbnail} 
                          alt={dance.title}
                          className="dance-thumbnail"
                        />
                        <div className="dance-details">
                          <h4>{dance.title}</h4>
                          <span className="dance-duration">{dance.duration}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#000000' }}>{dance.category}</td>
                    <td style={{ color: '#000000' }}>{new Date(dance.dateAdded).toLocaleDateString()}</td>
                    <td style={{ color: '#000000' }}>{dance.username || "Unknown"}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className={`btn-icon btn-edit ${!canEditDance(dance) ? 'disabled' : ''}`}
                          onClick={canEditDance(dance) ? () => handleEdit(dance) : undefined}
                          title={canEditDance(dance) ? "Edit" : "You can only edit your own dances"}
                          disabled={!canEditDance(dance)}
                          style={{
                            opacity: canEditDance(dance) ? 1 : 0.5,
                            cursor: canEditDance(dance) ? 'pointer' : 'not-allowed'
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn-icon btn-delete"
                          onClick={() => openDeleteModal(dance)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {dances.length > 0 && (
          <div className="pagination">
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            
            <span className="pagination-info">
              Page {currentPage} of {totalPages} ({sortedDances.length} total)
            </span>
            
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedDance && (
          <div className="modal-overlay" onClick={handleModalOverlayClick}>
            <div
              className="modal edit-modal"
              onClick={e => e.stopPropagation()} // Prevent overlay click from closing modal when clicking inside
            >
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="edit-title">
                    Dance Title<span className="required-asterisk">*</span>
                  </label>
                  <input
                    id="edit-title"
                    type="text"
                    value={editForm.title}
                    onChange={(e) => handleEditFormChange('title', e.target.value)}
                    className={`form-input ${validationErrors.title ? 'error' : ''}`}
                    placeholder="Enter dance title"
                  />
                  {validationErrors.title && (
                    <div className="error-message">
                      <AlertCircle size={16} />
                      {validationErrors.title}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="edit-region">
                    Island/Region<span className="required-asterisk">*</span>
                  </label>
                  <select
                    id="edit-region"
                    value={editForm.region}
                    onChange={(e) => handleEditFormChange('region', e.target.value)}
                    className={`form-select ${validationErrors.region ? 'error' : ''}`}
                  >
                    <option value="">Select Island/Region</option>
                    <option value="Luzon">Luzon</option>
                    <option value="Visayas">Visayas</option>
                    <option value="Mindanao">Mindanao</option>
                  </select>
                  {validationErrors.region && (
                    <div className="error-message">
                      <AlertCircle size={16} />
                      {validationErrors.region}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="edit-history">
                    History<span className="required-asterisk">*</span>
                  </label>
                  <textarea
                    id="edit-history"
                    value={editForm.history}
                    onChange={(e) => handleEditFormChange('history', e.target.value)}
                    className={`form-textarea ${validationErrors.history ? 'error' : ''}`}
                    placeholder="Enter dance history..."
                    rows="4"
                    style={{
                      minHeight: '120px',
                      maxHeight: '240px',
                      overflowY: 'auto',
                      resize: 'vertical'
                    }}
                  />
                  {validationErrors.history && (
                    <div className="error-message">
                      <AlertCircle size={16} />
                      {validationErrors.history}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="edit-references">
                    References<span className="required-asterisk">*</span>
                  </label>
                  <textarea
                    id="edit-references"
                    value={editForm.references}
                    onChange={(e) => handleEditFormChange('references', e.target.value)}
                    className={`form-textarea ${validationErrors.references ? 'error' : ''}`}
                    placeholder="Enter dance references..."
                    rows="4"
                    style={{
                      minHeight: '120px',
                      maxHeight: '240px',
                      overflowY: 'auto',
                      resize: 'vertical'
                    }}
                  />
                  {validationErrors.references && (
                    <div className="error-message">
                      <AlertCircle size={16} />
                      {validationErrors.references}
                    </div>
                  )}
                </div>

                {/* Optional Fields */}
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
                          value={editForm.durationHours || ''}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            durationHours: parseInt(e.target.value) || 0
                          })}
                          placeholder="0"
                          min="0"
                          max="5"
                          step="1"
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
                          value={editForm.durationMinutes || ''}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            durationMinutes: parseInt(e.target.value) || 0
                          })}
                          placeholder="5"
                          min="0"
                          max="59"
                          step="1"
                          required
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
                          value={editForm.durationSeconds || ''}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            durationSeconds: parseInt(e.target.value) || 0
                          })}
                          placeholder="30"
                          min="0"
                          max="59"
                          step="1"
                          style={{ width: '70px', padding: '12px 8px' }}
                        />
                        <span style={{ fontSize: '0.9rem', color: '#718096', fontWeight: '500' }}>s</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-performers">
                      Number of Performers<span className="required-asterisk">*</span>
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="number"
                        id="edit-performers"
                        name="performers"
                        className="form-input"
                        value={editForm.performers}
                        onChange={(e) => handleEditFormChange('performers', e.target.value)}
                        placeholder="4"
                        min="1"
                        max="50"
                        step="1"
                        required
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
                  <label htmlFor="edit-music">
                    Music & Instruments<span className="required-asterisk">*</span>
                  </label>
                  <input
                    id="edit-music"
                    type="text"
                    value={editForm.music}
                    onChange={(e) => handleEditFormChange('music', e.target.value)}
                    className="form-input"
                    placeholder="Enter music and instruments"
                  />
                  {!editForm.music && (
                    <div className="form-note" style={{ color: '#888', fontSize: '0.95em' }}>
                      No music or instruments specified.
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="edit-costumes">
                    Traditional Costumes<span className="required-asterisk">*</span>
                  </label>
                  <input
                    id="edit-costumes"
                    type="text"
                    value={editForm.costumes}
                    onChange={(e) => handleEditFormChange('costumes', e.target.value)}
                    className="form-input"
                    placeholder="Enter costumes"
                  />
                  {!editForm.costumes && (
                    <div className="form-note" style={{ color: '#888', fontSize: '0.95em' }}>
                      No costumes specified.
                    </div>
                  )}
                </div>

                {/* Video Preview Upload Section */}
                <div className="form-group">
                  <label>Video Preview (Optional)</label>
                  
                  {/* Show existing preview video if it exists */}
                  {existingPreviewVideo && !deletedPreviewVideo && (
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ 
                        background: '#e8f5e8', 
                        border: '1px solid #c3e6cb', 
                        borderRadius: '8px', 
                        padding: '15px',
                        marginBottom: '10px'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          marginBottom: '10px'
                        }}>
                          <div style={{ fontWeight: '600', color: '#155724' }}>
                            📹 Current Preview Video
                          </div>
                          <button
                            type="button"
                            onClick={deleteExistingPreviewVideo}
                            style={{
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                        <video 
                          controls
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'contain',
                            backgroundColor: '#000',
                            borderRadius: '8px'
                          }}
                        >
                          <source src={existingPreviewVideo.url} />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  )}
                  
                  <div
                    className="upload-area"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'preview')}
                    onClick={() => document.getElementById('edit-preview-video-input').click()}
                    style={{
                      border: '2px dashed #e9ecef',
                      borderRadius: '12px',
                      padding: '40px 20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#f8f9fa',
                      transition: 'all 0.3s ease',
                      marginBottom: '15px'
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '10px', opacity: '0.5' }}>📹</div>
                    <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                      {existingPreviewVideo && !deletedPreviewVideo ? 'Replace Preview Video' : 'Upload New Preview Video'}
                    </div>
                    <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>Drag and drop a video file or click to browse</div>
                  </div>
                  
                  <input
                    type="file"
                    id="edit-preview-video-input"
                    style={{ display: 'none' }}
                    accept="video/*"
                    onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'preview')}
                  />

                  {previewVideo && (
                    <div style={{ marginTop: '15px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#f8f9fa',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        marginBottom: '10px'
                      }}>
                        <div>
                          <span style={{ fontWeight: '600' }}>{previewVideo.name}</span>
                          <span style={{ color: '#6c757d', marginLeft: '10px' }}>({previewVideo.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={removePreviewVideo}
                          style={{
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                      <video 
                        controls
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'contain',
                          backgroundColor: '#000',
                          borderRadius: '8px'
                        }}
                      >
                        <source src={previewVideo.url} type={previewVideo.file.type} />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </div>

                {/* Figure Videos Upload Section */}
                <div className="form-group">
                  <label>Figure Videos (Optional)</label>
                  
                  {/* Show existing figure videos */}
                  {existingFigureVideos.length > 0 && (
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ 
                        background: '#e8f5e8', 
                        border: '1px solid #c3e6cb', 
                        borderRadius: '8px', 
                        padding: '15px'
                      }}>
                        <div style={{ fontWeight: '600', color: '#155724', marginBottom: '10px' }}>
                          🎬 Current Figure Videos
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                          {existingFigureVideos.map((video, idx) => (
                            <div key={video.id} style={{
                              position: 'relative',
                              background: 'white',
                              border: '1px solid #28a745',
                              borderRadius: '8px',
                              padding: '10px',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                            }}>
                              <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem', color: '#155724' }}>
                                {video.name}
                              </div>
                              <button
                                type="button"
                                onClick={() => deleteExistingFigureVideo(video.id)}
                                style={{
                                  position: 'absolute',
                                  top: '5px',
                                  right: '5px',
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '20px',
                                  height: '20px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                ×
                              </button>
                              
                              <video 
                                controls
                                style={{
                                  width: '100%',
                                  height: '120px',
                                  objectFit: 'cover',
                                  borderRadius: '4px',
                                  backgroundColor: '#000'
                                }}
                              >
                                <source src={video.url} />
                                Video cannot be loaded
                              </video>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div
                    className="upload-area"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'figures')}
                    onClick={() => document.getElementById('edit-figures-input').click()}
                    style={{
                      border: '2px dashed #e9ecef',
                      borderRadius: '12px',
                      padding: '40px 20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#f8f9fa',
                      transition: 'all 0.3s ease',
                      marginBottom: '15px'
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '10px', opacity: '0.5' }}>🎬</div>
                    <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                      {existingFigureVideos.length > 0 ? 'Add More Figure Videos' : 'Upload Figure Videos'}
                    </div>
                    <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>Drag and drop video files or click to browse (one at a time)</div>
                  </div>
                  
                  <input
                    type="file"
                    id="edit-figures-input"
                    style={{ display: 'none' }}
                    accept="video/*"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleFileUpload(e.target.files[0], 'figures');
                        e.target.value = '';
                      }
                    }}
                  />

                  {figureVideos.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
                      {figureVideos.map((video, idx) => (
                        <div key={video.id} style={{
                          position: 'relative',
                          background: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '10px',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}>
                          <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem' }}>
                            Figure {idx + 1}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFigureVideo(video.id)}
                            style={{
                              position: 'absolute',
                              top: '5px',
                              right: '5px',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ×
                          </button>
                          
                          <video 
                            controls
                            style={{
                              width: '100%',
                              height: '120px',
                              objectFit: 'cover',
                              borderRadius: '4px',
                              backgroundColor: '#000'
                            }}
                          >
                            <source src={video.url} type={video.file.type} />
                            Video cannot be loaded
                          </video>
                          
                          <div style={{ marginTop: '8px', fontSize: '0.8rem' }}>
                            <div style={{ fontWeight: '600', color: '#2d3748' }}>
                              {truncateFileName(video.name, 15)}
                            </div>
                            <div style={{ color: '#718096' }}>
                              {video.size}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dance Image Upload Section */}
                <div className="form-group">
                  <label>Dance Image (Optional)</label>
                  
                  {/* Show existing dance image if it exists */}
                  {existingDanceImage && (deletedDanceImage === false) && (
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ 
                        background: '#e8f5e8', 
                        border: '1px solid #c3e6cb', 
                        borderRadius: '8px', 
                        padding: '15px',
                        marginBottom: '10px'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          marginBottom: '10px'
                        }}>
                          <div style={{ fontWeight: '600', color: '#155724' }}>
                            🖼️ Current Dance Image
                          </div>
                          <button
                            type="button"
                            onClick={deleteExistingDanceImage}
                            style={{
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                        <img 
                          src={existingDanceImage.url} 
                          alt="Current dance" 
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div
                    className="upload-area"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'image')}
                    onClick={() => document.getElementById('edit-image-input').click()}
                    style={{
                      border: '2px dashed #e9ecef',
                      borderRadius: '12px',
                      padding: '40px 20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#f8f9fa',
                      transition: 'all 0.3s ease',
                      marginBottom: '15px'
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '10px', opacity: '0.5' }}>🖼️</div>
                    <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                      {existingDanceImage && (deletedDanceImage === false) ? 'Replace Dance Image' : 'Upload New Dance Image'}
                    </div>
                    <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>Drag and drop an image file or click to browse</div>
                  </div>
                  
                  <input
                    type="file"
                    id="edit-image-input"
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'image')}
                  />

                  {danceImage && (
                    <div style={{ marginTop: '15px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#f8f9fa',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        marginBottom: '10px'
                      }}>
                        <div>
                          <span style={{ fontWeight: '600' }}>{danceImage.name}</span>
                          <span style={{ color: '#6c757d', marginLeft: '10px' }}>({danceImage.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={removeDanceImage}
                          style={{
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                      <img 
                        src={danceImage.url} 
                        alt="Dance preview" 
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleSaveClick}
                  disabled={!isEditChanged()}
                >
                  <Check size={16} />
                  Save Changes
                </button>
                <button
                  className="btn btn-cancel"
                  onClick={handleCancelClick}
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && danceToDelete && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Confirm Delete</h3>
              <p>
                To confirm deletion, type <b>{`"${danceToDelete.title}"`}</b> below.<br />
                This action cannot be undone.
              </p>
              <input
                type="text"
                className="form-input"
                placeholder={`Type "${danceToDelete.title}" to confirm`}
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                autoFocus
                style={{
                  marginBottom: 16,
                  borderColor:
                    deleteInput.length === 0
                      ? "#ccc"
                      : normalizeString(deleteInput) !== normalizeString(danceToDelete.title)
                        ? "red"
                        : "#28a745",
                  outline:
                    deleteInput.length === 0
                      ? ""
                      : normalizeString(deleteInput) !== normalizeString(danceToDelete.title)
                        ? "2px solid red"
                        : "2px solid #28a745"
                }}
              />
              
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Enter your current password"
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  style={{
                    paddingRight: '45px',
                    borderColor: deletePassword.length === 0 ? "#ccc" : "#28a745",
                    outline: deletePassword.length === 0 ? "" : "2px solid #28a745"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#718096',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn btn-danger"
                  onClick={() => handleDeleteDance(danceToDelete.id)}
                  disabled={normalizeString(deleteInput) !== normalizeString(danceToDelete.title) || !deletePassword.trim()}
                  title={
                    normalizeString(deleteInput) !== normalizeString(danceToDelete.title) 
                      ? "Type the exact title to enable" 
                      : !deletePassword.trim() 
                      ? "Enter your password to enable deletion"
                      : ""
                  }
                >
                  Delete
                </button>
                <button 
                  className="btn btn-cancel"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Confirmation Modal */}
        {showSaveConfirmModal && (
          <div className="modal-overlay" onClick={(e) => {
            if (e.target.className === 'modal-overlay') {
              setShowSaveConfirmModal(false);
            }
          }}>
            <div className="modal">
              <h3>Confirm Save Changes</h3>
              <p>Are you sure you want to save the changes to this dance?</p>
              <div className="modal-actions">
                <button
                  className="btn btn-primary"
                  onClick={confirmSave}
                >
                  <Check size={16} />
                  Yes, Save Changes
                </button>
                <button
                  className="btn btn-cancel"
                  onClick={() => setShowSaveConfirmModal(false)}
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Discard Changes Confirmation Modal */}
        {showDiscardConfirmModal && (
          <div className="modal-overlay" onClick={(e) => {
            if (e.target.className === 'modal-overlay') {
              setShowDiscardConfirmModal(false);
            }
          }}>
            <div className="modal">
              <h3>Discard Changes</h3>
              <p>You have unsaved changes. Are you sure you want to discard them?</p>
              <div className="modal-actions">
                <button
                  className="btn btn-danger"
                  onClick={confirmDiscard}
                >
                  <AlertCircle size={16} />
                  Yes, Discard Changes
                </button>
                <button
                  className="btn btn-cancel"
                  onClick={() => setShowDiscardConfirmModal(false)}
                >
                  <X size={16} />
                  Keep Editing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageDance;