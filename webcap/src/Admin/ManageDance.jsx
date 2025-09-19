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
  const [deleteInput, setDeleteInput] = useState(""); // <-- Add this state

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    region: '',
    history: '',
    references: '',
    duration: '',
    performers: '',
    music: '',
    costumes: ''
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
          duration: dance.duration || '', // Use uploaded duration if available
          performers: dance.performers || '',
          music: dance.music || '',
          costumes: dance.costumes || '',
          thumbnail: dance.image?.url || '/api/placeholder/150/100', // Use uploaded image or placeholder
          references: dance.references,
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
      .select("id, title, island, user_id, created_at, history, references, duration, performers, music, costumes");

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
      const merged = (dancesData || []).map((d) => {
        // Capitalize island/island value
        const island = d.island
          ? d.island.charAt(0).toUpperCase() + d.island.slice(1).toLowerCase()
          : "Unknown";
        return {
          ...d,
          username: userMap[d.user_id] || "Unknown",
          image_url: imageMap[d.id] || null,
          category: island, // Use capitalized island as category
          dateAdded: d.created_at,
          duration: d.duration || '',
          performers: d.performers || '',
          music: d.music || '',
          costumes: d.costumes || '',
          thumbnail: imageMap[d.id] || "/api/placeholder/150/100",
          history: d.history || "",
          references: d.references || "",
          region: island, // for consistency in edit modal
        };
      });

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
    const matchesCategory =
      filterCategory === "all" ||
      (dance.category && dance.category === filterCategory);
    return matchesSearch && matchesCategory;
  });

  // Count dances per island (case-insensitive)
  const luzonCount = dances.filter(d => d.category === "Luzon").length;
  const visayasCount = dances.filter(d => d.category === "Visayas").length;
  const mindanaoCount = dances.filter(d => d.category === "Mindanao").length;

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

  // --- DELETE FUNCTION ---
  const handleDeleteDance = async (danceId) => {
    if (!danceId) return;
    setLoading(true);

    try {
      // 1. Get all images related to this dance
      const { data: images, error: imagesError } = await supabase
        .from("dance_images")
        .select("id, image_url")
        .eq("dance_id", danceId);

      if (imagesError) throw imagesError;

      // 2. Delete images from Supabase Storage
      if (images && images.length > 0) {
        const imagePaths = images.map(img => {
          // Assuming image_url is like "public/dances/filename.jpg"
          // Remove the storage URL prefix if present
          const url = img.image_url;
          // If you store full URLs, extract the path after the bucket name
          // Example: https://xyz.supabase.co/storage/v1/object/public/dances/filename.jpg
          // Should become: "dances/filename.jpg"
          const match = url.match(/\/object\/public\/(.+)$/);
          return match ? match[1] : url;
        });

        // Remove from storage (bucket: "public")
        const { error: storageError } = await supabase.storage
          .from("public")
          .remove(imagePaths);

        if (storageError) {
          // Optionally, handle error but continue with DB deletion
          console.error("Storage delete error:", storageError);
        }
      }

      // 3. Delete dance_images rows
      const { error: deleteImagesError } = await supabase
        .from("dance_images")
        .delete()
        .eq("dance_id", danceId);

      if (deleteImagesError) throw deleteImagesError;

      // 4. Delete the dance itself
      const { error: deleteDanceError } = await supabase
        .from("dances")
        .delete()
        .eq("id", danceId);

      if (deleteDanceError) throw deleteDanceError;

      // 5. Optionally, delete other related info (e.g., comments, likes, etc.) if you have such tables

      // Refresh list
      await fetchDancesAndRelated();
      setShowDeleteModal(false);
      setDanceToDelete(null);
      setDeleteInput("");
    } catch (err) {
      alert("Failed to delete dance: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dance) => {
    setSelectedDance(dance);
    setEditForm({
      title: dance.title || '',
      region: dance.region || '',
      history: dance.history || '',
      references: dance.references || '',
      duration: dance.duration || '',
      performers: dance.performers || '',
      music: dance.music || '',
      costumes: dance.costumes || ''
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // --- EDIT FUNCTION ---
  const handleSaveEdit = async () => {
    if (!selectedDance) return;
    setLoading(true);

    // 1. Update in Supabase
    const { error: updateError } = await supabase
      .from("dances")
      .update({
        title: editForm.title,
        island: editForm.region,
        history: editForm.history,
        references: editForm.references,
        duration: editForm.duration,
        performers: editForm.performers,
        music: editForm.music,
        costumes: editForm.costumes
      })
      .eq("id", selectedDance.id);

    // 2. Update in localStorage
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
            references: editForm.references,
            duration: editForm.duration,
            performers: editForm.performers,
            music: editForm.music,
            costumes: editForm.costumes
          };
        }
        return dance;
      });
      localStorage.setItem('uploadedDances', JSON.stringify(updatedStoredDances));
    }

    // 3. Update UI state
    const updatedDances = dances.map(dance => {
      if (dance.id === selectedDance.id) {
        return {
          ...dance,
          title: editForm.title,
          region: editForm.region,
          category: editForm.region,
          history: editForm.history,
          references: editForm.references,
          duration: editForm.duration,
          performers: editForm.performers,
          music: editForm.music,
          costumes: editForm.costumes
        };
      }
      return dance;
    });
    setDances(updatedDances);

    // 4. Close modal and reset
    setShowEditModal(false);
    setSelectedDance(null);
    setEditForm({
      title: '',
      region: '',
      history: '',
      references: '',
      duration: '',
      performers: '',
      music: '',
      costumes: ''
    });
    setLoading(false);
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setSelectedDance(null);
    setEditForm({
      title: '',
      region: '',
      history: '',
      references: '',
      duration: '',
      performers: '',
      music: '',
      costumes: ''
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
      duration: dance.duration || '',
      performers: dance.performers || '',
      music: dance.music || '',
      costumes: dance.costumes || '',
      thumbnail: dance.image?.url || '/api/placeholder/150/100',
      references: dance.references,
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

  // Add this function inside your component
  const isEditChanged = () => {
    if (!selectedDance) return false;
    return (
      editForm.title.trim() !== (selectedDance.title || '').trim() ||
      editForm.region.trim() !== (selectedDance.region || selectedDance.island || selectedDance.category || '').trim() ||
      editForm.history.trim() !== (selectedDance.history || '').trim() ||
      editForm.references.trim() !== (selectedDance.references || '').trim() ||
      editForm.duration.trim() !== (selectedDance.duration || '').trim() ||
      editForm.performers.trim() !== (selectedDance.performers || '').trim() ||
      editForm.music.trim() !== (selectedDance.music || '').trim() ||
      editForm.costumes.trim() !== (selectedDance.costumes || '').trim()
    );
  };

  useEffect(() => {
    if (showEditModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showEditModal]);

  // Reset delete input when modal opens/closes
  useEffect(() => {
    if (!showDeleteModal) setDeleteInput("");
  }, [showDeleteModal]);

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
              <option value="Luzon" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Luzon</option>
              <option value="Visayas" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Visayas</option>
              <option value="Mindanao" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Mindanao</option>
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
                  <th>Island</th>
                  <th>Date Added</th>
                  <th>Uploaded By</th> {/* Added column header */}
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
                    <td style={{ color: '#000000' }}>{dance.username || "Unknown"}</td> {/* Uploaded By */}
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
            <div
              className="modal edit-modal"
              onClick={e => e.stopPropagation()} // Prevent overlay click from closing modal when clicking inside
            >
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
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-region">Island/Region</label>
                  <select
                    id="edit-region"
                    value={editForm.region}
                    onChange={(e) => handleEditFormChange('region', e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="">Select Island/Region</option>
                    <option value="Luzon">Luzon</option>
                    <option value="Visayas">Visayas</option>
                    <option value="Mindanao">Mindanao</option>
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
                    required
                    style={{
                      minHeight: '120px',
                      maxHeight: '240px',
                      overflowY: 'auto',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-references">References</label>
                  <textarea
                    id="edit-references"
                    value={editForm.references}
                    onChange={(e) => handleEditFormChange('references', e.target.value)}
                    className="form-textarea"
                    placeholder="Enter dance references..."
                    rows="4"
                    required
                    style={{
                      minHeight: '120px',
                      maxHeight: '240px',
                      overflowY: 'auto',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* NEW FIELDS */}
                <div className="form-group">
                  <label htmlFor="edit-duration">Duration</label>
                  <input
                    id="edit-duration"
                    type="text"
                    value={editForm.duration}
                    onChange={(e) => handleEditFormChange('duration', e.target.value)}
                    className="form-input"
                    placeholder="Enter duration"
                  />
                  {!editForm.duration && (
                    <div className="form-note" style={{ color: '#888', fontSize: '0.95em' }}>
                      No duration provided.
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="edit-performers">Performers</label>
                  <input
                    id="edit-performers"
                    type="text"
                    value={editForm.performers}
                    onChange={(e) => handleEditFormChange('performers', e.target.value)}
                    className="form-input"
                    placeholder="Enter performers"
                  />
                  {!editForm.performers && (
                    <div className="form-note" style={{ color: '#888', fontSize: '0.95em' }}>
                      No performers specified.
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="edit-music">Music & Instruments</label>
                  <input
                    id="edit-music"
                    type="text"
                    value={editForm.music}
                    onChange={(e) => handleEditFormChange('music', e.target.value)}
                    className="form-input"
                    placeholder="Enter music and instruments"
                  />
                  {!editForm.music && (
                    <div className="form-note" style={{ color: '#888', fontSize: '0.95em' }}>
                      No music or instruments specified.
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="edit-costumes">Traditional Costumes</label>
                  <input
                    id="edit-costumes"
                    type="text"
                    value={editForm.costumes}
                    onChange={(e) => handleEditFormChange('costumes', e.target.value)}
                    className="form-input"
                    placeholder="Enter costumes"
                  />
                  {!editForm.costumes && (
                    <div className="form-note" style={{ color: '#888', fontSize: '0.95em' }}>
                      No costumes specified.
                    </div>
                  )}
                </div>
                {/* END NEW FIELDS */}
              </div>
              <div className="modal-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleSaveEdit}
                  disabled={
                    !editForm.title.trim() ||
                    !editForm.region.trim() ||
                    !editForm.history.trim() ||
                    !editForm.references.trim() ||
                    !isEditChanged()
                  }
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
                To confirm deletion, type <b>{`"${danceToDelete.title}"`}</b> below.<br />
                This action cannot be undone.
              </p>
              <input
                type="text"
                className="form-input"
                placeholder={`Type "${danceToDelete.title}" to confirm`}
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                autoFocus
                style={{
                  marginBottom: 16,
                  borderColor:
                    deleteInput.length === 0
                      ? "#ccc"
                      : deleteInput !== danceToDelete.title
                        ? "red"
                        : "#28a745",
                  outline:
                    deleteInput.length === 0
                      ? ""
                      : deleteInput !== danceToDelete.title
                        ? "2px solid red"
                        : "2px solid #28a745"
                }}
              />
              <div className="modal-actions">
                <button 
                  className="btn btn-danger"
                  onClick={() => handleDeleteDance(danceToDelete.id)}
                  disabled={deleteInput.trim() !== danceToDelete.title}
                  title={deleteInput.trim() !== danceToDelete.title ? "Type the exact title to enable" : ""}
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