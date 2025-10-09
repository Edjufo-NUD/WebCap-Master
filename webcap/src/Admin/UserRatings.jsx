import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../Admin/Sidebar";
import "./UserRatings.css";
import { supabase } from "../supabasebaseClient";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, BarChart3, Users, Star, Activity } from 'lucide-react';

const UserRatings = () => {
  const [activeItem, setActiveItem] = useState("user-ratings");
  const [feedbackList, setFeedbackList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  
  // Advanced filtering and pagination states
  const [selectedDance, setSelectedDance] = useState("All");
  const [selectedFigure, setSelectedFigure] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  // Always show charts - removed toggle functionality
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const itemsPerPage = 15;
  
  // Page jump modal states
  const [showPageModal, setShowPageModal] = useState(false);
  const [jumpToPage, setJumpToPage] = useState("");
  
  // Screen size for responsive styling
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dance categories for filtering
  const danceCategories = ["All", "Binungey", "Pahid", "Sua Ku Sua", "Tiklos", "Tiklos: Step-by-Step"];

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchFeedback = async () => {
      const { data, error } = await supabase
        .from('user_feedback')
        .select('submitted_at, figure_name, rating, user_id, text_feedback, users:users(username)')
        .order('submitted_at', { ascending: false });
      if (!error) setFeedbackList(data || []);
    };
    fetchFeedback();
  }, []);

  // Helper function to extract dance name from figure name
  const extractDanceName = (figureName) => {
    if (figureName.includes("TiklosTut")) return "Tiklos: Step-by-Step";
    if (figureName.includes("Tiklos")) return "Tiklos";
    if (figureName.includes("Binungey")) return "Binungey";
    if (figureName.includes("Pahid")) return "Pahid";
    if (figureName.includes("SuaKuSua")) return "Sua Ku Sua";
    return "Other";
  };

  // Helper function to highlight search terms
  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="search-highlight">{part}</mark>
      ) : part
    );
  };

  // Helper function to calculate average rating
  const calculateAverageRating = (feedback) => {
    return feedback.rating || 0;
  };

  // Enhanced filtering and sorting logic
  const filteredData = useMemo(() => {
    let filtered = feedbackList.filter(fb => {
      const danceName = extractDanceName(fb.figure_name);
      const fbDate = new Date(fb.submitted_at);
      const rating = calculateAverageRating(fb);
      
      // Basic filters
      const matchesDance = selectedDance === "All" || danceName === selectedDance;
      const matchesFigure = selectedFigure === "All" || fb.figure_name.includes(selectedFigure);
      
      // Enhanced search with highlighting support
      const searchQuery = debouncedSearchTerm.toLowerCase();
      const matchesSearch = searchQuery === "" || 
        fb.figure_name.toLowerCase().includes(searchQuery) ||
        (fb.users?.username || fb.user_id).toLowerCase().includes(searchQuery) ||
        danceName.toLowerCase().includes(searchQuery);
      
      return matchesDance && matchesFigure && matchesSearch;
    });

    // Enhanced sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "date":
          aValue = new Date(a.submitted_at);
          bValue = new Date(b.submitted_at);
          break;
        case "rating":
          aValue = calculateAverageRating(a);
          bValue = calculateAverageRating(b);
          break;
        case "user":
          aValue = (a.users?.username || a.user_id).toLowerCase();
          bValue = (b.users?.username || b.user_id).toLowerCase();
          break;
        case "dance":
          aValue = extractDanceName(a.figure_name);
          bValue = extractDanceName(b.figure_name);
          break;
        case "figure":
          aValue = a.figure_name.toLowerCase();
          bValue = b.figure_name.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [feedbackList, selectedDance, selectedFigure, debouncedSearchTerm, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get figures for selected dance
  const availableFigures = useMemo(() => {
    if (selectedDance === "All") return ["All"];
    const figures = feedbackList
      .filter(fb => extractDanceName(fb.figure_name) === selectedDance)
      .map(fb => fb.figure_name)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    return ["All", ...figures];
  }, [feedbackList, selectedDance]);

  // Reset dependent filters when dance changes
  useEffect(() => {
    if (selectedDance !== "All" && !availableFigures.includes(selectedFigure)) {
      setSelectedFigure("All");
    }
  }, [selectedDance, availableFigures, selectedFigure]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDance, selectedFigure, debouncedSearchTerm, sortBy, sortOrder]);

  // Chart data for trends
  const chartData = useMemo(() => {
    const groupedByDate = {};
    filteredData.forEach(fb => {
      const date = new Date(fb.submitted_at).toLocaleDateString();
      if (!groupedByDate[date]) {
        groupedByDate[date] = { date, ratings: [], count: 0 };
      }
      groupedByDate[date].ratings.push(fb.rating);
      groupedByDate[date].count++;
    });

    return Object.values(groupedByDate)
      .map(day => ({
        ...day,
        avgRating: day.ratings.reduce((sum, rating) => sum + rating, 0) / day.ratings.length
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30); // Last 30 days
  }, [filteredData]);

  const openModal = (fb) => {
    setSelectedFeedback(fb);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedFeedback(null);
  };

  // Page jump handlers
  const openPageModal = () => {
    setJumpToPage(currentPage.toString());
    setShowPageModal(true);
  };

  const closePageModal = () => {
    setShowPageModal(false);
    setJumpToPage("");
  };

  const handlePageJump = () => {
    const pageNum = parseInt(jumpToPage);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      closePageModal();
    }
  };

  // Mapping for JSON file names to display names
  const figureNameMap = {
    "BinungeyBoyFig1.json": "Binungey - Boy: Figure 1",
    "BinungeyBoyFig2.json": "Binungey - Boy: Figure 2",
    "BinungeyBoyFig3.json": "Binungey - Boy: Figure 3",
    "BinungeyBoyFig4.json": "Binungey - Boy: Figure 4",
    "BinungeyBoyFig5.json": "Binungey - Boy: Figure 5",
    "BinungeyBoyFig6.json": "Binungey - Boy: Figure 6",
    "BinungeyBoyFig7.json": "Binungey - Boy: Figure 7",
    "PahidBoyFig1.json": "Pahid - Boy: Figure 1",
    "PahidBoyFig2.json": "Pahid - Boy: Figure 2",
    "PahidBoyFig3.json": "Pahid - Boy: Figure 3",
    "PahidBoyFig4.json": "Pahid - Boy: Figure 4",
    "PahidBoyFig5.json": "Pahid - Boy: Figure 5",
    "PahidBoyFig6.json": "Pahid - Boy: Figure 6",
    "SuaKuSuaBoyFig1.json": "Sua Ku Sua - Boy: Figure 1",
    "SuaKuSuaBoyFig2.json": "Sua Ku Sua - Boy: Figure 2",
    "SuaKuSuaBoyFig3.json": "Sua Ku Sua - Boy: Figure 3",
    "SuaKuSuaBoyFig4.json": "Sua Ku Sua - Boy: Figure 4",
    "SuaKuSuaBoyFig5.json": "Sua Ku Sua - Boy: Figure 5",
    "SuaKuSuaBoyFig6.json": "Sua Ku Sua - Boy: Figure 6",
    "SuaKuSuaBoyFig7.json": "Sua Ku Sua - Boy: Figure 7",
    "SuaKuSuaBoyFig8.json": "Sua Ku Sua - Boy: Figure 8",
    "SuaKuSuaBoyFig9.json": "Sua Ku Sua - Boy: Figure 9",
    "SuaKuSuaBoyFig10.json": "Sua Ku Sua - Boy: Figure 10",
    "TiklosBoyFig1.json": "Tiklos - Boy: Figure 1",
    "TiklosBoyFig2.json": "Tiklos - Boy: Figure 2",
    "TiklosBoyFig3.json": "Tiklos - Boy: Figure 3",
    "TiklosBoyFig4.json": "Tiklos - Boy: Figure 4",
    "TiklosTutFig1.json": "Tiklos - Figure: 1 (Step 1)",
    "TiklosTutFig2.json": "Tiklos - Figure: 1 (Step 2)",
    "TiklosTutFig3.json": "Tiklos - Figure: 1 (Step 3)",
    "TiklosTutFig4.json": "Tiklos - Figure: 1 (Step 4)",
    "TiklosTutFig5.json": "Tiklos - Figure: 1 (Step 5)",
    "TiklosTutFig6.json": "Tiklos - Figure: 2 (Step 1)",
    "TiklosTutFig7.json": "Tiklos - Figure: 2 (Step 2)",
    "TiklosTutFig8.json": "Tiklos - Figure: 2 (Step 3)",
    "TiklosTutFig9.json": "Tiklos - Figure: 3 (Step 1)",
    "TiklosTutFig10.json": "Tiklos - Figure: 3 (Step 2)",
    "TiklosTutFig11.json": "Tiklos - Figure: 3 (Step 3)",
    "TiklosTutFig12.json": "Tiklos - Figure: 3 (Step 4)",
    "TiklosTutFig13.json": "Tiklos - Figure: 4 (Step 1)",
    "TiklosTutFig14.json": "Tiklos - Figure: 4 (Step 2)",
    "TiklosTutFig15.json": "Tiklos - Figure: 4 (Step 3)",
    "TiklosTutFig16.json": "Tiklos - Figure: 4 (Step 4)"
  };

  // Helper to get display name
  function getDisplayFigureName(name) {
    return figureNameMap[name] || name;
  }

  return (
    <div className="user-ratings-container">
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      <div className="user-ratings-content">
        <div className="ratings-header">
          <h1 className="user-ratings-title">User Ratings Dashboard</h1>
          <p className="user-ratings-subtitle">Monitor and analyze dance performance feedback</p>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">
                {filteredData.length}
                {feedbackList.length !== filteredData.length && (
                  <span className="stat-total">/{feedbackList.length}</span>
                )}
              </div>
              <div className="stat-label">
                {feedbackList.length !== filteredData.length ? 'Filtered Ratings' : 'Total Ratings'}
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Star size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">
                {filteredData.length > 0 ? 
                  (filteredData.reduce((sum, r) => sum + r.rating, 0) / filteredData.length).toFixed(1) 
                  : "0.0"}
              </div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Activity size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{danceCategories.length - 1}</div>
              <div className="stat-label">Dance Types</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <BarChart3 size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{totalPages}</div>
              <div className="stat-label">Total Pages</div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="controls-section">
          <div className="filter-row">
            <div className="dance-filters">
              <div className="filter-label">
                Dance Filter:
              </div>
              <div className="filter-buttons">
                {danceCategories.map(dance => (
                  <button
                    key={dance}
                    className={`filter-btn ${selectedDance === dance ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedDance(dance);
                      // Smart filter reset when "All" is selected
                      if (dance === "All") {
                        setSelectedFigure("All");
                        setSearchTerm("");
                        setSortBy("date");
                        setSortOrder("desc");
                      }
                    }}
                  >
                    {dance}
                  </button>
                ))}
              </div>
              
              {/* Active Filters - Inline Display */}
              <div className="active-filters-inline">
                <span className="active-filters-label">Active Filters:</span>
                <div className="active-filters-list">
                  {selectedDance !== "All" || selectedFigure !== "All" || debouncedSearchTerm ? (
                    <>
                      {selectedDance !== "All" && (
                        <span className="active-filter">Dance: {selectedDance}</span>
                      )}
                      {selectedFigure !== "All" && (
                        <span className="active-filter">Figure: {getDisplayFigureName(selectedFigure)}</span>
                      )}
                      {debouncedSearchTerm && (
                        <span className="active-filter">Search: "{debouncedSearchTerm}"</span>
                      )}
                    </>
                  ) : (
                    <span className="active-filter">All</span>
                  )}
                </div>
              </div>
            </div>

            <div 
              className="secondary-filters"
              style={{
                display: 'flex',
                flexDirection: windowWidth > 1366 ? 'row' : 'column',
                alignItems: windowWidth > 1366 ? 'center' : 'stretch',
                gap: windowWidth > 1366 ? '20px' : '1rem'
              }}
            >
              {selectedDance !== "All" && availableFigures.length > 1 && (
                <>
                  <label>Figure:</label>
                  <select 
                    value={selectedFigure} 
                    onChange={(e) => setSelectedFigure(e.target.value)}
                    className="figure-select"
                  >
                    {availableFigures.map(figure => (
                      <option key={figure} value={figure}>
                        {figure === "All" ? "All Figures" : getDisplayFigureName(figure)}
                      </option>
                    ))}
                  </select>
                </>
              )}

              <div 
                className="search-container"
                style={{
                  flex: windowWidth > 1366 ? '8' : 'none',
                  width: windowWidth <= 1366 ? '100%' : 'auto'
                }}
              >
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search by figure, user, or dance name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="search-clear-btn"
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              <div 
                className="sort-controls"
                style={{
                  flex: windowWidth > 1366 ? '0.3' : 'none',
                  width: windowWidth <= 1366 ? '100%' : 'auto',
                  maxWidth: windowWidth > 1366 ? '200px' : 'none'
                }}
              >
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="date">Sort by Date</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="user">Sort by User</option>
                  <option value="dance">Sort by Dance</option>
                  <option value="figure">Sort by Figure</option>
                </select>
                
                <button 
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="sort-order-btn"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Charts Section - Always Visible */}
        {chartData.length > 0 && (
          <div className="charts-section">
            <div className="chart-container">
              <h3 className="chart-title">Rating Trends (Last 30 Days)</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666"
                      fontSize={12}
                    />
                    <YAxis 
                      domain={[1, 5]} 
                      stroke="#666"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value) => [`${value.toFixed(1)}⭐`, 'Avg Rating']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgRating" 
                      stroke="#a0855b" 
                      strokeWidth={3}
                      dot={{ fill: '#a0855b', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-container">
              <h3 className="chart-title">Daily Rating Count</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666"
                      fontSize={12}
                    />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value) => [value, 'Rating Count']}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#a0855b"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Ratings Table */}
        <div className="ratings-table-section">
          <div className="table-header">
            <h3>Ratings Data</h3>
            <div className="table-info">
              Showing {paginatedData.length} of {filteredData.length} ratings
            </div>
          </div>

          <div className="ratings-table-container">
            <div className="table-wrapper">
              <table className="ratings-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Username</th>
                    <th>Dance</th>
                    <th>Figure</th>
                    <th>Rating</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                {paginatedData.length > 0 ? paginatedData.map(fb => (
                  <tr key={fb.submitted_at + fb.user_id} onClick={() => openModal(fb)} className="table-row">
                    <td className="timestamp-cell">
                      {fb.submitted_at ? new Date(fb.submitted_at).toLocaleString() : ""}
                    </td>
                    <td className="user-id-cell">
                      {highlightSearchTerm(fb.users?.username || fb.user_id, debouncedSearchTerm)}
                    </td>
                    <td className="dance-cell">
                      <span className="dance-badge">
                        {highlightSearchTerm(extractDanceName(fb.figure_name), debouncedSearchTerm)}
                      </span>
                    </td>
                    <td className="figure-cell">
                      {highlightSearchTerm(getDisplayFigureName(fb.figure_name), debouncedSearchTerm)}
                    </td>
                    <td className="rating-cell">
                      <span className={`rating-badge ${getSimpleRatingClass(calculateAverageRating(fb))}`}>
                        {calculateAverageRating(fb).toFixed(0)} ⭐
                      </span>
                    </td>
                    <td className="status-cell">
                      <span className="status-indicator">
                        {fb.text_feedback ? '💬 Has Feedback' : '⭐ Rating Only'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="no-results">
                      <div className="no-results-content">
                        <Search size={48} />
                        <h3>No results found</h3>
                        <p>Try adjusting your filters or search terms</p>
                      </div>
                    </td>
                  </tr>
                )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
                
              </button>

              <button
                className="current-page-btn"
                onClick={openPageModal}
              >
                {currentPage}
              </button>

              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
        
        {/* Simple Improved Modal */}
        {modalOpen && selectedFeedback && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header-simple">
                  <h2>Feedback Details</h2>
                </div>
                
                <div className="modal-body-simple">
                  <div className="detail-row">
                    <strong>Timestamp:</strong>
                    <span>{selectedFeedback.submitted_at ? new Date(selectedFeedback.submitted_at).toLocaleString() : "N/A"}</span>
                  </div>
                  
                  <div className="detail-row">
                    <strong>Username:</strong>
                    <span>{selectedFeedback.users?.username || selectedFeedback.user_id}</span>
                  </div>
                  
                  <div className="detail-row">
                    <strong>Dance Figure:</strong>
                    <span>{getDisplayFigureName(selectedFeedback.figure_name)}</span>
                  </div>
                  
                  <div className="detail-row">
                    <strong>Rating:</strong>
                    <span className="rating-simple">
                      {selectedFeedback.rating} ⭐
                    </span>
                  </div>
                  
                  {selectedFeedback.text_feedback && (
                    <div className="detail-row feedback-text">
                      <strong>Text Feedback:</strong>
                      <div className="feedback-content">
                        {selectedFeedback.text_feedback}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="modal-footer-simple">
                  <button className="close-button" onClick={closeModal}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Simple Page Jump Modal */}
        {showPageModal && (
          <div className="modal-overlay" onClick={closePageModal}>
            <div className="simple-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Go to Page</h3>
              <div className="page-input-group">
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={jumpToPage}
                  onChange={(e) => setJumpToPage(e.target.value)}
                  placeholder={`1-${totalPages}`}
                  autoFocus
                />
                <div className="modal-buttons">
                  <button onClick={closePageModal}>Cancel</button>
                  <button 
                    onClick={handlePageJump}
                    disabled={!jumpToPage || parseInt(jumpToPage) < 1 || parseInt(jumpToPage) > totalPages}
                    className="primary"
                  >
                    Go
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function getRatingBadgeClass(rating) {
  if (rating >= 90) return "badge-excellent";
  if (rating >= 75) return "badge-good";
  if (rating >= 50) return "badge-average";
  return "badge-poor";
}

function getSimpleRatingClass(rating) {
  if (rating >= 90) return "simple-excellent";
  if (rating >= 75) return "simple-good";
  return "simple-average";
}

export default UserRatings;