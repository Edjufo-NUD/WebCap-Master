import React, { useState, useEffect } from "react";
import { User, Mail, Calendar, Lock, Eye, EyeOff, Edit2, Save, X } from "lucide-react";
import { FaCheck, FaTimes } from "react-icons/fa";
import Sidebar from "./Sidebar";
import { supabase } from "../supabasebaseClient";
import "./AdminProfile.css";

// Password Requirements Component
const AdminPasswordRequirements = ({ password, isVisible }) => {
  const requirements = [
    { key: 'length', text: '8-24 characters', check: password.length >= 8 && password.length <= 24 },
    { key: 'lowercase', text: 'One lowercase letter', check: /(?=.*[a-z])/.test(password) },
    { key: 'uppercase', text: 'One uppercase letter', check: /(?=.*[A-Z])/.test(password) },
    { key: 'number', text: 'One number', check: /(?=.*\d)/.test(password) },
    { key: 'special', text: 'One special character', check: /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])/.test(password) }
  ];

  if (!isVisible) return null;

  return (
    <div className="admin-password-requirements">
      <div className="admin-requirements-title">Password Requirements:</div>
      {requirements.map(req => (
        <div key={req.key} className={`admin-requirement-item ${req.check ? 'valid' : 'invalid'}`}>
          <span className="admin-requirement-icon">
            {req.check ? <FaCheck /> : <FaTimes />}
          </span>
          <span className="admin-requirement-text">{req.text}</span>
        </div>
      ))}
    </div>
  );
};

// Snackbar Component
const AdminSnackbar = ({ message, type, onClose }) => (
  <div
    className={`admin-snackbar ${type}`}
    onClick={onClose}
    role="alert"
    aria-live="assertive"
  >
    {message}
  </div>
);

const AdminProfile = () => {
  const [activeItem, setActiveItem] = useState("admin-profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ show: false, message: "", type: "" });

  // User data
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [dateJoined, setDateJoined] = useState("");
  const [userId, setUserId] = useState("");

  // Edit states
  const [editedUsername, setEditedUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.email) {
        showSnackbar("User not found. Please log in again.", "error");
        return;
      }

      setEmail(currentUser.email);

      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, username, created_at")
          .eq("email", currentUser.email)
          .single();

        if (error) throw error;

        setUserId(data.id);
        setUsername(data.username || "");
        setEditedUsername(data.username || "");
        
        // Format date
        const date = new Date(data.created_at);
        setDateJoined(date.toLocaleDateString("en-US", { 
          year: "numeric", 
          month: "long", 
          day: "numeric" 
        }));
      } catch (error) {
        console.error("Error loading user data:", error);
        showSnackbar("Failed to load profile data.", "error");
      }
    };

    loadUserData();
  }, []);

  const showSnackbar = (message, type) => {
    setSnackbar({ show: true, message, type });
    setTimeout(() => setSnackbar({ show: false, message: "", type: "" }), 3000);
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]).{8,24}$/;
    return regex.test(password);
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setEditedUsername(username);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedUsername(username);
  };

  const handleSaveProfile = async () => {
    if (!editedUsername.trim()) {
      showSnackbar("Username cannot be empty.", "error");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ username: editedUsername.trim() })
        .eq("id", userId);

      if (error) throw error;

      setUsername(editedUsername.trim());
      setIsEditing(false);
      
      // Update localStorage
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      currentUser.username = editedUsername.trim();
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      localStorage.setItem("username", editedUsername.trim());
      
      showSnackbar("Profile updated successfully!", "success");
    } catch (error) {
      console.error("Error updating profile:", error);
      showSnackbar("Failed to update profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPassword = () => {
    setIsEditingPassword(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleCancelPasswordEdit = () => {
    setIsEditingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showSnackbar("All password fields are required.", "error");
      return;
    }

    if (!validatePassword(newPassword)) {
      showSnackbar("New password does not meet requirements.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showSnackbar("New passwords do not match.", "error");
      return;
    }

    setLoading(true);
    try {
      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: currentPassword,
      });

      if (signInError) {
        showSnackbar("Current password is incorrect.", "error");
        setLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setIsEditingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      
      showSnackbar("Password updated successfully!", "success");
    } catch (error) {
      console.error("Error updating password:", error);
      showSnackbar("Failed to update password.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      <div className="admin-profile-page">
        <div className="admin-profile-wrapper">
          <div className="admin-profile-header">
            <h1 className="admin-profile-main-title">Admin Profile</h1>
            <p className="admin-profile-subtitle">Manage your account information</p>
          </div>

          <div className="admin-profile-card">
            {loading && (
              <div className="admin-loading-overlay">
                <div className="admin-spinner"></div>
              </div>
            )}

            <div className="admin-profile-info">
              {/* Profile Fields */}
              <div className="admin-profile-fields">
                {/* Username */}
                <div className="admin-field-group">
                  <label className="admin-field-label">
                    <User size={16} />
                    Username
                  </label>
                  {isEditing ? (
                    <div className="admin-field-input-container">
                      <input
                        type="text"
                        className="admin-field-input admin-field-with-buttons"
                        value={editedUsername}
                        onChange={(e) => setEditedUsername(e.target.value)}
                        placeholder="Enter your username"
                      />
                      <div className="admin-field-buttons">
                        <button className="admin-btn-save-inline" onClick={handleSaveProfile}>
                          <Save size={14} />
                        </button>
                        <button className="admin-btn-cancel-inline" onClick={handleCancelEdit}>
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="admin-field-input-container">
                      <div className="admin-field-value admin-field-with-buttons">{username || "Not set"}</div>
                      <button className="admin-btn-edit-inline" onClick={handleEditProfile}>
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div className="admin-field-group">
                  <label className="admin-field-label">
                    <Mail size={16} />
                    Email
                  </label>
                  <div className="admin-field-value">{email}</div>
                </div>

                {/* Date Joined (Read-only) */}
                <div className="admin-field-group">
                  <label className="admin-field-label">
                    <Calendar size={16} />
                    Date Joined
                  </label>
                  <div className="admin-field-value">{dateJoined || "Loading..."}</div>
                </div>

                {/* Password */}
                <div className="admin-field-group">
                  <label className="admin-field-label">
                    <Lock size={16} />
                    Password
                  </label>
                  {!isEditingPassword ? (
                    <div className="admin-field-input-container">
                      <div className="admin-field-value admin-field-with-buttons">••••••••</div>
                      <button className="admin-btn-edit-inline" onClick={handleEditPassword}>
                        <Edit2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Current Password */}
                      <div className="admin-password-input-container">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="admin-field-input admin-password-input"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          className="admin-password-toggle-btn"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>

                      {/* New Password */}
                      <div className="admin-password-input-container" style={{ marginTop: '1rem' }}>
                        <input
                          type={showNewPassword ? "text" : "password"}
                          className="admin-field-input admin-password-input"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          className="admin-password-toggle-btn"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          aria-label={showNewPassword ? "Hide password" : "Show password"}
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <AdminPasswordRequirements password={newPassword} isVisible={true} />

                      {/* Confirm Password */}
                      <div className="admin-password-input-container" style={{ marginTop: '1rem' }}>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="admin-field-input admin-password-input"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          className="admin-password-toggle-btn"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>

                      {/* Save/Cancel Buttons for Password */}
                      <div className="admin-password-edit-actions" style={{ marginTop: '1rem' }}>
                        <button className="admin-btn-save-password-full" onClick={handleSavePassword}>
                          <Save size={14} />
                          Save Password
                        </button>
                        <button className="admin-btn-cancel-password-full" onClick={handleCancelPasswordEdit}>
                          <X size={14} />
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Snackbar */}
        {snackbar.show && (
          <AdminSnackbar
            message={snackbar.message}
            type={snackbar.type}
            onClose={() => setSnackbar({ show: false, message: "", type: "" })}
          />
        )}
      </div>
    </>
  );
};

export default AdminProfile;