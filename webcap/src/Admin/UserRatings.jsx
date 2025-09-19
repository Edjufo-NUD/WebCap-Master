import React, { useState, useEffect } from "react";
import Sidebar from "../Admin/Sidebar";
import "./UserRatings.css";
import { supabase } from "../supabasebaseClient";

const UserRatings = () => {
  const [activeItem, setActiveItem] = useState("user-ratings");
  const [feedbackList, setFeedbackList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

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

  const openModal = (fb) => {
    setSelectedFeedback(fb);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedFeedback(null);
  };

  return (
    <div className="user-ratings-container">
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      <div className="user-ratings-content">
        <h1 className="user-ratings-title">User Ratings</h1>
        <div className="user-ratings-card">
          <h2 className="user-ratings-card-title">Dance Performance Ratings</h2>
          <p className="user-ratings-description">
            View and monitor user ratings for various Filipino dance figures and performances.
          </p>
          <div className="ratings-table-container">
            <table className="ratings-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Username</th>
                  <th>Figure</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {feedbackList.map(fb => (
                  <tr key={fb.submitted_at + fb.user_id} onClick={() => openModal(fb)} style={{cursor: "pointer"}}>
                    <td className="timestamp-cell">
                      {fb.submitted_at ? new Date(fb.submitted_at).toLocaleString() : ""}
                    </td>
                    <td className="user-id-cell">
                      {fb.users?.username || fb.user_id}
                    </td>
                    <td className="figure-cell">
                      {fb.figure_name}
                    </td>
                    <td className="rating-cell">
                      <span className={`rating-badge ${getRatingBadgeClass(fb.rating)}`}>
                        {fb.rating} ⭐
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rating-stats">
            <div className="stat-item">
              <span className="stat-label">Total Ratings:</span>
              <span className="stat-value">{feedbackList.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Average Rating:</span>
              <span className="stat-value">
                {feedbackList.length > 0 
                  ? (feedbackList.reduce((sum, r) => sum + r.rating, 0) / feedbackList.length).toFixed(1)
                  : "0.0"
                } ⭐
              </span>
            </div>
          </div>
        </div>
        {/* Modal */}
        {modalOpen && selectedFeedback && (
          <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999
          }}>
            <div style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "32px",
              minWidth: "320px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
              maxWidth: "90vw",
              color: "#000" // <-- add this line
            }}>
              <h2 style={{marginTop:0}}>Feedback Details</h2>
              <div><b>Timestamp:</b> {selectedFeedback.submitted_at ? new Date(selectedFeedback.submitted_at).toLocaleString() : ""}</div>
              <div><b>Username:</b> {selectedFeedback.users?.username || selectedFeedback.user_id}</div>
              <div><b>Figure:</b> {selectedFeedback.figure_name}</div>
              <div><b>Rating:</b> {selectedFeedback.rating} ⭐</div>
              <div><b>Text Feedback:</b> {selectedFeedback.text_feedback || <i>(none)</i>}</div>
              <button onClick={closeModal} style={{
                marginTop: "24px",
                padding: "8px 20px",
                borderRadius: "8px",
                border: "none",
                background: "#007bff",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer"
              }}>Close</button>
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

export default UserRatings;