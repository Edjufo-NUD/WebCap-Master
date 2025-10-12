import React, { useState, useEffect } from 'react';
import { Play, MapPin, ChevronUp, Check, X, AlertTriangle, Search, Filter, XCircle } from 'lucide-react';
import Navbar from '../Admin/Sidebar';
import './DanceRequest.css';
import { supabase } from '../supabasebaseClient';

const regions = ['All', 'Luzon', 'Visayas', 'Mindanao'];

// Helper function to convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (url) => {
  if (!url) return '';
  
  // Handle different YouTube URL formats
  let videoId = '';
  
  if (url.includes('youtube.com/shorts/')) {
    videoId = url.split('youtube.com/shorts/')[1].split('?')[0];
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0];
  } else if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1].split('&')[0];
  }
  
  return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
};

// Helper to capitalize the first letter
const capitalize = (str) => str && typeof str === 'string'
  ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  : '';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  
  return date.toLocaleDateString('en-US', options);
};

// Helper for formal N/A display
const displayOrNA = (value) => value && value.trim() ? value : "N/A";

const DanceRequest = () => {
  const [activeItem, setActiveItem] = useState("dance-request");
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDance, setSelectedDance] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [dances, setDances] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // History sidebar state
  const [historyDances, setHistoryDances] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Reason modal state
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReasonDance, setSelectedReasonDance] = useState(null);
  
  // Cancel confirmation modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [danceToCancel, setDanceToCancel] = useState(null);
  
  // Notification state
  const [notification, setNotification] = useState(null);
  
  // Search and sort state
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  
  // For modal data
  const [figures, setFigures] = useState([]);
  const [mainVideoUrl, setMainVideoUrl] = useState('');
  const [images, setImages] = useState([]);

  // Get current user role and id for filtering
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const currentUserId = localStorage.getItem("user_id");
  const userRole = currentUser?.role;

  // Show notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
    
    // Trigger a storage event to notify Sidebar of count change
    window.dispatchEvent(new CustomEvent('pendingCountChanged'));
  };

  useEffect(() => {
    const fetchDances = async () => {
      setLoading(true);
      // Fetch only pending dances with uploader information
      let query = supabase
        .from('dances')
        .select(`
          id, 
          title, 
          island, 
          references, 
          history, 
          main_video_url, 
          duration, 
          performers, 
          music, 
          costumes, 
          status, 
          user_id,
          created_at,
          users!user_id (
            username,
            email
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      // If current user is admin, only show their own dances
      if (userRole === 'admin' && currentUserId) {
        query = query.eq('user_id', currentUserId);
      }
      // Superadmins see all pending dances

      const { data: dancesData, error: dancesError } = await query;

      const { data: imagesData, error: imagesError } = await supabase
        .from('dance_images')
        .select('dance_id, image_url, position')
        .order('position', { ascending: true });

      if (!dancesError && !imagesError) {
        const imageMap = {};
        imagesData?.forEach(img => {
          if (!imageMap[img.dance_id]) {
            imageMap[img.dance_id] = img.image_url;
          }
        });

        const databaseDances = (dancesData || []).map(d => ({
          ...d,
          image_url: imageMap[d.id] || null,
          isFeatured: false,
          duration: d.duration || '',
          performers: d.performers || '',
          music: d.music || '',
          costumes: d.costumes || '',
          island: capitalize(d.island || ''),
          origin: capitalize(d.island || ''),
          uploader: d.users ? {
            username: d.users.username,
            email: d.users.email
          } : null
        }));

        // Only show database dances
        setDances(databaseDances);
      } else {
        console.error('Error fetching dances:', dancesError);
        console.error('Error fetching images:', imagesError);
        // If there's an error with database, show empty list
        setDances([]);
      }
      setLoading(false);
    };
    fetchDances();
  }, [userRole, currentUserId]);

  // Handle clicking on declined history items to show reason
  const handleHistoryClick = async (dance) => {
    if (dance.status === 'declined') {
      // Fetch the full dance data including decline reason
      const { data: danceData, error } = await supabase
        .from('dances')
        .select('decline_reason, title')
        .eq('id', dance.id)
        .single();
      
      if (!error && danceData) {
        setSelectedReasonDance({
          ...dance,
          decline_reason: danceData.decline_reason,
          title: danceData.title
        });
        setShowReasonModal(true);
      }
    }
  };

  // Fetch history of approved/declined dances for current user
  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        let query = supabase
          .from('dances')
          .select(`
            id, title, status, created_at, user_id,
            users:user_id (
              username
            )
          `)
          .in('status', ['approved', 'declined'])
          .order('created_at', { ascending: false })
          .limit(20);

        // If admin, only show their own history
        if (userRole === 'admin' && currentUserId) {
          query = query.eq('user_id', currentUserId);
        }

        const { data: historyData, error: historyError } = await query;

        if (!historyError) {
          setHistoryDances(historyData || []);
        } else {
          console.error('Error fetching history:', historyError);
        }
      } catch (error) {
        console.error('Error in fetchHistory:', error);
      }
      setLoadingHistory(false);
    };

    fetchHistory();
  }, [userRole, currentUserId]);

  // Fetch figures, main video, and images for modal
  useEffect(() => {
    const fetchFiguresAndMedia = async () => {
      if (!selectedDance) {
        setFigures([]);
        setMainVideoUrl('');
        setImages([]);
        return;
      }

      // Fetch dance figures
      const { data: figuresData } = await supabase
        .from('dance_figures')
        .select('*')
        .eq('dance_id', selectedDance.id)
        .order('figure_number', { ascending: true });

      setFigures(figuresData || []);

      // Fetch dance images
      const { data: imagesData } = await supabase
        .from('dance_images')
        .select('*')
        .eq('dance_id', selectedDance.id)
        .order('position', { ascending: true });

      setImages(imagesData || []);

      // Set main video URL
      let mainVideo = imagesData?.find(img => img.position === 0 && img.video_url) ||
                      imagesData?.find(img => img.position === 1 && img.video_url);
      setMainVideoUrl(mainVideo?.video_url || selectedDance.main_video_url || '');
    };

    fetchFiguresAndMedia();
  }, [selectedDance]);

  useEffect(() => {
    if (showPreview) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showPreview]);

  useEffect(() => {
    if (!showPreview) return;

    const preventScroll = (e) => {
      const modalContent = document.querySelector('.modal-content');
      if (modalContent && !modalContent.contains(e.target)) {
        e.preventDefault();
      }
    };

    document.addEventListener('wheel', preventScroll, { passive: false });
    document.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      document.removeEventListener('wheel', preventScroll, { passive: false });
      document.removeEventListener('touchmove', preventScroll, { passive: false });
    };
  }, [showPreview]);

  const filteredDances = dances.filter(dance => {
    const matchesRegion =
      selectedRegion === 'All' ||
      (dance.island && dance.island.toLowerCase() === selectedRegion.toLowerCase());
    const matchesSearch =
      dance.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dance.uploader?.username?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  // Sorting logic
  const sortedDances = [...filteredDances].sort((a, b) => {
    switch (sortOption) {
      case 'a-z':
        return a.title?.localeCompare(b.title) || 0;
      case 'z-a':
        return b.title?.localeCompare(a.title) || 0;
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'newest':
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  const handleSortChange = (option) => {
    setSortOption(option);
    setShowSortDropdown(false);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSortDropdown && !e.target.closest('.sort-dropdown-container')) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSortDropdown]);

  const openPreview = (dance) => {
    setSelectedDance(dance);
    setShowPreview(true);
  };
  
  const closePreview = () => {
    setShowPreview(false);
    setSelectedDance(null);
    setFigures([]);
    setMainVideoUrl('');
    setImages([]);
  };

  // Show cancel confirmation modal
  const handleCancelClick = (danceId) => {
    setDanceToCancel(danceId);
    setShowCancelModal(true);
  };

  // Cancel Request (confirmed)
  const handleCancel = async () => {
    if (!danceToCancel) return;
    
    try {
      // Update database dance status to cancelled
      const { error } = await supabase
        .from('dances')
        .update({ status: 'cancelled' })
        .eq('id', danceToCancel);
      
      if (!error) {
        showNotification('Dance request cancelled successfully.', 'warning');
        setDances(prev => prev.filter(d => d.id !== danceToCancel));
        setShowCancelModal(false);
        setDanceToCancel(null);
        closePreview();
      } else {
        showNotification('Error cancelling request: ' + error.message, 'error');
      }
    } catch (e) {
      console.error('Cancel request error:', e);
      showNotification('Error cancelling request', 'error');
    }
  };

  // Cancel the cancel confirmation
  const handleCancelModalClose = () => {
    setShowCancelModal(false);
    setDanceToCancel(null);
  };

  return (
    <div className="dance-approval-page">
        <Navbar activeItem={activeItem} setActiveItem={setActiveItem} />
      
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            {notification.type === 'success' && <Check size={20} />}
            {notification.type === 'error' && <X size={20} />}
            {notification.type === 'warning' && <AlertTriangle size={20} />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Dance Request History */}
      <div className="history-sidebar">
        <div className="history-content">
          {loadingHistory ? (
            <div className="history-loading">Loading history...</div>
          ) : historyDances.length === 0 ? (
            <div className="history-empty">No request history yet</div>
          ) : (
            <div className="history-scroll-container">
              <div className="history-header">
                <h3>Dance Request History</h3>
              </div>
              <div className="history-items-row">
                {historyDances.map(dance => (
                  <div 
                    key={dance.id} 
                    className={`history-item ${dance.status} ${dance.status === 'declined' ? 'clickable' : ''}`}
                    onClick={dance.status === 'declined' ? () => handleHistoryClick(dance) : undefined}
                    title={dance.status === 'declined' ? 'Click to view decline reason' : ''}
                  >
                    <div className="history-title">{dance.title}</div>
                    <div className="history-status">
                      <span className={`status-badge ${dance.status}`}>
                        {dance.status === 'approved' ? '✓ Approved' : '✗ Declined'}
                      </span>
                    </div>
                    {userRole === 'superadmin' && dance.users && (
                      <div className="history-uploader">
                        by {dance.users.username}
                      </div>
                    )}
                    <div className="history-date">
                      {formatDate(dance.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search and Controls Section - ManageDance Style */}
      <div className="manage-dance-controls">
        <div className="controls-left">
          <div className="dance-search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search dances or uploaders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="dance-search-input"
            />
          </div>
          
          {/* Region Filter */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="filter-select"
            style={{ 
              color: '#000000', 
              backgroundColor: '#ffffff',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              appearance: 'none'
            }}
          >
            <option value="All" style={{ color: '#000000', backgroundColor: '#ffffff' }}>All Regions</option>
            <option value="Luzon" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Luzon</option>
            <option value="Visayas" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Visayas</option>
            <option value="Mindanao" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Mindanao</option>
          </select>
        </div>
        
        <div className="controls-right">
          <select
            value={sortOption}
            onChange={(e) => handleSortChange(e.target.value)}
            className="sort-select"
            style={{ 
              color: '#000000', 
              backgroundColor: '#ffffff',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              appearance: 'none'
            }}
          >
            <option value="newest" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Newest First</option>
            <option value="oldest" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Oldest First</option>
            <option value="a-z" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Title A-Z</option>
            <option value="z-a" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Title Z-A</option>
          </select>
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info-center">
        <p>{sortedDances.length} {userRole === 'admin' ? 'your' : ''} pending dances found</p>
      </div>

      {/* Grid */}
      <section className="dances-grid-section">
        <div className="container">
          <div className="dances-grid">
            {loading ? (
              <div style={{ textAlign: 'center', width: '100%' }}>
                Loading {userRole === 'admin' ? 'your' : ''} pending dance requests...
              </div>
            ) : sortedDances.length === 0 ? (
              <div style={{ textAlign: 'center', width: '100%' }}>
                {/* Empty state - no message */}
              </div>
            ) : (
              sortedDances.map(dance => (
                <div key={dance.id} className="dance-card" onClick={() => openPreview(dance)}>
                  <div className="pending-badge">Pending Approval</div>
                  <div className="dance-image">
                    {dance.image_url ? (
                      <img src={dance.image_url} alt={dance.title} />
                    ) : (
                      <div className="letter-circle">
                        {dance.title ? dance.title.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                    <div className="dance-overlay">
                      <button className="play-button">
                        <Play size={24} />
                      </button>
                    </div>
                  </div>

                  <div className="dance-content">
                    <div className="dance-header">
                      <h3 className="dance-name">{dance.title}</h3>
                    </div>

                    <div className="dance-meta">
                      <div className="meta-item">
                        <MapPin size={14} />
                        <span>{capitalize(dance.island)}</span>
                      </div>
                    </div>

                    {/* Show uploader info for superadmin */}
                    {userRole === 'superadmin' && dance.uploader && (
                      <div className="uploader-info" style={{
                        fontSize: '0.85rem',
                        color: '#666',
                        backgroundColor: '#f8f9fa',
                        padding: '6px 8px',
                        borderRadius: '4px',
                        marginBottom: '8px',
                        border: '1px solid #e9ecef'
                      }}>
                        <strong>Uploaded by:</strong> {dance.uploader.username}
                      </div>
                    )}

                    {/* Upload date info */}
                    <div className="upload-info" style={{
                      fontSize: '0.85rem',
                      color: '#666',
                      backgroundColor: '#f0f9ff',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      marginBottom: '8px',
                      border: '1px solid #bae6fd'
                    }}>
                      <strong>Submitted at:</strong> {formatDate(dance.created_at)}
                    </div>

                    <div className="dance-footer">
                      <button className="review-button">
                        {userRole === 'admin' ? 'View Request' : 'Review Request'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Preview Modal */}
      {showPreview && selectedDance && (
        <div className="preview-modal">
          <div className="modal-backdrop" onClick={closePreview}></div>
          <div className="modal-content" style={{ padding: 0, overflow: 'auto', maxHeight: '90vh' }}>
            {selectedDance.image_url && (
              <div style={{ width: '100%', height: 220, overflow: 'hidden', borderTopLeftRadius: 12, borderTopRightRadius: 12, position: 'relative' }}>
                <img
                  src={selectedDance.image_url}
                  alt={selectedDance.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, width: '100%',
                  background: 'rgba(0,0,0,0.45)', color: '#fff',
                  padding: '16px 20px 10px 20px',
                  borderBottomLeftRadius: 12, borderBottomRightRadius: 12
                }}>
                  <h2 className="modal-title" style={{ margin: 0 }}>{selectedDance.title}</h2>
                  <p className="modal-subtitle" style={{ margin: 0 }}>Traditional Filipino Folk Dance - Pending Approval</p>
                  <div className="modal-meta-badges">
                    <span className="region-badge">{capitalize(selectedDance.island)}</span>
                    <span className="pending-badge-modal">Pending</span>
                  </div>
                </div>
              </div>
            )}

            <div className="modal-body" style={{ padding: 24 }}>
              {/* Show upload info for all users in dance request */}
              {selectedDance.uploader && (
                <div className="modal-section">
                  <h3>Upload Information</h3>
                  <div style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '12px 16px', 
                    borderRadius: '6px',
                    border: '1px solid #e9ecef',
                    marginBottom: '16px'
                  }}>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>
                      <strong>Uploaded by:</strong> {selectedDance.uploader.username}
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#666' }}>
                      <strong>Email:</strong> {selectedDance.uploader.email}
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#666' }}>
                      <strong>Submitted at:</strong> {formatDate(selectedDance.created_at)}
                    </p>
                  </div>
                </div>
              )}

              {/* Performance Details */}
              <div className="modal-section">
                <h3>Performance Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1rem 0' }}>
                  <div><strong>Duration:</strong> {displayOrNA(selectedDance.duration)}</div>
                  <div><strong>Performers:</strong> {displayOrNA(selectedDance.performers)}</div>
                  <div><strong>Island:</strong> {displayOrNA(selectedDance.island)}</div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Music & Costumes</h3>
                <p><strong>Music:</strong> {displayOrNA(selectedDance.music)}</p>
                <p><strong>Costumes:</strong> {displayOrNA(selectedDance.costumes)}</p>
              </div>

              <div className="modal-section">
                <h3>References</h3>
                <p style={{
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}>
                  {displayOrNA(selectedDance.references)}
                </p>
              </div>

              {/* History */}
              <div className="modal-section">
                <h3>History</h3>
                <p style={{
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}>
                  {displayOrNA(selectedDance.history)}
                </p>
              </div>

              {/* Main Video */}
              {mainVideoUrl && (
                <div className="modal-section modal-video-section" style={{ 
                  textAlign: 'center', 
                  margin: '32px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <h3 style={{ marginBottom: 12 }}>Cultural Dance</h3>
                  <video
                    src={mainVideoUrl}
                    controls
                    className="main-dance-video"
                    style={{
                      width: '100%',
                      maxWidth: '520px',
                      height: 'auto',
                      maxHeight: '400px',
                      borderRadius: '12px',
                      background: '#000',
                      objectFit: 'contain',
                      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
                      display: 'block',
                      margin: '0 auto',
                      position: 'relative',
                      zIndex: '1'
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {/* Figures */}
              <div className="modal-section">
                <h3>Figures</h3>
                <div className="figures-grid">
                  {figures.length === 0 && <span style={{ gridColumn: '1 / -1' }}>No figures uploaded.</span>}
                  {figures.map((fig, idx) => (
                    <div key={fig.id} className="figure-box">
                      <div style={{ fontWeight: 600, marginBottom: 6 }}>
                        Figure {fig.figure_number ?? idx + 1}
                      </div>
                      <video
                        src={fig.video_url}
                        controls
                        style={{
                          width: '100%',
                          height: 'auto',
                          minHeight: 150,
                          maxHeight: 200,
                          borderRadius: 6,
                          background: '#000',
                          objectFit: 'contain',
                          display: 'block'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>



              {/* Action */}
              <div className="approval-actions">
                <button className="cancel-button" onClick={() => handleCancelClick(selectedDance.id)}>
                  <XCircle size={20} />
                  Cancel Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decline Reason Display Modal */}
      {showReasonModal && selectedReasonDance && (
        <div className="modal-overlay" onClick={() => setShowReasonModal(false)}>
          <div className="reason-modal" onClick={e => e.stopPropagation()}>
            <h3>Decline Reason</h3>
            <div className="dance-info">
              <strong>Dance:</strong> {selectedReasonDance.title}
            </div>
            <div className="decline-reason-display">
              <label>Reason for Decline:</label>
              <div className="reason-text">
                {selectedReasonDance.decline_reason || 'No reason provided'}
              </div>
            </div>
            <div className="reason-actions">
              <button 
                className="close-btn"
                onClick={() => setShowReasonModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="navigation-modal-overlay">
          <div className="navigation-modal-content">
            <div className="navigation-modal-header">
              <div className="navigation-modal-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="navigation-modal-title">
                Cancel Dance Request?
              </h3>
            </div>
            <div className="navigation-modal-body">
              <p className="navigation-modal-message">
                Are you sure you want to cancel this dance request? Once cancelled, your dance submission will be removed from the approval queue.
              </p>
              <p className="navigation-modal-submessage">
                This action cannot be undone.
              </p>
            </div>
            <div className="navigation-modal-actions">
              <button 
                className="logout-modal-confirm"
                onClick={handleCancel}
              >
                Cancel Request
              </button>
              <button 
                className="logout-modal-cancel"
                onClick={handleCancelModalClose}
              >
                Keep Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DanceRequest;
