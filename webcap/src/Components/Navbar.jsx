import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, LogIn, AlertTriangle } from 'lucide-react';
import logo from '../assets/FLIPinoNLogo.png';
import './Navbar.css';
import { supabase } from '../supabasebaseClient';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(
    // read cached username right away
    localStorage.getItem("username")
  );
  const navigate = useNavigate();
  const location = useLocation();

  // read stored user object
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userId = currentUser?.id;
  const email = currentUser?.email;

  // Check authentication status and get username
  useEffect(() => {
    const checkAuthStatus = async () => {
      const accessToken = localStorage.getItem("access_token");
      
      setIsAuthenticated(!!accessToken);
      
      // only fetch if we have email and no cached username
      if (accessToken && email && !username) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('username')
          .eq('email', email)
          .single();
        
        if (error) {
          console.error('Error fetching username:', error);
          setUsername('User');
          return;
        }

        // store to state + cache in localStorage
        setUsername(userData.username);
        localStorage.setItem("username", userData.username);
      } else if (!accessToken) {
        setUsername('');
      }
    };

    checkAuthStatus();

    // Listen for auth changes
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [location.pathname, email, username]); // Re-check when route changes

  const navItems = [
    { path: '/home', label: 'Home' },
    { path: '/dances', label: 'Folk Dances' },
    { path: '/culture', label: 'Dance Tradition' },
    { path: '/about', label: 'About' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    // Clear all authentication data
    localStorage.clear(); // Clear everything including access_token
    
    // Trigger custom event to update auth state in App.jsx
    window.dispatchEvent(new Event('authChange'));
    
    navigate('/home'); // Go to home instead of login
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      // Close profile dropdown if clicking outside
      if (!event.target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
      
      // Close mobile menu if clicking outside
      if (!event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <div className="navbar-logo" onClick={() => handleNavigation('/home')}>
            <img src={logo} alt="FLIPino" className="navbar-logo-image" />
            <span className="navbar-logo-text">FLIPino</span>
          </div>

          {/* Desktop Navigation */}
          <div className="navbar-menu">
            {navItems.map((item) => (
              <button
                key={item.path}
                className={`navbar-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop Profile and Mobile Menu */}
          <div className="navbar-actions">
            {/* User Greeting - Desktop Only */}
            <div className="user-greeting desktop-only">
              {isAuthenticated ? `Hi, ${username || "User"}!` : 'Guest'}
            </div>
            
            {/* Profile Dropdown - Desktop Only */}
            <div className="profile-dropdown desktop-only">
              <button 
                className="profile-button"
                onClick={toggleProfileDropdown}
              >
                <User size={20} />
              </button>
              {isProfileDropdownOpen && (
                <div className="profile-dropdown-menu">
                  {isAuthenticated ? (
                    <>
                      <button 
                        className="profile-dropdown-item"
                        onClick={() => {
                          handleNavigation('/profile');
                          setIsProfileDropdownOpen(false);
                        }}
                      >
                        <User size={16} />
                        Profile
                      </button>
                      <button 
                        className="profile-dropdown-item logout"
                        onClick={handleLogoutClick}
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        className="profile-dropdown-item"
                        onClick={() => {
                          handleNavigation('/login');
                          setIsProfileDropdownOpen(false);
                        }}
                      >
                        <LogIn size={16} />
                        Login
                      </button>
                      <button 
                        className="profile-dropdown-item"
                        onClick={() => {
                          handleNavigation('/register');
                          setIsProfileDropdownOpen(false);
                        }}
                      >
                        <User size={16} />
                        Sign Up
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button - Mobile Only */}
            <button 
              className="mobile-menu-button mobile-only"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu">
            {navItems.map((item) => (
              <button
                key={item.path}
                className={`mobile-menu-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
              >
                {item.label}
              </button>
            ))}
            <div className="mobile-menu-divider"></div>
            {isAuthenticated ? (
              <>
                <button
                  className="mobile-menu-item"
                  onClick={() => {
                    handleNavigation('/profile');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <User size={16} />
                  Profile
                </button>
                <button
                  className="mobile-menu-item logout"
                  onClick={handleLogoutClick}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  className="mobile-menu-item"
                  onClick={() => {
                    handleNavigation('/login');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogIn size={16} />
                  Login
                </button>
                <button
                  className="mobile-menu-item"
                  onClick={() => {
                    handleNavigation('/register');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <User size={16} />
                  Sign Up
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="logout-modal-overlay" onClick={handleLogoutCancel}>
          <div className="logout-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-header">
              <div className="logout-modal-icon">
                <AlertTriangle size={24} />
              </div>
              <h3 className="logout-modal-title">Confirm Logout</h3>
            </div>
            
            <div className="logout-modal-body">
              <p className="logout-modal-message">
                Are you sure you want to log out? You will need to sign in again to access your account.
              </p>
            </div>
            
            <div className="logout-modal-actions">
              <button 
                className="logout-modal-confirm"
                onClick={handleLogoutConfirm}
              >
                <LogOut size={16} />
                Logout
              </button>
              <button 
                className="logout-modal-cancel"
                onClick={handleLogoutCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;