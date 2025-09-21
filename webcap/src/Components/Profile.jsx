import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Edit3, Save, X, Lock, BarChart3 } from 'lucide-react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Navbar from '../Components/Navbar';
import './Profile.css';
import { supabase } from '../supabasebaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Dances (alphabetical)
const DANCE_NAMES = [
  "Binungey",
  "Pahid",
  "Sua Ku Sua",
  "Tiklos",
  "Tiklos: Step-by-Step"
];

// Snackbar component
const Snackbar = ({ message, type, onClose }) => (
  <div
    style={{
      position: 'fixed',
      bottom: '32px',
      left: '50%',
      transform: 'translateX(-50%)',
      minWidth: '250px',
      background: type === 'success' ? '#43a047' : type === 'error' ? '#e53935' : '#323232',
      color: '#fff',
      padding: '16px 32px',
      borderRadius: '8px',
      zIndex: 9999,
      fontSize: '1rem',
      opacity: 0.97,
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      cursor: 'pointer'
    }}
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
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ message: '', type: '' });

  const [showPasswordEdit, setShowPasswordEdit] = useState(false);
  const [passwordFields, setPasswordFields] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [userId, setUserId] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [averageScore, setAverageScore] = useState(null);

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const showSnackbar = (message, type) => {
    setSnackbar({ message, type });
    setTimeout(() => setSnackbar({ message: '', type: '' }), 3000);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...profileData });
  };

  const handleSave = async () => {
    // Username validation
    const username = editData.name.trim();
    if (username.length < 6 || username.length > 16) {
      showSnackbar('Username must be 6-16 characters.', 'error');
      return;
    }
    setLoading(true);

    // Update username in your users table
    const { error: userTableError } = await supabase
      .from('users')
      .update({ username })
      .eq('id', userId);

    // Update display name in Supabase Auth (user_metadata)
    const { error: authError } = await supabase.auth.updateUser({
      data: { display_name: username }
    });

    setLoading(false);

    if (userTableError || authError) {
      showSnackbar('Failed to update username. It may already be taken.', 'error');
      return;
    }
    setProfileData(prev => ({ ...prev, name: username }));
    setIsEditing(false);
    showSnackbar('Profile updated successfully!', 'success');
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

  const handlePasswordSave = async () => {
    const { current, new: newPass, confirm } = passwordFields;

    // Validation
    if (!current || !newPass || !confirm) {
      showSnackbar('Please fill in all password fields.', 'error');
      return;
    }
    if (newPass.length < 6 || newPass.length > 24) {
      showSnackbar('New password must be 6-24 characters.', 'error');
      return;
    }
    if (current.length < 6 || current.length > 24) {
      showSnackbar('Current password must be 6-24 characters.', 'error');
      return;
    }
    if (newPass !== confirm) {
      showSnackbar('Confirm password must match new password.', 'error');
      return;
    }
    if (current === newPass) {
      showSnackbar('New password cannot be the same as the current password.', 'error');
      return;
    }

    // Re-authenticate user with current password
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user) {
      showSnackbar('User not authenticated.', 'error');
      return;
    }
    // Try to sign in with current password to verify
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: current
    });
    if (signInError) {
      showSnackbar('Current password is incorrect.', 'error');
      return;
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPass
    });
    if (updateError) {
      showSnackbar('Failed to update password.', 'error');
      return;
    }

    setShowPasswordEdit(false);
    setPasswordFields({ current: '', new: '', confirm: '' });
    setShowPasswords({ current: false, new: false, confirm: false });
    showSnackbar('Password updated successfully!', 'success');
  };

  // Fetch user info and history from Supabase
  useEffect(() => {
    const fetchData = async () => {
      // Get current user from Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      // Fetch user profile
      const { data: userData } = await supabase
        .from('users')
        .select('username, email, created_at')
        .eq('id', user.id)
        .single();

      if (userData) {
        setProfileData({
          name: userData.username,
          email: userData.email,
          joinDate: new Date(userData.created_at).toLocaleString('default', { month: 'long', year: 'numeric' })
        });
      }

      // Fetch user history for performance chart and recent activity
      const { data: historyData } = await supabase
        .from('user_history')
        .select('dance_name, score, attempted_at')
        .eq('user_id', user.id);

      // Prepare performance data for all dances, even if no attempts
      let perfData = DANCE_NAMES.map(name => ({ name, score: 0 }));
      let totalScore = 0;
      let totalAttempts = 0;

      if (historyData && historyData.length > 0) {
        // Group by dance_name and average the scores
        const danceScores = {};
        historyData.forEach(item => {
          if (!danceScores[item.dance_name]) {
            danceScores[item.dance_name] = { total: 0, count: 0 };
          }
          danceScores[item.dance_name].total += item.score;
          danceScores[item.dance_name].count += 1;
          totalScore += item.score;
          totalAttempts += 1;
        });

        // Fill perfData with averages, keep all dances
        perfData = DANCE_NAMES.map(name => ({
          name,
          score: danceScores[name]
            ? Math.round(danceScores[name].total / danceScores[name].count)
            : 0
        }));

        // Calculate overall average score
        setAverageScore(totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : null);

        // Recent activity: sort by attempted_at desc, take latest 5
        const sorted = [...historyData].sort((a, b) => new Date(b.attempted_at) - new Date(a.attempted_at));
        setRecentActivities(sorted.slice(0, 5).map((item, idx) => ({
          id: idx + 1,
          activity: item.dance_name,
          score: item.score,
          date: getRelativeDate(item.attempted_at),
          icon: '🎵'
        })));
      } else {
        setAverageScore(null);
        setRecentActivities([]);
      }

      // Always set performance data (all dances, sorted)
      setPerformanceData(perfData);
    };

    fetchData();
  }, []);

  // Helper to get "Today", "X days ago", etc.
  function getRelativeDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff} days ago`;
  }

  return (
    <div className="profile">
      <Navbar />
      <div className="profile-container" style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Profile Section - Left Side */}
        <div className="profile-card">
          {loading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
            </div>
          )}

          <div className="profile-avatar">
            <div className="avatar-circle">
              <User size={50} />
            </div>
          </div>

          <div className="profile-header">
            <h2 className="profile-title" style={{ fontSize: '1.5rem' }}>My Profile</h2>
            <p className="profile-subtitle">Manage your account information</p>
          </div>

          <div className="profile-actions">
            {!isEditing ? (
              <button className="btn-edit" onClick={handleEdit}>
                <Edit3 size={16} />
                Edit Username
              </button>
            ) : (
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
            )}
          </div>

          {/* Profile Fields */}
          <div className="profile-fields">
            <div className="field-group">
              <label className="field-label">
                <User size={16} />
                Username
              </label>
              {isEditing ? (
                <input
                  className="field-input"
                  type="text"
                  value={editData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your username"
                  minLength={6}
                  maxLength={16}
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

            {/* Password Section */}
            {!showPasswordEdit ? (
              <div className="field-group">
                <label className="field-label">
                  <Lock size={16} />
                  Password
                </label>
                <div className="field-value" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>••••••••</span>
                  <button
                    className="btn-edit-password"
                    onClick={() => setShowPasswordEdit(true)}
                  >
                    <Lock size={12} />
                    Edit
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="field-group">
                  <label className="field-label">
                    <Lock size={16} />
                    Current Password
                  </label>
                  <div className="password-input-container">
                    <input
                      className="field-input password-input"
                      type={showPasswords.current ? 'text' : 'password'}
                      placeholder="Current Password"
                      value={passwordFields.current}
                      onChange={e => handlePasswordFieldChange('current', e.target.value)}
                      minLength={6}
                      maxLength={24}
                    />
                    <button
                      className="password-toggle-btn"
                      onClick={() => togglePasswordVisibility('current')}
                    >
                      {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">
                    <Lock size={16} />
                    New Password
                  </label>
                  <div className="password-input-container">
                    <input
                      className="field-input password-input"
                      type={showPasswords.new ? 'text' : 'password'}
                      placeholder="New Password"
                      value={passwordFields.new}
                      onChange={e => handlePasswordFieldChange('new', e.target.value)}
                      minLength={6}
                      maxLength={24}
                    />
                    <button
                      className="password-toggle-btn"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">
                    <Lock size={16} />
                    Confirm New Password
                  </label>
                  <div className="password-input-container">
                    <input
                      className="field-input password-input"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      placeholder="Confirm New Password"
                      value={passwordFields.confirm}
                      onChange={e => handlePasswordFieldChange('confirm', e.target.value)}
                      minLength={6}
                      maxLength={24}
                    />
                    <button
                      className="password-toggle-btn"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="password-actions">
                  <button className="btn-save" onClick={handlePasswordSave}>
                    <Save size={16} />
                    Save Password
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => {
                      setShowPasswordEdit(false);
                      setPasswordFields({ current: '', new: '', confirm: '' });
                      setShowPasswords({ current: false, new: false, confirm: false });
                    }}
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side - Charts and Activity */}
        <div>
          {/* Performance Chart */}
          <div className="chart-card" style={{
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <BarChart3 size={24} style={{ color: '#a0855b' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                Average Score
              </h3>
            </div>
            <div className="chart-container" style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="score" fill="#a0855b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            padding: '2rem'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '1.5rem' }}>
              Recent Activity
            </h3>
            <div>
              {recentActivities.length === 0 && (
                <div style={{ color: '#6b7280', fontSize: '1rem' }}>No activity yet.</div>
              )}
              {recentActivities.map((activity) => (
                <div key={activity.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  marginBottom: '0.5rem',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{activity.icon}</span>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                        {activity.activity}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Score: {activity.score}%
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'right' }}>
                    {activity.date}
                  </div>
                </div>
              ))}
            </div>
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

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Dashboard Grid Responsiveness */
        @media (max-width: 1200px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
        }

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .profile-container {
            padding: 6rem 1rem 2rem 1rem !important;
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          
          .profile-card {
            padding: 2rem 1.5rem !important;
            margin: 0 !important;
            border-radius: 16px !important;
          }
          
          .profile-title {
            font-size: 1.75rem !important;
          }
          
          .profile-subtitle {
            font-size: 1rem !important;
          }
          
          .avatar-circle {
            width: 100px !important;
            height: 100px !important;
          }
          
          .avatar-circle svg {
            width: 40px !important;
            height: 40px !important;
          }
          
          .edit-actions {
            flex-direction: column !important;
            align-items: center !important;
            gap: 0.8rem !important;
          }
          
          .btn-edit,
          .btn-save,
          .btn-cancel {
            width: 100% !important;
            max-width: 200px !important;
            justify-content: center !important;
            font-size: 0.8rem !important;
            padding: 0.6rem 1.2rem !important;
          }
          
          .password-actions {
            flex-direction: column !important;
            align-items: center !important;
            gap: 0.8rem !important;
          }
          
          .btn-edit-password {
            padding: 0.3rem 0.6rem !important;
            font-size: 0.7rem !important;
          }
          
          /* Chart responsiveness */
          .chart-card {
            padding: 1.5rem !important;
            margin-bottom: 1.5rem !important;
          }
          
          .chart-card h3 {
            font-size: 1.25rem !important;
            margin-bottom: 1rem !important;
          }
          
          .chart-container {
            height: 250px !important;
          }
          
          /* Activity card responsiveness */
          .activity-card {
            padding: 1.5rem !important;
          }
          
          .activity-card h3 {
            font-size: 1.25rem !important;
            margin-bottom: 1rem !important;
          }
          
          .activity-item {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.5rem !important;
          }
          
          .activity-item-content {
            width: 100% !important;
          }
          
          .activity-item-date {
            align-self: flex-end !important;
            font-size: 0.8rem !important;
          }
        }

        @media (max-width: 480px) {
          .profile-container {
            padding: 5rem 0.5rem 1rem 0.5rem !important;
            gap: 1rem !important;
          }
          
          .profile-card {
            padding: 1.5rem 1rem !important;
            border-radius: 12px !important;
          }
          
          .profile-title {
            font-size: 1.5rem !important;
          }
          
          .profile-subtitle {
            font-size: 0.9rem !important;
          }
          
          .avatar-circle {
            width: 80px !important;
            height: 80px !important;
          }
          
          .avatar-circle svg {
            width: 35px !important;
            height: 35px !important;
          }
          
          .field-label {
            font-size: 0.8rem !important;
          }
          
          .field-value,
          .field-input {
            padding: 0.8rem !important;
            font-size: 0.9rem !important;
          }
          
          .btn-edit,
          .btn-save,
          .btn-cancel {
            padding: 0.5rem 1rem !important;
            font-size: 0.75rem !important;
            max-width: 180px !important;
          }
          
          .chart-card,
          .activity-card {
            padding: 1rem !important;
            border-radius: 16px !important;
          }
          
          .chart-card h3,
          .activity-card h3 {
            font-size: 1.1rem !important;
            margin-bottom: 0.8rem !important;
          }
          
          .chart-container {
            height: 220px !important;
          }
          
          /* Activity card responsiveness */
          .activity-card {
            padding: 1.5rem !important;
          }
          
          .activity-card h3 {
            font-size: 1.25rem !important;
            margin-bottom: 1rem !important;
          }
          
          .activity-item {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.5rem !important;
          }
          
          .activity-item-content {
            width: 100% !important;
          }
          
          .activity-item-date {
            align-self: flex-end !important;
            font-size: 0.8rem !important;
          }
        }

        /* Extra small devices */
        @media (max-width: 320px) {
          .profile-container {
            padding: 4rem 0.25rem 0.5rem 0.25rem !important;
          }
          
          .profile-card {
            padding: 1rem 0.8rem !important;
          }
          
          .profile-title {
            font-size: 1.3rem !important;
          }
          
          .avatar-circle {
            width: 70px !important;
            height: 70px !important;
          }
          
          .avatar-circle svg {
            width: 30px !important;
            height: 30px !important;
          }
          
          .chart-container {
            height: 200px !important;
          }
          
          .btn-edit,
          .btn-save,
          .btn-cancel {
            padding: 0.4rem 0.8rem !important;
            font-size: 0.7rem !important;
            max-width: 160px !important;
          }
        }

        /* Landscape orientation for tablets */
        @media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
          .profile-container {
            padding: 5rem 2rem 2rem 2rem !important;
            grid-template-columns: 45% 55% !important;
            gap: 2rem !important;
          }
          
          .chart-container {
            height: 280px !important;
          }
        }

        /* Large screens optimization */
        @media (min-width: 1400px) {
          .profile-container {
            max-width: 1600px !important;
            grid-template-columns: 500px 1fr !important;
            gap: 3rem !important;
          }
          
          .profile-card {
            padding: 3rem !important;
          }
          
          .chart-container {
            height: 350px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;