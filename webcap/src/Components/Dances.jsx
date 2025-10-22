// Dances.jsx (full updated)

import React, { useState, useEffect } from 'react';
import { Search, Filter, Play, MapPin, ArrowUp } from 'lucide-react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import './Dances.css';
import { supabase } from '../supabasebaseClient';
import tiklosImage from '../assets/tiklos.png';
import binungeyImage from '../assets/binungeybg.png';
import pahidImage from '../assets/Pahid.png';
import suakusuaImage from '../assets/sks.png';

// Videos (kept as in your version)
import BinungeyMainVideo from '../assets/Videos/Binungey.mp4';
import BinungeyFig1 from '../assets/Videos/BinungeyBoyFig1.mp4';
import BinungeyFig2 from '../assets/Videos/BinungeyBoyFig2.mp4';
import BinungeyFig3 from '../assets/Videos/BinungeyBoyFig3.mp4';
import BinungeyFig4 from '../assets/Videos/BinungeyBoyFig4.mp4';
import BinungeyFig5 from '../assets/Videos/BinungeyBoyFig5.mp4';
import BinungeyFig6 from '../assets/Videos/BinungeyBoyFig6.mp4';
import BinungeyFig7 from '../assets/Videos/BinungeyBoyFig7.mp4';

import PahidMainVideo from '../assets/Videos/Pahid.mp4';
import PahidFig1 from '../assets/Videos/PahidBoyFig1.mp4';
import PahidFig2 from '../assets/Videos/PahidBoyFig2.mp4';
import PahidFig3 from '../assets/Videos/PahidBoyFig3.mp4';
import PahidFig4 from '../assets/Videos/PahidBoyFig4.mp4';
import PahidFig5 from '../assets/Videos/PahidBoyFig5.mp4';
import PahidFig6 from '../assets/Videos/PahidBoyFig6.mp4';

import SuaKuSuaFig1 from '../assets/Videos/SuaKuSuaBoyFig1.mp4';
import SuaKuSuaFig2 from '../assets/Videos/SuaKuSuaBoyFig2.mp4';
import SuaKuSuaFig3 from '../assets/Videos/SuaKuSuaBoyFig3.mp4';
import SuaKuSuaFig4 from '../assets/Videos/SuaKuSuaBoyFig4.mp4';
import SuaKuSuaFig5 from '../assets/Videos/SuaKuSuaBoyFig5.mp4';
import SuaKuSuaFig6 from '../assets/Videos/SuaKuSuaBoyFig6.mp4';
import SuaKuSuaFig7 from '../assets/Videos/SuaKuSuaBoyFig7.mp4';
import SuaKuSuaFig8 from '../assets/Videos/SuaKuSuaBoyFig8.mp4';
import SuaKuSuaFig9 from '../assets/Videos/SuaKuSuaBoyFig9.mp4';
import SuaKuSuaFig10 from '../assets/Videos/SuaKuSuaBoyFig10.mp4';

import TiklosMainVideo from '../assets/Videos/Tiklos.mp4';
import TiklosFig1 from '../assets/Videos/TiklosBoyFig1.mp4';
import TiklosFig2 from '../assets/Videos/TiklosBoyFig2.mp4';
import TiklosFig3 from '../assets/Videos/TiklosBoyFig3.mp4';
import TiklosFig4 from '../assets/Videos/TiklosBoyFig4.mp4';

const regions = ['All', 'Luzon', 'Visayas', 'Mindanao'];

const getYouTubeEmbedUrl = (url) => {
  if (!url) return '';
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

const featuredDances = [
  {
    id: 'featured-1',
    title: 'Binungey',
    name: 'Binungey',
    island: 'Luzon',
    region: 'Pangasinan',
    province: 'Pangasinan',
    image_url: binungeyImage,
    description:
      'A folk dance from Pangasinan that dramatizes the preparation of binungey, a traditional rice cake steamed in bamboo.',
    history:
      'A folk dance from Pangasinan, Western Luzon, that dramatizes the preparation of binungey — a traditional rice cake steamed in bamboo. The dance honors local food traditions, showcasing the cultural identity and everyday labor of the Pangasinense people.',
    references:
      'Rhythmic folk music typical of Pangasinan with native percussion. Kimona with serpentina skirt and tapis for women, camisa de chino and plain trousers for men.',
    main_video_url: BinungeyMainVideo,
    difficulty: 'Intermediate',
    duration: '4-6 minutes',
    performers: '6-8 dancers',
    origin: 'Western Luzon (Province of Pangasinan)',
    significance:
      'This dance represents the local tradition of preparing binungey, a delicacy made from sticky rice and coconut milk cooked in bamboo tubes. It emphasizes themes of community cooperation, cultural heritage, and regional identity in Pangasinan.',
    music:
      'Rhythmic folk music typical of Pangasinan, often performed with native percussion instruments',
    costumes: 'Women: Kimona with serpentina skirt and tapis. Men: Camisa de chino and plain trousers.',
    referenceLink:
      'https://baguioheraldexpressonline.com/psinan-hosts-regl-sem-on-philippine-folkdance/',
    isFeatured: true,
    created_at: '2024-01-15T10:00:00Z',
    figureVideos: [
      { id: 'binungey-fig-1', figure_number: 1, video_url: BinungeyFig1 },
      { id: 'binungey-fig-2', figure_number: 2, video_url: BinungeyFig2 },
      { id: 'binungey-fig-3', figure_number: 3, video_url: BinungeyFig3 },
      { id: 'binungey-fig-4', figure_number: 4, video_url: BinungeyFig4 },
      { id: 'binungey-fig-5', figure_number: 5, video_url: BinungeyFig5 },
      { id: 'binungey-fig-6', figure_number: 6, video_url: BinungeyFig6 },
      { id: 'binungey-fig-7', figure_number: 7, video_url: BinungeyFig7 },
    ],
  },
  {
    id: 'featured-4',
    title: 'Pahid',
    name: 'Pahid',
    island: 'Visayas',
    region: 'Capiz and Aklan',
    province: 'Capiz and Aklan',
    image_url: pahidImage,
    description:
      'A folk dance from the Visayan region whose name means "to wipe/brush off" and depicts the act of wiping mud off bare feet as visitors enter a home.',
    history:
      'A folk dance from the Visayan region of the Philippines (notably in the provinces of Capiz and Aklan) whose name means "to wipe/brush off" (from pahid, meaning "wipe off") and is said to depict the act of wiping mud off bare feet as visitors enter a home.',
    references:
      'Typically in 3/4 time in two parts (A & B) for one version of the dance. Peasant kimona and patadyong (or similar peasant attire) with a scarf for girls; Camisa de chino with colored peasant pants, performed barefoot for boys.',
    main_video_url: PahidMainVideo,
    difficulty: 'Intermediate',
    duration: '4-6 minutes',
    performers: '4-8 dancers',
    origin: 'Visayas',
    significance:
      'This dance represents a gesture of courtesy and hospitality: as farmers or guests enter with muddy feet, they wipe them before entering the home. The wiping motion is dramatized in dance form.',
    music: 'Traditional Filipino folk music with indigenous instruments',
    costumes:
      'Peasant kimona and patadyong (or similar peasant attire) with a scarf for girls; Camisa de chino with colored peasant pants, performed barefoot for boys',
    referenceLink: 'https://www.scribd.com/document/49774671/PE-dances-1',
    isFeatured: true,
    created_at: '2024-02-20T14:30:00Z',
    figureVideos: [
      { id: 'pahid-fig-1', figure_number: 1, video_url: PahidFig1 },
      { id: 'pahid-fig-2', figure_number: 2, video_url: PahidFig2 },
      { id: 'pahid-fig-3', figure_number: 3, video_url: PahidFig3 },
      { id: 'pahid-fig-4', figure_number: 4, video_url: PahidFig4 },
      { id: 'pahid-fig-5', figure_number: 5, video_url: PahidFig5 },
      { id: 'pahid-fig-6', figure_number: 6, video_url: PahidFig6 },
    ],
  },
  {
    id: 'featured-2',
    title: 'Sua Ku Sua',
    name: 'Sua Ku Sua',
    island: 'Mindanao',
    region: 'Jolo, Sulu',
    province: 'Jolo, Sulu',
    image_url: suakusuaImage,
    description:
      'A courtship dance of the Tausug people of Jolo, Sulu. The title "Sua-Ku-Sua" translates roughly to "My Pomelo Tree".',
    history:
      'A courtship dance of the Tausug people of Jolo, Sulu in the southern Philippines. The title "Sua-Ku-Sua" translates roughly to "My Pomelo Tree" (from sua meaning "pomelo" and ku meaning "mine") and the dance was originally inspired by the pomelo tree — its slender branches and leaves likened to the virtue and beauty of a lady.',
    references:
      'Accompanied by song and fan-movements; instrumentation not always detailed but rooted in the Tausug coastal/lowland Muslim tradition. Dancers hold two white fans, which suggest the leaves of the pomelo tree swaying in the wind.',
    main_video_url: '',
    difficulty: 'Advanced',
    duration: '5-7 minutes',
    performers: '2-4 dancers',
    origin: 'Jolo, Sulu (Mindanao / Sulu Archipelago)',
    significance:
      'The dance celebrates the relationship of the Tausug community with the pomelo tree — an important fruit/livelihood in the region. The movements and props (notably white fans) mimic the swaying of its leaves, and the dance serves as a graceful expression of courtship and aesthetic values in Tausug culture.',
    music:
      'Accompanied by song and fan-movements; instrumentation not always detailed but rooted in the Tausug coastal/lowland Muslim tradition',
    costumes: 'Elaborate Muslim royal attire with intricate embroidery',
    referenceLink: 'https://www.scribd.com/document/683615342/Sua-Ku-Sua',
    isFeatured: true,
    created_at: '2024-03-10T09:15:00Z',
    figureVideos: [
      { id: 'suakusua-fig-1', figure_number: 1, video_url: SuaKuSuaFig1 },
      { id: 'suakusua-fig-2', figure_number: 2, video_url: SuaKuSuaFig2 },
      { id: 'suakusua-fig-3', figure_number: 3, video_url: SuaKuSuaFig3 },
      { id: 'suakusua-fig-4', figure_number: 4, video_url: SuaKuSuaFig4 },
      { id: 'suakusua-fig-5', figure_number: 5, video_url: SuaKuSuaFig5 },
      { id: 'suakusua-fig-6', figure_number: 6, video_url: SuaKuSuaFig6 },
      { id: 'suakusua-fig-7', figure_number: 7, video_url: SuaKuSuaFig7 },
      { id: 'suakusua-fig-8', figure_number: 8, video_url: SuaKuSuaFig8 },
      { id: 'suakusua-fig-9', figure_number: 9, video_url: SuaKuSuaFig9 },
      { id: 'suakusua-fig-10', figure_number: 10, video_url: SuaKuSuaFig10 },
    ],
  },
  {
    id: 'featured-3',
    title: 'Tiklos',
    name: 'Tiklos',
    island: 'Visayas',
    region: 'Leyte',
    province: 'Leyte',
    image_url: tiklosImage,
    description: 'A dance depicting the Bayanihan spirit of community cooperation.',
    history:
      'A dance depicting the Bayanihan spirit of community cooperation. Represents the Filipino spirit of bayanihan (community cooperation) where neighbors help each other during planting and harvesting seasons.',
    references:
      'Lively Visayan folk music with traditional instruments. Simple rural Filipino clothing reflecting farming attire.',
    main_video_url: TiklosMainVideo,
    difficulty: 'Beginner',
    duration: '3-5 minutes',
    performers: '8-12 dancers',
    origin: 'Visayas',
    significance:
      'Represents the Filipino spirit of bayanihan (community cooperation) where neighbors help each other during planting and harvesting seasons.',
    music: 'Lively Visayan folk music with traditional instruments',
    costumes: 'Simple rural Filipino clothing reflecting farming attire',
    referenceLink:
      'https://folkdanceworld.com/2019/12/13/tiklos-philippine-folk-dance.html',
    isFeatured: true,
    created_at: '2024-04-05T16:45:00Z',
    figureVideos: [
      { id: 'tiklos-fig-1', figure_number: 1, video_url: TiklosFig1 },
      { id: 'tiklos-fig-2', figure_number: 2, video_url: TiklosFig2 },
      { id: 'tiklos-fig-3', figure_number: 3, video_url: TiklosFig3 },
      { id: 'tiklos-fig-4', figure_number: 4, video_url: TiklosFig4 },
    ],
  },
];

const capitalize = (str) =>
  str && typeof str === 'string'
    ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    : '';

const Dances = () => {
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDance, setSelectedDance] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [dances, setDances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoModalUrl, setVideoModalUrl] = useState('');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOption, setSortOption] = useState('latest');
  const [userHasSelectedSort, setUserHasSelectedSort] = useState(false);

  const [figures, setFigures] = useState([]);
  const [mainVideoUrl, setMainVideoUrl] = useState('');
  const [images, setImages] = useState([]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 200);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // ---------- FETCH ----------
  useEffect(() => {
    const fetchDances = async () => {
      setLoading(true);

      // fetch dances WITH created_at (only approved dances)
      const { data: dancesData, error: dancesError } = await supabase
        .from('dances')
        .select(
          'id, title, island, references, history, main_video_url, duration, performers, music, costumes, created_at'
        )
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      const { data: imagesData, error: imagesError } = await supabase
        .from('dance_images')
        .select('dance_id, image_url, position')
        .order('position', { ascending: true });

      if (dancesError) {
        console.error('Error fetching dances:', dancesError);
      }
      if (imagesError) {
        console.error('Error fetching images:', imagesError);
      }

      if (!dancesError && !imagesError) {
        const imageMap = {};
        (imagesData || []).forEach((img) => {
          if (!imageMap[img.dance_id]) imageMap[img.dance_id] = img.image_url;
        });

        const databaseDances = (dancesData || []).map((d) => ({
          ...d,
          image_url: imageMap[d.id] || null,
          isFeatured: false,
          duration: d.duration || '',
          performers: d.performers || '',
          music: d.music || '',
          costumes: d.costumes || '',
          island: capitalize(d.island || ''),
          origin: capitalize(d.island || ''),
        }));

        const combinedDances = [...featuredDances, ...databaseDances];
        setDances(combinedDances);
      } else {
        setDances(featuredDances);
      }

      setLoading(false);
    };

    fetchDances();
  }, []);

  // ---------- FETCH MEDIA FOR SELECTED ----------
  useEffect(() => {
    const fetchFiguresAndMedia = async () => {
      if (!selectedDance) {
        setFigures([]);
        setMainVideoUrl('');
        setImages([]);
        return;
      }
      if (selectedDance.isFeatured) {
        setFigures(selectedDance.figureVideos || []);
        setMainVideoUrl(selectedDance.main_video_url || '');
        setImages([]);
        return;
      }

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

      const mainVideo =
        imagesData?.find((img) => img.position === 0 && img.video_url) ||
        imagesData?.find((img) => img.position === 1 && img.video_url);
      setMainVideoUrl(mainVideo?.video_url || selectedDance.main_video_url || '');
    };

    fetchFiguresAndMedia();
  }, [selectedDance]);

  // ---------- FILTER ----------
  const filteredDances = dances.filter((dance) => {
    const matchesRegion =
      selectedRegion === 'All' ||
      (dance.island && dance.island.toLowerCase() === selectedRegion.toLowerCase());
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (dance.title || '').toLowerCase().includes(q) ||
      (dance.province || '').toLowerCase().includes(q);
    return matchesRegion && matchesSearch;
  });

  // ---------- SORT ----------
  const dateVal = (d) => {
    if (!d?.created_at) return 0;
    const timestamp = new Date(d.created_at).getTime();
    return isNaN(timestamp) ? 0 : timestamp;
  };

  // Sorting logic - COMPLETELY REWRITTEN
  let sortedDances = [...filteredDances];
  
  if (!userHasSelectedSort) {
    // Default: Featured first, then by date (newest first)
    sortedDances.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return dateVal(b) - dateVal(a);
    });
  } else {
    // User selected a sort option
    if (sortOption === 'a-z') {
      sortedDances.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortOption === 'z-a') {
      sortedDances.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    } else if (sortOption === 'latest') {
      // Sort ALL dances by date - newest first (mix featured and database)
      sortedDances.sort((a, b) => dateVal(b) - dateVal(a));
    } else if (sortOption === 'oldest') {
      // Sort ALL dances by date - oldest first (mix featured and database)
      sortedDances.sort((a, b) => dateVal(a) - dateVal(b));
    }
  }

  // ---------- UI HANDLERS ----------
  const handleSortChange = (option) => {
    setSortOption(option);
    setUserHasSelectedSort(true);
    setShowSortDropdown(false);
  };

  const handleRegionChange = (region) => {
    setSelectedRegion(region);
    // Reset to default sorting (featured on top) when "All" is clicked
    if (region === 'All') {
      setUserHasSelectedSort(false);
      setSortOption('latest');
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close only when clicking outside the wrapper we control
      if (showSortDropdown && !e.target.closest('.dances-sort-button-container')) {
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

  const openVideoModal = (dance, e) => {
    e.stopPropagation();
    const videoUrl = dance.main_video_url || '';
    if (videoUrl) {
      setVideoModalUrl(videoUrl);
      setShowVideoModal(true);
    }
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setVideoModalUrl('');
  };

  const closePreview = () => {
    setShowPreview(false);
    setSelectedDance(null);
    setFigures([]);
    setMainVideoUrl('');
    setImages([]);
  };

  useEffect(() => {
    if (showPreview) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) modalContent.scrollTop = 0;
      }, 50);
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
      if (modalContent && !modalContent.contains(e.target)) e.preventDefault();
    };
    document.addEventListener('wheel', preventScroll, { passive: false });
    document.addEventListener('touchmove', preventScroll, { passive: false });
    return () => {
      document.removeEventListener('wheel', preventScroll, { passive: false });
      document.removeEventListener('touchmove', preventScroll, { passive: false });
    };
  }, [showPreview]);

  const displayOrNA = (value) => (value && String(value).trim() ? value : 'N/A');

  // ---- NEW: Resolve a reference URL from any possible field name ----
  const getReferenceUrl = (dance) =>
    dance?.referenceLink || dance?.reference_url || dance?.reference_link || '';

  return (
    <div className="dances-page">
      <Navbar />

      <section className="dances-header">
        <div className="container">
          <h1 className="page-title">Filipino Folk Dances</h1>
          <p className="page-subtitle">
            Explore the rich cultural heritage of the Philippines through traditional folk dances
          </p>
        </div>
      </section>

      <section className="dances-search-filter">
        <div className="container">
          <div className="dances-search-controls">
            <div className="dances-search-bar">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search dances or provinces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="dances-mobile-controls-row">
              {/* WRAPPED for click-outside correctness */}
              <div className="dances-sort-button-container" style={{ position: 'relative' }}>
                <div
                  className="dances-filter-circle-button"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                >
                  <Filter size={20} />
                </div>

                {showSortDropdown && (
                  <div
                    className="sort-dropdown"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      left: '0',
                      background: 'rgba(210, 180, 140, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(160, 133, 91, 0.3)',
                      borderRadius: '16px',
                      boxShadow:
                        '0 8px 32px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15)',
                      minWidth: '220px',
                      padding: '12px',
                      zIndex: 1000,
                      animation: 'fadeIn 0.15s ease-out',
                    }}
                  >
                    {['a-z', 'z-a', 'latest', 'oldest'].map((option) => (
                      <button
                        key={option}
                        onClick={() => handleSortChange(option)}
                        style={{
                          width: '100%',
                          padding: '14px 18px',
                          marginBottom: option === 'oldest' ? '0' : '8px',
                          background:
                            sortOption === option
                              ? 'rgba(160, 133, 91, 0.9)'
                              : 'rgba(160, 133, 91, 0.6)',
                          border: 'none',
                          borderRadius: '12px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '16px',
                          fontWeight: '500',
                          color: '#ffffff',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          boxShadow:
                            sortOption === option
                              ? '0 2px 8px rgba(0, 0, 0, 0.2)'
                              : 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(160, 133, 91, 0.85)';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            sortOption === option
                              ? 'rgba(160, 133, 91, 0.9)'
                              : 'rgba(160, 133, 91, 0.6)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        {option === 'a-z'
                          ? 'A-Z'
                          : option === 'z-a'
                          ? 'Z-A'
                          : option === 'latest'
                          ? 'Latest Upload'
                          : 'Oldest Upload'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="dances-region-buttons-wrapper">
                {regions.map((region) => (
                  <button
                    key={region}
                    className={`dances-region-btn ${
                      selectedRegion === region ? 'dances-region-active' : ''
                    }`}
                    onClick={() => handleRegionChange(region)}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="news-ticker-bar">
        <div className="news-ticker-content">
          <span role="img" aria-label="megaphone" style={{ marginRight: 8 }}>
            📢
          </span>
          <span>
            🎉 Welcome to <strong>FLIPino</strong> - Your gateway to Filipino cultural heritage!
            <span style={{ marginLeft: 4 }}>
              Explore traditional Filipino folk dances like never before — watch detailed tutorials,
              learn the history, and discover the rich stories behind each dance. Start your
              cultural journey today! 💃🕺
            </span>
          </span>
        </div>
      </div>

      <section className="dances-grid-section">
        <div className="container">
          <div className="results-info">
            <p>{sortedDances.length} dances found</p>
          </div>

          <div className="dances-grid">
            {loading ? (
              <div style={{ textAlign: 'center', width: '100%' }}>Loading dances...</div>
            ) : sortedDances.length === 0 ? (
              <div style={{ textAlign: 'center', width: '100%' }}>No dances found.</div>
            ) : (
              sortedDances.map((dance) => (
                <div key={dance.id} className="dance-card">
                  {dance.isFeatured && <div className="featured-badge">Featured</div>}

                  <div className="dance-image">
                    {dance.image_url ? (
                      <img src={dance.image_url} alt={dance.title} />
                    ) : (
                      <div
                        className="letter-circle"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#f5f5f5',
                          border: '2px dashed #ddd',
                          color: '#666',
                          fontSize: '14px',
                          fontWeight: '500',
                        }}
                      >
                        {dance.title === 'Sua Ku Sua'
                          ? 'No Image Available'
                          : dance.title
                          ? dance.title.charAt(0).toUpperCase()
                          : '?'}
                      </div>
                    )}
                    <div className="dance-overlay">
                      <button className="play-button" onClick={(e) => openVideoModal(dance, e)}>
                        <Play size={24} />
                      </button>
                    </div>
                  </div>

                  <div className="dance-content" onClick={() => openPreview(dance)}>
                    <div className="dance-header">
                      <h3 className="dance-name">{dance.title}</h3>
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
                      <button className="learn-button">View Details</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {showScrollTop && !showPreview && !showVideoModal && (
        <button
          className="scroll-to-top-btn"
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: '#a0855b',
            border: '1.5px solid #a0855b', // ← fixed
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
          <ArrowUp
            size={window.innerWidth < 480 ? 16 : window.innerWidth < 900 ? 20 : 24}
            color="#ffffff"
          />
        </button>
      )}

      {showVideoModal && videoModalUrl && (
        <div
          className="preview-modal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <button
            onClick={closeVideoModal}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              fontSize: '32px',
              width: 48,
              height: 48,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10001,
              transition: 'background 0.2s',
              padding: 0,
              paddingBottom: 7,
            }}
            onMouseEnter={(e) => (e.target.style.background = 'rgba(255,255,255,0.3)')}
            onMouseLeave={(e) => (e.target.style.background = 'rgba(255,255,255,0.2)')}
          >
            ×
          </button>
          <div
            style={{
              width: '100%',
              maxWidth: '1200px',
              aspectRatio: '16/9',
              position: 'relative',
            }}
          >
            <video
              src={videoModalUrl}
              controls
              autoPlay
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 8,
                objectFit: 'contain',
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {showPreview && selectedDance && (
        <div className="preview-modal">
          <div className="modal-backdrop" onClick={closePreview}></div>
          <div
            className="modal-content"
            style={{
              padding: 0,
              overflow: 'auto',
              maxHeight: '90vh',
              scrollBehavior: 'auto',
            }}
          >
            <div className="modal-header">
              {selectedDance.image_url ? (
                <img
                  src={selectedDance.image_url}
                  alt={selectedDance.title}
                  className="modal-image"
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed #ddd',
                    color: '#666',
                    fontSize: '18px',
                    fontWeight: '500',
                  }}
                >
                  No Preview Available
                </div>
              )}
              <div className="modal-header-content">
                <h2 className="modal-title" style={{ margin: 0 }}>
                  {selectedDance.title}
                </h2>
                <p className="modal-subtitle" style={{ margin: 0 }}>
                  Traditional Filipino Folk Dance
                </p>
                <div className="modal-meta-badges">
                  <span className="region-badge">{capitalize(selectedDance.island)}</span>
                  {selectedDance.isFeatured && <span className="featured-badge-modal">Featured</span>}
                </div>
              </div>
            </div>

            <div className="modal-body" style={{ padding: 24 }}>
              <div className="modal-section">
                <h3>History</h3>
                <p style={{ whiteSpace: 'pre-line' }}>{selectedDance.history}</p>
              </div>

              {selectedDance.isFeatured ? (
                <>
                  <div className="modal-section">
                    <h3>Performance Details</h3>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                        margin: '1rem 0',
                      }}
                    >
                      <div>
                        <strong>Duration:</strong> {displayOrNA(selectedDance.duration)}
                      </div>
                      <div>
                        <strong>Performers:</strong> {displayOrNA(selectedDance.performers)}
                      </div>
                      <div>
                        <strong>Origin:</strong> {displayOrNA(selectedDance.origin)}
                      </div>
                    </div>
                  </div>

                  <div className="modal-section">
                    <h3>Cultural Significance</h3>
                    <p>{selectedDance.significance}</p>
                  </div>

                  <div className="modal-section">
                    <h3>Music & Costumes</h3>
                    <p style={{ whiteSpace: 'pre-line' }}>
                      <strong>Music:</strong> {displayOrNA(selectedDance.music)}
                    </p>
                    <p style={{ whiteSpace: 'pre-line' }}>
                      <strong>Costumes:</strong> {displayOrNA(selectedDance.costumes)}
                    </p>
                  </div>

                  {/* NEW: Reference link for featured dances */}
                  {getReferenceUrl(selectedDance) && (
                    <div className="modal-section">
                      <h3>Reference</h3>
                      <p>
                        <a
                          href={getReferenceUrl(selectedDance)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#a0855b',
                            textDecoration: 'none',
                            fontWeight: '500',
                            borderBottom: '1px solid #a0855b',
                            transition: 'all 0.3s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.color = '#8b7355';
                            e.target.style.borderBottomColor = '#8b7355';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = '#a0855b';
                            e.target.style.borderBottomColor = '#a0855b';
                          }}
                        >
                          Learn more about {selectedDance.title} →
                        </a>
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="modal-section">
                    <h3>Performance Details</h3>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                        margin: '1rem 0',
                      }}
                    >
                      <div>
                        <strong>Duration:</strong> {displayOrNA(selectedDance.duration)}
                      </div>
                      <div>
                        <strong>Performers:</strong> {displayOrNA(selectedDance.performers)}
                      </div>
                      <div>
                        <strong>Origin:</strong> {displayOrNA(selectedDance.origin)}
                      </div>
                    </div>
                  </div>
                  <div className="modal-section">
                    <h3>Music & Costumes</h3>
                    <p style={{ whiteSpace: 'pre-line' }}>
                      <strong>Music:</strong> {displayOrNA(selectedDance.music)}
                    </p>
                    <p style={{ whiteSpace: 'pre-line' }}>
                      <strong>Costumes:</strong> {displayOrNA(selectedDance.costumes)}
                    </p>
                  </div>
                  <div className="modal-section">
                    <h3>References</h3>
                    <p
                      style={{
                        whiteSpace: 'pre-line',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                      }}
                    >
                      {displayOrNA(selectedDance.references)}
                    </p>
                  </div>

                  {/* NEW: Reference link for non-featured dances */}
                  {getReferenceUrl(selectedDance) && (
                    <div className="modal-section" style={{ marginTop: '-8px' }}>
                      <h3 style={{ marginTop: 0 }}>Reference</h3>
                      <p>
                        <a
                          href={getReferenceUrl(selectedDance)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#a0855b',
                            textDecoration: 'none',
                            fontWeight: '500',
                            borderBottom: '1px solid #a0855b',
                            transition: 'all 0.3s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.color = '#8b7355';
                            e.target.style.borderBottomColor = '#8b7355';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = '#a0855b';
                            e.target.style.borderBottomColor = '#a0855b';
                          }}
                        >
                          Learn more about {selectedDance.title} →
                        </a>
                      </p>
                    </div>
                  )}
                </>
              )}

              {mainVideoUrl && (
                <div className="modal-section" style={{ textAlign: 'center', margin: '32px 0' }}>
                  <h3 style={{ marginBottom: 12 }}>Cultural Dance</h3>
                  <video
                    src={mainVideoUrl}
                    controls
                    style={{
                      width: '520px',
                      height: '320px',
                      borderRadius: 12,
                      background: '#000',
                      objectFit: 'contain',
                      boxShadow: '0 4px 24px #0002',
                      margin: '0 auto',
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              <div className="modal-section">
                <h3>Figures</h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: figures.length === 1 ? '1fr' : '1fr 1fr',
                    gap: '24px',
                    margin: '1rem 0',
                    justifyItems: figures.length === 1 ? 'center' : 'stretch',
                  }}
                >
                  {figures.length === 0 && (
                    <span style={{ gridColumn: '1 / -1' }}>No figures uploaded.</span>
                  )}
                  {figures.map((fig, idx) => (
                    <div key={fig.id} className="figure-box">
                      <div style={{ fontWeight: 600, marginBottom: 6 }}>
                        Figure {fig.figure_number ?? idx + 1}
                      </div>
                      <video
                        src={fig.video_url}
                        controls
                        style={{
                          width: '350px',
                          height: '250px',
                          borderRadius: 6,
                          background: '#000',
                          objectFit: 'contain',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  borderTop: '1px solid #e5e7eb',
                }}
              >
                <button
                  onClick={closePreview}
                  style={{
                    background: '#a0855b',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    minWidth: '120px',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#8b7355';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#a0855b';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Dances;
