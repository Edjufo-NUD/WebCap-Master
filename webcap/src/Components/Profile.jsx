import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Edit3, Save, X } from 'lucide-react';
import Navbar from '../Components/Navbar';
import './Profile.css';
import { supabase } from '../supabasebaseClient';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    joinDate: ''
  });
  const [editData, setEditData] = useState({ ...profileData });
  const [loading, setLoading] = useState(true);

  // Get user info from localStorage and then fetch from Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      // Get user id from localStorage
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        setLoading(false);
        return;
      }
      // Fetch user info from Supabase
      const { data, error } = await supabase
        .from('users')
        .select('username, email, created_at') // <-- removed phone
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
    setLoading(true);
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      setLoading(false);
      return;
    }
    // Update user info in Supabase
    const { error } = await supabase
      .from('users')
      .update({
        username: editData.name,
        email: editData.email
      })
      .eq('id', userId);

    if (!error) {
      setProfileData({ ...editData });
      setIsEditing(false);
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

  return (
    <div className="profile">
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">Manage your account information</p>
        </div>

        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-circle">
              <User size={60} />
            </div>
          </div>

          <div className="profile-info">
            <div className="profile-actions">
              {!isEditing ? (
                <button className="btn-edit" onClick={handleEdit} disabled={loading}>
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="btn-save" onClick={handleSave} disabled={loading}>
                    <Save size={16} />
                    Save
                  </button>
                  <button className="btn-cancel" onClick={handleCancel} disabled={loading}>
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', margin: '30px 0' }}>Loading profile...</div>
            ) : (
              <div className="profile-fields">
                <div className="field-group">
                  <label className="field-label">
                    <User size={16} />
                    Full Name
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
                  {isEditing ? (
                    <input
                      type="email"
                      className="field-input"
                      value={editData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email address"
                    />
                  ) : (
                    <div className="field-value">{profileData.email}</div>
                  )}
                </div>

                <div className="field-group">
                  <label className="field-label">
                    <Calendar size={16} />
                    Member Since
                  </label>
                  <div className="field-value">{profileData.joinDate}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;