import React, { useState, useEffect } from 'react';
import { Search, Filter, Play, MapPin } from 'lucide-react';
import Navbar from '../Components/Navbar';
import './Dances.css';
import { supabase } from '../supabasebaseClient';

const regions = ['All', 'Luzon', 'Visayas', 'Mindanao'];

const Dances = () => {
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDance, setSelectedDance] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [dances, setDances] = useState([]);
  const [loading, setLoading] = useState(true);

  // For modal
  const [figures, setFigures] = useState([]);
  const [mainVideoUrl, setMainVideoUrl] = useState('');
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchDances = async () => {
      setLoading(true);
      const { data: dancesData, error: dancesError } = await supabase
        .from('dances')
        .select('id, title, island, references, history')
        .order('created_at', { ascending: false });

      const { data: imagesData, error: imagesError } = await supabase
        .from('dance_images')
        .select('dance_id, image_url, position')
        .order('position', { ascending: true });

      if (!dancesError && !imagesError) {
        const imageMap = {};
        imagesData.forEach(img => {
          if (!imageMap[img.dance_id]) {
            imageMap[img.dance_id] = img.image_url;
          }
        });

        const merged = (dancesData || []).map(d => ({
          ...d,
          image_url: imageMap[d.id] || null
        }));
        setDances(merged);
      }
      setLoading(false);
    };
    fetchDances();
  }, []);

  // Fetch figures, main video, and images for modal
  useEffect(() => {
    const fetchFiguresAndMedia = async () => {
      if (!selectedDance) {
        setFigures([]);
        setMainVideoUrl('');
        setImages([]);
        return;
      }

      // Fetch figures (order by figure_number)
      const { data: figuresData } = await supabase
        .from('dance_figures')
        .select('*')
        .eq('dance_id', selectedDance.id)
        .order('figure_number', { ascending: true });

      setFigures(figuresData || []);

      // Fetch images (order by position)
      const { data: imagesData } = await supabase
        .from('dance_images')
        .select('*')
        .eq('dance_id', selectedDance.id)
        .order('position', { ascending: true });

      setImages(imagesData || []);

      // Main video: first video_url in dance_images with position 0, fallback to 1
      let mainVideo = imagesData?.find(img => img.position === 0 && img.video_url) ||
                      imagesData?.find(img => img.position === 1 && img.video_url);
      setMainVideoUrl(mainVideo?.video_url || '');
    };

    fetchFiguresAndMedia();
  }, [selectedDance]);

  // Filtering logic
  const filteredDances = dances.filter(dance => {
    const matchesRegion = selectedRegion === 'All' || (dance.island && dance.island.toLowerCase() === selectedRegion.toLowerCase());
    const matchesSearch = dance.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dance.province?.toLowerCase().includes(searchQuery.toLowerCase());
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

  return (
    <div className="dances-page">
      <Navbar />
      
      {/* Header Section */}
      <section className="dances-header">
        <div className="container">
          <h1 className="page-title">Filipino Folk Dances</h1>
          <p className="page-subtitle">
            Explore the rich cultural heritage of the Philippines through traditional folk dances
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="search-filter">
        <div className="container">
          <div className="search-bar">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search dances or provinces..."
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

      {/* Dances Grid */}
      <section className="dances-grid-section">
        <div className="container">
          <div className="results-info">
            <p>{filteredDances.length} dances found</p>
          </div>
          
          <div className="dances-grid">
            {loading ? (
              <div style={{ textAlign: 'center', width: '100%' }}>Loading dances...</div>
            ) : filteredDances.length === 0 ? (
              <div style={{ textAlign: 'center', width: '100%' }}>No dances found.</div>
            ) : (
              filteredDances.map(dance => (
                <div key={dance.id} className="dance-card" onClick={() => openPreview(dance)}>
                  <div className="dance-image">
                    {dance.image_url ? (
                      <img src={dance.image_url} alt={dance.title} />
                    ) : (
                      <div className="letter-circle">
                        {dance.title ? dance.title.charAt(0).toUpperCase() : "?"}
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
                        <span>{dance.island}</span>
                      </div>
                    </div>
                    
                    {/* Show only up to 2 lines of history, then "..." */}
                    <p
                      className="dance-description"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minHeight: '3em',
                        maxHeight: '3em',
                      }}
                    >
                      {dance.history}
                    </p>
                    <div className="dance-footer">
                      <button className="learn-button">
                        View Details
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
          <div className="modal-content" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Thumbnail image at the very top, fills the modal width and height */}
            {selectedDance.image_url && (
              <div style={{
                width: '100%',
                height: 220,
                overflow: 'hidden',
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                position: 'relative'
              }}>
                <img
                  src={selectedDance.image_url}
                  alt={selectedDance.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
                {/* Optional: Overlay title on image */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  background: 'rgba(0,0,0,0.45)',
                  color: '#fff',
                  padding: '16px 20px 10px 20px',
                  borderBottomLeftRadius: 12,
                  borderBottomRightRadius: 12
                }}>
                  <h2 className="modal-title" style={{ margin: 0 }}>{selectedDance.title}</h2>
                  <p className="modal-subtitle" style={{ margin: 0 }}>Traditional Filipino Folk Dance</p>
                  <div className="modal-meta-badges">
                    <span className="region-badge">{selectedDance.island}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="modal-body" style={{ padding: 24 }}>
              {/* History */}
              <div className="modal-section">
                <h3>History</h3>
                <p>{selectedDance.history}</p>
              </div>

              {/* References */}
              <div className="modal-section">
                <h3>References</h3>
                <p style={{
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}>
                  {selectedDance.references}
                </p>
              </div>

              {/* Main Video */}
              {mainVideoUrl && (
                <div className="modal-section">
                  <h3>Main Video</h3>
                  <video
                    src={mainVideoUrl}
                    controls
                    style={{
                      width: '100%',
                      maxWidth: 320,
                      height: 180,
                      borderRadius: 8,
                      marginBottom: 16,
                      background: '#000',
                      objectFit: 'cover'
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {/* Figures */}
              <div className="modal-section">
                <h3>Figures</h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 24,
                  }}
                >
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
                          height: 200,
                          borderRadius: 6,
                          background: '#000',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dances;