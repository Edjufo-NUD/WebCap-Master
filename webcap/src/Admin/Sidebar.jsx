import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Upload, BarChart3, Star, LogOut, Settings, Menu } from "lucide-react";
import IndakHamakaLogo from "../assets/IndakHamakaLogo.png";
import "./Sidebar.css";

const Sidebar = ({ activeItem, setActiveItem }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get current user role from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const role = currentUser?.role;

  // Filter menu items based on role
  const menuItems = [
    {
      id: "manage-dance",
      label: "Manage Dance",
      icon: Settings,
      path: "/manage-dance"
    },
    {
      id: "dance-upload",
      label: "Dance Upload",
      icon: Upload,
      path: "/dance-upload"
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      path: "/analytics"
    },
    {
      id: "user-ratings",
      label: "User Ratings",
      icon: Star,
      path: "/user-ratings"
    },
    {
      id: "user-management",
      label: "User Management",
      icon: Users,
      path: "/user-management"
    }
  ].filter(item => {
    if (item.id === "user-management") {
      return role === "superadmin";
    }
    return role === "admin" || role === "superadmin";
  });

  const handleItemClick = (item) => {
    setActiveItem(item.id);
    navigate(item.path);
    setMobileMenuOpen(false); // Close mobile menu after navigation
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setMobileMenuOpen(false); // Close mobile menu
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    localStorage.clear();
    navigate("/login");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <div className={`sidebar${mobileMenuOpen ? " open-mobile" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={IndakHamakaLogo} alt="FLIPino Logo" className="sidebar-logo-image" />
            <span className="sidebar-logo-text">FLIPino Admin</span>
          </div>
          {/* Hamburger for mobile */}
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
            return (
              <div
                key={item.id}
                className={`sidebar-item ${activeItem === item.id ? "active" : ""}`}
                onClick={() => handleItemClick(item)}
              >
                <IconComponent className="sidebar-icon" size={20} />
                <span className="sidebar-label">{item.label}</span>
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

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="sidebar-mobile-menu">
          <nav>
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.id}
                  className={`sidebar-item ${activeItem === item.id ? "active" : ""}`}
                  onClick={() => handleItemClick(item)}
                >
                  <IconComponent className="sidebar-icon" size={20} />
                  <span className="sidebar-label">{item.label}</span>
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

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-actions">
              <button className="btn btn-logout" onClick={confirmLogout}>
                Logout
              </button>
              <button className="btn btn-cancel" onClick={cancelLogout}>
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