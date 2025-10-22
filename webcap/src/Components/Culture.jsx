// src/pages/Culture.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Components/Footer';
import {
  MapPin,
  Clock,
  Users,
  Star,
  Play,
  BookOpen,
  Camera,
  Music,
  X,
  Calendar,
  Award,
  Users2,
  Volume2,
  Heart,
  Palette,
  Scroll,
  ChevronDown,
  ChevronRight,
  ArrowUp
} from 'lucide-react';
import Navbar from '../Components/Navbar';
import './Culture.css';

// Region images
import luzonImage from '../assets/Luzon.jpg';
import visayasImage from '../assets/Visayas.jpg';
import mindanaoImage from '../assets/Map_of_Mindanao.jpg';

// Classification images
import countrysideImage from '../assets/Countryside.jpg';
import occupationalImage from '../assets/Occupational.jpeg';
import mimeticImage from '../assets/Mimetic.jpg';
import spanishImage from '../assets/Spanish.jpg';
import cordilleraImage from '../assets/Cordillera.jpeg';
import westernInfluenceImage from '../assets/WesternInfluence.jpg';
import religiousCeremonialImage from '../assets/ReligiousCeremonial.jpg';
import warMartialImage from '../assets/WarMartial.jpg';

// Dance images
import tiniklingImage from '../assets/tinikling.jpg';
import maglalatikImage from '../assets/maglalatik.jpg';
import bangaImage from '../assets/Banga123.jpg';
import palayImage from '../assets/Palay.jpg';
import pandanggoImage from '../assets/pandanggo.jpg';
import sayawSaBangkoImage from '../assets/SayawSaBangko.jpg';
import itikItikImage from '../assets/itik-itik.jpg';
import maramionImage from '../assets/Maramion.jpg';
import singkilImage from '../assets/singkil.jpg';
import kuratsaImage from '../assets/kuratsa.jpg';
import carinosaImage from '../assets/carinosa.jpg';
import rigodonImage from '../assets/Rigodon.jpeg';
import laJotaImage from '../assets/LaJota.jpg';
import mazurkaImage from '../assets/Mazurka.jpg';
import bendianImage from '../assets/Bendian123.jpg';
import tayawImage from '../assets/Tayaw.png';
import kalapawImage from '../assets/kalapaw.png';
import squareDanceImage from '../assets/SquareDance.jpg';
import polkaImage from '../assets/Polka.jpg';
import waltzImage from '../assets/Waltz.jpg';
import swingImage from '../assets/Swing.jpeg';
import dugsoImage from '../assets/Dugso.jpg';
import subliImage from '../assets/subli.jpg';
import sinulogImage from '../assets/sinulog.jpg';
import malongMalongImage from '../assets/MalongMalong.jpg';
import sagayanImage from '../assets/Sagayan.jpeg';
import binaylanImage from '../assets/binaylan.jpg';

const Culture = () => {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);

  // Scroll-to-top button state
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Navigation and search states
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('');

  // Show button when scrolled down and track reading progress
  React.useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 300;
      setShowScrollTop(scrolled);
      
      // Calculate reading progress
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollProgress = (window.scrollY / documentHeight) * 100;
      setReadingProgress(Math.min(scrollProgress, 100));
      setShowProgressBar(window.scrollY > 200);
      
      // Update active section (only for navigation sections)
      const sections = ['elements', 'regions', 'classifications', 'timeline'];
      let foundActiveSection = '';
      for (let section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            foundActiveSection = section;
            break;
          }
        }
      }
      setActiveSection(foundActiveSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside navigation
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNavMenu) {
        const navElement = event.target.closest('.floating-nav');
        if (!navElement) {
          setShowNavMenu(false);
          // Clear search when navigation closes
          clearSearch();
        }
      }
    };

    if (showNavMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showNavMenu]);

  // Clear search when navigation menu closes
  React.useEffect(() => {
    if (!showNavMenu && searchTerm) {
      setSearchTerm('');
      setSearchResults([]);
      setCurrentSearchIndex(0);
      document.querySelectorAll('.search-highlight').forEach(el => {
        el.classList.remove('search-highlight', 'search-highlight-active');
      });
    }
  }, [showNavMenu, searchTerm]);

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigation functions
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setShowNavMenu(false);
      // Clear search when navigating to a section
      clearSearch();
    }
  };

  // Search functionality
  const performSearch = (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    const searchTermLower = term.toLowerCase();
    const results = [];
    
    // Create a container that excludes navbar and navigation elements
    const searchSections = [
      '.culture-hero',
      '.cultural-heritage-intro', 
      '.cultural-elements',
      '.folk-dance-classifications',
      '.regional-cultures',
      '.cultural-timeline'
    ];
    
    // Find all text nodes that contain the search term within the content sections only
    searchSections.forEach(sectionSelector => {
      const section = document.querySelector(sectionSelector);
      if (section) {
        const walker = document.createTreeWalker(
          section,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: function(node) {
              // Exclude navbar, floating-nav, search-container elements
              const parent = node.parentElement;
              if (parent && (
                parent.closest('.navbar') ||
                parent.closest('.floating-nav') ||
                parent.closest('.search-container')
              )) {
                return NodeFilter.FILTER_REJECT;
              }
              return NodeFilter.FILTER_ACCEPT;
            }
          },
          false
        );

        let node;
        while (node = walker.nextNode()) {
          const text = node.textContent.toLowerCase();
          if (text.includes(searchTermLower)) {
            results.push(node.parentElement);
          }
        }
      }
    });

    setSearchResults(results);
    setCurrentSearchIndex(0);
    
    if (results.length > 0) {
      results[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      highlightSearchResults(results, searchTermLower);
    }
  };

  const highlightSearchResults = (results, term) => {
    // Remove previous highlights
    document.querySelectorAll('.search-highlight').forEach(el => {
      el.classList.remove('search-highlight');
    });

    // Add new highlights
    results.forEach((element, index) => {
      element.classList.add('search-highlight');
      if (index === currentSearchIndex) {
        element.classList.add('search-highlight-active');
      }
    });
  };

  const navigateSearchResults = (direction) => {
    if (searchResults.length === 0) return;
    
    document.querySelectorAll('.search-highlight-active').forEach(el => {
      el.classList.remove('search-highlight-active');
    });

    let newIndex;
    if (direction === 'next') {
      newIndex = (currentSearchIndex + 1) % searchResults.length;
    } else {
      newIndex = currentSearchIndex === 0 ? searchResults.length - 1 : currentSearchIndex - 1;
    }

    setCurrentSearchIndex(newIndex);
    searchResults[newIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    searchResults[newIndex].classList.add('search-highlight-active');
  };

  const clearSearch = React.useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setCurrentSearchIndex(0);
    // Clear all search highlights
    document.querySelectorAll('.search-highlight').forEach(el => {
      el.classList.remove('search-highlight', 'search-highlight-active');
    });
  }, []);

  const folkDanceClassifications = [
    {
      category: 'Countryside Dances (Rural/Agricultural)',
      description:
        'Dances that reflect rural life, agricultural practices, and the connection between Filipinos and their land.',
      image: countrysideImage,
      dances: [
        {
          name: 'Tinikling',
          origin: 'Leyte',
          description: 'Mimics the movement of tikling birds avoiding bamboo traps',
          culturalContext: 'Represents Filipino agility and resilience in agricultural settings',
          image: tiniklingImage
        },
        {
          name: 'Maglalatik',
          origin: 'Laguna',
          description: 'Mock-war dance using coconut shells as armor',
          culturalContext: 'Celebrates the coconut harvest and community cooperation',
          image: maglalatikImage
        },
        {
          name: 'Banga',
          origin: 'Kalinga',
          description: 'Women gracefully balance clay pots while dancing',
          culturalContext: 'Depicts the daily task of fetching water from mountain springs',
          image: bangaImage
        },
        {
          name: 'Palay',
          origin: 'Various regions',
          description: 'Depicts rice planting, harvesting, and threshing',
          culturalContext: 'Honors the staple crop and agricultural cycle',
          image: palayImage
        }
      ],
      characteristics: [
        'Movements mirror daily agricultural activities',
        'Use of farm tools and natural materials as props',
        'Strong connection to seasonal cycles and harvest festivals',
        'Community participation reflecting bayanihan spirit'
      ]
    },
    {
      category: 'Occupational Dances',
      description:
        'Dances that depict various occupations and trades, showcasing the dignity of labor.',
      image: occupationalImage,
      dances: [
        {
          name: 'Pandanggo sa Ilaw',
          origin: 'Mindoro',
          description: 'Balances oil lamps while performing graceful movements',
          culturalContext:
            "Represents the fishermen's practice of using lights to attract fish",
          image: pandanggoImage
        },
        {
          name: 'Sayaw sa Bangko',
          origin: 'Pangasinan',
          description: 'Performed on narrow wooden benches',
          culturalContext: 'Depicts the skill and balance required in carpentry work',
          image: sayawSaBangkoImage
        },
        {
          name: 'Itik-Itik',
          origin: 'Surigao del Sur',
          description: 'Mimics the movements of ducks',
          culturalContext:
            'Represents rice farming and the ducks that help in pest control',
          image: itikItikImage
        },
        {
          name: 'Maramion',
          origin: 'Antique',
          description: 'Depicts the movements of honey gatherers',
          culturalContext:
            'Shows the dangerous but rewarding work of collecting wild honey',
          image: maramionImage
        }
      ],
      characteristics: [
        'Movements simulate specific work activities',
        'Props represent tools of the trade',
        'Celebrates the value and skill of various professions',
        'Often performed during occupational festivals'
      ]
    },
    {
      category: 'Mimetic Dances (Nature and Animals)',
      description:
        'Dances that imitate natural phenomena, animals, and environmental elements.',
      image: mimeticImage,
      dances: [
        {
          name: 'Itik-Itik',
          origin: 'Surigao del Sur',
          description: 'Imitates duck movements - waddling, flapping, splashing',
          culturalContext:
            'Connection between humans and nature in rice farming communities',
          image: itikItikImage
        },
        {
          name: 'Tinikling',
          origin: 'Leyte',
          description:
            'Mimics tikling birds navigating through grass and bamboo',
          culturalContext: 'Represents harmony between humans and wildlife',
          image: tiniklingImage
        },
        {
          name: 'Singkil',
          origin: 'Maranao',
          description:
            'Imitates birds gracefully moving through a forest',
          culturalContext: 'Royal court dance inspired by natural elegance',
          image: singkilImage
        },
        {
          name: 'Kuratsa',
          origin: 'Visayas',
          description: 'Mimics courtship behavior of birds',
          culturalContext:
            'Natural courtship patterns reflected in human dance',
          image: kuratsaImage
        }
      ],
      characteristics: [
        'Movements directly imitate animal behavior',
        'Props often represent natural elements',
        'Teaches respect for wildlife and environment',
        'Connects human culture to natural world'
      ]
    },
    {
      category: 'Spanish Influence Dances',
      description:
        'Dances that evolved from Spanish colonial period, blending European forms with Filipino sensibilities.',
      image: spanishImage,
      dances: [
        {
          name: 'Cariñosa',
          origin: 'National dance',
          description: 'Courtship dance with fans and handkerchiefs',
          culturalContext:
            'Spanish colonial courtship customs adapted to Filipino values',
          image: carinosaImage
        },
        {
          name: 'Rigodon',
          origin: 'European ballroom',
          description: 'Formal ballroom dance for special occasions',
          culturalContext:
            'Spanish aristocratic traditions in Filipino social events',
          image: rigodonImage
        },
        {
          name: 'La Jota',
          origin: 'Spanish Jota',
          description:
            'Lively dance with castanets and flowing movements',
          culturalContext:
            'Spanish regional dance adapted to Filipino celebrations',
          image: laJotaImage
        },
        {
          name: 'Mazurka',
          origin: 'European court',
          description: 'Elegant couple dance with graceful turns',
          culturalContext: 'Colonial period formal entertainment',
          image: mazurkaImage
        },
        {
          name: 'Pandanggo',
          origin: 'Spanish Fandango',
          description:
            'Various regional adaptations of Spanish fandango',
          culturalContext:
            'Spanish dance forms localized to Filipino regions',
          image: pandanggoImage
        }
      ],
      characteristics: [
        'European dance structures with Filipino modifications',
        'Formal courtship and social interaction patterns',
        'Use of Spanish-introduced accessories like fans',
        'Performed at formal social gatherings and celebrations'
      ]
    },
    {
      category: 'Cordillera Dances (Mountain Province)',
      description:
        'Dances from the mountainous northern regions, preserving ancient tribal traditions.',
      image: cordilleraImage,
      dances: [
        {
          name: 'Bendian',
          origin: 'Benguet',
          description:
            'Circle dance celebrating community unity and thanksgiving',
          culturalContext:
            'Ritual dance for harvest festivals and important ceremonies',
          image: bendianImage
        },
        {
          name: 'Tayaw',
          origin: 'Ifugao',
          description:
            'Ritual dance performed during rice planting and harvest',
          culturalContext:
            'Sacred dance connecting community to ancestral spirits',
          image: tayawImage
        },
        {
          name: 'Kalapaw',
          origin: 'Kalinga',
          description: 'Courtship dance of the Kalinga people',
          culturalContext:
            'Traditional courtship within tribal customs',
          image: kalapawImage
        },
        {
          name: 'Salidsid',
          origin: 'Kalinga',
          description:
            'Courtship dance where dancers move like flowing water',
          culturalContext:
            'Represents the gentle flow of mountain streams',
          image: bangaImage
        }
      ],
      characteristics: [
        'Strong spiritual and ritual elements',
        'Connection to ancestral traditions and rice culture',
        'Community circle formations',
        'Use of traditional gongs and indigenous music'
      ]
    },
    {
      category: 'Western Influence Dances',
      description:
        'Dances introduced during American period and later, showing modern adaptations.',
      image: westernInfluenceImage,
      dances: [
        {
          name: 'Square Dance',
          origin: 'American introduction',
          description: 'Group dance with caller directing movements',
          culturalContext:
            'American cultural influence in Filipino social dancing',
          image: squareDanceImage
        },
        {
          name: 'Polka',
          origin: 'European via America',
          description: 'Lively couple dance with hopping steps',
          culturalContext:
            'Western social dancing adapted to Filipino celebrations',
          image: polkaImage
        },
        {
          name: 'Waltz',
          origin: 'European ballroom',
          description: 'Elegant three-step ballroom dance',
          culturalContext:
            'Formal Western dancing in Filipino high society',
          image: waltzImage
        },
        {
          name: 'Swing',
          origin: 'American jazz era',
          description: 'Energetic partner dance with jazz music',
          culturalContext:
            'Modern American cultural influence post-WWII',
          image: swingImage
        }
      ],
      characteristics: [
        'Direct adoption or adaptation of Western forms',
        'Modern musical accompaniment',
        'Individual couple focus rather than community',
        'Influence of American educational and cultural programs'
      ]
    },
    {
      category: 'Religious and Ceremonial Dances',
      description:
        'Dances with spiritual significance, performed during religious festivals and ceremonies.',
      image: religiousCeremonialImage,
      dances: [
        {
          name: 'Singkil',
          origin: 'Maranao',
          description: 'Royal dance depicting Islamic epic stories',
          culturalContext:
            'Sacred dance preserving Islamic cultural heritage',
          image: singkilImage
        },
        {
          name: 'Dugso',
          origin: 'Bukidnon',
          description: 'Ceremonial dance for healing and thanksgiving',
          culturalContext:
            'Indigenous spiritual practice through movement',
          image: dugsoImage
        },
        {
          name: 'Subli',
          origin: 'Batangas',
          description: 'Religious dance honoring the Holy Cross',
          culturalContext:
            'Catholic devotion expressed through traditional movement',
          image: subliImage
        },
        {
          name: 'Sinulog',
          origin: 'Cebu',
          description: 'Festival dance honoring Santo Niño',
          culturalContext:
            'Christian faith integrated with pre-colonial ritual',
          image: sinulogImage
        }
      ],
      characteristics: [
        'Deep spiritual and religious significance',
        'Performed during specific religious occasions',
        'Blend of indigenous and introduced religious elements',
        'Community participation in faith expression'
      ]
    },
    {
      category: 'War and Martial Dances',
      description: 'Dances depicting warfare, heroism, and martial skills.',
      image: warMartialImage,
      dances: [
        {
          name: 'Maglalatik',
          origin: 'Laguna',
          description: 'Mock battle dance using coconut shells',
          culturalContext:
            'Commemorates historical battles and warrior traditions',
          image: maglalatikImage
        },
        {
          name: 'Kappa Malong-Malong',
          origin: 'Maranao',
          description:
            'Demonstrates various uses of the traditional malong',
          culturalContext:
            'Shows practical and ceremonial aspects of traditional dress',
          image: malongMalongImage
        },
        {
          name: 'Sagayan',
          origin: 'Maranao',
          description:
            'Epic warrior dance with shields and weapons',
          culturalContext:
            'Preserves stories of legendary Maranao heroes',
          image: sagayanImage
        },
        {
          name: 'Binaylan',
          origin: 'Higaonon',
          description:
            'Depicts the movements of a hen protecting her chicks',
          culturalContext:
            'Represents protective instincts and defense of community',
          image: binaylanImage
        }
      ],
      characteristics: [
        'Dramatic movements depicting combat and heroism',
        'Use of traditional weapons and shields as props',
        'Preservation of historical and legendary narratives',
        'Display of physical strength and martial skills'
      ]
    }
  ];

  const culturalRegions = [
    {
      id: 1,
      name: 'Luzon',
      image: luzonImage,
      dances: [
        {
          name: 'Tinikling',
          culturalMeaning:
            'Represents Filipino resilience and agility, mimicking the tikling bird avoiding bamboo traps set by farmers',
          musicalConnection:
            'Bamboo poles create work rhythms that echo traditional agricultural activities',
          communityRole:
            'Performed at harvest festivals to celebrate agricultural abundance and community cooperation'
        },
        {
          name: 'Cariñosa',
          culturalMeaning:
            'Embodies Filipino courtship values of respect, patience, and romantic pursuit within community oversight',
          musicalConnection:
            'Rondalla music with Spanish guitars adapted to Filipino romantic sensibilities',
          communityRole:
            'Social dance that teaches proper courtship behavior and gender interactions'
        },
        {
          name: 'Pandanggo sa Ilaw',
          culturalMeaning:
            'Celebrates Filipino ingenuity and the symbolic triumph of light over darkness',
          musicalConnection:
            'Waltz rhythm adapted to showcase grace and skill in balancing oil lamps',
          communityRole:
            'Performed during religious festivals to honor saints and spiritual illumination'
        }
      ],
      description:
        'Northern and central Philippines showcase Spanish colonial influences mixed with indigenous traditions.',
      highlights: ['Rice terraces ceremonies', 'Courtship dances', 'Festival celebrations'],
      detailedInfo: {
        overview:
          'Luzon, the largest island in the Philippines, is home to diverse cultural traditions that reflect centuries of indigenous heritage and Spanish colonial influence. From the mountainous Cordilleras to the bustling streets of Manila, Luzon showcases a rich tapestry of folk dances and cultural practices.',
        population: '57.8 million',
        provinces: '38 provinces',
        languages: ['Tagalog', 'Ilocano', 'Kapampangan', 'Bicolano'],
        culturalDanceConnections: [
          {
            culturalValue: 'Bayanihan (Community Spirit)',
            danceExpression:
              'Group formations in Tinikling require community cooperation',
            meaning:
              'Dancers must work together or everyone fails - mirrors Filipino communal values'
          },
          {
            culturalValue: 'Pakikipagkunware (Accommodation)',
            danceExpression: 'Gentle, non-aggressive movements in Cariñosa',
            meaning:
              'Dance reflects Filipino preference for harmony over confrontation'
          },
          {
            culturalValue: 'Religious Devotion',
            danceExpression: 'Sacred symbolism in Pandanggo sa Ilaw',
            meaning: 'Light represents spiritual guidance and divine protection'
          }
        ],
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
      dances: [
        {
          name: 'Sinulog',
          culturalMeaning:
            'Sacred dance honoring Santo Niño, blending Catholic devotion with indigenous ritual movements',
          musicalConnection:
            'Drum beats and native instruments create hypnotic rhythms for spiritual connection',
          communityRole:
            'Unifies diverse communities through shared religious celebration and cultural identity'
        },
        {
          name: 'Kuratsa',
          culturalMeaning:
            'Playful courtship dance showcasing flirtation balanced with respect and traditional gender roles',
          musicalConnection:
            'Lively folk music with guitar and percussion encourages spirited but controlled interaction',
          communityRole:
            'Social dance that allows young people to interact within culturally acceptable boundaries'
        },
        {
          name: 'Subli',
          culturalMeaning:
            'Devotional dance combining Catholic prayer with indigenous healing and thanksgiving rituals',
          musicalConnection:
            'Sacred chants and traditional instruments bridge Spanish religious music with native spirituality',
          communityRole:
            'Performed during religious festivals to express collective faith and cultural continuity'
        }
      ],
      description:
        'Central islands blend Christian traditions with pre-colonial rituals and vibrant festivals.',
      highlights: ['Religious festivals', 'Warrior dances', 'Maritime traditions'],
      detailedInfo: {
        overview:
          'The Visayas region, composed of beautiful islands in central Philippines, is renowned for its vibrant festivals, deeply rooted Catholic traditions, and dynamic folk dances. The region serves as the cultural heartland where ancient traditions meet Spanish colonial influences.',
        population: '20.3 million',
        provinces: '16 provinces',
        languages: ['Cebuano', 'Hiligaynon', 'Waray', 'Boholano'],
        culturalDanceConnections: [
          {
            culturalValue: 'Religious Syncretism',
            danceExpression: 'Catholic and indigenous elements merged in Sinulog',
            meaning:
              'Filipino ability to adapt foreign religions while maintaining ancestral spiritual practices'
          },
          {
            culturalValue: 'Joyful Celebration',
            danceExpression:
              'Exuberant movements and colorful costumes in festival dances',
            meaning:
              'Filipino resilience expressed through celebration despite historical hardships'
          },
          {
            culturalValue: 'Maritime Heritage',
            danceExpression:
              'Flowing movements that mirror ocean waves and island life',
            meaning:
              'Connection to sea-based livelihood and inter-island cultural exchange'
          }
        ],
        famousFestivals: [
          { name: 'Sinulog Festival', location: 'Cebu City', description: 'Grand festival honoring Santo Niño' },
          { name: 'Dinagyang Festival', location: 'Iloilo City', description: 'Colorful celebration with tribal dances' },
          { name: 'Sandugo Festival', location: 'Bohol', description: 'Blood compact commemoration' }
        ],
        culturalSites: [
          "Magellan's Cross",
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
      dances: [
        {
          name: 'Singkil',
          culturalMeaning:
            'Royal court dance depicting the epic romance of Princess Gandingan, showcasing Maranao nobility and grace',
          musicalConnection:
            "Kulintang gong ensemble creates intricate melodies that guide the dancers' regal movements",
          communityRole:
            'Preserves Maranao epic traditions while displaying cultural sophistication and artistic mastery'
        },
        {
          name: 'Pagdiwata',
          culturalMeaning:
            'Spiritual healing dance invoking ancestral spirits and natural forces for community protection',
          musicalConnection:
            'Sacred drums and chants create trance-like states for spiritual communication',
          communityRole:
            'Maintains connection to pre-Islamic spiritual traditions and indigenous healing practices'
        },
        {
          name: 'Kappa Malong-Malong',
          culturalMeaning:
            'Demonstrates the versatility of the malong garment, celebrating Maranao textile artistry and practicality',
          musicalConnection:
            'Rhythmic accompaniment follows the graceful manipulation of the traditional tube skirt',
          communityRole:
            'Teaches traditional clothing usage while showcasing regional textile craftsmanship'
        }
      ],
      description:
        'Southern Philippines preserve rich Islamic and indigenous cultural heritage.',
      highlights: ['Royal court dances', 'Tribal ceremonies', 'Epic storytelling'],
      detailedInfo: {
        overview:
          "Mindanao, the second-largest island, is a melting pot of cultures where Islamic traditions, indigenous practices, and Christian influences converge. Known for its royal court dances and epic storytelling traditions, Mindanao preserves some of the Philippines' most ancient cultural practices.",
        population: '26.3 million',
        provinces: '27 provinces',
        languages: ['Cebuano', 'Maranao', 'Maguindanaoan', 'Tausug'],
        culturalDanceConnections: [
          {
            culturalValue: 'Royal Elegance (Kadatuan)',
            danceExpression:
              'Precise, controlled movements in Singkil that reflect aristocratic bearing',
            meaning:
              'Dance preserves memory of pre-colonial Filipino kingdoms and sophisticated court culture'
          },
          {
            culturalValue: 'Spiritual Connection (Babaylan Tradition)',
            danceExpression:
              'Ritualistic movements in Pagdiwata that invoke spiritual forces',
            meaning:
              'Maintains indigenous shamanic traditions alongside Islamic and Christian practices'
          },
          {
            culturalValue: 'Practical Wisdom',
            danceExpression:
              'Multiple uses of malong demonstrated through dance',
            meaning:
              'Filipino ingenuity in creating multi-functional cultural artifacts'
          }
        ],
        famousFestivals: [
          { name: 'Kadayawan Festival', location: 'Davao City', description: "Thanksgiving celebration for nature's gifts" },
          { name: 'Shariff Kabunsuan Festival', location: 'Cotabato', description: 'Islamic cultural celebration' },
          { name: 'Lanzones Festival', location: 'Camiguin', description: 'Fruit harvest festival' }
        ],
        culturalSites: ['Lake Sebu', 'Mount Apo', 'Enchanted River', 'Masjid Al-Dahab']
      }
    }
  ];

  

  const timeline = [
    {
      period: 'Pre-Colonial Era',
      year: 'Before 1521',
      description:
        'Indigenous tribes develop ritual dances for harvests, hunting, and spiritual ceremonies.',
      dances: ['Bendian', 'Dugso', 'Pagdiwata'],
      culturalDanceContext: {
        purpose:
          'Dances served as communication with spirits, nature, and ancestors through movement',
        community:
          'Entire tribes participated in seasonal ceremonies that strengthened social bonds',
        preservation:
          'Oral tradition kept dance knowledge alive across generations without written records',
        meaning:
          'Movement patterns encoded agricultural knowledge, spiritual beliefs, and tribal identity',
        instruments:
          'Indigenous drums, gongs, and natural materials created sacred rhythms',
        costumes:
          'Natural materials and tribal symbols indicated clan identity and spiritual roles'
      },
      modernRelevance:
        'These ancient dances maintain connection to pre-colonial Filipino spirituality and environmental awareness in contemporary performances.'
    },
    {
      period: 'Spanish Colonial',
      year: '1521-1898',
      description:
        'Spanish influence introduces European dance forms merged with local traditions.',
      dances: ['Cariñosa', 'Rigodon', 'Pandanggo'],
      culturalDanceContext: {
        purpose:
          'Social dances for courtship and community celebration within Catholic framework',
        adaptation:
          'European dance forms modified to fit Filipino cultural values and physical expression',
        resistance: 'Indigenous movement elements preserved within colonial dance structures',
        meaning:
          'Cultural fusion created uniquely Filipino interpretations of European social customs',
        instruments:
          'Spanish guitars and European instruments adapted to Filipino musical sensibilities',
        costumes:
          'Colonial formal wear combined with traditional Filipino textile patterns and techniques'
      },
      modernRelevance:
        'Colonial-era dances demonstrate Filipino cultural adaptability while maintaining distinct identity.'
    },
    {
      period: 'American Period',
      year: '1898-1946',
      description:
        'Folk dances preserved and documented, becoming symbols of national identity.',
      dances: ['Tinikling', 'Singkil', 'La Jota'],
      culturalDanceContext: {
        purpose:
          'Cultural preservation during foreign occupation became form of peaceful resistance',
        documentation:
          'First systematic recording and standardization of traditional dance forms',
        nationalism:
          'Folk dances became symbols of Filipino cultural independence and unique identity',
        meaning:
          'Performance of traditional dances asserted cultural autonomy and historical continuity',
        education:
          'Introduction of folk dance into formal education system for cultural transmission',
        modernization:
          'Traditional dances adapted for stage performance and cultural presentation'
      },
      modernRelevance:
        'This period established folk dance as essential component of Filipino national identity and educational curriculum.'
    },
    {
      period: 'Modern Era',
      year: '1946-Present',
      description:
        'Contemporary choreographers revitalize traditional dances for new generations.',
      dances: ['Modern interpretations', 'Fusion styles', 'Cultural preservation'],
      culturalDanceContext: {
        purpose:
          'Keeping traditions alive while making them relevant to modern Filipino and global audiences',
        innovation:
          'New choreographic approaches while respecting traditional cultural meanings and values',
        education:
          'Folk dance integration into school curricula and cultural education programs',
        globalization:
          'Filipino folk dances performed worldwide by diaspora communities maintaining cultural connections',
        technology:
          'Digital documentation and online instruction expanding access to traditional knowledge',
        fusion:
          'Contemporary artists creating new works that honor traditional forms while addressing modern themes'
      },
      modernRelevance:
        'Contemporary folk dance practice maintains cultural connection in globalized world while evolving for new generations.'
    }
  ];

  // --- Modal helpers
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

  // === Collapsible sections state & toggle ===
  const [openTimeline, setOpenTimeline] = useState(() => new Set([0, 1, 2, 3])); // default all visible
  const [openClassifications, setOpenClassifications] = useState(() => new Set()); // default all closed
  
  const toggleTimeline = (idx) => {
    setOpenTimeline((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleClassification = (idx) => {
    setOpenClassifications((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const culturalElements = [
    {
      icon: Music,
      title: 'Traditional Music in Dance',
      description:
        'Kulintang, rondalla, and bamboo instruments create the rhythmic soul of Filipino folk dances.',
      detailedInfo: {
        overview:
          'Filipino traditional music forms the rhythmic foundation of folk dances, creating an immersive cultural experience that connects dancers and audiences to their ancestral heritage.',
        danceApplications: [
          {
            dance: 'Singkil',
            instrument: 'Kulintang ensemble',
            culturalFunction:
              'Royal court music elevates dance to ceremonial art form, each gong pattern tells stories of heroism and romance',
            rhythmicMeaning:
              'Complex polyrhythms mirror the intricate steps of royal court dancers'
          },
          {
            dance: 'Tinikling',
            instrument: 'Bamboo poles as percussion',
            culturalFunction: 'Work rhythms transformed into celebratory dance',
            rhythmicMeaning:
              'Clicking bamboo mimics sounds of rural labor turned into joyful expression'
          },
          {
            dance: 'Cariñosa',
            instrument: 'Rondalla string ensemble',
            culturalFunction: 'Spanish-influenced music for social courtship dancing',
            rhythmicMeaning:
              'Melodic strings guide gentle, respectful romantic interactions'
          }
        ],
        instruments: [
          {
            name: 'Kulintang',
            description:
              'Ancient gong ensemble from Mindanao, creates melodic patterns for royal court dances like Singkil'
          },
          {
            name: 'Rondalla',
            description:
              'String ensemble with bandurria, laud, and guitar, accompanies Spanish-influenced dances like Cariñosa'
          },
          {
            name: 'Gangsa',
            description:
              'Flat gongs from the Cordilleras, used in ritual and ceremonial dances like Bendian'
          },
          {
            name: 'Bamboo Instruments',
            description:
              'Angklung, tongatong, and bumbong create percussive rhythms for folk dances like Tinikling'
          }
        ],
        characteristics: [
          'Polyrhythmic patterns that guide complex dance movements',
          'Call and response sections between musicians and dancers',
          'Improvisation within traditional structures allows personal expression',
          'Integration of indigenous and colonial musical elements creates unique Filipino sound'
        ],
        significance:
          'Music serves as the heartbeat of Filipino culture, with each rhythm telling stories of love, war, harvest, and spiritual beliefs passed down through generations of dancers and musicians.'
      }
    },
    {
      icon: Users,
      title: 'Community Spirit Through Dance',
      description:
        'Bayanihan - the Filipino spirit of unity expressed through synchronized group performances.',
      detailedInfo: {
        overview:
          'Bayanihan embodies the Filipino spirit of unity and cooperation, where communities come together to support one another, beautifully expressed through collective dance performances that strengthen social bonds.',
        danceManifestations: [
          {
            principle: 'Pakikipagkapwa (Shared Identity)',
            danceExpression: 'Synchronized group movements in all folk dances',
            culturalMeaning:
              'Individual success depends on group harmony - no one dances alone'
          },
          {
            principle: 'Utang na Loob (Debt of Gratitude)',
            danceExpression: 'Teaching dances to younger generations',
            culturalMeaning:
              'Older community members pass on cultural knowledge as gift to future'
          },
          {
            principle: 'Kapamilya (Treating Others as Family)',
            danceExpression: 'Inclusive participation regardless of skill level',
            culturalMeaning:
              'Community dances welcome all participants, building inclusive identity'
          }
        ],
        principles: [
          {
            name: 'Pakikipagkapwa',
            description:
              'Shared identity and interconnectedness among community members expressed through unified dance movements'
          },
          {
            name: 'Utang na Loob',
            description:
              'Debt of gratitude that binds communities together through cultural transmission'
          },
          {
            name: 'Kapamilya',
            description:
              'Treating others as family, regardless of blood relations, through inclusive dance participation'
          },
          {
            name: 'Pakikipagkunware',
            description:
              'Accommodating others even at personal sacrifice, shown in dance partner consideration'
          }
        ],
        expressions: [
          'Group dances performed during fiestas and celebrations create community unity',
          'Collective preparation of costumes and props builds social cooperation',
          'Intergenerational teaching of dance traditions strengthens cultural bonds',
          'Community fundraising for cultural events demonstrates shared responsibility'
        ],
        significance:
          'The bayanihan spirit ensures that Filipino cultural traditions survive and thrive, with entire communities taking responsibility for preserving their heritage through participatory dance traditions.'
      }
    },
    {
      icon: BookOpen,
      title: 'Oral Traditions Through Movement',
      description:
        'Epic stories and cultural wisdom preserved through choreographed dance narratives.',
      detailedInfo: {
        overview:
          'Filipino oral traditions preserve ancient wisdom, historical events, and cultural values through storytelling dances that serve as living libraries of indigenous knowledge.',
        epics: [
          {
            name: 'Darangen',
            description:
              'Maranao epic telling the adventures of Prince Bantugan, performed through Singkil dance'
          },
          {
            name: 'Hudhud',
            description:
              'Ifugao harvest songs and epic chants accompanying rice terrace rituals'
          },
          {
            name: 'Ullalim',
            description:
              'Kalinga epic about heroic deeds, performed during peace pacts'
          },
          {
            name: 'Biag ni Lam-ang',
            description:
              'Ilocano epic of supernatural hero, expressed through various folk dances'
          }
        ],
        storytelling: [
          'Dance movements that mimic narrative elements',
          'Costumes and props that represent story characters',
          'Musical accompaniment that enhances dramatic tension',
          'Audience participation in familiar story segments'
        ],
        significance:
          'Oral traditions through dance ensure that historical events, moral lessons, and cultural wisdom remain alive and accessible to new generations, creating an unbroken chain of cultural memory.'
      }
    },
    {
      icon: Camera,
      title: 'Visual Arts in Dance Costume',
      description:
        'Traditional textiles, jewelry, and ceremonial dress that communicate cultural identity.',
      detailedInfo: {
        overview:
          'Filipino visual arts in dance encompass elaborate costumes, symbolic accessories, and intricate designs that communicate cultural identity, social status, and spiritual beliefs.',
        costumes: [
          {
            name: "Baro't Saya",
            description:
              'Traditional Filipino dress with butterfly sleeves, worn in Spanish-influenced dances'
          },
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
        significance:
          'Visual elements in Filipino dance serve as a non-verbal language that communicates complex cultural narratives, making each performance a feast for the eyes and a lesson in history.'
      }
    }
  ];

  return (
    <div className="culture">
      <Navbar />

      {/* Reading Progress Bar */}
      {showProgressBar && (
        <div className="reading-progress-container">
          <div 
            className="reading-progress-bar" 
            style={{ width: `${readingProgress}%` }}
          ></div>
        </div>
      )}

      {/* Floating Navigation Menu */}
      <div className={`floating-nav ${showNavMenu ? 'nav-open' : ''}`}>
        <button 
          className="culture-nav-toggle"
          onClick={(e) => {
            e.stopPropagation();
            // If we're closing the menu and there's a search active, clear it
            if (showNavMenu && searchTerm) {
              setSearchTerm('');
              setSearchResults([]);
              setCurrentSearchIndex(0);
              document.querySelectorAll('.search-highlight').forEach(el => {
                el.classList.remove('search-highlight', 'search-highlight-active');
              });
            }
            setShowNavMenu(!showNavMenu);
          }}
          title="Navigation Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        
        <div className="nav-menu" onClick={(e) => e.stopPropagation()}>
          <div className="nav-header">
            <h3>Quick Navigation</h3>
            {activeSection && (
              <span className={`section-indicator ${activeSection}`}>
                {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
              </span>
            )}
          </div>

          {/* Search Bar in Navigation */}
          <div className="nav-search-container">
            <div className="nav-search-bar">
              <svg className="nav-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                className="nav-search-input"
                placeholder="Search this page..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  performSearch(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (e.shiftKey) {
                      navigateSearchResults('prev');
                    } else {
                      navigateSearchResults('next');
                    }
                  } else if (e.key === 'Escape') {
                    clearSearch();
                  }
                }}
              />
              {searchTerm && (
                <div className="nav-search-controls">
                  <span className="nav-search-count">
                    {searchResults.length > 0 ? `${currentSearchIndex + 1}/${searchResults.length}` : '0'}
                  </span>
                  <button className="nav-search-btn" onClick={() => navigateSearchResults('prev')} disabled={searchResults.length === 0}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="15,18 9,12 15,6"/>
                    </svg>
                  </button>
                  <button className="nav-search-btn" onClick={() => navigateSearchResults('next')} disabled={searchResults.length === 0}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="9,18 15,12 9,6"/>
                    </svg>
                  </button>
                  <button className="nav-search-btn" onClick={clearSearch}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="nav-links">
            <button onClick={() => { scrollToSection('heritage'); setShowNavMenu(false); }} className={activeSection === 'heritage' ? 'active' : ''}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Living Heritage
            </button>
            <button onClick={() => { scrollToSection('elements'); setShowNavMenu(false); }} className={activeSection === 'elements' ? 'active' : ''}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l2 7h7l-5.5 4 2 7L12 15.5 6.5 20l2-7L3 9h7l2-7z"/>
              </svg>
              Cultural Elements
            </button>
            <button onClick={() => { scrollToSection('classifications'); setShowNavMenu(false); }} className={activeSection === 'classifications' ? 'active' : ''}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              Dance Classifications
            </button>
            <button onClick={() => { scrollToSection('regions'); setShowNavMenu(false); }} className={activeSection === 'regions' ? 'active' : ''}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Regional Cultures
            </button>
            <button onClick={() => { scrollToSection('timeline'); setShowNavMenu(false); }} className={activeSection === 'timeline' ? 'active' : ''}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              Cultural Timeline
            </button>
          </div>
        </div>
      </div>



      {/* Hero Section */}
      <section id="hero" className="culture-hero">
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
              Discover the living heritage of the Philippines through traditional folk dances that preserve our ancestors' wisdom,
              values, and stories. Each graceful movement in Cariñosa teaches respect and courtship traditions.
              Every rhythmic step in Tinikling demonstrates Filipino resilience and community cooperation.
              From the royal court elegance of Singkil to the harvest celebrations of rural dances,
              experience how these cultural treasures continue to shape Filipino identity across three distinct regions.
              Journey through centuries of tradition where Spanish colonial influences, indigenous spirituality,
              and modern adaptations create a unique tapestry of movement, music, and meaning that connects
              past generations to present communities and future cultural preservation.
            </p>
          </div>
        </div>
      </section>

      {/* Heritage Introduction */}
      <section 
        id="heritage" 
        className="cultural-heritage-intro"
        style={{
          background: '#c4a678',
          color: 'white',
          padding: '4rem 0'
        }}
      >
        <div className="container">
          <div className="section-header">
            <h2 
              className="section-title"
              style={{
                color: '#FFD700',
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                marginBottom: '1rem',
                textAlign: 'center',
                fontWeight: '800',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                background: 'rgba(0,0,0,0.1)',
                padding: '1rem',
                borderRadius: '10px',
                border: '3px solid #FFD700',
                boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
              }}
            >
              Living Cultural Heritage
            </h2>
            <p 
              className="section-subtitle"
              style={{
                color: '#000000',
                fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
                maxWidth: '600px',
                margin: '0 auto',
                textAlign: 'center',
                fontWeight: '600',
                background: 'rgba(255,255,255,0.9)',
                padding: '0.5rem 1rem',
                borderRadius: '8px'
              }}
            >
              Filipino folk dances are more than entertainment—they are living repositories of cultural knowledge, 
              spiritual beliefs, and community values passed down through generations of movement and music.
            </p>
          </div>
          <div className="heritage-content">
          <div className="heritage-highlights">
            <div className="heritage-highlight">
              <div className="heritage-highlight-icon">
                <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3>Ancestral Wisdom</h3>
              <p>Each dance movement encodes traditional knowledge about agriculture, nature, and social values</p>
            </div>
            <div className="heritage-highlight">
              <div className="heritage-highlight-icon">
                <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <h3>Community Identity</h3>
              <p>Dances strengthen social bonds and preserve unique regional cultural characteristics</p>
            </div>
            <div className="heritage-highlight">
              <div className="heritage-highlight-icon">
                <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l2 7h7l-5.5 4 2 7L12 15.5 6.5 20l2-7L3 9h7l2-7z"/>
                </svg>
              </div>
              <h3>Cultural Continuity</h3>
              <p>Traditional forms adapt to modern contexts while maintaining their essential meaning and spirit</p>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Cultural Elements */}
      <section 
        id="elements" 
        className="cultural-elements"
        style={{
          background: 'white',
          color: '#333',
          padding: '4rem 0'
        }}
      >
        <div className="container">
          <div className="section-header">
            <h2 
              className="section-title"
              style={{
                color: '#FFD700',
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                marginBottom: '1rem',
                textAlign: 'center',
                fontWeight: '800',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                background: 'rgba(196, 166, 120, 0.1)',
                padding: '1rem',
                borderRadius: '10px',
                border: '3px solid #c4a678',
                boxShadow: '0 4px 12px rgba(196, 166, 120, 0.4)'
              }}
            >
              Elements of Filipino Culture
            </h2>
            <p 
              className="section-subtitle"
              style={{
                color: '#000000',
                fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
                maxWidth: '600px',
                margin: '0 auto',
                textAlign: 'center',
                fontWeight: '600'
              }}
            >
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

      

      {/* Folk Dance Classifications */}
      <section 
        id="classifications" 
        className="folk-dance-classifications"
        style={{
          background: '#c4a678',
          color: 'white',
          padding: '4rem 0'
        }}
      >
        <div className="container">
          <div className="section-header">
            <h2 
              className="section-title"
              style={{
                color: '#FFD700',
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                marginBottom: '1rem',
                textAlign: 'center',
                fontWeight: '800',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                background: 'rgba(0,0,0,0.1)',
                padding: '1rem',
                borderRadius: '10px',
                border: '3px solid #FFD700',
                boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
              }}
            >
              Filipino Folk Dance Classifications
            </h2>
            <p 
              className="section-subtitle"
              style={{
                color: '#000000',
                fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
                maxWidth: '600px',
                margin: '0 auto',
                textAlign: 'center',
                fontWeight: '600',
                background: 'rgba(255,255,255,0.9)',
                padding: '0.5rem 1rem',
                borderRadius: '8px'
              }}
            >
              Understanding the rich diversity of Filipino folk dances through their traditional categories and cultural origins
            </p>
            <div className="classification-controls">

            </div>
          </div>

          <div className="classifications-grid">
            {folkDanceClassifications.map((classification, index) => {
              const isOpen = openClassifications.has(index);
              return (
                <div key={index} className="classification-card">
                  <div 
                    className="classification-header-clickable"
                    onClick={() => toggleClassification(index)}
                  >
                    <div className="classification-image">
                      <img src={classification.image} alt={classification.category} />
                      <div className="classification-overlay">
                        <div className="classification-icon">
                          <Users2 size={32} />
                        </div>
                      </div>
                    </div>

                    <div className="classification-content">
                      <div className="classification-header">
                        <div className="classification-title-section">
                          <h3 className="classification-title">
                            {classification.category}
                            <button className="collapse-indicator">
                              <svg 
                                width="20" 
                                height="20" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor"
                                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                              >
                                <polyline points="6,9 12,15 18,9"/>
                              </svg>
                            </button>
                          </h3>
                          <p className="classification-description">{classification.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="classification-expandable-content">
                      <div className="classification-characteristics">
                    <h4>Key Characteristics:</h4>
                    <div className="characteristics-list-grid">
                      {classification.characteristics.map((characteristic, charIndex) => (
                        <div key={charIndex} className="characteristic-item-simple">
                          <div className="characteristic-bullet-simple">•</div>
                          <span>{characteristic}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="classification-dances">
                    <h4>Representative Dances:</h4>
                    <div className="dances-showcase">
                      {classification.dances.map((dance, danceIndex) => (
                        <div key={danceIndex} className="dance-showcase-card">
                          <div className="dance-image">
                            <img src={dance.image} alt={dance.name} />
                            <div className="dance-image-overlay">
                              <span className="dance-showcase-origin">{dance.origin}</span>
                            </div>
                          </div>
                          <div className="dance-content">
                            <div className="dance-showcase-header">
                              <span className="dance-showcase-name">{dance.name}</span>
                            </div>
                            <p className="dance-showcase-description">{dance.description}</p>
                            <div className="dance-showcase-context">
                              <div className="context-icon">
                                <Heart size={14} />
                              </div>
                              <p className="context-text">{dance.culturalContext}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Regional Cultures */}
      <section 
        id="regions" 
        className="regional-cultures"
        style={{
          background: 'white',
          color: '#333',
          padding: '4rem 0'
        }}
      >
        <div className="container">
          <div className="section-header">
            <h2 
              className="section-title"
              style={{
                color: '#FFD700',
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                marginBottom: '1rem',
                textAlign: 'center',
                fontWeight: '800',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                background: 'rgba(196, 166, 120, 0.1)',
                padding: '1rem',
                borderRadius: '10px',
                border: '3px solid #c4a678',
                boxShadow: '0 4px 12px rgba(196, 166, 120, 0.4)'
              }}
            >
              Regional Cultural Diversity
            </h2>
            <p 
              className="section-subtitle"
              style={{
                color: '#000000',
                fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
                maxWidth: '600px',
                margin: '0 auto',
                textAlign: 'center',
                fontWeight: '600'
              }}
            >
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
                    <h4>Featured Traditional Dances:</h4>
                    <div className="dance-tags">
                      {region.dances.slice(0, 3).map((dance, index) => (
                        <span key={index} className="dance-tag">{dance.name}</span>
                      ))}
                      {region.dances.length > 3 && (
                        <span className="dance-tag-more">+{region.dances.length - 3} more</span>
                      )}
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
      <section 
        id="timeline" 
        className="cultural-timeline"
        style={{ 
          background: '#c4a678', 
          color: 'white',
          padding: '4rem 0'
        }}
      >
        <div className="container">
          <div className="section-header">
            <h2 
              className="section-title" 
              style={{ 
                color: '#FFD700',
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                marginBottom: '1rem',
                textAlign: 'center',
                fontWeight: '800',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                background: 'rgba(0,0,0,0.1)',
                padding: '1rem',
                borderRadius: '10px',
                border: '3px solid #FFD700',
                boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
              }}
            >
              Cultural Evolution Timeline
            </h2>
            <p 
              className="section-subtitle" 
              style={{ 
                color: '#000000',
                fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
                maxWidth: '600px',
                margin: '0 auto',
                fontWeight: '600',
                background: 'rgba(255,255,255,0.9)',
                padding: '0.5rem 1rem',
                borderRadius: '8px'
              }}
            >
              Journey through the historical development of Filipino folk dance traditions
            </p>
          </div>

          <div 
            className="timeline"
            style={{
              position: 'relative',
              maxWidth: '1000px',
              margin: '0 auto',
              padding: '2rem 0'
            }}
          >
            {/* Enhanced Timeline Central Line */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: '4px',
                background: 'linear-gradient(to bottom, #ffffff, #f0f0f0, #ffffff)',
                transform: 'translateX(-50%)',
                boxShadow: '0 0 10px rgba(255,255,255,0.5)',
                zIndex: 1
              }}
            />
            {timeline.map((period, index) => {
              const isOpen = openTimeline.has(index);
              return (
                <div 
                  key={index} 
                  className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'} ${isOpen ? 'expanded' : 'collapsed'}`}
                >
                  <div className="timeline-content">
                    <div className="timeline-period-row">
                      <div className="timeline-period">
                        <h3 style={{ color: '#c4a678', marginBottom: '0.5rem' }}>{period.period}</h3>
                        <span 
                          className="timeline-year"
                          style={{ color: '#4a5568', fontWeight: '600' }}
                        >
                          {period.year}
                        </span>
                      </div>

                      {/* Arrow beside the clock */}
                      <button
                        type="button"
                        className="timeline-toggle"
                        onClick={() => toggleTimeline(index)}
                        aria-expanded={isOpen}
                        aria-controls={`timeline-panel-${index}`}
                        title={isOpen ? 'Collapse' : 'Expand'}
                        style={{ color: '#c4a678' }}
                      >
                        {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                    </div>

                    {/* Collapsible content */}
                    {isOpen && (
                      <div id={`timeline-panel-${index}`} className="timeline-panel">
                        <p 
                          className="timeline-description"
                          style={{ 
                            color: '#4a5568', 
                            margin: '1rem 0', 
                            lineHeight: 1.6 
                          }}
                        >
                          {period.description}
                        </p>

                        <div 
                          className="timeline-cultural-context"
                          style={{
                            background: 'rgba(196, 166, 120, 0.05)',
                            padding: '1.5rem',
                            borderRadius: '10px',
                            margin: '1.5rem 0',
                            border: '1px solid rgba(196, 166, 120, 0.2)'
                          }}
                        >
                          <h4 
                            style={{ 
                              color: '#c4a678',
                              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                              marginBottom: '1rem'
                            }}
                          >
                            Cultural-Dance Context:
                          </h4>
                          <div className="context-grid">
                            <div 
                              className="context-item" 
                              style={{ 
                                color: '#4a5568',
                                fontSize: 'clamp(0.8rem, 2vw, 0.95rem)',
                                marginBottom: '0.75rem',
                                background: 'rgba(196, 166, 120, 0.1)',
                                padding: '1rem',
                                borderRadius: '8px',
                                borderLeft: '3px solid #c4a678'
                              }}
                            >
                              <strong style={{ color: '#2d3748' }}>Purpose:</strong> {period.culturalDanceContext?.purpose}
                            </div>
                            <div 
                              className="context-item" 
                              style={{ 
                                color: '#4a5568',
                                fontSize: 'clamp(0.8rem, 2vw, 0.95rem)',
                                marginBottom: '0.75rem',
                                background: 'rgba(196, 166, 120, 0.1)',
                                padding: '1rem',
                                borderRadius: '8px',
                                borderLeft: '3px solid #c4a678'
                              }}
                            >
                              <strong style={{ color: '#2d3748' }}>Community Role:</strong> {period.culturalDanceContext?.community}
                            </div>
                            <div 
                              className="context-item" 
                              style={{ 
                                color: '#4a5568',
                                fontSize: 'clamp(0.8rem, 2vw, 0.95rem)',
                                marginBottom: '0.75rem',
                                background: 'rgba(196, 166, 120, 0.1)',
                                padding: '1rem',
                                borderRadius: '8px',
                                borderLeft: '3px solid #c4a678'
                              }}
                            >
                              <strong style={{ color: '#2d3748' }}>Cultural Meaning:</strong> {period.culturalDanceContext?.meaning}
                            </div>
                          </div>
                        </div>

                        <div className="timeline-dances">
                          <strong style={{ color: '#2d3748', fontSize: '1rem' }}>Notable Dances:</strong>
                          <div className="timeline-dance-list" style={{ marginTop: '0.5rem' }}>
                            {period.dances.map((dance, danceIndex) => (
                              <span 
                                key={danceIndex} 
                                className="timeline-dance"
                                style={{
                                  background: '#c4a678',
                                  color: 'white',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '16px',
                                  fontSize: '0.9rem',
                                  fontWeight: '500',
                                  display: 'inline-block',
                                  margin: '0.25rem'
                                }}
                              >
                                {dance}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="timeline-relevance" style={{ marginTop: '1.5rem' }}>
                          <strong style={{ color: '#2d3748', fontSize: '1rem' }}>Modern Relevance:</strong>
                          <p 
                            className="relevance-note"
                            style={{ 
                              color: '#4a5568', 
                              marginTop: '0.5rem',
                              lineHeight: 1.6 
                            }}
                          >
                            {period.modernRelevance}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="timeline-marker">
                    <Clock size={20} />
                  </div>
                </div>
              );
            })}
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

              <div className="modal-section cultural-dance-integration">
                <h3>
                  <Users size={20} />
                  Cultural Values in Dance
                </h3>
                <div className="cultural-connections-grid">
                  {selectedRegion.detailedInfo.culturalDanceConnections?.map((connection, index) => (
                    <div key={index} className="cultural-connection-item">
                      <div className="connection-value">
                        <strong>{connection.culturalValue}</strong>
                      </div>
                      <div className="connection-dance">
                        Dance Expression: {connection.danceExpression}
                      </div>
                      <div className="connection-meaning">
                        <em>{connection.meaning}</em>
                      </div>
                    </div>
                  ))}
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

              <div className="modal-section traditional-dances-section">
                <h3>
                  <Music size={20} />
                  Traditional Dances & Cultural Meaning
                </h3>
                <div className="modal-dances-grid">
                  {selectedRegion.dances.map((dance, index) => (
                    <div key={index} className="modal-dance-card">
                      <div className="modal-dance-header">
                        <h4 className="modal-dance-name">{dance.name}</h4>
                        <div className="modal-dance-icon">
                          <Palette size={16} />
                        </div>
                      </div>
                      <p className="modal-dance-meaning">{dance.culturalMeaning}</p>
                      <div className="modal-dance-details">
                        <div className="modal-dance-detail">
                          <Music size={14} />
                          <span><strong>Musical Connection:</strong> {dance.musicalConnection}</span>
                        </div>
                        <div className="modal-dance-detail">
                          <Users size={14} />
                          <span><strong>Community Role:</strong> {dance.communityRole}</span>
                        </div>
                      </div>
                    </div>
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
                {/* FIX: render dynamic icon component correctly */}
                {(() => {
                  const Icon = selectedElement.icon;
                  return <Icon size={60} />;
                })()}
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

              {selectedElement.detailedInfo.danceApplications && (
                <div className="element-modal-section">
                  <h3>
                    <Music size={20} />
                    Dance Applications
                  </h3>
                  <div className="dance-applications-grid">
                    {selectedElement.detailedInfo.danceApplications.map((application, index) => (
                      <div key={index} className="dance-application-card">
                        <div className="application-header">
                          <div className="dance-name-badge">{application.dance}</div>
                          <div className="instrument-badge">{application.instrument}</div>
                        </div>
                        <div className="application-function">
                          <strong>Cultural Function:</strong>
                          <p>{application.culturalFunction}</p>
                        </div>
                        <div className="application-meaning">
                          <strong>Rhythmic Meaning:</strong>
                          <p>{application.rhythmicMeaning}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

              {selectedElement.detailedInfo.danceManifestations && (
                <div className="element-modal-section">
                  <h3>
                    <Heart size={20} />
                    Dance Manifestations
                  </h3>
                  <div className="principles-grid">
                    {selectedElement.detailedInfo.danceManifestations.map((manifestation, index) => (
                      <div key={index} className="principle-card">
                        <h4>{manifestation.principle}</h4>
                        <p><strong>Dance Expression:</strong> {manifestation.danceExpression}</p>
                        <p><em>Cultural Meaning:</em> {manifestation.culturalMeaning}</p>
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
                    {selectedElement.detailedInfo.storytelling.map((el, index) => (
                      <div key={index} className="storytelling-item">
                        <div className="storytelling-bullet">•</div>
                        <span>{el}</span>
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

      {/* Enhanced Scroll to Top Button with Progress Ring */}
      {showScrollTop && !selectedRegion && !selectedElement && (
        <button
          className="scroll-to-top-enhanced"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          
          <svg className="progress-ring" width="60" height="60" viewBox="0 0 60 60">
            <circle
              className="progress-ring-circle"
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              r="26"
              cx="30"
              cy="30"
              style={{
                strokeDasharray: `${2 * Math.PI * 26}`,
                strokeDashoffset: `${2 * Math.PI * 26 * (1 - readingProgress / 100)}`,
              }}
            />
          </svg>
          <div className="scroll-icon">
            <ArrowUp size={20} />
          </div>
        </button>
      )}

      {/* Enhanced References Section */}
      <section 
        id="references" 
        style={{
          background: '#ffffff',
          padding: '5rem 0 4rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative Pattern Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(160, 133, 91, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(219, 39, 119, 0.03) 0%, transparent 50%)',
          zIndex: 0
        }} />

        <div className="container" style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1.5rem',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'linear-gradient(135deg, #a0855b, #c4a678)',
              padding: '0.75rem 1.5rem',
              borderRadius: '50px',
              marginBottom: '1.5rem',
              boxShadow: '0 4px 15px rgba(160, 133, 91, 0.3)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <span style={{ 
                color: '#ffffff',
                fontSize: '0.875rem', 
                fontWeight: '700',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}>
                Academic Sources
              </span>
            </div>
            <h2 style={{ 
              background: 'linear-gradient(135deg, #a0855b, #c4a678, #db2777)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '2.75rem', 
              fontWeight: '800',
              marginBottom: '1rem',
              letterSpacing: '-0.02em'
            }}>
              References & Citations
            </h2>
            <p style={{
              color: '#4a5568',
              fontSize: '1.15rem',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: '1.7',
              fontWeight: '400'
            }}>
              Scholarly sources and cultural institutions that informed this comprehensive guide to Filipino folk dance traditions
            </p>
          </div>

          {/* References Grid - Responsive: 4 cols on XL, 3 on L, 2 on M, 1 on SM */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '2rem',
            marginBottom: '3rem',
            maxWidth: '1600px',
            margin: '0 auto 3rem'
          }}
          className="cultureReferencesGrid"
          >
            <style>{`
              @media (max-width: 1600px) {
                .cultureReferencesGrid {
                  grid-template-columns: repeat(4, 1fr) !important;
                  max-width: 1400px;
                }
              }
              @media (max-width: 1400px) {
                .cultureReferencesGrid {
                  grid-template-columns: repeat(3, 1fr) !important;
                  max-width: 1200px;
                }
              }
              @media (max-width: 1024px) {
                .cultureReferencesGrid {
                  grid-template-columns: repeat(2, 1fr) !important;
                  gap: 1.5rem !important;
                }
              }
              @media (max-width: 768px) {
                .cultureReferencesGrid {
                  grid-template-columns: 1fr !important;
                  gap: 1.25rem !important;
                }
              }
            `}</style>
            {[
              {
                number: '01',
                title: 'Cultural Center of the Philippines',
                subtitle: 'Educational Performing Arts',
                link: 'https://epa.culturalcenter.gov.ph/6/',
              },
              {
                number: '02',
                title: 'Pandanggo Folk Dance',
                subtitle: 'Reference.com History',
                link: 'https://www.reference.com/history-geography/history-pandanggo-sa-ilaw-ac48f5cbb2522b2c',
              },
              {
                number: '03',
                title: 'Sayaw Sa Bangko History',
                subtitle: 'Yodisphere Cultural Archives',
                link: 'https://www.yodisphere.com/2023/09/Sayaw-Sa-Bangko-Folk-Dance-History.html',
              },
              {
                number: '04',
                title: 'Itik-Itik Dance Tradition',
                subtitle: 'DanceUs Cultural Guide',
                link: 'https://www.danceus.org/style/itik-itik-dance-in-philippines/',
              },
              {
                number: '05',
                title: 'Cariñosa National Dance',
                subtitle: 'DanceUs Cultural Guide',
                link: 'https://www.danceus.org/style/carinosa-dance-in-philippines/',
              },
              {
                number: '06',
                title: 'Rigodon Ballroom Tradition',
                subtitle: 'The Philippine Star',
                link: 'https://www.philstar.com/other-sections/starweek-magazine/2008/06/08/66579/elegant-cherished-tradition',
              },
              {
                number: '07',
                title: 'Western Musical Influence',
                subtitle: 'National Commission for Culture and the Arts',
                link: 'https://ncca.gov.ph/about-ncca-3/subcommissions/subcommission-on-the-arts-sca/music/westernized-musical-traditions-in-the-philippines/',
              },
              {
                number: '08',
                title: 'Cordillera Indigenous Dance',
                subtitle: 'Mabikas Foundation',
                link: 'https://mabikas-foundation.org/wp-content/uploads/2021/02/performing_indigeneity_in_the_cordillera_dance_community_and_power_in_the_highlands_of_luzon.pdf',
              }
            ].map((ref, index) => (
              <div
                key={index}
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  padding: '2rem',
                  border: '2px solid transparent',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.25)';
                  e.currentTarget.style.borderColor = '#c4a678';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                {/* Gradient Top Border */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '5px',
                  background: 'linear-gradient(90deg, #a0855b, #c4a678, #db2777)',
                }} />

                {/* Card Content Wrapper */}
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                  {/* Reference Number */}
                  <div style={{ 
                    marginBottom: '1.25rem',
                    marginTop: '0.5rem'
                  }}>
                    <div style={{
                      width: '45px',
                      height: '45px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #a0855b, #c4a678)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: '800',
                      color: '#ffffff',
                      boxShadow: '0 4px 15px rgba(160, 133, 91, 0.3)'
                    }}>
                      {ref.number}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    background: 'linear-gradient(135deg, #a0855b, #c4a678)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '1.35rem',
                    fontWeight: '800',
                    marginBottom: '0.5rem',
                    lineHeight: '1.3'
                  }}>
                    {ref.title}
                  </h3>

                  {/* Subtitle - Flex grow to push button down */}
                  <p style={{
                    color: '#db2777',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    marginBottom: '1.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    flex: '1'
                  }}>
                    {ref.subtitle}
                  </p>
                </div>

                {/* Link Button - Always at bottom */}
                <a
                  href={ref.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'linear-gradient(135deg, #a0855b, #c4a678)',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    textDecoration: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '50px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(160, 133, 91, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.gap = '0.75rem';
                    e.currentTarget.style.transform = 'translateX(5px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(160, 133, 91, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.gap = '0.5rem';
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(160, 133, 91, 0.3)';
                  }}
                >
                  <span>View Source</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              </div>
            ))}
          </div>

          {/* Citation Note */}
          <div style={{
            background: '#ffffff',
            border: '3px solid #c4a678',
            borderRadius: '20px',
            padding: '2rem 2.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1.5rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative Corner Accent */}
            <div style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, #a0855b, #c4a678)',
              borderRadius: '50%',
              opacity: 0.1
            }} />
            
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #a0855b, #c4a678)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 15px rgba(160, 133, 91, 0.3)'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h4 style={{
                background: 'linear-gradient(135deg, #a0855b, #c4a678)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '1.25rem',
                fontWeight: '800',
                marginBottom: '0.75rem',
                letterSpacing: '-0.01em'
              }}>
                Academic Integrity Notice
              </h4>
              <p style={{
                color: '#4a5568',
                fontSize: '1rem',
                lineHeight: '1.8',
                margin: 0
              }}>
                All information presented in this cultural guide has been carefully researched and cited from reputable academic sources, 
                cultural institutions, and scholarly publications. We acknowledge and honor the contributions of these organizations 
                in preserving and documenting Filipino cultural heritage.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Culture;