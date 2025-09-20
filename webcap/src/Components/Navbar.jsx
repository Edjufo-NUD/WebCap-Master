import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, AlertTriangle } from 'lucide-react';
import logo from '../assets/FLIPinoNLogo.png';
import './Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
    localStorage.clear();
    setShowLogoutModal(false);
    navigate('/login');
    window.location.reload(); // Force reload to reset app state
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
      if (!event.target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
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

          {/* Profile and Mobile Menu */}
          <div className="navbar-actions">
            {/* Profile Dropdown */}
            <div className="profile-dropdown">
              <button 
                className="profile-button"
                onClick={toggleProfileDropdown}
              >
                <User size={20} />
              </button>
              {isProfileDropdownOpen && (
                <div className="profile-dropdown-menu">
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
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="mobile-menu-button"
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
            <button
              className="mobile-menu-item"
              onClick={() => {
                handleNavigation('/profile');
                setIsMobileMenuOpen(false);
              }}
            >
              Profile
            </button>
            <button
              className="mobile-menu-item logout"
              onClick={handleLogoutClick}
            >
              Logout
            </button>
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
                className="logout-modal-cancel"
                onClick={handleLogoutCancel}
              >
                Cancel
              </button>
              <button 
                className="logout-modal-confirm"
                onClick={handleLogoutConfirm}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
