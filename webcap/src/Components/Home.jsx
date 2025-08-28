import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, BookOpen, ChevronRight, Star, X, MapPin, Clock } from 'lucide-react';
import Navbar from '../Components/Navbar';
import './Home.css';
import home1Image from '../assets/home1.jpg';
import home2Image from '../assets/home2.jpg';
import home3Image from '../assets/home3.jpg';
import tiklosImage from '../assets/tiklos.png';
import binungeyImage from '../assets/binungeybg.png';
import suakusuaImage from '../assets/Sua.png';

const Home = () => {
  const navigate = useNavigate();
  const [selectedDance, setSelectedDance] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselImages = [home1Image, home2Image, home3Image];

  const featuredDances = [
    {
      id: 1,
      name: 'Binungey',
      region: 'Abra',
      image: binungeyImage,
      description: 'A traditional dance from Abra celebrating harvest and community unity.',
      difficulty: 'Intermediate',
      duration: '4-6 minutes',
      performers: '6-8 dancers',
      origin: 'Northern Luzon',
      significance: 'This dance represents the joy and gratitude of farmers during harvest season. Performers wear traditional Ilocano costumes and use farming tools as props.',
      music: 'Traditional Ilocano folk music with gongs and drums',
      costumes: 'Colorful traditional Ilocano attire with wide-brimmed hats'
    },
    {
      id: 2,
      name: 'Sua Ku Sua',
      region: 'Jolo, Sulu',
      image: suakusuaImage,
      description: 'A courtship dance from the Tausug people of Sulu.',
      difficulty: 'Advanced',
      duration: '5-7 minutes',
      performers: '2-4 dancers',
      origin: 'Mindanao',
      significance: 'A graceful courtship dance that tells the story of a prince wooing a princess. The dance showcases the refined culture of the Tausug people.',
      music: 'Traditional Tausug kulintang ensemble',
      costumes: 'Elaborate Muslim royal attire with intricate embroidery'
    },
    {
      id: 3,
      name: 'Tiklos',
      region: 'Leyte',
      image: tiklosImage,
      description: 'A dance depicting the Bayanihan spirit of community cooperation.',
      difficulty: 'Beginner',
      duration: '3-5 minutes',
      performers: '8-12 dancers',
      origin: 'Visayas',
      significance: 'Represents the Filipino spirit of bayanihan (community cooperation) where neighbors help each other during planting and harvesting seasons.',
      music: 'Lively Visayan folk music with traditional instruments',
      costumes: 'Simple rural Filipino clothing reflecting farming attire'
    }
  ];

  // Debug image imports
  useEffect(() => {
    console.log('Image imports:', {
      home1Image,
      home2Image,
      home3Image,
      tiklosImage,
      binungeyImage,
      suakusuaImage
    });
    
    console.log('Featured dances with images:', featuredDances.map(dance => ({
      name: dance.name,
      image: dance.image,
      imageType: typeof dance.image
    })));
  }, []);

  // Auto-slide carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [carouselImages.length]);

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
            <div className="hero-buttons">
              <button 
                className="btn-primary"
                onClick={() => navigate('/dances')}
              >
                Explore Dances
              </button>
            </div>
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
              <div key={dance.id} className="dance-card">
                <div className="dance-image">
                  {!imageError[dance.id] ? (
                    <img 
                      src={dance.image} 
                      alt={dance.name}
                      onError={() => handleImageError(dance.id, dance.image)}
                      onLoad={() => handleImageLoad(dance.id, dance.image)}
                    />
                  ) : (
                    <div className="image-placeholder">
                      <span>Image not available</span>
                    </div>
                  )}
                </div>
                <div className="dance-content">
                  <div className="dance-header">
                    <h3 className="dance-name">{dance.name}</h3>
                    {/* Difficulty removed */}
                  </div>
                  <p className="dance-region">{dance.region}</p>
                  <p className="dance-description">{dance.description}</p>
                  <button 
                    className="learn-button"
                    onClick={() => openModal(dance)}
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
                Explore Culture
                <ChevronRight size={20} />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Enhanced Dance Modal - Similar to Culture Page Style */}
      {isModalOpen && selectedDance && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            
            
            <div className="modal-header">
              <div className="modal-image-container">
                <img 
                  src={selectedDance.image} 
                  alt={selectedDance.name}
                  className="modal-image"
                  onError={(e) => {
                    console.error('Modal image failed to load:', selectedDance.image);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div className="modal-header-content">
                <h2 className="modal-title">{selectedDance.name}</h2>
                <div className="modal-region">
                  <MapPin size={16} />
                  <span>{selectedDance.region}, {selectedDance.origin}</span>
                </div>
                <span className={`modal-difficulty ${selectedDance.difficulty.toLowerCase()}`}>
                  {selectedDance.difficulty}
                </span>
              </div>
            </div>

            <div className="modal-body">
              <div className="modal-overview">
                <h3>About this Dance</h3>
                <p>{selectedDance.significance}</p>
              </div>

              <div className="modal-stats">
                <div className="modal-stat">
                  <Clock size={20} />
                  <div>
                    <span className="modal-stat-number">{selectedDance.duration}</span>
                    <span className="modal-stat-label">Duration</span>
                  </div>
                </div>
                <div className="modal-stat">
                  <Users size={20} />
                  <div>
                    <span className="modal-stat-number">{selectedDance.performers}</span>
                    <span className="modal-stat-label">Performers</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Music & Instruments</h3>
                <p>{selectedDance.music}</p>
              </div>

              <div className="modal-section">
                <h3>Traditional Costumes</h3>
                <p>{selectedDance.costumes}</p>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-primary modal-btn"
                onClick={() => {
                  closeModal();
                  navigate('/dances');
                }}
              >
                View All Dances
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
