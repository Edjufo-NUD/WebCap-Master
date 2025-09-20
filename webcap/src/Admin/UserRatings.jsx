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
                      {getDisplayFigureName(fb.figure_name)}
                    </td>
                    <td className="rating-cell">
                      <span className="rating-simple">
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