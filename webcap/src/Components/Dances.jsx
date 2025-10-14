import React, { useState, useEffect } from 'react';
import { Search, Filter, Play, MapPin, ArrowUp } from 'lucide-react';
import Navbar from '../Components/Navbar';
import './Dances.css';
import { supabase } from '../supabasebaseClient';
import tiklosImage from '../assets/tiklos.png';
import binungeyImage from '../assets/binungeybg.png';
import pahidImage from '../assets/Pahid.png';

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
    island: 'Luzon',
    province: 'Abra',
    image_url: binungeyImage,
    history:
      'A traditional dance from Abra celebrating harvest and community unity. This dance represents the joy and gratitude of farmers during harvest season. Performers wear traditional Ilocano costumes and use farming tools as props.',
    references:
      'Traditional Ilocano folk music with gongs and drums. Colorful traditional Ilocano attire with wide-brimmed hats.',
    main_video_url: BinungeyMainVideo,
    difficulty: 'Intermediate',
    duration: '4-6 minutes',
    performers: '6-8 dancers',
    origin: 'Northern Luzon',
    significance:
      'This dance represents the joy and gratitude of farmers during harvest season. Performers wear traditional Ilocano costumes and use farming tools as props.',
    music: 'Traditional Ilocano folk music with gongs and drums',
    costumes: 'Colorful traditional Ilocano attire with wide-brimmed hats',
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
    island: 'Luzon',
    province: 'Northern Luzon',
    image_url: pahidImage,
    history:
      'A traditional Filipino folk dance that showcases graceful movements and cultural heritage. This dance demonstrates the refined artistry and storytelling tradition of Filipino culture through expressive choreography.',
    references:
      'Traditional Filipino folk music with indigenous instruments. Traditional Filipino attire with cultural significance.',
    main_video_url: PahidMainVideo,
    difficulty: 'Intermediate',
    duration: '4-6 minutes',
    performers: '4-8 dancers',
    origin: 'Northern Luzon',
    significance:
      'This dance represents the artistic expression and cultural storytelling traditions of the Filipino people, showcasing graceful movements and cultural heritage.',
    music: 'Traditional Filipino folk music with indigenous instruments',
    costumes: 'Traditional Filipino attire with cultural significance',
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
    image: null,
    image_url: null,
    description: 'A courtship dance from the Tausug people of Sulu.',
    history:
      'A courtship dance from the Tausug people of Sulu. A graceful courtship dance that tells the story of a prince wooing a princess. The dance showcases the refined culture of the Tausug people.',
    references:
      'Traditional Tausug kulintang ensemble. Elaborate Muslim royal attire with intricate embroidery.',
    main_video_url: '',
    difficulty: 'Advanced',
    duration: '5-7 minutes',
    performers: '2-4 dancers',
    origin: 'Mindanao',
    significance:
      'A graceful courtship dance that tells the story of a prince wooing a princess. The dance showcases the refined culture of the Tausug people.',
    music: 'Traditional Tausug kulintang ensemble',
    costumes: 'Elaborate Muslim royal attire with intricate embroidery',
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
    island: 'Visayas',
    province: 'Leyte',
    image_url: tiklosImage,
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

      // fetch dances WITH created_at
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
    if (!d?.created_at) return new Date('2020-01-01').getTime(); // Default old date for items without timestamp
    return new Date(d.created_at).getTime();
  };

  const compareByOption = (a, b) => {
    switch (sortOption) {
      case 'a-z':
        return (a.title || '').localeCompare(b.title || '');
      case 'z-a':
        return (b.title || '').localeCompare(a.title || '');
      case 'latest':
        return dateVal(b) - dateVal(a); // newest first
      case 'oldest':
        return dateVal(a) - dateVal(b); // oldest first
      default:
        return 0;
    }
  };

  // If user hasn't explicitly selected a sort option, keep featured on top for all regions
  const sortedDances = [...filteredDances].sort((a, b) => {
    if (!userHasSelectedSort) {
      // Featured dances stay on top
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      // Within each group, sort by date (latest first)
      return dateVal(b) - dateVal(a);
    }
    // When user has explicitly selected a sort option, apply it to all dances
    return compareByOption(a, b);
  });

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

  const displayOrNA = (value) => (value && value.trim() ? value : 'N/A');

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
              <div className="sort-dropdown-container" style={{ position: 'relative' }}>
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
                      top: 'calc(100% + 12px)',
                      left: 0,
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
          border: '1.5px solid #a0855b',  // ← fixed
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
                <p>{selectedDance.history}</p>
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
                    <p>
                      <strong>Music:</strong> {displayOrNA(selectedDance.music)}
                    </p>
                    <p>
                      <strong>Costumes:</strong> {displayOrNA(selectedDance.costumes)}
                    </p>
                  </div>
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
                    <p>
                      <strong>Music:</strong> {displayOrNA(selectedDance.music)}
                    </p>
                    <p>
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
    </div>
  );
};

export default Dances;
