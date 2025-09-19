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
} from "lucide-react";
import { supabase } from "../supabasebaseClient";
import IndakHamakaLogo from "../assets/IndakHamakaLogo.png";
import "./Sidebar.css";

const Sidebar = ({ activeItem, setActiveItem }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Filter menu items based on role
  const menuItems = [
    { id: "manage-dance", label: "Manage Dance", icon: Settings, path: "/manage-dance" },
    { id: "dance-upload", label: "Dance Upload", icon: Upload, path: "/dance-upload" },
    { id: "analytics", label: "Analytics", icon: BarChart3, path: "/analytics" },
    { id: "user-ratings", label: "User Ratings", icon: Star, path: "/user-ratings" },
    { id: "user-management", label: "User Management", icon: Users, path: "/user-management" },
  ].filter(item => {
    if (item.id === "user-management") return role === "superadmin";
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

  return (
    <>
      <div className={`sidebar${mobileMenuOpen ? " open-mobile" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img
              src={IndakHamakaLogo}
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
