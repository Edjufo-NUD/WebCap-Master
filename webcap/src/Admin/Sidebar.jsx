import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Upload,
  BarChart3,
  Star,
  LogOut,
  Settings,
  Menu,
  FileText,
  CheckSquare,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "../supabasebaseClient";
import FLIPinoLogo from "../assets/FLIPinoNLogo.png";
import "./Sidebar.css";

const Sidebar = ({ activeItem, setActiveItem }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingDancesCount, setPendingDancesCount] = useState(0);
  const [username, setUsername] = useState(
    // read cached username right away
    localStorage.getItem("username")
  );

  // read stored user object
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const role = currentUser?.role;
  const email = currentUser?.email;

  useEffect(() => {
    // only fetch if we have email and no cached username
    const getUsername = async () => {
      if (!email || username) return;

      const { data, error } = await supabase
        .from("users")
        .select("username")
        .eq("email", email)
        .single();

      if (error) {
        console.error("Error fetching username:", error);
        return;
      }

      // store to state + cache in localStorage
      setUsername(data.username);
      localStorage.setItem("username", data.username);
    };

    getUsername();
  }, [email, username]);

  // Fetch pending dances count
  useEffect(() => {
    const fetchPendingCount = async () => {
      if (role !== 'superadmin') return; // Only fetch for superadmin

      const { count, error } = await supabase
        .from('dances')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (!error) {
        setPendingDancesCount(count || 0);
      }
    };

    fetchPendingCount();
    
    // Refresh count every 30 seconds for real-time updates
    const interval = setInterval(fetchPendingCount, 30000);
    
    // Listen for custom events from DanceApproval component
    const handlePendingCountChanged = () => {
      fetchPendingCount();
    };
    
    window.addEventListener('pendingCountChanged', handlePendingCountChanged);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('pendingCountChanged', handlePendingCountChanged);
    };
  }, [role]);

  // Filter menu items based on role
  const menuItems = [
    { id: "manage-dance", label: "Manage Dance", icon: Settings, path: "/manage-dance" },
    { id: "dance-upload", label: "Dance Upload", icon: Upload, path: "/dance-upload" },
    { id: "dance-request", label: "Dance Request", icon: FileText, path: "/dance-request" },
    { id: "dance-approval", label: "Dance Approval", icon: CheckSquare, path: "/dance-approval" },
    { id: "analytics", label: "Analytics", icon: BarChart3, path: "/analytics" },
    { id: "user-ratings", label: "User Ratings", icon: Star, path: "/user-ratings" },
    { id: "user-management", label: "User Management", icon: Users, path: "/user-management" },
  ].filter(item => {
    if (item.id === "user-management") return role === "superadmin";
    if (item.id === "dance-request") return role === "admin";
    if (item.id === "dance-approval") return role === "superadmin";
    return role === "admin" || role === "superadmin";
  });

  const handleItemClick = (item) => {
    setActiveItem(item.id);
    navigate(item.path);
    setMobileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setMobileMenuOpen(false);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    // clear both caches
    localStorage.removeItem("username");
    localStorage.removeItem("currentUser");
    navigate("/login");
    window.location.reload();
  };

  const cancelLogout = () => setShowLogoutModal(false);

  // Close mobile menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      // Close mobile menu if clicking outside
      if (!event.target.closest('.sidebar-mobile-menu') && !event.target.closest('.sidebar-hamburger')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className={`sidebar${mobileMenuOpen ? " open-mobile" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img
              src={FLIPinoLogo}
              alt="FLIPino Logo"
              className="sidebar-logo-image"
            />
            <span className="sidebar-logo-text">
              Hello, {username || "Loading..."}!
            </span>
          </div>
          <button
            className="sidebar-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open menu"
          >
            <Menu size={28} />
          </button>
        </div>

        {/* Desktop menu */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const showBadge = item.id === "dance-approval" && role === "superadmin" && pendingDancesCount > 0;
            
            return (
              <div
                key={item.id}
                className={`sidebar-item ${activeItem === item.id ? "active" : ""}`}
                onClick={() => handleItemClick(item)}
                style={{ justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <IconComponent className="sidebar-icon" size={20} />
                  <span className="sidebar-label">{item.label}</span>
                </div>
                {showBadge && (
                  <span className="pending-badge" style={{ 
                    position: 'static',
                    marginLeft: '0'
                  }}>{pendingDancesCount}</span>
                )}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-item logout" onClick={handleLogoutClick}>
            <LogOut className="sidebar-icon" size={20} />
            <span className="sidebar-label">Logout</span>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sidebar-mobile-menu">
          <nav>
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const showBadge = item.id === "dance-approval" && role === "superadmin" && pendingDancesCount > 0;
              
              return (
                <div
                  key={item.id}
                  className={`sidebar-item ${activeItem === item.id ? "active" : ""}`}
                  onClick={() => handleItemClick(item)}
                  style={{ justifyContent: 'space-between' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <IconComponent className="sidebar-icon" size={20} />
                    <span className="sidebar-label">{item.label}</span>
                  </div>
                  {showBadge && (
                    <span className="pending-badge" style={{ 
                      position: 'static',
                      marginLeft: '0'
                    }}>{pendingDancesCount}</span>
                  )}
                </div>
              );
            })}
            <div className="sidebar-item logout" onClick={handleLogoutClick}>
              <LogOut className="sidebar-icon" size={20} />
              <span className="sidebar-label">Logout</span>
            </div>
          </nav>
        </div>
      )}

      {showLogoutModal && (
        <div className="logout-modal-overlay" onClick={cancelLogout}>
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
                onClick={confirmLogout}
              >
                <LogOut size={16} />
                Logout
              </button>
              <button 
                className="logout-modal-cancel"
                onClick={cancelLogout}
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

export default Sidebar;
