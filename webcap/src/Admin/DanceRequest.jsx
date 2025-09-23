import React, { useState, useEffect } from "react";
import { supabase } from "../supabasebaseClient";
import Sidebar from "./Sidebar";
import { FileText, Clock, Send, Eye, Filter, Search } from "lucide-react";
import "./DanceUpload.css"; // Reusing existing styles

const DanceRequest = () => {
  const [activeItem, setActiveItem] = useState("dance-request");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Form state for new requests
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    requestType: "new_dance"
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("dance_requests")
        .select(`
          *,
          users:user_id (username, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      
      const { error } = await supabase
        .from("dance_requests")
        .insert([{
          ...formData,
          user_id: currentUser.id,
          status: "pending",
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        priority: "medium",
        requestType: "new_dance"
      });

      // Refresh requests
      fetchRequests();
      alert("Request submitted successfully!");
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Error submitting request. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "#fbbf24";
      case "approved": return "#10b981";
      case "rejected": return "#ef4444";
      case "in_progress": return "#3b82f6";
      default: return "#6b7280";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "#ef4444";
      case "medium": return "#f59e0b";
      case "low": return "#10b981";
      default: return "#6b7280";
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || request.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="admin-layout">
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      
      <div className="admin-content">
        <div className="admin-header">
          <h1>Dance Requests</h1>
          <p>Submit and manage dance content requests</p>
        </div>

        {/* Submit New Request Form */}
        <div className="upload-container">
          <div className="upload-header">
            <FileText className="upload-icon" size={24} />
            <h2>Submit New Request</h2>
          </div>

          <form onSubmit={handleSubmitRequest} className="upload-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Request Title *</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="Enter request title"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Traditional">Traditional</option>
                  <option value="Folk">Folk</option>
                  <option value="Modern">Modern</option>
                  <option value="Regional">Regional</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="requestType">Request Type</label>
                <select
                  id="requestType"
                  value={formData.requestType}
                  onChange={(e) => setFormData({...formData, requestType: e.target.value})}
                >
                  <option value="new_dance">New Dance Addition</option>
                  <option value="dance_update">Dance Information Update</option>
                  <option value="media_addition">Media Addition</option>
                  <option value="correction">Content Correction</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                rows={4}
                placeholder="Provide detailed description of your request"
              />
            </div>

            <button type="submit" className="submit-btn">
              <Send size={20} />
              Submit Request
            </button>
          </form>
        </div>

        {/* Requests List */}
        <div className="upload-container">
          <div className="upload-header">
            <Clock className="upload-icon" size={24} />
            <h2>My Requests</h2>
          </div>

          {/* Filters */}
          <div className="filters">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <Filter size={20} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="in_progress">In Progress</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading requests...</div>
          ) : (
            <div className="requests-grid">
              {filteredRequests.length === 0 ? (
                <div className="no-data">No requests found</div>
              ) : (
                filteredRequests.map((request) => (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <h3>{request.title}</h3>
                      <div className="request-badges">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(request.status) }}
                        >
                          {request.status}
                        </span>
                        <span 
                          className="priority-badge"
                          style={{ backgroundColor: getPriorityColor(request.priority) }}
                        >
                          {request.priority}
                        </span>
                      </div>
                    </div>
                    
                    <p className="request-description">
                      {request.description.substring(0, 100)}
                      {request.description.length > 100 && "..."}
                    </p>
                    
                    <div className="request-meta">
                      <span>Type: {request.requestType}</span>
                      <span>Category: {request.category}</span>
                    </div>
                    
                    <div className="request-footer">
                      <span className="request-date">
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                      <button
                        className="view-btn"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowModal(true);
                        }}
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Request Details Modal */}
        {showModal && selectedRequest && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal request-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{selectedRequest.title}</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-content">
                <div className="request-detail-badges">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(selectedRequest.status) }}
                  >
                    {selectedRequest.status}
                  </span>
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(selectedRequest.priority) }}
                  >
                    {selectedRequest.priority} priority
                  </span>
                </div>
                
                <div className="request-details">
                  <div className="detail-item">
                    <strong>Type:</strong> {selectedRequest.requestType}
                  </div>
                  <div className="detail-item">
                    <strong>Category:</strong> {selectedRequest.category}
                  </div>
                  <div className="detail-item">
                    <strong>Submitted:</strong> {new Date(selectedRequest.created_at).toLocaleString()}
                  </div>
                  <div className="detail-item">
                    <strong>Description:</strong>
                    <p>{selectedRequest.description}</p>
                  </div>
                  {selectedRequest.admin_notes && (
                    <div className="detail-item">
                      <strong>Admin Notes:</strong>
                      <p>{selectedRequest.admin_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DanceRequest;
