import React, { useState, useEffect } from 'react';
import { Search, Filter, Play, MapPin, ChevronUp, ArrowUp, Check, X } from 'lucide-react';
import Navbar from '../Admin/Sidebar';
import './DanceApproval.css';
import { supabase } from '../supabasebaseClient';
import tiklosImage from '../assets/tiklos.png';
import binungeyImage from '../assets/binungeybg.png';
import suakusuaImage from '../assets/Sua.png';
import pahidImage from '../assets/Pahid.png';

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

// Hardcoded featured dances with correct YouTube videos
const featuredDances = [
  {
    id: 'featured-1',
    title: 'Binungey',
    island: 'Luzon',
    province: 'Abra',
    image_url: binungeyImage,
    history: 'A traditional dance from Abra celebrating harvest and community unity. This dance represents the joy and gratitude of farmers during harvest season. Performers wear traditional Ilocano costumes and use farming tools as props.',
    references: 'Traditional Ilocano folk music with gongs and drums. Colorful traditional Ilocano attire with wide-brimmed hats.',
    main_video_url: 'https://youtu.be/F9FhAKrlNMo', // Binungey Cultural Dance
    difficulty: 'Intermediate',
    duration: '4-6 minutes',
    performers: '6-8 dancers',
    origin: 'Northern Luzon',
    significance: 'This dance represents the joy and gratitude of farmers during harvest season. Performers wear traditional Ilocano costumes and use farming tools as props.',
    music: 'Traditional Ilocano folk music with gongs and drums',
    costumes: 'Colorful traditional Ilocano attire with wide-brimmed hats',
    isFeatured: true,
    status: 'pending',
    // Figure videos for Binungey
    figureVideos: [
      {
        id: 'binungey-fig-1',
        figure_number: 1,
        video_url: 'https://youtube.com/shorts/nHwHrEnLhi4?feature=share'
      },
      {
        id: 'binungey-fig-2',
        figure_number: 2,
        video_url: 'https://youtube.com/shorts/mCqgoAv4WzI?feature=share'
      },
      {
        id: 'binungey-fig-3',
        figure_number: 3,
        video_url: 'https://youtube.com/shorts/LSUvULJIyV4?feature=share'
      },
      {
        id: 'binungey-fig-4',
        figure_number: 4,
        video_url: 'https://youtube.com/shorts/Uk4FDTOZWPQ?feature=share'
      },
      {
        id: 'binungey-fig-5',
        figure_number: 5,
        video_url: 'https://youtube.com/shorts/a_b9blnDamc?feature=share'
      },
      {
        id: 'binungey-fig-6',
        figure_number: 6,
        video_url: 'https://youtube.com/shorts/n_r16_HlaGc?feature=share'
      },
      {
        id: 'binungey-fig-7',
        figure_number: 7,
        video_url: 'https://youtube.com/shorts/pPwaI_reVwA?feature=share'
      }
    ]
  },
  {
    id: 'featured-4',
    title: 'Pahid',
    island: 'Luzon',
    province: 'Northern Luzon',
    image_url: pahidImage,
    history: 'A traditional Filipino folk dance that showcases graceful movements and cultural heritage. This dance demonstrates the refined artistry and storytelling tradition of Filipino culture through expressive choreography.',
    references: 'Traditional Filipino folk music with indigenous instruments. Traditional Filipino attire with cultural significance.',
    main_video_url: '',
    difficulty: 'Intermediate',
    duration: '4-6 minutes',
    performers: '4-8 dancers',
    origin: 'Northern Luzon',
    significance: 'This dance represents the artistic expression and cultural storytelling traditions of the Filipino people, showcasing graceful movements and cultural heritage.',
    music: 'Traditional Filipino folk music with indigenous instruments',
    costumes: 'Traditional Filipino attire with cultural significance',
    isFeatured: true,
    status: 'pending',
    figureVideos: [
      {
        id: 'pahid-fig-1',
        figure_number: 1,
        video_url: 'https://youtube.com/shorts/AAM6CMk9E6s?feature=share'
      },
      {
        id: 'pahid-fig-2',
        figure_number: 2,
        video_url: 'https://youtube.com/shorts/-tEzpvd1oB8?feature=share'
      },
      {
        id: 'pahid-fig-3',
        figure_number: 3,
        video_url: 'https://youtube.com/shorts/kUVOrXvO9EQ?feature=share'
      },
      {
        id: 'pahid-fig-4',
        figure_number: 4,
        video_url: 'https://youtube.com/shorts/1TWD3F2ud_Y?feature=share'
      },
      {
        id: 'pahid-fig-5',
        figure_number: 5,
        video_url: 'https://youtube.com/shorts/kfL9hBx7Jx8?feature=share'
      },
      {
        id: 'pahid-fig-6',
        figure_number: 6,
        video_url: 'https://youtube.com/shorts/cXnMmvGtDIQ?feature=share'
      }
    ]
  },
  {
    id: 'featured-2',
    title: 'Sua Ku Sua',
    island: 'Mindanao',
    province: 'Jolo, Sulu',
    image_url: suakusuaImage,
    history: 'A courtship dance from the Tausug people of Sulu. A graceful courtship dance that tells the story of a prince wooing a princess. The dance showcases the refined culture of the Tausug people.',
    references: 'Traditional Tausug kulintang ensemble. Elaborate Muslim royal attire with intricate embroidery.',
    main_video_url: '',
    difficulty: 'Advanced',
    duration: '5-7 minutes',
    performers: '2-4 dancers',
    origin: 'Mindanao',
    significance: 'A graceful courtship dance that tells the story of a prince wooing a princess. The dance showcases the refined culture of the Tausug people.',
    music: 'Traditional Tausug kulintang ensemble',
    costumes: 'Elaborate Muslim royal attire with intricate embroidery',
    isFeatured: true,
    status: 'pending',
    figureVideos: [
      {
        id: 'suakusua-fig-1',
        figure_number: 1,
        video_url: 'https://youtube.com/shorts/0QybWUPPYiA?feature=share'
      },
      {
        id: 'suakusua-fig-2',
        figure_number: 2,
        video_url: 'https://youtube.com/shorts/QHV3Tpqbulc?feature=share'
      },
      {
        id: 'suakusua-fig-3',
        figure_number: 3,
        video_url: 'https://youtube.com/shorts/xVP-AzE9Ing?feature=share'
      },
      {
        id: 'suakusua-fig-4',
        figure_number: 4,
        video_url: 'https://youtube.com/shorts/EBU8wY3mZjk?feature=share'
      },
      {
        id: 'suakusua-fig-5',
        figure_number: 5,
        video_url: 'https://youtube.com/shorts/0DxN9IZHGVw?feature=share'
      },
      {
        id: 'suakusua-fig-6',
        figure_number: 6,
        video_url: 'https://youtube.com/shorts/ZGjHBhKvngY?feature=share'
      },
      {
        id: 'suakusua-fig-7',
        figure_number: 7,
        video_url: 'https://youtube.com/shorts/4XyxXhRWooI?feature=share'
      },
      {
        id: 'suakusua-fig-8',
        figure_number: 8,
        video_url: 'https://youtube.com/shorts/i-t-1Re42cs?feature=share'
      },
      {
        id: 'suakusua-fig-9',
        figure_number: 9,
        video_url: 'https://youtube.com/shorts/BCTQqVNfbbc'
      },
      {
        id: 'suakusua-fig-10',
        figure_number: 10,
        video_url: 'https://youtube.com/shorts/_TP40XGCtHA?feature=share'
      }
    ]
  },
  {
    id: 'featured-3',
    title: 'Tiklos',
    island: 'Visayas',
    province: 'Leyte',
    image_url: tiklosImage,
    history: 'A dance depicting the Bayanihan spirit of community cooperation. Represents the Filipino spirit of bayanihan (community cooperation) where neighbors help each other during planting and harvesting seasons.',
    references: 'Lively Visayan folk music with traditional instruments. Simple rural Filipino clothing reflecting farming attire.',
    main_video_url: 'https://youtube.com/shorts/QnkC5NnK0L4?feature=share',
    difficulty: 'Beginner',
    duration: '3-5 minutes',
    performers: '8-12 dancers',
    origin: 'Visayas',
    significance: 'Represents the Filipino spirit of bayanihan (community cooperation) where neighbors help each other during planting and harvesting seasons.',
    music: 'Lively Visayan folk music with traditional instruments',
    costumes: 'Simple rural Filipino clothing reflecting farming attire',
    isFeatured: true,
    status: 'pending',
    figureVideos: [
      {
        id: 'tiklos-fig-1',
        figure_number: 1,
        video_url: 'https://youtube.com/shorts/1HObuAVDv9o?feature=share'
      },
      {
        id: 'tiklos-fig-2',
        figure_number: 2,
        video_url: 'https://youtube.com/shorts/hzBRQjOhJ-A?feature=share'
      },
      {
        id: 'tiklos-fig-3',
        figure_number: 3,
        video_url: 'https://youtube.com/shorts/feTYg33dEUY?feature=share'
      },
      {
        id: 'tiklos-fig-4',
        figure_number: 4,
        video_url: 'https://youtube.com/shorts/hWDzGWTix6g?feature=share'
      }
    ]
  }
];

// Helper to capitalize the first letter
const capitalize = (str) => str && typeof str === 'string'
  ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  : '';

const DanceApproval = () => {
  const [activeItem, setActiveItem] = useState("dance-approval");
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDance, setSelectedDance] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [dances, setDances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // For modal
  const [figures, setFigures] = useState([]);
  const [mainVideoUrl, setMainVideoUrl] = useState('');
  const [images, setImages] = useState([]);

  // Show button when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchDances = async () => {
      setLoading(true);
      // Fetch only pending dances for approval
      const { data: dancesData, error: dancesError } = await supabase
        .from('dances')
        .select('id, title, island, references, history, main_video_url, duration, performers, music, costumes, status')
        .eq('status', 'pending')
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

        const databaseDances = (dancesData || []).map(d => ({
          ...d,
          image_url: imageMap[d.id] || null,
          isFeatured: false,
          duration: d.duration || '',
          performers: d.performers || '',
          music: d.music || '',
          costumes: d.costumes || '',
          island: capitalize(d.island || ''),
          origin: capitalize(d.island || '')
        }));

        // For demo purposes, include featured dances with pending status
        const pendingFeaturedDances = featuredDances.filter(dance => dance.status === 'pending');
        const combinedDances = [...pendingFeaturedDances, ...databaseDances];
        setDances(combinedDances);
      } else {
        // If there's an error with database, just show pending featured dances
        const pendingFeaturedDances = featuredDances.filter(dance => dance.status === 'pending');
        setDances(pendingFeaturedDances);
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

      // For featured dances, use the figureVideos array
      if (selectedDance.isFeatured) {
        setFigures(selectedDance.figureVideos || []);
        setMainVideoUrl(selectedDance.main_video_url || (selectedDance.figureVideos?.[0]?.video_url || ''));
        setImages([]);
        return;
      }

      // For database dances, fetch from Supabase
      const { data: figuresData } = await supabase
        .from('dance_figures')
        .select('*')
        .eq('dance_id', selectedDance.id)
        .order('figure_number', { ascending: true });

      setFigures(figuresData || []);

      const { data: imagesData } = await supabase
        .from('dance_images')
        .select('*')
        .eq('dance_id', selectedDance.id)
        .order('position', { ascending: true });

      setImages(imagesData || []);

      let mainVideo = imagesData?.find(img => img.position === 0 && img.video_url) ||
                      imagesData?.find(img => img.position === 1 && img.video_url);
      setMainVideoUrl(mainVideo?.video_url || selectedDance.main_video_url || '');
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

  // Handle Accept dance
  const handleAccept = async (danceId) => {
    try {
      if (selectedDance?.isFeatured) {
        // For featured dances, just update local state for demo
        console.log(`Accepted dance: ${selectedDance.title}`);
        alert(`Dance "${selectedDance.title}" has been accepted!`);
      } else {
        // For database dances, update in Supabase
        const { error } = await supabase
          .from('dances')
          .update({ status: 'approved' })
          .eq('id', danceId);
        
        if (!error) {
          alert(`Dance has been accepted!`);
          // Remove from current list
          setDances(prev => prev.filter(d => d.id !== danceId));
        } else {
          alert('Error accepting dance');
        }
      }
      closePreview();
    } catch (error) {
      console.error('Error accepting dance:', error);
      alert('Error accepting dance');
    }
  };

  // Handle Decline dance
  const handleDecline = async (danceId) => {
    try {
      if (selectedDance?.isFeatured) {
        // For featured dances, just update local state for demo
        console.log(`Declined dance: ${selectedDance.title}`);
        alert(`Dance "${selectedDance.title}" has been declined.`);
      } else {
        // For database dances, update in Supabase
        const { error } = await supabase
          .from('dances')
          .update({ status: 'rejected' })
          .eq('id', danceId);
        
        if (!error) {
          alert(`Dance has been declined.`);
          // Remove from current list
          setDances(prev => prev.filter(d => d.id !== danceId));
        } else {
          alert('Error declining dance');
        }
      }
      closePreview();
    } catch (error) {
      console.error('Error declining dance:', error);
      alert('Error declining dance');
    }
  };

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

  // Helper for formal N/A display
  const displayOrNA = (value) => value && value.trim() ? value : "N/A";

  return (
    <div className="dance-approval-page">
      <Navbar activeItem={activeItem} setActiveItem={setActiveItem} />
      
      {/* Header Section */}
      <section className="approval-header">
        <div className="container">
          <h1 className="page-title">Dance Approval Center</h1>
          <p className="page-subtitle">
            Review and approve pending dance submissions
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
            <p>{filteredDances.length} pending dances found</p>
          </div>
          
          <div className="dances-grid">
            {loading ? (
              <div style={{ textAlign: 'center', width: '100%' }}>Loading pending dances...</div>
            ) : filteredDances.length === 0 ? (
              <div style={{ textAlign: 'center', width: '100%' }}>No pending dances found.</div>
            ) : (
              filteredDances.map(dance => (
                <div key={dance.id} className="dance-card" onClick={() => openPreview(dance)}>
                  {/* Pending badge */}
                  <div className="pending-badge">Pending Approval</div>
                  
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
                      {dance.difficulty && (
                        <span className={`difficulty ${dance.difficulty.toLowerCase()}`}>
                          {dance.difficulty}
                        </span>
                      )}
                    </div>
                    
                    <div className="dance-meta">
                      <div className="meta-item">
                        <MapPin size={14} />
                        <span>{capitalize(dance.island)}</span>
                      </div>
                      {dance.province && (
                        <div className="meta-item">
                          <span>• {dance.province}</span>
                        </div>
                      )}
                    </div>
                    
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
                      <button className="review-button">
                        Review Dance
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          className="scroll-to-top-btn"
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: '#fff',
            border: '1.5px solid #a0855b',
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            width: window.innerWidth < 480 ? 38 : window.innerWidth < 900 ? 44 : 54,
            height: window.innerWidth < 480 ? 38 : window.innerWidth < 900 ? 44 : 54,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'opacity 0.2s, width 0.2s, height 0.2s',
          }}
          aria-label="Scroll to top"
        >
          <ArrowUp size={window.innerWidth < 480 ? 20 : window.innerWidth < 900 ? 24 : 32} color="#a0855b" />
        </button>
      )}

      {/* Preview Modal */}
      {showPreview && selectedDance && (
        <div className="preview-modal">
          <div className="modal-backdrop" onClick={closePreview}></div>
          <div
            className="modal-content"
            style={{
              padding: 0,
              overflow: 'auto',
              maxHeight: '90vh',
            }}
          >
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
                  <p className="modal-subtitle" style={{ margin: 0 }}>Traditional Filipino Folk Dance - Pending Approval</p>
                  <div className="modal-meta-badges">
                    <span className="region-badge">{capitalize(selectedDance.island)}</span>
                    {selectedDance.difficulty && (
                      <span className={`difficulty ${selectedDance.difficulty.toLowerCase()}`}>
                        {selectedDance.difficulty}
                      </span>
                    )}
                    <span className="pending-badge-modal">Pending</span>
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

              {/* Additional info for featured dances */}
              {selectedDance.isFeatured && (
                <>
                  <div className="modal-section">
                    <h3>Performance Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1rem 0' }}>
                      <div><strong>Duration:</strong> {displayOrNA(selectedDance.duration)}</div>
                      <div><strong>Performers:</strong> {displayOrNA(selectedDance.performers)}</div>
                      <div><strong>Origin:</strong> {displayOrNA(selectedDance.origin)}</div>
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
                </>
              )}

              {/* Main Video */}
              {mainVideoUrl && (
                <div className="modal-section" style={{ textAlign: 'center', margin: '32px 0' }}>
                  <h3 style={{ marginBottom: 12 }}>Cultural Dance</h3>
                  {selectedDance.isFeatured ? (
                    <iframe
                      src={getYouTubeEmbedUrl(mainVideoUrl)}
                      title={`${selectedDance.title} - Main Video`}
                      width="100%"
                      height="320"
                      style={{
                        maxWidth: 520,
                        borderRadius: 12,
                        border: 'none',
                        boxShadow: '0 4px 24px #0002'
                      }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
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
                  )}
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
                      {selectedDance.isFeatured ? (
                        <iframe
                          src={getYouTubeEmbedUrl(fig.video_url)}
                          title={`${selectedDance.title} - Figure ${fig.figure_number ?? idx + 1}`}
                          width="100%"
                          height="200"
                          style={{
                            borderRadius: 6,
                            border: 'none'
                          }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
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
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Approval Actions */}
              <div className="approval-actions">
                <button
                  className="decline-button"
                  onClick={() => handleDecline(selectedDance.id)}
                >
                  <X size={20} />
                  Decline Dance
                </button>
                <button
                  className="accept-button"
                  onClick={() => handleAccept(selectedDance.id)}
                >
                  <Check size={20} />
                  Accept Dance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DanceApproval;
