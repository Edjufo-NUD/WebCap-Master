import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Star, Play, BookOpen, Camera, Music, X, Calendar, Award, Users2, Volume2, Heart, Palette, Scroll } from 'lucide-react';
import Navbar from '../Components/Navbar';
import './Culture.css';
import luzonImage from '../assets/Luzon.jpg';
import visayasImage from '../assets/Visayas.jpg';
import mindanaoImage from '../assets/Map_of_Mindanao.jpg';


const Culture = () => {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);

  const culturalRegions = [
    {
      id: 1,
      name: 'Luzon',
      image: luzonImage, // instead of '/assets/Luzon.jpg'

      dances: ['Tinikling', 'Cariñosa', 'Pandanggo sa Ilaw'],
      description: 'Northern and central Philippines showcase Spanish colonial influences mixed with indigenous traditions.',
      highlights: ['Rice terraces ceremonies', 'Courtship dances', 'Festival celebrations'],
      detailedInfo: {
        overview: 'Luzon, the largest island in the Philippines, is home to diverse cultural traditions that reflect centuries of indigenous heritage and Spanish colonial influence. From the mountainous Cordilleras to the bustling streets of Manila, Luzon showcases a rich tapestry of folk dances and cultural practices.',
        population: '57.8 million',
        provinces: '38 provinces',
        languages: ['Tagalog', 'Ilocano', 'Kapampangan', 'Bicolano'],
        famousFestivals: [
          { name: 'Panagbenga Festival', location: 'Baguio City', description: 'Flower festival celebrating the blooming season' },
          { name: 'Ati-Atihan Festival', location: 'Kalibo, Aklan', description: 'Vibrant street dancing festival' },
          { name: 'Pahiyas Festival', location: 'Lucban, Quezon', description: 'Harvest festival with colorful decorations' }
        ],
        culturalSites: [
          'Banaue Rice Terraces',
          'Vigan Heritage Village',
          'Intramuros Historic District',
          'Mayon Volcano'
        ]
      }
    },
    {
      id: 2,
      name: 'Visayas',
      image: visayasImage,
      dances: ['Sinulog', 'Kuratsa', 'Subli'],
      description: 'Central islands blend Christian traditions with pre-colonial rituals and vibrant festivals.',
      highlights: ['Religious festivals', 'Warrior dances', 'Maritime traditions'],
      detailedInfo: {
        overview: 'The Visayas region, composed of beautiful islands in central Philippines, is renowned for its vibrant festivals, deeply rooted Catholic traditions, and dynamic folk dances. The region serves as the cultural heartland where ancient traditions meet Spanish colonial influences.',
        population: '20.3 million',
        provinces: '16 provinces',
        languages: ['Cebuano', 'Hiligaynon', 'Waray', 'Boholano'],
        famousFestivals: [
          { name: 'Sinulog Festival', location: 'Cebu City', description: 'Grand festival honoring Santo Niño' },
          { name: 'Dinagyang Festival', location: 'Iloilo City', description: 'Colorful celebration with tribal dances' },
          { name: 'Sandugo Festival', location: 'Bohol', description: 'Blood compact commemoration' }
        ],
        culturalSites: [
          'Magellan\'s Cross',
          'Chocolate Hills',
          'Boracay Island',
          'Siquijor Island'
        ]
      }
    },
    {
      id: 3,
      name: 'Mindanao',
      image: mindanaoImage,
      dances: ['Singkil', 'Pagdiwata', 'Kappa Malong-Malong'],
      description: 'Southern Philippines preserve rich Islamic and indigenous cultural heritage.',
      highlights: ['Royal court dances', 'Tribal ceremonies', 'Epic storytelling'],
      detailedInfo: {
        overview: 'Mindanao, the second-largest island, is a melting pot of cultures where Islamic traditions, indigenous practices, and Christian influences converge. Known for its royal court dances and epic storytelling traditions, Mindanao preserves some of the Philippines\' most ancient cultural practices.',
        population: '26.3 million',
        provinces: '27 provinces',
        languages: ['Cebuano', 'Maranao', 'Maguindanaoan', 'Tausug'],
        famousFestivals: [
          { name: 'Kadayawan Festival', location: 'Davao City', description: 'Thanksgiving celebration for nature\'s gifts' },
          { name: 'Shariff Kabunsuan Festival', location: 'Cotabato', description: 'Islamic cultural celebration' },
          { name: 'Lanzones Festival', location: 'Camiguin', description: 'Fruit harvest festival' }
        ],
        culturalSites: [
          'Lake Sebu',
          'Mount Apo',
          'Enchanted River',
          'Masjid Al-Dahab'
        ]
      }
    }
  ];

  const culturalElements = [
    {
      icon: Music,
      title: 'Traditional Music',
      description: 'Kulintang, rondalla, and bamboo instruments create the heartbeat of Filipino folk dances.',
      detailedInfo: {
        overview: 'Filipino traditional music forms the rhythmic foundation of folk dances, creating an immersive cultural experience that connects dancers and audiences to their ancestral heritage.',
        instruments: [
          { name: 'Kulintang', description: 'Ancient gong ensemble from Mindanao, creates melodic patterns for royal court dances' },
          { name: 'Rondalla', description: 'String ensemble with bandurria, laud, and guitar, accompanies Spanish-influenced dances' },
          { name: 'Gangsa', description: 'Flat gongs from the Cordilleras, used in ritual and ceremonial dances' },
          { name: 'Bamboo Instruments', description: 'Angklung, tongatong, and bumbong create percussive rhythms' }
        ],
        characteristics: [
          'Polyrhythmic patterns that guide dance movements',
          'Call and response sections between musicians and dancers',
          'Improvisation within traditional structures',
          'Integration of indigenous and colonial musical elements'
        ],
        significance: 'Music serves as the heartbeat of Filipino culture, with each rhythm telling stories of love, war, harvest, and spiritual beliefs passed down through generations.'
      }
    },
    {
      icon: Users,
      title: 'Community Spirit',
      description: 'Bayanihan - the spirit of community cooperation reflected in group performances.',
      detailedInfo: {
        overview: 'Bayanihan embodies the Filipino spirit of unity and cooperation, where communities come together to support one another, beautifully expressed through collective dance performances.',
        principles: [
          { name: 'Pakikipagkapwa', description: 'Shared identity and interconnectedness among community members' },
          { name: 'Utang na Loob', description: 'Debt of gratitude that binds communities together' },
          { name: 'Kapamilya', description: 'Treating others as family, regardless of blood relations' },
          { name: 'Pakikipagkunware', description: 'Accommodating others even at personal sacrifice' }
        ],
        expressions: [
          'Group dances performed during fiestas and celebrations',
          'Collective preparation of costumes and props',
          'Intergenerational teaching of dance traditions',
          'Community fundraising for cultural events'
        ],
        significance: 'The bayanihan spirit ensures that Filipino cultural traditions survive and thrive, with entire communities taking responsibility for preserving their heritage for future generations.'
      }
    },
    {
      icon: BookOpen,
      title: 'Oral Traditions',
      description: 'Stories, legends, and epics passed down through generations via dance movements.',
      detailedInfo: {
        overview: 'Filipino oral traditions preserve ancient wisdom, historical events, and cultural values through storytelling dances that serve as living libraries of indigenous knowledge.',
        epics: [
          { name: 'Darangen', description: 'Maranao epic telling the adventures of Prince Bantugan, performed through Singkil dance' },
          { name: 'Hudhud', description: 'Ifugao harvest songs and epic chants accompanying rice terrace rituals' },
          { name: 'Ullalim', description: 'Kalinga epic about heroic deeds, performed during peace pacts' },
          { name: 'Biag ni Lam-ang', description: 'Ilocano epic of supernatural hero, expressed through various folk dances' }
        ],
        storytelling: [
          'Dance movements that mimic narrative elements',
          'Costumes and props that represent story characters',
          'Musical accompaniment that enhances dramatic tension',
          'Audience participation in familiar story segments'
        ],
        significance: 'Oral traditions through dance ensure that historical events, moral lessons, and cultural wisdom remain alive and accessible to new generations, creating an unbroken chain of cultural memory.'
      }
    },
    {
      icon: Camera,
      title: 'Visual Arts',
      description: 'Colorful costumes, intricate patterns, and symbolic accessories tell cultural stories.',
      detailedInfo: {
        overview: 'Filipino visual arts in dance encompass elaborate costumes, symbolic accessories, and intricate designs that communicate cultural identity, social status, and spiritual beliefs.',
        costumes: [
          { name: 'Baro\'t Saya', description: 'Traditional Filipino dress with butterfly sleeves, worn in Spanish-influenced dances' },
          { name: 'Malong', description: 'Tubular garment from Mindanao, versatile clothing used in Muslim dances' },
          { name: 'Bahag', description: 'Traditional loincloth worn by male dancers in indigenous mountain dances' },
          { name: 'Terno', description: 'Formal Filipino dress with distinctive sleeve design for elegant ballroom dances' }
        ],
        accessories: [
          'Fans (abaniko) representing courtship and grace',
          'Bamboo poles for percussive dance elements',
          'Colored scarves (pañuelo) for dramatic effect',
          'Traditional jewelry indicating social status'
        ],
        patterns: [
          'Geometric designs representing natural elements',
          'Floral motifs symbolizing fertility and growth',
          'Tribal patterns indicating clan and regional identity',
          'Religious symbols reflecting spiritual beliefs'
        ],
        significance: 'Visual elements in Filipino dance serve as a non-verbal language that communicates complex cultural narratives, making each performance a feast for the eyes and a lesson in history.'
      }
    }
  ];

  const timeline = [
    {
      period: 'Pre-Colonial Era',
      year: 'Before 1521',
      description: 'Indigenous tribes develop ritual dances for harvests, hunting, and spiritual ceremonies.',
      dances: ['Bendian', 'Dugso', 'Pagdiwata']
    },
    {
      period: 'Spanish Colonial',
      year: '1521-1898',
      description: 'Spanish influence introduces European dance forms merged with local traditions.',
      dances: ['Cariñosa', 'Rigodon', 'Pandanggo']
    },
    {
      period: 'American Period',
      year: '1898-1946',
      description: 'Folk dances preserved and documented, becoming symbols of national identity.',
      dances: ['Tinikling', 'Singkil', 'La Jota']
    },
    {
      period: 'Modern Era',
      year: '1946-Present',
      description: 'Contemporary choreographers revitalize traditional dances for new generations.',
      dances: ['Modern interpretations', 'Fusion styles', 'Cultural preservation']
    }
  ];

  const openModal = (region) => {
    setSelectedRegion(region);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedRegion(null);
    document.body.style.overflow = 'unset';
  };

  const openElementModal = (element) => {
    setSelectedElement(element);
    document.body.style.overflow = 'hidden';
  };

  const closeElementModal = () => {
    setSelectedElement(null);
    document.body.style.overflow = 'unset';
  };

  return (
    <div className="culture">
      <Navbar />
      
      {/* Hero Section */}
      <section className="culture-hero">
        <div className="culture-hero-background">
          <div className="culture-hero-overlay"></div>
        </div>
        <div className="culture-hero-content">
          <div className="culture-hero-text">
            <h1 className="culture-hero-title">
              Filipino Cultural
              <span className="culture-highlight"> Heritage</span>
            </h1>
            <p className="culture-hero-description">
            Explore the rich tapestry of Filipino culture through traditional folk dances, 
  music, costumes, and stories that have shaped our national identity for centuries.
  From the rhythmic beats of kulintang to the graceful movements of tinikling, 
  discover how each dance tells a unique story of our ancestors, their beliefs, 
  and their connection to the land. Journey through three distinct regions - 
  Luzon, Visayas, and Mindanao - each offering its own cultural treasures, 
  from courtship rituals and harvest celebrations to royal court performances 
  and spiritual ceremonies that continue to bring communities together today.
            </p>

          </div>
        </div>
      </section>

      {/* Cultural Elements */}
      <section className="cultural-elements">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Elements of Filipino Culture</h2>
            <p className="section-subtitle">
              The fundamental components that make Filipino folk dances unique and meaningful
            </p>
          </div>
          
          <div className="elements-grid">
            {culturalElements.map((element, index) => {
              const IconComponent = element.icon;
              return (
                <div 
                  key={index} 
                  className="element-card clickable"
                  onClick={() => openElementModal(element)}
                >
                  <div className="element-icon">
                    <IconComponent size={40} />
                  </div>
                  <h3 className="element-title">{element.title}</h3>
                  <p className="element-description">{element.description}</p>
                  <div className="element-hover-indicator">
                    <Play size={16} />
                    <span>Learn More</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Regional Cultures */}
      <section className="regional-cultures">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Regional Cultural Diversity</h2>
            <p className="section-subtitle">
              Each region of the Philippines offers distinct cultural traditions and dance forms
            </p>
          </div>
          
          <div className="regions-grid">
            {culturalRegions.map((region) => (
              <div key={region.id} className="region-card">
                <div className="region-image">
                  <img src={region.image} alt={region.name} />
                  <div className="region-overlay">
                    <button 
                      className="explore-button"
                      onClick={() => openModal(region)}
                    >
                      <Play size={20} />
                      Explore Island
                    </button>
                  </div>
                </div>
                <div className="region-content">
                  <div className="region-header">
                    <h3 className="region-name">{region.name}</h3>
                    <div className="region-icon">
                      <MapPin size={16} />
                    </div>
                  </div>
                  <p className="region-description">{region.description}</p>
                  
                  <div className="region-dances">
                    <h4>Featured Dances:</h4>
                    <div className="dance-tags">
                      {region.dances.map((dance, index) => (
                        <span key={index} className="dance-tag">{dance}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="region-highlights">
                    <h4>Cultural Highlights:</h4>
                    <ul>
                      {region.highlights.map((highlight, index) => (
                        <li key={index}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cultural Timeline */}
      <section className="cultural-timeline">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Cultural Evolution Timeline</h2>
            <p className="section-subtitle">
              Journey through the historical development of Filipino folk dance traditions
            </p>
          </div>
          
          <div className="timeline">
            {timeline.map((period, index) => (
              <div key={index} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
                <div className="timeline-content">
                  <div className="timeline-period">
                    <h3>{period.period}</h3>
                    <span className="timeline-year">{period.year}</span>
                  </div>
                  <p className="timeline-description">{period.description}</p>
                  <div className="timeline-dances">
                    <strong>Notable Dances:</strong>
                    <div className="timeline-dance-list">
                      {period.dances.map((dance, danceIndex) => (
                        <span key={danceIndex} className="timeline-dance">{dance}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="timeline-marker">
                  <Clock size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Region Modal */}
      {selectedRegion && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            
            
            <div className="modal-header">
              <img src={selectedRegion.image} alt={selectedRegion.name} className="modal-image" />
              <div className="modal-header-content">
                <h2 className="modal-title">{selectedRegion.name}</h2>
                <p className="modal-subtitle">Cultural Region of the Philippines</p>
              </div>
            </div>

            <div className="modal-body">
              <div className="modal-overview">
                <h3>Overview</h3>
                <p>{selectedRegion.detailedInfo.overview}</p>
              </div>

              <div className="modal-stats">
                <div className="modal-stat">
                  <Users2 size={20} />
                  <div>
                    <span className="modal-stat-number">{selectedRegion.detailedInfo.population}</span>
                    <span className="modal-stat-label">Population</span>
                  </div>
                </div>
                <div className="modal-stat">
                  <MapPin size={20} />
                  <div>
                    <span className="modal-stat-number">{selectedRegion.detailedInfo.provinces}</span>
                    <span className="modal-stat-label">Provinces</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Languages Spoken</h3>
                <div className="modal-tags">
                  {selectedRegion.detailedInfo.languages.map((language, index) => (
                    <span key={index} className="modal-tag language-tag">{language}</span>
                  ))}
                </div>
              </div>

              <div className="modal-section">
                <h3>Famous Festivals</h3>
                <div className="festivals-grid">
                  {selectedRegion.detailedInfo.famousFestivals.map((festival, index) => (
                    <div key={index} className="festival-card">
                      <div className="festival-header">
                        <Calendar size={16} />
                        <h4>{festival.name}</h4>
                      </div>
                      <p className="festival-location">{festival.location}</p>
                      <p className="festival-description">{festival.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-section">
                <h3>Cultural Sites</h3>
                <div className="cultural-sites-grid">
                  {selectedRegion.detailedInfo.culturalSites.map((site, index) => (
                    <div key={index} className="cultural-site">
                      <Award size={16} />
                      <span>{site}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-section">
                <h3>Traditional Dances</h3>
                <div className="modal-tags">
                  {selectedRegion.dances.map((dance, index) => (
                    <span key={index} className="modal-tag dance-tag">{dance}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Element Modal */}
      {selectedElement && (
        <div className="modal-overlay" onClick={closeElementModal}>
          <div className="element-modal-content" onClick={(e) => e.stopPropagation()}>
           
            
            <div className="element-modal-header">
              <div className="element-modal-icon">
                <selectedElement.icon size={60} />
              </div>
              <div className="element-modal-header-content">
                <h2 className="element-modal-title">{selectedElement.title}</h2>
                <p className="element-modal-subtitle">Core Element of Filipino Culture</p>
              </div>
            </div>

            <div className="element-modal-body">
              <div className="element-modal-overview">
                <h3>Overview</h3>
                <p>{selectedElement.detailedInfo.overview}</p>
              </div>

              {selectedElement.detailedInfo.instruments && (
                <div className="element-modal-section">
                  <h3>
                    <Volume2 size={20} />
                    Traditional Instruments
                  </h3>
                  <div className="instruments-grid">
                    {selectedElement.detailedInfo.instruments.map((instrument, index) => (
                      <div key={index} className="instrument-card">
                        <h4>{instrument.name}</h4>
                        <p>{instrument.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedElement.detailedInfo.principles && (
                <div className="element-modal-section">
                  <h3>
                    <Heart size={20} />
                    Core Principles
                  </h3>
                  <div className="principles-grid">
                    {selectedElement.detailedInfo.principles.map((principle, index) => (
                      <div key={index} className="principle-card">
                        <h4>{principle.name}</h4>
                        <p>{principle.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedElement.detailedInfo.epics && (
                <div className="element-modal-section">
                  <h3>
                    <Scroll size={20} />
                    Epic Traditions
                  </h3>
                  <div className="epics-grid">
                    {selectedElement.detailedInfo.epics.map((epic, index) => (
                      <div key={index} className="epic-card">
                        <h4>{epic.name}</h4>
                        <p>{epic.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedElement.detailedInfo.costumes && (
                <div className="element-modal-section">
                  <h3>
                    <Palette size={20} />
                    Traditional Costumes
                  </h3>
                  <div className="costumes-grid">
                    {selectedElement.detailedInfo.costumes.map((costume, index) => (
                      <div key={index} className="costume-card">
                        <h4>{costume.name}</h4>
                        <p>{costume.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedElement.detailedInfo.characteristics && (
                <div className="element-modal-section">
                  <h3>Key Characteristics</h3>
                  <div className="characteristics-list">
                    {selectedElement.detailedInfo.characteristics.map((characteristic, index) => (
                      <div key={index} className="characteristic-item">
                        <div className="characteristic-bullet">•</div>
                        <span>{characteristic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedElement.detailedInfo.expressions && (
                <div className="element-modal-section">
                  <h3>Cultural Expressions</h3>
                  <div className="expressions-list">
                    {selectedElement.detailedInfo.expressions.map((expression, index) => (
                      <div key={index} className="expression-item">
                        <div className="expression-bullet">•</div>
                        <span>{expression}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedElement.detailedInfo.storytelling && (
                <div className="element-modal-section">
                  <h3>Storytelling Elements</h3>
                  <div className="storytelling-list">
                    {selectedElement.detailedInfo.storytelling.map((element, index) => (
                      <div key={index} className="storytelling-item">
                        <div className="storytelling-bullet">•</div>
                        <span>{element}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedElement.detailedInfo.accessories && (
                <div className="element-modal-section">
                  <h3>Traditional Accessories</h3>
                  <div className="accessories-list">
                    {selectedElement.detailedInfo.accessories.map((accessory, index) => (
                      <div key={index} className="accessory-item">
                        <div className="accessory-bullet">•</div>
                        <span>{accessory}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedElement.detailedInfo.patterns && (
                <div className="element-modal-section">
                  <h3>Design Patterns</h3>
                  <div className="patterns-list">
                    {selectedElement.detailedInfo.patterns.map((pattern, index) => (
                      <div key={index} className="pattern-item">
                        <div className="pattern-bullet">•</div>
                        <span>{pattern}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="element-modal-significance">
                <h3>Cultural Significance</h3>
                <p className="significance-text">{selectedElement.detailedInfo.significance}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Culture;