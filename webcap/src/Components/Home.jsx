import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, BookOpen, ChevronRight, Star, X, MapPin, Clock, ArrowUp, UserPlus, LogIn, Check } from 'lucide-react';
import Navbar from '../Components/Navbar';
import './Home.css';
import home1Image from '../assets/home1.jpg';
import home2Image from '../assets/home2.jpg';
import home3Image from '../assets/home3.jpg';
import tiklosImage from '../assets/tiklos.png';
import binungeyImage from '../assets/binungeybg.png';
import pahidImage from '../assets/Pahid.png';

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

const Home = () => {
  const navigate = useNavigate();
  const [selectedDance, setSelectedDance] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showLoginInvitation, setShowLoginInvitation] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const carouselImages = [home1Image, home2Image, home3Image];

  const featuredDances = [
    {
      id: 'featured-1',
      title: 'Binungey',
      name: 'Binungey',
      island: 'Luzon',
      region: 'Abra',
      province: 'Abra',
      image: binungeyImage,
      image_url: binungeyImage,
      description: 'A traditional dance from Abra celebrating harvest and community unity.',
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
      name: 'Pahid',
      island: 'Luzon',
      region: 'Northern Luzon',
      province: 'Northern Luzon',
      image: pahidImage,
      image_url: pahidImage,
      description: 'A traditional Filipino folk dance that showcases graceful movements and cultural heritage.',
      history: 'A traditional Filipino folk dance that showcases graceful movements and cultural heritage. This dance demonstrates the refined artistry and storytelling tradition of Filipino culture through expressive choreography.',
      references: 'Traditional Filipino folk music with indigenous instruments. Traditional Filipino attire with cultural significance.',
      main_video_url: 'https://youtube.com/shorts/9McsqHeMnmc', // No main video provided, will use first figure video
      difficulty: 'Intermediate',
      duration: '4-6 minutes',
      performers: '4-8 dancers',
      origin: 'Northern Luzon',
      significance: 'This dance represents the artistic expression and cultural storytelling traditions of the Filipino people, showcasing graceful movements and cultural heritage.',
      music: 'Traditional Filipino folk music with indigenous instruments',
      costumes: 'Traditional Filipino attire with cultural significance',
      isFeatured: true,
      // Figure videos for Pahid
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
      name: 'Sua Ku Sua',
      island: 'Mindanao',
      region: 'Jolo, Sulu',
      province: 'Jolo, Sulu',
      image: null, // No image available
      image_url: null, // No image available
      description: 'A courtship dance from the Tausug people of Sulu.',
      history: 'A courtship dance from the Tausug people of Sulu. A graceful courtship dance that tells the story of a prince wooing a princess. The dance showcases the refined culture of the Tausug people.',
      references: 'Traditional Tausug kulintang ensemble. Elaborate Muslim royal attire with intricate embroidery.',
      main_video_url: '', // No main video provided
      difficulty: 'Advanced',
      duration: '5-7 minutes',
      performers: '2-4 dancers',
      origin: 'Mindanao',
      significance: 'A graceful courtship dance that tells the story of a prince wooing a princess. The dance showcases the refined culture of the Tausug people.',
      music: 'Traditional Tausug kulintang ensemble',
      costumes: 'Elaborate Muslim royal attire with intricate embroidery',
      isFeatured: true,
      // Figure videos for Sua Ku Sua
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
      name: 'Tiklos',
      island: 'Visayas',
      region: 'Leyte',
      province: 'Leyte',
      image: tiklosImage,
      image_url: tiklosImage,
      description: 'A dance depicting the Bayanihan spirit of community cooperation.',
      history: 'A dance depicting the Bayanihan spirit of community cooperation. Represents the Filipino spirit of bayanihan (community cooperation) where neighbors help each other during planting and harvesting seasons.',
      references: 'Lively Visayan folk music with traditional instruments. Simple rural Filipino clothing reflecting farming attire.',
      main_video_url: 'https://youtube.com/shorts/QnkC5NnK0L4?feature=share', // Tiklos Cultural Dance
      difficulty: 'Beginner',
      duration: '3-5 minutes',
      performers: '8-12 dancers',
      origin: 'Visayas',
      significance: 'Represents the Filipino spirit of bayanihan (community cooperation) where neighbors help each other during planting and harvesting seasons.',
      music: 'Lively Visayan folk music with traditional instruments',
      costumes: 'Simple rural Filipino clothing reflecting farming attire',
      isFeatured: true,
      // Figure videos for Tiklos
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

  // Debug image imports
  useEffect(() => {
    console.log('Image imports:', {
      home1Image,
      home2Image,
      home3Image,
      tiklosImage,
      binungeyImage
    });
    
    console.log('Featured dances with images:', featuredDances.map(dance => ({
      name: dance.name,
      image: dance.image,
      imageType: typeof dance.image
    })));
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = () => {
      const accessToken = localStorage.getItem("access_token");
      const newAuthState = !!accessToken;
      setIsAuthenticated(newAuthState);
      
      // Show login invitation for guest users only once per session
      if (!newAuthState && !sessionStorage.getItem('loginInvitationShown')) {
        // Show modal after a short delay to let the page load
        setTimeout(() => {
          setShowLoginInvitation(true);
        }, 2000);
      }
    };

    checkAuthStatus();

    // Listen for auth changes
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  // Auto-slide carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  // Show scroll-to-top button when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Control body scroll for login invitation modal
  useEffect(() => {
    if (showLoginInvitation) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showLoginInvitation]);

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageError = (danceId, imageSrc) => {
    console.error(`Image failed to load for dance ${danceId}:`, imageSrc);
    setImageError(prev => ({ ...prev, [danceId]: true }));
  };

  const handleImageLoad = (danceId, imageSrc) => {
    console.log(`Image loaded successfully for dance ${danceId}:`, imageSrc);
    setImageError(prev => ({ ...prev, [danceId]: false }));
  };

  const openModal = (dance) => {
    console.log('Opening modal for dance:', dance.name);
    console.log('Image source:', dance.image);
    console.log('Image type:', typeof dance.image);
    setSelectedDance(dance);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedDance(null);
    setIsModalOpen(false);
    document.body.style.overflow = 'unset';
  };

  // Login invitation modal handlers
  const closeLoginInvitation = () => {
    setShowLoginInvitation(false);
    // Mark as shown for this session
    sessionStorage.setItem('loginInvitationShown', 'true');
    document.body.style.overflow = 'unset';
  };

  const handleLoginClick = () => {
    closeLoginInvitation();     
    navigate('/login');
  };

  const handleSignUpClick = () => {
    closeLoginInvitation();
    navigate('/register');
  };

  return (
    <div className="home">
      {/* Side Design Elements - Only visible on large screens */}
      <div className="side-decoration left"></div>
      <div className="side-decoration right"></div>
      <div className="side-pattern left"></div>
      <div className="side-pattern right"></div>

      {/* Vertical lines */}
      <div className="vertical-line left-1"></div>
      <div className="vertical-line left-2"></div>
      <div className="vertical-line right-1"></div>
      <div className="vertical-line right-2"></div>

      {/* Floating elements */}
      <div className="floating-element diamond" style={{ top: '15%', left: '5%', animationDelay: '0s' }}></div>
      <div className="floating-element circle" style={{ top: '35%', left: '8%', animationDelay: '2s' }}></div>
      <div className="floating-element triangle" style={{ top: '55%', left: '3%', animationDelay: '4s' }}></div>
      <div className="floating-element diamond" style={{ top: '75%', left: '7%', animationDelay: '1s' }}></div>
      <div className="floating-element circle" style={{ top: '25%', right: '5%', animationDelay: '3s' }}></div>
      <div className="floating-element triangle" style={{ top: '45%', right: '8%', animationDelay: '5s' }}></div>
      <div className="floating-element diamond" style={{ top: '65%', right: '3%', animationDelay: '1.5s' }}></div>
      <div className="floating-element circle" style={{ top: '85%', right: '6%', animationDelay: '3.5s' }}></div>

      {/* Background shapes */}
      <div className="bg-shape hexagon" style={{ top: '10%', left: '2%' }}></div>
      <div className="bg-shape octagon" style={{ top: '60%', left: '1%' }}></div>
      <div className="bg-shape hexagon" style={{ top: '30%', right: '2%' }}></div>
      <div className="bg-shape octagon" style={{ top: '80%', right: '1%' }}></div>

      <Navbar />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Discover the Beauty of
              <span className="highlight"> Filipino Folk Dances</span>
            </h1>
            <p className="hero-description">
              Immerse yourself in the rich cultural heritage of the Philippines through 
              traditional folk dances. Learn, practice, and celebrate our vibrant traditions.
            </p>

          </div>
          <div className="hero-image">
            <img 
              src={carouselImages[currentSlide]} 
              alt="Filipino Folk Dance"
              onError={(e) => {
                console.error(`Hero image failed to load:`, carouselImages[currentSlide]);
                e.target.style.display = 'none';
              }}
            />
            <div className="hero-image-overlay"></div>
          </div>
        </div>
      </section>

      {/* Featured Dances */}
      <section className="featured">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Folk Dances</h2>
            <p className="section-subtitle">
              Discover the most popular and beautiful Filipino folk dances
            </p>
          </div>
          
          <div className="dance-grid">
            {featuredDances.map((dance) => (
              <div key={dance.id} className="dance-card" onClick={() => openModal(dance)} style={{ cursor: 'pointer' }}>
                <div className="dance-image">
                  {dance.image && !imageError[dance.id] ? (
                    <img 
                      src={dance.image} 
                      alt={dance.name}
                      onError={() => handleImageError(dance.id, dance.image)}
                      onLoad={() => handleImageLoad(dance.id, dance.image)}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed #ddd',
                      color: '#666',
                      fontSize: '18px',
                      fontWeight: '500'
                    }}>
                      No Preview Available
                    </div>
                  )}
                </div>
                <div className="dance-content">
                  <div className="dance-header">
                    <h3 className="dance-name">{dance.title || dance.name}</h3>
                    {/* Difficulty removed */}
                  </div>
                  <p className="dance-region">{dance.region}</p>
                  <p className="dance-description">{dance.description}</p>
                  <button 
                    className="learn-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(dance);
                    }}
                  >
                    Learn More
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="featured-footer">
            <button 
              className="btn-outline"
              onClick={() => navigate('/dances')}
            >
              View All Dances
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="culture-preview">
        <div className="container">
          <div className="culture-content">
            <div className="culture-text">
              <h2 className="culture-title">Rich Cultural Heritage</h2>
              <p className="culture-description">
                Filipino folk dances are more than just performances - they are living 
                stories that preserve our ancestors' traditions, beliefs, and way of life. 
                Each dance tells a unique tale of our diverse regions and communities.
              </p>
              <ul className="culture-features">
                <li>Traditional costumes and music</li>
                <li>Regional variations and stories</li>
                <li>Historical significance</li>
                <li>Community celebrations</li>
              </ul>
              <button 
                className="btn-primary"
                onClick={() => navigate('/culture')}
              >
                Explore Dance Tradition
                <ChevronRight size={20} />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Enhanced Dance Modal - Similar to Dances Page Style */}
      {isModalOpen && selectedDance && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Thumbnail image or No Preview Available placeholder */}
            <div style={{
              width: '100%',
              height: 220,
              overflow: 'hidden',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              position: 'relative'
            }}>
              {selectedDance.image ? (
                <img
                  src={selectedDance.image}
                  alt={selectedDance.title || selectedDance.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  onError={(e) => {
                    console.error('Modal image failed to load:', selectedDance.image);
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed #ddd',
                  color: '#666',
                  fontSize: '18px',
                  fontWeight: '500'
                }}>
                  No Preview Available
                </div>
              )}
              {/* Overlay title on image/placeholder */}
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
                <h2 className="modal-title" style={{ margin: 0 }}>{selectedDance.title || selectedDance.name}</h2>
                <p className="modal-subtitle" style={{ margin: 0 }}>Traditional Filipino Folk Dance</p>
                <div className="modal-meta-badges">
                  <span className="region-badge">{selectedDance.island}</span>
                  {selectedDance.difficulty && (
                    <span className={`difficulty ${selectedDance.difficulty.toLowerCase()}`}>
                      {selectedDance.difficulty}
                    </span>
                  )}
                  <span className="featured-badge-modal">Featured</span>
                </div>
              </div>
            </div>
            
            <div className="modal-body" style={{ padding: 24 }}>
              {/* History */}
              <div className="modal-section">
                <h3>History</h3>
                <p>{selectedDance.history || selectedDance.significance}</p>
              </div>

              {/* Performance Details */}
              <div className="modal-section">
                <h3>Performance Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1rem 0' }}>
                  <div><strong>Duration:</strong> {selectedDance.duration}</div>
                  <div><strong>Performers:</strong> {selectedDance.performers}</div>
                  <div><strong>Origin:</strong> {selectedDance.origin}</div>
                  <div><strong>Difficulty:</strong> {selectedDance.difficulty}</div>
                </div>
              </div>
              
              <div className="modal-section">
                <h3>Cultural Significance</h3>
                <p>{selectedDance.significance}</p>
              </div>

              <div className="modal-section">
                <h3>Music & Costumes</h3>
                <p><strong>Music:</strong> {selectedDance.music}</p>
                <p><strong>Costumes:</strong> {selectedDance.costumes}</p>
              </div>

              {/* YouTube Video */}
              {selectedDance.figureVideos && selectedDance.figureVideos.length > 0 && (
                <div className="modal-section" style={{ textAlign: 'center', margin: '32px 0' }}>
                  <h3 style={{ marginBottom: 12 }}>Cultural Dance</h3>
                  {selectedDance.main_video_url ? (
                    <iframe
                      width="100%"
                      height="320"
                      src={getYouTubeEmbedUrl(selectedDance.main_video_url)}
                      title={`${selectedDance.title || selectedDance.name} Dance Video`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{
                        maxWidth: 520,
                        borderRadius: 12,
                        boxShadow: '0 4px 24px #0002'
                      }}
                    ></iframe>
                  ) : (
                    // Show "No Preview Available" if no main video
                    <div
                      style={{
                        width: '100%',
                        maxWidth: 520,
                        height: 320,
                        borderRadius: 12,
                        background: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px dashed #ddd',
                        color: '#666',
                        fontSize: '18px',
                        fontWeight: '500',
                        boxShadow: '0 4px 24px #0002',
                        margin: '0 auto'
                      }}
                    >
                      No Preview Available
                    </div>
                  )}
                </div>
              )}

              {/* Figures (YouTube Shorts) */}
              {selectedDance.figureVideos && selectedDance.figureVideos.length > 0 && (
                <div className="modal-section">
                  <h3>Figures</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '24px',
                    margin: '1rem 0'
                  }}>
                    {selectedDance.figureVideos.map((fig) => (
                      <div key={fig.id} className="figure-box">
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>
                          Figure {fig.figure_number}
                        </div>
                        <iframe
                          width="100%"
                          height="200"
                          src={getYouTubeEmbedUrl(fig.video_url)}
                          title={`${selectedDance.title || selectedDance.name} Figure ${fig.figure_number}`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{
                            borderRadius: 6,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        ></iframe>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>


          </div>
        </div>
      )}

      {/* Login Invitation Modal */}
      {showLoginInvitation && (
        <div className="login-invitation-overlay" onClick={closeLoginInvitation}>
          <div className="login-invitation-modal" onClick={(e) => e.stopPropagation()}>
            {/* Animated particles */}
            <div className="login-invitation-particles">
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
            </div>

            {/* Header */}
            <div className="login-invitation-header">
              <h2 className="login-invitation-title">Create Your Account</h2>
            </div>

            {/* Body */}
            <div className="login-invitation-body">
              {/* Progress visualization */}
              <div className="progress-preview">
                <div className="preview-header">
                  <div className="chart-icon">📊</div>
                  <span className="preview-title">Your Progress Dashboard</span>
                </div>
                
                <div className="progress-cards">
                  <div className="progress-card">
                    <div className="progress-header">
                      <span className="dance-name">Binungey</span>
                      <span className="progress-score">85%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill high" style={{ width: '85%' }}></div>
                    </div>
                    <div className="progress-stats">
                      <span className="stat">+12% this week</span>
                    </div>
                  </div>
                  
                  <div className="progress-card">
                    <div className="progress-header">
                      <span className="dance-name">Tiklos</span>
                      <span className="progress-score">72%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill medium" style={{ width: '72%' }}></div>
                    </div>
                    <div className="progress-stats">
                      <span className="stat">+8% this week</span>
                    </div>
                  </div>
                  
                  <div className="progress-card">
                    <div className="progress-header">
                      <span className="dance-name">Sua Ku Sua</span>
                      <span className="progress-score">93%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill excellent" style={{ width: '93%' }}></div>
                    </div>
                    <div className="progress-stats">
                      <span className="stat">+5% this week</span>
                    </div>
                  </div>
                </div>
                
                <div className="preview-footer">
                  <div className="total-stats">
                    <span class="total-dances">3 Dances Tracked</span>
                    <span class="avg-score">Average: 83%</span>
                  </div>
                </div>
              </div>
              
              <div className="benefit-text">
                <p>Monitor your dance performance with detailed analytics and track your improvement over time.</p>
              </div>

              <div className="login-invitation-actions">
                <button className="login-invitation-btn primary" onClick={handleSignUpClick}>
                  <UserPlus size={18} />
                  Sign Up Free
                </button>
                <button className="login-invitation-btn secondary" onClick={handleLoginClick}>
                  <LogIn size={18} />
                  Login
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="login-invitation-footer">
              <p className="login-invitation-footer-text">
                You can always create an account later
              </p>
              <button className="login-invitation-skip" onClick={closeLoginInvitation}>
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && !isModalOpen && !showLoginInvitation && (
        <button
          className="scroll-to-top-btn"
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: '#a0855b',
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
          <ArrowUp size={window.innerWidth < 480 ? 16 : window.innerWidth < 900 ? 20 : 24} color="#ffffff" />
        </button>
      )}
    </div>
  );
};

export default Home;
