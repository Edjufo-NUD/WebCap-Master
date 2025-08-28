import React, { useState, useEffect } from "react";
import Sidebar from "../Admin/Sidebar";
import "./UserRatings.css";
// Example: Get data from user_feedback table using Supabase
import { supabase } from "../supabasebaseClient";

const UserRatings = () => {
  const [activeItem, setActiveItem] = useState("user-ratings");
  const [feedbackList, setFeedbackList] = useState([]);

  useEffect(() => {
    const fetchFeedback = async () => {
      const { data, error } = await supabase
        .from('user_feedback')
        .select('submitted_at, figure_name, rating, user_id, users:users(username)')
        .order('submitted_at', { ascending: false });
      if (!error) setFeedbackList(data || []);
    };
    fetchFeedback();
  }, []);

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
                  <tr key={fb.submitted_at + fb.user_id}>
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