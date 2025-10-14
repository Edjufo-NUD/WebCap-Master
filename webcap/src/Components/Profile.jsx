import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Edit3, Save, X, Lock, BarChart3, TrendingUp, Target, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import './Profile.css';
import { supabase } from '../supabasebaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import logo from '../assets/FLIPinoNLogo.png';

// Dance data with figure counts and structure
const DANCE_DATA = {
  "Binungey": {
    displayName: "Binungey Summary",
    totalFigures: 7,
    figures: Array.from({length: 7}, (_, i) => ({ id: i + 1, name: `Figure ${i + 1}` }))
  },
  "Pahid": {
    displayName: "Pahid", 
    totalFigures: 6,
    figures: Array.from({length: 6}, (_, i) => ({ id: i + 1, name: `Figure ${i + 1}` }))
  },
  "Sua Ku Sua": {
    displayName: "Sua Ku Sua",
    totalFigures: 10, 
    figures: Array.from({length: 10}, (_, i) => ({ id: i + 1, name: `Figure ${i + 1}` }))
  },
  "Tiklos": {
    displayName: "Tiklos",
    totalFigures: 4,
    figures: Array.from({length: 4}, (_, i) => ({ id: i + 1, name: `Figure ${i + 1}` }))
  },
  "Tiklos: Step-by-Step": {
    displayName: "Tiklos: Step-by-Step",
    totalFigures: 16,
    figures: [
      { id: 1, name: "Figure 1 (Step 1)" }, { id: 2, name: "Figure 1 (Step 2)" },
      { id: 3, name: "Figure 1 (Step 3)" }, { id: 4, name: "Figure 1 (Step 4)" },
      { id: 5, name: "Figure 2 (Step 1)" }, { id: 6, name: "Figure 2 (Step 2)" },
      { id: 7, name: "Figure 2 (Step 3)" }, { id: 8, name: "Figure 2 (Step 4)" },
      { id: 9, name: "Figure 3 (Step 1)" }, { id: 10, name: "Figure 3 (Step 2)" },
      { id: 11, name: "Figure 3 (Step 3)" }, { id: 12, name: "Figure 3 (Step 4)" },
      { id: 13, name: "Figure 4 (Step 1)" }, { id: 14, name: "Figure 4 (Step 2)" },
      { id: 15, name: "Figure 4 (Step 3)" }, { id: 16, name: "Figure 4 (Step 4)" }
    ]
  }
};

// Dances (alphabetical) - for backward compatibility
const DANCE_NAMES = Object.keys(DANCE_DATA);

// Password Requirements component for Profile (white theme)
const PasswordRequirements = ({ password, isVisible }) => {
  const requirements = [
    { key: 'length', text: '8-24 characters', check: password.length >= 8 && password.length <= 24 },
    { key: 'lowercase', text: 'One lowercase letter', check: /(?=.*[a-z])/.test(password) },
    { key: 'uppercase', text: 'One uppercase letter', check: /(?=.*[A-Z])/.test(password) },
    { key: 'number', text: 'One number', check: /(?=.*\d)/.test(password) },
    { key: 'special', text: 'One special character', check: /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])/.test(password) }
  ];

  if (!isVisible) return null;

  return (
    <div className="password-requirements-profile">
      <div className="requirements-title-profile">Password Requirements:</div>
      {requirements.map(req => (
        <div key={req.key} className={`requirement-item-profile ${req.check ? 'valid' : 'invalid'}`}>
          <span className="requirement-icon-profile">
            {req.check ? <FaCheck /> : <FaTimes />}
          </span>
          <span className="requirement-text-profile">{req.text}</span>
        </div>
      ))}
    </div>
  );
};

// Dance Progress Table Component
const DanceProgressTable = ({ danceName, figureScores, danceData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const totalFigures = danceData.totalFigures;
  const completedFigures = figureScores.filter(score => score > 0).length;
  const completionRate = totalFigures > 0 ? Math.round((completedFigures / totalFigures) * 100) : 0;
  
  // Calculate final dance score (average of all figures)
  const finalScore = figureScores.length > 0 ? 
    Math.round(figureScores.reduce((sum, score) => sum + score, 0) / totalFigures) : 0;

  // Prepare data for the table
  const figureData = danceData.figures.map((figure, index) => ({
    id: figure.id,
    name: figure.name,
    score: figureScores[index] || 0,
    completed: (figureScores[index] || 0) > 0
  }));

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score > 0) return '#ef4444';
    return '#9ca3af';
  };

  const getScoreBackground = (score) => {
    if (score >= 80) return '#ecfdf5';
    if (score >= 60) return '#fffbeb';
    if (score > 0) return '#fef2f2';
    return '#f9fafb';
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      border: `2px solid ${completionRate === 100 ? '#10b981' : '#e5e7eb'}`,
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }}
    onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header - Always Visible */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: isExpanded ? '1rem' : '0',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <h4 style={{
          fontSize: '1.1rem',
          fontWeight: '700',
          color: '#1f2937',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Target size={18} style={{ color: '#a0855b' }} />
          {danceName}
        </h4>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <span style={{
            background: '#a0855b',
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: '600'
          }}>
            {finalScore}% Final
          </span>
          {isExpanded ? <ChevronUp size={20} style={{ color: '#a0855b' }} /> : <ChevronDown size={20} style={{ color: '#a0855b' }} />}
        </div>
      </div>

      {/* Progress Bar - Always Visible */}
      <div style={{
        background: '#f3f4f6',
        borderRadius: '8px',
        height: '12px',
        marginTop: '1rem',
        marginBottom: '0.75rem',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          background: `linear-gradient(90deg, ${completionRate === 100 ? '#10b981' : completionRate > 50 ? '#f59e0b' : '#ef4444'}, ${completionRate === 100 ? '#059669' : completionRate > 50 ? '#d97706' : '#dc2626'})`,
          height: '100%',
          width: `${completionRate}%`,
          transition: 'width 0.3s ease',
          borderRadius: '8px'
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '0.75rem',
          fontWeight: '600',
          color: completionRate > 30 ? 'white' : '#374151',
          textShadow: completionRate > 30 ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
        }}>
          {completedFigures}/{totalFigures} figures ({completionRate}%)
        </div>
      </div>

      {/* Score Summary - Always Visible */}
      {!isExpanded && (
        <div style={{
          padding: '0.75rem 1rem',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{
            fontSize: '0.8rem',
            color: '#374151',
            fontWeight: '600'
          }}>
            Final Score = (Sum of all figure scores) ÷ {totalFigures} figures
          </div>
          <div style={{
            fontSize: '1rem',
            fontWeight: '700',
            color: getScoreColor(finalScore),
            padding: '0.25rem 0.75rem',
            background: getScoreBackground(finalScore),
            borderRadius: '6px',
            border: `2px solid ${getScoreColor(finalScore)}`
          }}>
            {finalScore}%
          </div>
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <>
      {/* Table Container */}
      <div style={{
        overflowX: 'auto',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: '300px'
        }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={{
                padding: '0.75rem 1rem',
                textAlign: 'left',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                Figure #
              </th>
              <th style={{
                padding: '0.75rem 1rem',
                textAlign: 'left',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                Figure Name
              </th>
              <th style={{
                padding: '0.75rem 1rem',
                textAlign: 'center',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                Score
              </th>
              <th style={{
                padding: '0.75rem 1rem',
                textAlign: 'center',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {figureData.map((figure, index) => (
              <tr 
                key={index}
                style={{
                  background: index % 2 === 0 ? 'white' : '#fafafa',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <td style={{
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  color: '#374151',
                  borderBottom: '1px solid #f3f4f6',
                  fontWeight: '600'
                }}>
                  {figure.id}
                </td>
                <td style={{
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  color: '#374151',
                  borderBottom: '1px solid #f3f4f6'
                }}>
                  {figure.name}
                </td>
                <td style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'center',
                  borderBottom: '1px solid #f3f4f6'
                }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: getScoreColor(figure.score),
                    background: getScoreBackground(figure.score),
                    border: `1px solid ${getScoreColor(figure.score)}20`
                  }}>
                    {figure.score > 0 ? `${figure.score}%` : '—'}
                  </span>
                </td>
                <td style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'center',
                  borderBottom: '1px solid #f3f4f6'
                }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: figure.completed ? '#10b981' : '#9ca3af',
                    background: figure.completed ? '#ecfdf5' : '#f9fafb',
                    border: `1px solid ${figure.completed ? '#10b981' : '#9ca3af'}20`
                  }}>
                    {figure.completed ? '✓ Done' : '⏸ Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Row */}
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: '#f9fafb',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          fontSize: '0.875rem',
          color: '#374151',
          fontWeight: '600'
        }}>
          Final Score = (Sum of all figure scores) ÷ {totalFigures} figures
        </div>
        <div style={{
          fontSize: '1.2rem',
          fontWeight: '700',
          color: getScoreColor(finalScore),
          padding: '0.5rem 1rem',
          background: getScoreBackground(finalScore),
          borderRadius: '8px',
          border: `2px solid ${getScoreColor(finalScore)}`
        }}>
          {finalScore}%
        </div>
      </div>
        </>
      )}
    </div>
  );
};

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
    joinDate: '',
    age: '',
    gender: ''
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

  const [showPasswordRequirements, setShowPasswordRequirements] = useState({
    new: false,
    confirm: false
  });

  const [userId, setUserId] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [averageScore, setAverageScore] = useState(null);
  const [danceProgressData, setDanceProgressData] = useState({});
  const [analyticsData, setAnalyticsData] = useState({
    totalAttempts: 0,
    totalFiguresCompleted: 0,
    bestDance: null,
    improvementTrend: null,
    streakCount: 0,
    totalDances: Object.keys(DANCE_DATA).length,
    completedDances: 0
  });

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const showSnackbar = (message, type) => {
    setSnackbar({ message, type });
    setTimeout(() => setSnackbar({ message: '', type: '' }), 3000);
  };

  // Password validation function
  const validatePassword = (password) => {
    if (password.length < 8) return "Password must be at least 8 characters long.";
    if (password.length > 24) return "Password must be no more than 24 characters long.";
    if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter.";
    if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number.";
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) return "Password must contain at least one special character.";
    return null;
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
    
    // Update local profile data
    setProfileData(prev => ({ ...prev, name: username }));
    setIsEditing(false);
    
    // Update cached username in localStorage and trigger navbar refresh
    localStorage.setItem("username", username);
    
    // Force a more direct navbar update by dispatching a custom event with data
    window.dispatchEvent(new CustomEvent('usernameChanged', { 
      detail: { newUsername: username } 
    }));
    
    // Also trigger the general auth change event as backup
    window.dispatchEvent(new Event('authChange'));
    
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
    
    // Validate current password length (basic validation)
    if (current.length < 6) {
      showSnackbar('Current password is too short.', 'error');
      return;
    }
    
    // Validate new password with comprehensive requirements
    const passwordError = validatePassword(newPass);
    if (passwordError) {
      showSnackbar(passwordError, 'error');
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
    setShowPasswordRequirements({ new: false, confirm: false });
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
        .select('username, email, age, gender, created_at')
        .eq('id', user.id)
        .single();

      if (userData) {
        setProfileData({
          name: userData.username,
          email: userData.email,
          age: userData.age,
          gender: userData.gender,
          joinDate: new Date(userData.created_at).toLocaleString('default', { month: 'long', year: 'numeric' })
        });
      }

      // Fetch user history for performance chart, recent activity, and dance progress
      const { data: historyData, error: historyError } = await supabase
        .from('user_history')
        .select('dance_name, figure_name, score, attempted_at')
        .eq('user_id', user.id);

      if (historyError) {
        console.error('Error fetching user history:', historyError);
        // Continue with empty data if there's an error
        setPerformanceData(DANCE_NAMES.map(name => ({ name, score: 0 })));
        setDanceProgressData(Object.keys(DANCE_DATA).reduce((acc, danceName) => {
          acc[danceName] = new Array(DANCE_DATA[danceName].totalFigures).fill(0);
          return acc;
        }, {}));
        setAverageScore(null);
        setRecentActivities([]);
        return;
      }

      // Prepare performance data for all dances, even if no attempts
      let perfData = DANCE_NAMES.map(name => ({ name, score: 0 }));
      let totalScore = 0;
      let totalAttempts = 0;

      // Initialize dance progress data structure
      const progressData = {};
      Object.keys(DANCE_DATA).forEach(danceName => {
        progressData[danceName] = new Array(DANCE_DATA[danceName].totalFigures).fill(0);
      });

      if (historyData && historyData.length > 0) {
        // Group by dance_name and calculate averages
        const danceScores = {};
        const figureScores = {}; // For tracking individual figure scores

        historyData.forEach(item => {
          // Overall dance score calculation
          if (!danceScores[item.dance_name]) {
            danceScores[item.dance_name] = { total: 0, count: 0 };
          }
          danceScores[item.dance_name].total += item.score;
          danceScores[item.dance_name].count += 1;
          totalScore += item.score;
          totalAttempts += 1;

          // Figure-specific score tracking
          if (item.figure_name && DANCE_DATA[item.dance_name]) {
            // Extract figure number from figure_name (e.g., "Figure 1", "BinungeyBoyFig1", etc.)
            let figureNumber = null;
            
            // Try different patterns to extract figure number
            const patterns = [
              /Figure\s*(\d+)/i,           // "Figure 1", "Figure 2", etc.
              /Fig(\d+)/i,                 // "Fig1", "Fig2", etc.
              /Step\s*(\d+)/i,             // "Step 1", "Step 2", etc.
              /(\d+)$/                     // Number at the end
            ];
            
            for (const pattern of patterns) {
              const match = item.figure_name.match(pattern);
              if (match) {
                figureNumber = parseInt(match[1]);
                break;
              }
            }
            
            if (figureNumber) {
              const figureIndex = figureNumber - 1; // Convert to 0-based index
              if (figureIndex >= 0 && figureIndex < DANCE_DATA[item.dance_name].totalFigures) {
                if (!figureScores[item.dance_name]) {
                  figureScores[item.dance_name] = {};
                }
                if (!figureScores[item.dance_name][figureIndex]) {
                  figureScores[item.dance_name][figureIndex] = [];
                }
                figureScores[item.dance_name][figureIndex].push(item.score);
              }
            }
          }
        });

        // Calculate highest scores for each figure (only keep the best attempt)
        Object.keys(figureScores).forEach(danceName => {
          Object.keys(figureScores[danceName]).forEach(figureIndex => {
            const scores = figureScores[danceName][figureIndex];
            const highestScore = Math.max(...scores); // Get the highest score instead of average
            progressData[danceName][parseInt(figureIndex)] = highestScore;
          });
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
          activity: item.figure_name ? 
            formatFigureName(item.figure_name) : 
            item.dance_name,
          score: item.score,
          date: getRelativeDate(item.attempted_at),
          icon: '🎵'
        })));

        // Calculate analytics data
        let totalFiguresCompleted = 0;
        let completedDances = 0;
        let bestDance = null;
        let bestScore = 0;

        Object.keys(progressData).forEach(danceName => {
          const figureScores = progressData[danceName];
          const completed = figureScores.filter(score => score > 0).length;
          totalFiguresCompleted += completed;
          
          // Check if dance is completed (all figures have scores)
          if (completed === DANCE_DATA[danceName].totalFigures) {
            completedDances++;
          }
          
          // Find best dance
          const avgScore = figureScores.length > 0 ? 
            Math.round(figureScores.reduce((sum, score) => sum + score, 0) / DANCE_DATA[danceName].totalFigures) : 0;
          if (avgScore > bestScore) {
            bestScore = avgScore;
            bestDance = { name: danceName, score: avgScore };
          }
        });

        // Calculate improvement trend (compare recent vs older scores)
        const recentScores = sorted.slice(0, Math.min(10, sorted.length)).map(item => item.score);
        const olderScores = sorted.slice(Math.min(10, sorted.length), Math.min(20, sorted.length)).map(item => item.score);
        
        let improvementTrend = null;
        if (recentScores.length > 0 && olderScores.length > 0) {
          const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
          const olderAvg = olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length;
          const improvement = recentAvg - olderAvg;
          improvementTrend = { value: Math.round(improvement), direction: improvement > 0 ? 'up' : improvement < 0 ? 'down' : 'stable' };
        }

        // Calculate streak (consecutive days with activity)
        let streakCount = 0;
        if (sorted.length > 0) {
          const today = new Date();
          let currentDate = new Date(sorted[0].attempted_at);
          
          for (let i = 0; i < sorted.length; i++) {
            const itemDate = new Date(sorted[i].attempted_at);
            const diffDays = Math.floor((today - itemDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === streakCount) {
              streakCount++;
            } else {
              break;
            }
          }
        }

        setAnalyticsData({
          totalAttempts,
          totalFiguresCompleted,
          bestDance,
          improvementTrend,
          streakCount,
          totalDances: Object.keys(DANCE_DATA).length,
          completedDances
        });
      } else {
        setAverageScore(null);
        setRecentActivities([]);
        setAnalyticsData({
          totalAttempts: 0,
          totalFiguresCompleted: 0,
          bestDance: null,
          improvementTrend: null,
          streakCount: 0,
          totalDances: Object.keys(DANCE_DATA).length,
          completedDances: 0
        });
      }

      // Set all data
      setPerformanceData(perfData);
      setDanceProgressData(progressData);
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

  // Helper to format figure names based on the mapping
  function formatFigureName(figureName) {
    if (!figureName) return '';
    
    // Remove .json extension if present
    const cleanName = figureName.replace('.json', '');
    
    // Handle different patterns
    const patterns = [
      // BinungeyBoyFig1 -> Binungey - Boy: Figure 1
      { regex: /^BinungeyBoyFig(\d+)$/, format: (match) => `Binungey - Boy: Figure ${match[1]}` },
      
      // PahidBoyFig1 -> Pahid - Boy: Figure 1  
      { regex: /^PahidBoyFig(\d+)$/, format: (match) => `Pahid - Boy: Figure ${match[1]}` },
      
      // SuaKuSuaBoyFig1 -> Sua Ku Sua - Boy: Figure 1
      { regex: /^SuaKuSuaBoyFig(\d+)$/, format: (match) => `Sua Ku Sua - Boy: Figure ${match[1]}` },
      
      // TiklosBoyFig1 -> Tiklos - Boy: Figure 1
      { regex: /^TiklosBoyFig(\d+)$/, format: (match) => `Tiklos - Boy: Figure ${match[1]}` },
      
      // TiklosTutFig1-16 -> Tiklos - Figure: X (Step Y)
      { regex: /^TiklosTutFig(\d+)$/, format: (match) => {
        const figNum = parseInt(match[1]);
        if (figNum >= 1 && figNum <= 5) return `Tiklos - Figure: 1 (Step ${figNum})`;
        if (figNum >= 6 && figNum <= 8) return `Tiklos - Figure: 2 (Step ${figNum - 5})`;
        if (figNum >= 9 && figNum <= 12) return `Tiklos - Figure: 3 (Step ${figNum - 8})`;
        if (figNum >= 13 && figNum <= 16) return `Tiklos - Figure: 4 (Step ${figNum - 12})`;
        return `Tiklos - Figure: ${figNum}`;
      }}
    ];
    
    // Try to match against patterns
    for (const pattern of patterns) {
      const match = cleanName.match(pattern.regex);
      if (match) {
        return pattern.format(match);
      }
    }
    
    // Fallback: try to extract dance name and figure info
    const fallbackMatch = cleanName.match(/^(.+?)(Boy|Girl|Tut)?Fig(\d+)$/);
    if (fallbackMatch) {
      const danceName = fallbackMatch[1];
      const gender = fallbackMatch[2] ? ` - ${fallbackMatch[2] === 'Tut' ? 'Tutorial' : fallbackMatch[2]}` : '';
      const figureNum = fallbackMatch[3];
      return `${danceName}${gender}: Figure ${figureNum}`;
    }
    
    // Return original if no pattern matches
    return figureName;
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
        {/* Left Column - Profile and Recent Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Profile Section */}
          <div className="profile-card">
            {loading && (
              <div className="loading-overlay">
                <div className="spinner"></div>
              </div>
            )}

            <div className="profile-header">
              <h2 className="profile-title" style={{ fontSize: '1.5rem' }}>My Profile</h2>
            </div>

            {/* Profile Fields */}
            <div className="profile-fields">
              <div className="field-group">
                <label className="field-label">
                  <User size={16} />
                  Username
                </label>
                {isEditing ? (
                  <>
                    <input
                      className="field-input"
                      type="text"
                      value={editData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your username"
                      minLength={6}
                      maxLength={16}
                    />
                    <div className="password-actions">
                      <button className="btn-save" onClick={handleSave}>
                        <Save size={16} />
                        Save
                      </button>
                      <button className="btn-cancel" onClick={handleCancel}>
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="field-value" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>{profileData.name}</span>
                    <button
                      className="btn-edit-password"
                      onClick={handleEdit}
                    >
                      <Edit3 size={12} />
                      Edit
                    </button>
                  </div>
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
                  <User size={16} />
                  Age
                </label>
                <div className="field-value">{profileData.age || 'N/A'}</div>
              </div>

              <div className="field-group">
                <label className="field-label">
                  <User size={16} />
                  Gender
                </label>
                <div className="field-value">{profileData.gender || 'N/A'}</div>
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
                        onFocus={() => setShowPasswordRequirements(prev => ({...prev, new: true}))}
                        onBlur={() => setTimeout(() => setShowPasswordRequirements(prev => ({...prev, new: false})), 150)}
                        minLength={8}
                        maxLength={24}
                      />
                      <button
                        className="password-toggle-btn"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <PasswordRequirements 
                      password={passwordFields.new} 
                      isVisible={showPasswordRequirements.new} 
                    />
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
                        minLength={8}
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
                        setShowPasswordRequirements({ new: false, confirm: false });
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



          {/* Recent Activity */}
          <div style={{
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Activity size={24} style={{ color: '#a0855b' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                Recent Activity
              </h3>
            </div>
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

        {/* Right Column - Charts and Progress */}
        <div>
          {/* Analytics Overview */}
          <div style={{
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <BarChart3 size={24} style={{ color: '#a0855b' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                Learning Analytics
              </h3>
            </div>
            
            {/* Analytics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              {/* Total Attempts */}
              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '1rem',
                textAlign: 'center',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#3b82f6', marginBottom: '0.25rem' }}>
                  {analyticsData.totalAttempts}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>
                  Total Attempts
                </div>
              </div>

              {/* Completed Dances */}
              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '1rem',
                textAlign: 'center',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#10b981', marginBottom: '0.25rem' }}>
                  {analyticsData.completedDances}/{analyticsData.totalDances}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>
                  Dances Mastered
                </div>
              </div>

              {/* Figures Completed */}
              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '1rem',
                textAlign: 'center',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#f59e0b', marginBottom: '0.25rem' }}>
                  {analyticsData.totalFiguresCompleted}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>
                  Figures Learned
                </div>
              </div>

              {/* Average Score */}
              {averageScore !== null && (
                <div style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ 
                    fontSize: '1.75rem', 
                    fontWeight: '700', 
                    color: averageScore >= 80 ? '#10b981' : averageScore >= 60 ? '#f59e0b' : '#ef4444',
                    marginBottom: '0.25rem' 
                  }}>
                    {averageScore}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>
                    Avg Score
                  </div>
                </div>
              )}
            </div>

            {/* Additional Analytics */}
            {analyticsData.improvementTrend && (
              <div style={{
                background: analyticsData.improvementTrend.direction === 'up' ? 
                  'linear-gradient(135deg, #10b981, #059669)' : 
                  analyticsData.improvementTrend.direction === 'down' ?
                  'linear-gradient(135deg, #ef4444, #dc2626)' :
                  'linear-gradient(135deg, #6b7280, #4b5563)',
                borderRadius: '12px',
                padding: '1rem',
                color: 'white',
                maxWidth: '300px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <TrendingUp size={16} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Progress Trend</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                  {analyticsData.improvementTrend.direction === 'up' ? '📈 Improving' : 
                   analyticsData.improvementTrend.direction === 'down' ? '📉 Declining' : '➡️ Stable'}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  {analyticsData.improvementTrend.value > 0 ? '+' : ''}{analyticsData.improvementTrend.value}%
                </div>
              </div>
            )}
          </div>

          {/* Dance Progress Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {/* Individual Dance Progress Tables - Sorted by Final Score */}
            {DANCE_NAMES
              .map((danceName) => {
                const figureScores = danceProgressData[danceName] || [];
                const totalFigures = DANCE_DATA[danceName].totalFigures;
                const finalScore = figureScores.length > 0 ? 
                  Math.round(figureScores.reduce((sum, score) => sum + score, 0) / totalFigures) : 0;
                
                return {
                  danceName,
                  finalScore,
                  figureScores,
                  danceData: DANCE_DATA[danceName]
                };
              })
              .sort((a, b) => b.finalScore - a.finalScore) // Sort by finalScore descending (highest to lowest)
              .map(({ danceName, figureScores, danceData }) => (
                <DanceProgressTable
                  key={danceName}
                  danceName={danceName}
                  figureScores={figureScores}
                  danceData={danceData}
                />
              ))}
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
            padding: 2rem 1rem 2rem 1rem !important;
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
            height: 240px !important;
            min-height: 200px !important;
            max-height: 280px !important;
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
            padding: 1.5rem 0.5rem 1rem 0.5rem !important;
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
            height: 200px !important;
            min-height: 180px !important;
            max-height: 220px !important;
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
            padding: 1rem 0.25rem 0.5rem 0.25rem !important;
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
            height: 180px !important;
            min-height: 160px !important;
            max-height: 200px !important;
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
            padding: 2rem 2rem 2rem 2rem !important;
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

      <Footer />
    </div>
  );
};

export default Profile;