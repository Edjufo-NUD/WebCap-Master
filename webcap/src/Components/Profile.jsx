import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Edit3, Save, X, Lock } from 'lucide-react';
import Navbar from '../Components/Navbar';
import './Profile.css';
import { supabase } from '../supabasebaseClient';

// Snackbar component
const Snackbar = ({ message, type, onClose }) => (
  <div
    className={`snackbar ${type}`}
    onClick={onClose}
    role="alert"
    aria-live="assertive"
  >
    {message}
  </div>
);

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    joinDate: ''
  });
  const [editData, setEditData] = useState({ ...profileData });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ message: '', type: '' });
  const [showPasswordEdit, setShowPasswordEdit] = useState(false);
  const [passwordFields, setPasswordFields] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Snackbar helper
  const showSnackbar = (message, type) => {
    setSnackbar({ message, type });
    setTimeout(() => setSnackbar({ message: '', type: '' }), 3000);
  };

  const validatePassword = (password) => password.length >= 8 && password.length <= 24;
  const validateUsername = (username) => username.length >= 6 && username.length <= 16;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('username, email, created_at')
        .eq('id', userId)
        .single();

      if (data) {
        setProfileData({
          name: data.username || '',
          email: data.email || '',
          joinDate: data.created_at
            ? new Date(data.created_at).toLocaleString('default', { month: 'long', year: 'numeric' })
            : ''
        });
        setEditData({
          name: data.username || '',
          email: data.email || '',
          joinDate: data.created_at
            ? new Date(data.created_at).toLocaleString('default', { month: 'long', year: 'numeric' })
            : ''
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...profileData });
  };

  const handleSave = async () => {
    // Username validation
    if (!validateUsername(editData.name)) {
      showSnackbar('Username must be between 6 and 16 characters!', 'error');
      return;
    }

    setLoading(true);
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      setLoading(false);
      return;
    }

    // Check if username or email is already taken
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .or(`username.eq.${editData.name},email.eq.${editData.email}`)
      .neq('id', userId)
      .maybeSingle();

    if (checkError) console.error('Check error:', checkError);

    if (existingUser) {
      showSnackbar('Username or email is already taken!', 'error');
      setLoading(false);
      return;
    }

    // Update user info
    const { error: updateError } = await supabase
      .from('users')
      .update({ username: editData.name, email: editData.email })
      .eq('id', userId);

    if (updateError) {
      console.error('Update error:', updateError);
      showSnackbar('Error updating profile.', 'error');
    } else {
      setProfileData({ ...editData });
      setIsEditing(false);
      showSnackbar('Profile updated successfully!', 'success');
    }

    setLoading(false);
  };

  const handleCancel = () => {
    setEditData({ ...profileData });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordFieldChange = (field, value) => {
    setPasswordFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Password change handler with validation
  const handlePasswordSave = async () => {
    if (!passwordFields.current || !passwordFields.new || !passwordFields.confirm) {
      showSnackbar('Please fill in all password fields.', 'error');
      return;
    }

    if (!validatePassword(passwordFields.new)) {
      showSnackbar('New password must be between 8 and 24 characters.', 'error');
      return;
    }

    if (passwordFields.new !== passwordFields.confirm) {
      showSnackbar('New passwords do not match.', 'error');
      return;
    }

    if (passwordFields.current === passwordFields.new) {
      showSnackbar(
        'New password cannot be the same as the current password.',
        'error'
      );
      return;
    }

    const { error } = await supabase.auth.updateUser(
      { password: passwordFields.new },
      { currentPassword: passwordFields.current } // Only works if your Supabase version supports it
    );

    if (error) {
      showSnackbar(
        error.message || 'Failed to update password. Please check your current password.',
        'error'
      );
      return;
    }

    setShowPasswordEdit(false);
    setPasswordFields({ current: '', new: '', confirm: '' });
    showSnackbar('Password updated successfully!', 'success');
  };

  return (
    <div className="profile">
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">Manage your account information</p>
        </div>

        <div className="profile-card">
          {loading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
            </div>
          )}
          <div className="profile-avatar">
            <div className="avatar-circle">
              <User size={60} />
            </div>
          </div>

          <div className="profile-info">
            <div className="profile-actions">
              {!loading && !isEditing ? (
                <button className="btn-edit" onClick={handleEdit}>
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              ) : null}

              {!loading && isEditing ? (
                <div className="edit-actions">
                  <button className="btn-save" onClick={handleSave}>
                    <Save size={16} />
                    Save
                  </button>
                  <button className="btn-cancel" onClick={handleCancel}>
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              ) : null}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', margin: '30px 0' }}>Loading profile...</div>
            ) : (
              <div className="profile-fields">
                <div className="field-group">
                  <label className="field-label">
                    <User size={16} />
                    Username
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="field-input"
                      value={editData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="field-value">{profileData.name}</div>
                  )}
                </div>

                <div className="field-group">
                  <label className="field-label">
                    <Mail size={16} />
                    Email Address
                  </label>
                  <div className="field-value">{profileData.email}</div>
                </div>

                <div className="field-group">
                  <label className="field-label">
                    <Calendar size={16} />
                    Member Since
                  </label>
                  <div className="field-value">{profileData.joinDate}</div>
                </div>

                {/* Edit Password Button and Fields */}
                <div className="field-group">
                  <label className="field-label" style={{ visibility: 'hidden' }}></label>
                  {!showPasswordEdit ? (
                    <button
                      className="btn-edit"
                      onClick={() => setShowPasswordEdit(true)}
                    >
                      <Lock size={16} />
                      Edit Password
                    </button>
                  ) : (
                    <div>
                      <div className="field-group">
                        <label className="field-label">
                          <Lock size={16} />
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="field-input"
                          placeholder="Current Password"
                          value={passwordFields.current}
                          onChange={e => handlePasswordFieldChange('current', e.target.value)}
                        />
                      </div>
                      <div className="field-group">
                        <label className="field-label">
                          <Lock size={16} />
                          New Password
                        </label>
                        <input
                          type="password"
                          className="field-input"
                          placeholder="New Password"
                          value={passwordFields.new}
                          onChange={e => handlePasswordFieldChange('new', e.target.value)}
                        />
                      </div>
                      <div className="field-group">
                        <label className="field-label">
                          <Lock size={16} />
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="field-input"
                          placeholder="Confirm New Password"
                          value={passwordFields.confirm}
                          onChange={e => handlePasswordFieldChange('confirm', e.target.value)}
                        />
                      </div>
                      <div className="edit-actions" style={{ marginTop: '1rem' }}>
                        <button
                          className="btn-save"
                          onClick={handlePasswordSave}
                        >
                          <Save size={16} />
                          Save
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={() => {
                            setShowPasswordEdit(false);
                            setPasswordFields({ current: '', new: '', confirm: '' });
                          }}
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {snackbar.message && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar({ message: '', type: '' })}
        />
      )}
    </div>
  );
};

export default Profile;
