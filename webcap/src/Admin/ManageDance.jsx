import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  Play,
  Pause,
  Star,
  Calendar,
  User,
  Download,
  Upload,
  Check,
  X
} from "lucide-react";
import Sidebar from "../Admin/Sidebar";
import { supabase } from "../supabasebaseClient";
import "./ManageDance.css";

const ManageDance = () => {
  const [activeItem, setActiveItem] = useState("manage-dance");
  const [dances, setDances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [dancesPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("dateAdded");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedDance, setSelectedDance] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [danceToDelete, setDanceToDelete] = useState(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    region: '',
    history: '',
    description: ''
  });

  // Load dances from localStorage
  useEffect(() => {
    const fetchDances = async () => {
      setLoading(true);
      
      try {
        // Get dances from localStorage
        const storedDances = localStorage.getItem('uploadedDances');
        const uploadedDances = storedDances ? JSON.parse(storedDances) : [];
        
        // Transform the data to match the expected structure
        const transformedDances = uploadedDances.map(dance => ({
          id: dance.id,
          title: dance.title,
          category: dance.region || 'Unknown', // Using region as category
          dateAdded: dance.uploadDate || new Date().toISOString(),
          duration: '3:45', // Default duration
          thumbnail: dance.image?.url || '/api/placeholder/150/100', // Use uploaded image or placeholder
          description: dance.description,
          history: dance.history,
          region: dance.region,
          previewVideo: dance.previewVideo,
          figureVideos: dance.figureVideos,
          image: dance.image
        }));
        
        setDances(transformedDances);
      } catch (error) {
        console.error('Error loading dances:', error);
        setDances([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDances();
  }, []);

  // Example: Get session from localStorage and fetch all data from Supabase
  const accessToken = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) return; // No session, do not fetch

      // Example: fetch all dances
      const { data: dances, error } = await supabase
        .from("dances")
        .select("*");

if (error) {
  console.error("Error fetching data:", error.message);
  setDances([]); // instead of setData([])
} else {
  setDances(dances); // instead of setData(dances)
}
    };

    fetchData();
  }, [accessToken]);

  // Fetch dances and related data from Supabase
  const fetchDancesAndRelated = async () => {
    setLoading(true); // <-- Add this line
    // 1. Fetch dances
    const { data: dancesData, error: dancesError } = await supabase
      .from("dances")
      .select("id, title, island, user_id, created_at");

    // 2. Fetch users (for uploader info)
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, username");

    // 3. Fetch dance_images (first image per dance)
    const { data: imagesData, error: imagesError } = await supabase
      .from("dance_images")
      .select("dance_id, image_url, position")
      .order("position", { ascending: true });

    if (!dancesError && !usersError && !imagesError) {
      // Map user IDs to usernames
      const userMap = {};
      usersData.forEach((u) => { userMap[u.id] = u.username; });

      // Map dance_id to its first image
      const imageMap = {};
      imagesData.forEach((img) => {
        if (!imageMap[img.dance_id]) {
          imageMap[img.dance_id] = img.image_url;
        }
      });

      // Merge username and image into dances
      const merged = (dancesData || []).map((d) => ({
        ...d,
        username: userMap[d.user_id] || "Unknown",
        image_url: imageMap[d.id] || null,
        category: d.island || "Unknown",
        dateAdded: d.created_at,
        duration: "3:45",
        thumbnail: imageMap[d.id] || "/api/placeholder/150/100",
      }));

      setDances(merged);
    }
    setLoading(false); // <-- Add this line
  };

  // Fetch on mount
  useEffect(() => {
    fetchDancesAndRelated();
  }, []);

  // Refresh from Supabase when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      fetchDancesAndRelated(); // reload from Supabase
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // Filter and search logic
  const filteredDances = dances.filter(dance => {
    const matchesSearch = dance.title?.toLowerCase().includes(searchTerm.toLowerCase());
    // Make sure category/island is compared in lowercase
    const matchesCategory =
      filterCategory === "all" ||
      (dance.category && dance.category.toLowerCase() === filterCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  // Count dances per island (case-insensitive)
  const luzonCount = dances.filter(d => d.category?.toLowerCase() === "luzon").length;
  const visayasCount = dances.filter(d => d.category?.toLowerCase() === "visayas").length;
  const mindanaoCount = dances.filter(d => d.category?.toLowerCase() === "mindanao").length;

  // Sorting logic
  const sortedDances = [...filteredDances].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === "dateAdded") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination logic
  const indexOfLastDance = currentPage * dancesPerPage;
  const indexOfFirstDance = indexOfLastDance - dancesPerPage;
  const currentDances = sortedDances.slice(indexOfFirstDance, indexOfLastDance);
  const totalPages = Math.ceil(sortedDances.length / dancesPerPage);

  const handleDeleteDance = (danceId) => {
    // Remove from state
    setDances(prev => prev.filter(dance => dance.id !== danceId));
    
    // Remove from localStorage
    const storedDances = localStorage.getItem('uploadedDances');
    if (storedDances) {
      const uploadedDances = JSON.parse(storedDances);
      const updatedDances = uploadedDances.filter(dance => dance.id !== danceId);
      localStorage.setItem('uploadedDances', JSON.stringify(updatedDances));
    }
    
    setShowDeleteModal(false);
    setDanceToDelete(null);
  };

  const handleEdit = (dance) => {
    setSelectedDance(dance);
    setEditForm({
      title: dance.title || '',
      region: dance.region || '',
      history: dance.history || '',
      description: dance.description || ''
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = () => {
    if (!selectedDance) return;

    // Update the dance in state
    const updatedDances = dances.map(dance => {
      if (dance.id === selectedDance.id) {
        return {
          ...dance,
          title: editForm.title,
          region: editForm.region,
          category: editForm.region, // Update category to match region
          history: editForm.history,
          description: editForm.description
        };
      }
      return dance;
    });
    
    setDances(updatedDances);

    // Update localStorage
    const storedDances = localStorage.getItem('uploadedDances');
    if (storedDances) {
      const uploadedDances = JSON.parse(storedDances);
      const updatedStoredDances = uploadedDances.map(dance => {
        if (dance.id === selectedDance.id) {
          return {
            ...dance,
            title: editForm.title,
            region: editForm.region,
            history: editForm.history,
            description: editForm.description
          };
        }
        return dance;
      });
      localStorage.setItem('uploadedDances', JSON.stringify(updatedStoredDances));
    }

    // Close modal
    setShowEditModal(false);
    setSelectedDance(null);
    setEditForm({
      title: '',
      region: '',
      history: '',
      description: ''
    });
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setSelectedDance(null);
    setEditForm({
      title: '',
      region: '',
      history: '',
      description: ''
    });
  };

  const openDeleteModal = (dance) => {
    setDanceToDelete(dance);
    setShowDeleteModal(true);
  };

  // Handle click outside modal to close
  const handleModalOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancelEdit();
    }
  };

  // Function to refresh data (can be called when returning from upload)
  const refreshDances = () => {
    const storedDances = localStorage.getItem('uploadedDances');
    const uploadedDances = storedDances ? JSON.parse(storedDances) : [];
    
    const transformedDances = uploadedDances.map(dance => ({
      id: dance.id,
      title: dance.title,
      category: dance.region || 'Unknown',
      dateAdded: dance.uploadDate || new Date().toISOString(),
      duration: '3:45',
      thumbnail: dance.image?.url || '/api/placeholder/150/100',
      description: dance.description,
      history: dance.history,
      region: dance.region,
      previewVideo: dance.previewVideo,
      figureVideos: dance.figureVideos,
      image: dance.image
    }));
    
    setDances(transformedDances);
  };

  // Listen for focus event to refresh data when returning to the page
  useEffect(() => {
    const handleFocus = () => {
      refreshDances();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  return (
    <div className="manage-dance-container">
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      
      <div className="main-content">
        <div className="manage-dance-header">
          <div className="header-top">
            <h1>Manage Dance Content</h1>
          </div>
          
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-value">{dances.length}</div>
              <div className="stat-label">All Dances</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{luzonCount}</div>
              <div className="stat-label">Luzon</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{visayasCount}</div>
              <div className="stat-label">Visayas</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{mindanaoCount}</div>
              <div className="stat-label">Mindanao</div>
            </div>
          </div>
        </div>

        <div className="manage-dance-controls">
          <div className="controls-left">
            <div className="search-container">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search dances..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            {/* Dropdown for filtering by island */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
              style={{ 
                color: '#000000', 
                backgroundColor: '#ffffff',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none'
              }}
            >
              <option value="all" style={{ color: '#000000', backgroundColor: '#ffffff' }}>All Islands</option>
              <option value="luzon" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Luzon</option>
              <option value="visayas" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Visayas</option>
              <option value="mindanao" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Mindanao</option>
            </select>
          </div>
          
          <div className="controls-right">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="sort-select"
              style={{ 
                color: '#000000', 
                backgroundColor: '#ffffff',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none'
              }}
            >
              <option value="dateAdded-desc" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Newest First</option>
              <option value="dateAdded-asc" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Oldest First</option>
              <option value="title-asc" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Title A-Z</option>
              <option value="title-desc" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Title Z-A</option>
            </select>
          </div>
        </div>

        <div className="dance-table-container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading dances...</p>
            </div>
          ) : dances.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Search size={48} />
              </div>
              <h3>No dances found</h3>
              <p>No dance entries found. Upload some dances to get started!</p>
            </div>
          ) : (
            <table className="dance-table">
              <thead>
                <tr>
                  <th>Dance</th>
                  <th>Category</th>
                  <th>Date Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentDances.map(dance => (
                  <tr key={dance.id}>
                    <td>
                      <div className="dance-info">
                        <img 
                          src={dance.thumbnail} 
                          alt={dance.title}
                          className="dance-thumbnail"
                        />
                        <div className="dance-details">
                          <h4>{dance.title}</h4>
                          <span className="dance-duration">{dance.duration}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#000000' }}>{dance.category}</td>
                    <td style={{ color: '#000000' }}>{new Date(dance.dateAdded).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(dance)}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn-icon btn-delete"
                          onClick={() => openDeleteModal(dance)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {dances.length > 0 && (
          <div className="pagination">
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            
            <span className="pagination-info">
              Page {currentPage} of {totalPages} ({sortedDances.length} total)
            </span>
            
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedDance && (
          <div className="modal-overlay" onClick={handleModalOverlayClick}>
            <div className="modal edit-modal">
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="edit-title">Dance Title</label>
                  <input
                    id="edit-title"
                    type="text"
                    value={editForm.title}
                    onChange={(e) => handleEditFormChange('title', e.target.value)}
                    className="form-input"
                    placeholder="Enter dance title"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-region">Island/Region</label>
                  <select
                    id="edit-region"
                    value={editForm.region}
                    onChange={(e) => handleEditFormChange('region', e.target.value)}
                    className="form-select"
                  >
                    <option value="">Select Island/Region</option>
                    <option value="luzon">Luzon</option>
                    <option value="visayas">Visayas</option>
                    <option value="mindanao">Mindanao</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-history">History</label>
                  <textarea
                    id="edit-history"
                    value={editForm.history}
                    onChange={(e) => handleEditFormChange('history', e.target.value)}
                    className="form-textarea"
                    placeholder="Enter dance history..."
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-description">Description</label>
                  <textarea
                    id="edit-description"
                    value={editForm.description}
                    onChange={(e) => handleEditFormChange('description', e.target.value)}
                    className="form-textarea"
                    placeholder="Enter dance description..."
                    rows="4"
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn btn-primary"
                  onClick={handleSaveEdit}
                  disabled={!editForm.title.trim()}
                >
                  <Check size={16} />
                  Save Changes
                </button>
                <button 
                  className="btn btn-cancel"
                  onClick={handleCancelEdit}
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && danceToDelete && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Confirm Delete</h3>
              <p>
                Are you sure you want to delete "{danceToDelete.title}"? 
                This action cannot be undone.
              </p>
              <div className="modal-actions">
                <button 
                  className="btn btn-danger"
                  onClick={() => handleDeleteDance(danceToDelete.id)}
                >
                  Delete
                </button>
                <button 
                  className="btn btn-cancel"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageDance;