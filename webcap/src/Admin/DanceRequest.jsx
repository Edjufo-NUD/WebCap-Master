import React, { useState, useEffect } from 'react';
import { Search, Filter, Play, MapPin, XCircle, Check, X, AlertTriangle } from 'lucide-react';
import Navbar from '../Admin/Sidebar';
import './DanceRequest.css';
import { supabase } from '../supabasebaseClient';

const regions = ['All', 'Luzon', 'Visayas', 'Mindanao'];

// Helper to capitalize
const capitalize = (str) =>
  str && typeof str === 'string'
    ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    : '';

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  
  return date.toLocaleDateString('en-US', options);
};

const DanceRequest = () => {
  const [activeItem, setActiveItem] = useState("dance-request");
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDance, setSelectedDance] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [dances, setDances] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Notification state
  const [notification, setNotification] = useState(null);
  
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

  // Fetch requested dances from database
  useEffect(() => {
    const fetchDances = async () => {
      setLoading(true);
      
      try {
        let query = supabase
          .from('dances')
          .select(`
            id, title, island, history, main_video_url, status, user_id, created_at,
            users:user_id (
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

        // Also fetch images for the dances
        const { data: imagesData, error: imagesError } = await supabase
          .from('dance_images')
          .select('dance_id, image_url, position')
          .order('position', { ascending: true });

        if (!dancesError && !imagesError) {
          // Create image map
          const imageMap = {};
          imagesData?.forEach(img => {
            if (!imageMap[img.dance_id]) {
              imageMap[img.dance_id] = img.image_url;
            }
          });

          const dbDances = (dancesData || []).map(d => ({
            ...d,
            image_url: imageMap[d.id] || null,
            island: capitalize(d.island || ''),
            origin: capitalize(d.island || ''),
            uploader: d.users ? {
              username: d.users.username,
              email: d.users.email
            } : null
          }));

          setDances(dbDances);
        } else {
          console.error('Error fetching dances:', dancesError);
          console.error('Error fetching images:', imagesError);
          setDances([]);
        }
      } catch (error) {
        console.error('Error in fetchDances:', error);
        setDances([]);
      }
      
      setLoading(false);
    };
    
    fetchDances();
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

  // Modal: Cancel body scroll
  useEffect(() => {
    document.body.style.overflow = showPreview ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showPreview]);

  const filteredDances = dances.filter(dance => {
    const matchesRegion =
      selectedRegion === 'All' ||
      (dance.island && dance.island.toLowerCase() === selectedRegion.toLowerCase());
    const matchesSearch =
      dance.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

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

  // Cancel Request
  const handleCancel = async (danceId) => {
    try {
      // Update database dance status to cancelled
      const { error } = await supabase
        .from('dances')
        .update({ status: 'cancelled' })
        .eq('id', danceId);
      
      if (!error) {
        showNotification('Dance request cancelled successfully.', 'warning');
        setDances(prev => prev.filter(d => d.id !== danceId));
      } else {
        showNotification('Error cancelling request: ' + error.message, 'error');
      }
      closePreview();
    } catch (e) {
      console.error('Cancel request error:', e);
      showNotification('Error cancelling request', 'error');
    }
  };

  return (
    <div className="dance-request-page">
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

      {/* Search & Filter */}
      <section className="search-filter">
        <div className="container">
          <div className="search-bar">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search dances..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-tabs">
            <Filter className="filter-icon" size={20} />
            <div className="region-tabs">
              {regions.map(region => (
                <button
                  key={region}
                  className={`region-tab ${selectedRegion === region ? 'active' : ''}`}
                  onClick={() => setSelectedRegion(region)}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="dances-grid-section">
        <div className="container">
          <div className="results-info">
            <p>
              {filteredDances.length} {userRole === 'admin' ? 'your' : ''} pending dance requests found
            </p>
          </div>

          <div className="dances-grid">
            {loading ? (
              <div style={{ textAlign: 'center', width: '100%' }}>
                Loading {userRole === 'admin' ? 'your' : ''} pending dance requests...
              </div>
            ) : filteredDances.length === 0 ? (
              <div style={{ textAlign: 'center', width: '100%' }}>
                No {userRole === 'admin' ? 'pending requests from you' : 'pending dance requests'} found.
              </div>
            ) : (
              filteredDances.map(dance => (
                <div key={dance.id} className="dance-card" onClick={() => openPreview(dance)}>
                  <div className="requested-badge">Pending</div>
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
                    <span className="requested-badge-modal">Pending</span>
                  </div>
                </div>
              </div>
            )}

            <div className="modal-body" style={{ padding: 24 }}>
              {/* Show uploader info for superadmins */}
              {userRole === 'superadmin' && selectedDance.uploader && (
                <div className="modal-section">
                  <h3>Request Information</h3>
                  <div style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '12px 16px', 
                    borderRadius: '6px',
                    border: '1px solid #e9ecef',
                    marginBottom: '16px'
                  }}>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>
                      <strong>Uploaded by:</strong> {selectedDance.uploader.username} ({selectedDance.uploader.email})
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#666' }}>
                      <strong>Submitted at:</strong> {formatDate(selectedDance.created_at)}
                    </p>
                  </div>
                </div>
              )}

              {/* History */}
              <div className="modal-section">
                <h3>History</h3>
                <p>{selectedDance.history}</p>
              </div>

              {/* Performance Details */}
              {(selectedDance.duration || selectedDance.performers || selectedDance.island) && (
                <div className="modal-section">
                  <h3>Performance Details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1rem 0' }}>
                    {selectedDance.duration && <div><strong>Duration:</strong> {selectedDance.duration}</div>}
                    {selectedDance.performers && <div><strong>Performers:</strong> {selectedDance.performers}</div>}
                    <div><strong>Island:</strong> {capitalize(selectedDance.island)}</div>
                  </div>
                </div>
              )}

              {/* Music & Costumes */}
              {(selectedDance.music || selectedDance.costumes) && (
                <div className="modal-section">
                  <h3>Music & Costumes</h3>
                  {selectedDance.music && <p><strong>Music:</strong> {selectedDance.music}</p>}
                  {selectedDance.costumes && <p><strong>Costumes:</strong> {selectedDance.costumes}</p>}
                </div>
              )}

              {/* References */}
              {selectedDance.references && (
                <div className="modal-section">
                  <h3>References</h3>
                  <p style={{ whiteSpace: 'pre-line', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    {selectedDance.references}
                  </p>
                </div>
              )}

              {/* Main video if present */}
              {mainVideoUrl && (
                <div className="modal-section" style={{ textAlign: 'center', margin: '32px 0' }}>
                  <h3 style={{ marginBottom: 12 }}>Cultural Dance</h3>
                  <video
                    src={mainVideoUrl}
                    controls
                    style={{
                      width: '100%',
                      maxWidth: 520,
                      height: 320,
                      borderRadius: 12,
                      background: '#000',
                      objectFit: 'cover',
                      boxShadow: '0 4px 24px #0002'
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
                  {figures.length === 0 ? (
                    <span style={{ gridColumn: '1 / -1' }}>No figures uploaded.</span>
                  ) : (
                    figures.map((fig, idx) => (
                      <div key={fig.id} className="figure-box">
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>
                          Figure {fig.figure_number ?? idx + 1}
                        </div>
                        <video
                          src={fig.video_url}
                          controls
                          style={{
                            width: '100%',
                            height: 200,
                            borderRadius: 6,
                            background: '#000',
                            objectFit: 'cover'
                          }}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="approval-actions">
                <button className="cancel-button" onClick={() => handleCancel(selectedDance.id)}>
                  <XCircle size={20} />
                  Cancel Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DanceRequest;
