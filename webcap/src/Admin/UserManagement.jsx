import React, { useState, useEffect } from "react";
import Sidebar from "../Admin/Sidebar";
import { supabase } from "../supabasebaseClient";
import "./UserManagementScoped.css";

const UserManagement = () => {
  const [activeItem, setActiveItem] = useState("user-management");
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [originalUserStatuses, setOriginalUserStatuses] = useState(new Map());
  const [isTogglingMaintenance, setIsTogglingMaintenance] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showStopCountdownModal, setShowStopCountdownModal] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(null);
  const [countdownInterval, setCountdownInterval] = useState(null);
  const usersPerPage = 10;

  // Show notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    fetchUsers();
    fetchAnalytics();
    checkMaintenanceMode();
    checkCountdownState();
  }, []);

  // Check if there's an ongoing countdown on component mount
  const checkCountdownState = () => {
    const savedCountdown = localStorage.getItem('maintenanceCountdown');
    if (savedCountdown) {
      const { endTime, action } = JSON.parse(savedCountdown);
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      
      if (remaining > 0) {
        setCountdownSeconds(remaining);
        startCountdown(remaining, action);
      } else {
        localStorage.removeItem('maintenanceCountdown');
      }
    }
  };

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [countdownInterval]);

  const checkMaintenanceMode = async () => {
    try {
      const { data: maintenanceUsers, error } = await supabase
        .from("users")
        .select("id")
        .eq("role", "user")
        .eq("status", "Maintenance");

      if (error) throw error;

      // If there are any users in maintenance mode, set the switch to ON
      if (maintenanceUsers && maintenanceUsers.length > 0) {
        setMaintenanceMode(true);
      }
    } catch (error) {
      console.error("Error checking maintenance mode:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Fetch total users (role = 'user')
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id")
        .eq("role", "user");

      if (usersError) throw usersError;

      // Fetch total admins (role = 'admin' or 'superadmin')
      const { data: adminsData, error: adminsError } = await supabase
        .from("users")
        .select("id")
        .in("role", ["admin", "superadmin"]);

      if (adminsError) throw adminsError;

      setTotalUsers(usersData?.length || 0);
      setTotalAdmins(adminsData?.length || 0);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, username, email, role, status");
    if (!error) {
      setUsers(
        (data || [])
          .filter((u) => u.role !== "superadmin")
          .map((u) => ({
            id: u.id,
            name: u.username,
            email: u.email,
            role: (u.role || "user").toLowerCase(),
            status: u.status || "Enabled",
          }))
      );
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
    setShowEditModal(true);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const { error } = await supabase.from("users").delete().eq("id", userToDelete.id);
    if (!error) {
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
      showNotification("User deleted successfully", 'success');
    } else {
      showNotification("Failed to delete user", 'error');
    }
  };

  const saveUserChanges = async () => {
    const { error } = await supabase
      .from("users")
      .update({
        role: editingUser.role,
        status: editingUser.status,
      })
      .eq("id", editingUser.id);

    if (!error) {
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
      showNotification("User updated successfully", 'success');
    } else {
      showNotification("Failed to update user", 'error');
    }
  };

  const handleInputChange = (field, value) => {
    setEditingUser({ ...editingUser, [field]: value });
  };

  const handleMaintenanceToggleClick = () => {
    // If there's an ongoing countdown, don't show modal
    if (countdownSeconds !== null) {
      return;
    }
    
    if (!maintenanceMode) {
      // Show confirmation modal before starting countdown
      setShowMaintenanceModal(true);
    } else {
      // Exiting maintenance mode - show confirmation
      setShowMaintenanceModal(true);
    }
  };

  const confirmMaintenanceToggle = () => {
    setShowMaintenanceModal(false);
    
    if (!maintenanceMode) {
      // Start 3-minute countdown (180 seconds)
      const countdownDuration = 180;
      const endTime = Date.now() + (countdownDuration * 1000);
      
      // Save countdown state to localStorage
      localStorage.setItem('maintenanceCountdown', JSON.stringify({
        endTime,
        action: 'enable'
      }));
      
      setCountdownSeconds(countdownDuration);
      startCountdown(countdownDuration, 'enable');
    } else {
      // Immediately exit maintenance mode
      toggleMaintenanceMode();
    }
  };

  const cancelMaintenanceToggle = () => {
    setShowMaintenanceModal(false);
  };

  const startCountdown = (duration, action) => {
    let remaining = duration;
    
    const interval = setInterval(() => {
      remaining--;
      setCountdownSeconds(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
        setCountdownInterval(null);
        setCountdownSeconds(null);
        localStorage.removeItem('maintenanceCountdown');
        
        // Execute maintenance mode toggle
        toggleMaintenanceMode();
      }
    }, 1000);
    
    setCountdownInterval(interval);
  };

  const handleStopCountdown = () => {
    setShowStopCountdownModal(true);
  };

  const confirmStopCountdown = () => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      setCountdownInterval(null);
    }
    setCountdownSeconds(null);
    localStorage.removeItem('maintenanceCountdown');
    setShowStopCountdownModal(false);
    showNotification('Maintenance mode countdown cancelled', 'info');
  };

  const cancelStopCountdown = () => {
    setShowStopCountdownModal(false);
  };

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMaintenanceMode = async () => {
    setIsTogglingMaintenance(true);
    
    try {
      if (!maintenanceMode) {
        // Entering maintenance mode - get all regular users and store their current status
        const { data: regularUsers, error: fetchError } = await supabase
          .from("users")
          .select("id, status")
          .eq("role", "user");

        if (fetchError) throw fetchError;

        // Store original statuses in component state and localStorage
        const statusMap = new Map();
        const statusBackup = {};
        
        regularUsers.forEach(user => {
          statusMap.set(user.id, user.status);
          statusBackup[user.id] = user.status;
        });
        
        setOriginalUserStatuses(statusMap);
        localStorage.setItem('userStatusBackup', JSON.stringify(statusBackup));

        // Update all regular users to maintenance status
        for (const user of regularUsers) {
          const { error } = await supabase
            .from("users")
            .update({ status: "Maintenance" })
            .eq("id", user.id);
          
          if (error) throw error;
        }

        setMaintenanceMode(true);
        showNotification("Maintenance mode enabled - All users set to maintenance status", 'success');

      } else {
        // Exiting maintenance mode - restore original statuses
        let statusesToRestore = originalUserStatuses;
        
        // Fallback to localStorage if state is empty
        if (statusesToRestore.size === 0) {
          const backup = localStorage.getItem('userStatusBackup');
          if (backup) {
            const backupData = JSON.parse(backup);
            statusesToRestore = new Map(Object.entries(backupData));
          }
        }

        // Get current users in maintenance mode
        const { data: maintenanceUsers, error: fetchError } = await supabase
          .from("users")
          .select("id")
          .eq("role", "user")
          .eq("status", "Maintenance");

        if (fetchError) throw fetchError;

        // Restore original statuses
        for (const user of maintenanceUsers) {
          const originalStatus = statusesToRestore.get(user.id) || "Enabled";
          const { error } = await supabase
            .from("users")
            .update({ status: originalStatus })
            .eq("id", user.id);
          
          if (error) throw error;
        }

        // Clear stored statuses
        setOriginalUserStatuses(new Map());
        localStorage.removeItem('userStatusBackup');
        setMaintenanceMode(false);
        showNotification("Maintenance mode disabled - User statuses restored", 'success');
      }

      // Refresh the users list
      await fetchUsers();

    } catch (error) {
      console.error("Error toggling maintenance mode:", error);
      showNotification("Failed to toggle maintenance mode", 'error');
    } finally {
      setIsTogglingMaintenance(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const admins = filteredUsers.filter((user) => user.role.toLowerCase() === "admin");
  const regularUsers = filteredUsers.filter((user) => user.role.toLowerCase() === "user");

  const currentAdminsCount = admins.length;
  const currentUsersCount = regularUsers.length;
  const totalAdminPages = Math.ceil(currentAdminsCount / usersPerPage) || 1;
  const totalUserPages = Math.ceil(currentUsersCount / usersPerPage) || 1;

  useEffect(() => {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, searchTerm]);

  const paginatedAdmins = admins.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );
  const paginatedRegularUsers = regularUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const handleNextPage = (totalPages) => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="user-management-container">
      {notification && (
        <div className={`um-notification ${notification.type}`}>
          <div className="um-notification-content">
            {notification.message}
          </div>
        </div>
      )}
      
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />

      <div className="user-management-content">
        <h1 className="user-management-title">User Management</h1>

        {/* Analytics Cards */}
        <div className="um-analytics-cards">
          <div className="um-stat-card">
            <div className="um-stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4V6C15 7.1 14.1 8 13 8H11C9.9 8 9 7.1 9 6V4L3 7V9H21ZM21 10H3V22H21V10Z"/>
              </svg>
            </div>
            <div className="um-stat-info">
              <div className="um-stat-value">{totalUsers}</div>
              <div className="um-stat-label">Total Users</div>
            </div>
          </div>
          
          <div className="um-stat-card">
            <div className="um-stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4V6C15 7.1 14.1 8 13 8H11C9.9 8 9 7.1 9 6V4L3 7V9H21ZM21 10H3V22H21V10Z"/>
              </svg>
            </div>
            <div className="um-stat-info">
              <div className="um-stat-value">{totalAdmins}</div>
              <div className="um-stat-label">Total Admins</div>
            </div>
          </div>

          <div className="um-stat-card">
            <div className="um-stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 2v20l-5.5-5.5L10 2zM14 2l5.5 14.5L14 22V2z"/>
              </svg>
            </div>
            <div className="um-stat-info">
              <div className="um-stat-value">{users.filter(u => u.status === 'Disabled').length}</div>
              <div className="um-stat-label">Disabled Users</div>
            </div>
          </div>
        </div>

        <div className="user-management-card">
          <h2 className="user-management-card-title">Manage Users</h2>

          <input
            type="text"
            className="um-user-search-bar"
            placeholder="Search by username, email, role, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Admins Table */}
          <div className="um-modern-table-section">
            <div className="um-table-header-modern">
              <h3>Admins</h3>
              <span className="um-table-count">{currentAdminsCount} total</span>
            </div>
            <div className="um-modern-table-container">
              <table className="um-modern-table">
                <thead>
                  <tr>
                    <th style={{ width: '25%' }}>Username</th>
                    <th style={{ width: '35%' }}>Email</th>
                    <th style={{ width: '15%' }}>Role</th>
                    <th style={{ width: '15%' }}>Status</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAdmins.length > 0 ? (
                    paginatedAdmins.map((user) => (
                      <tr key={user.id} className="um-table-row-modern">
                        <td>
                          <div className="um-user-info-display">
                            <span className="um-username">{user.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="um-email-text">{user.email}</span>
                        </td>
                        <td>
                          <span className={`um-modern-badge role-${user.role}`}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`um-modern-badge status-${user.status.toLowerCase()}`}>
                            {user.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="um-modern-edit-btn"
                            onClick={() => handleEditUser(user)}
                            title="Edit User"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="um-empty-state">
                        <div className="um-empty-content">
                          <div className="um-empty-icon">👨‍💼</div>
                          <h4>No admins found</h4>
                          <p>Try adjusting your search terms</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Admin Pagination */}
            {totalAdminPages > 1 && (
              <div className="um-table-pagination">
                <button
                  className="um-pagination-btn"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  ←
                </button>
                <span className="um-pagination-info">
                  Page {currentPage} of {totalAdminPages}
                </span>
                <button
                  className="um-pagination-btn"
                  onClick={() => handleNextPage(totalAdminPages)}
                  disabled={currentPage === totalAdminPages}
                >
                  →
                </button>
              </div>
            )}
          </div>

          {/* Users Table */}
          <div className="um-modern-table-section">
            <div className="um-table-header-modern">
              <div className="um-header-left">
                <h3>Users</h3>
                <span className="um-table-count">{currentUsersCount} total</span>
              </div>
              <div className="um-maintenance-toggle-modern">
                <label className="um-modern-switch">
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={handleMaintenanceToggleClick}
                    disabled={isTogglingMaintenance || countdownSeconds !== null}
                  />
                  <span className="um-switch-slider"></span>
                </label>
                <span className="um-toggle-label">
                  {countdownSeconds !== null ? (
                    <span className="um-countdown-text">
                      Maintenance in {formatCountdown(countdownSeconds)}
                    </span>
                  ) : (
                    maintenanceMode ? "Maintenance Mode ON" : "Maintenance Mode OFF"
                  )}
                </span>
                {countdownSeconds !== null && (
                  <button className="um-stop-countdown-btn" onClick={handleStopCountdown}>
                    Stop
                  </button>
                )}
              </div>
            </div>
            <div className="um-modern-table-container">
              <table className="um-modern-table">
                <thead>
                  <tr>
                    <th style={{ width: '25%' }}>Username</th>
                    <th style={{ width: '35%' }}>Email</th>
                    <th style={{ width: '15%' }}>Role</th>
                    <th style={{ width: '15%' }}>Status</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRegularUsers.length > 0 ? (
                    paginatedRegularUsers.map((user) => (
                      <tr key={user.id} className="um-table-row-modern">
                        <td>
                          <div className="um-user-info-display">
                            <span className="um-username">{user.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="um-email-text">{user.email}</span>
                        </td>
                        <td>
                          <span className={`um-modern-badge role-${user.role}`}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`um-modern-badge status-${user.status.toLowerCase()}`}>
                            {user.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="um-modern-edit-btn"
                            onClick={() => handleEditUser(user)}
                            title="Edit User"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="um-empty-state">
                        <div className="um-empty-content">
                          <div className="um-empty-icon">👤</div>
                          <h4>No users found</h4>
                          <p>No regular users in the system or try adjusting your search terms</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Users Pagination */}
            {totalUserPages > 1 && (
              <div className="um-table-pagination">
                <button
                  className="um-pagination-btn"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  ←
                </button>
                <span className="um-pagination-info">
                  Page {currentPage} of {totalUserPages}
                </span>
                <button
                  className="um-pagination-btn"
                  onClick={() => handleNextPage(totalUserPages)}
                  disabled={currentPage === totalUserPages}
                >
                  →
                </button>
              </div>
            )}
          </div>

          {/* Disabled Admins Table */}
          <div className="um-modern-table-section">
            <div className="um-table-header-modern">
              <h3>Disabled Admins</h3>
              <span className="um-table-count">{filteredUsers.filter(u => u.role === 'admin' && u.status === 'Disabled').length} total</span>
            </div>
            <div className="um-modern-table-container">
              <table className="um-modern-table">
                <thead>
                  <tr>
                    <th style={{ width: '25%' }}>Username</th>
                    <th style={{ width: '35%' }}>Email</th>
                    <th style={{ width: '15%' }}>Role</th>
                    <th style={{ width: '15%' }}>Status</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.filter(u => u.role === 'admin' && u.status === 'Disabled').length > 0 ? (
                    filteredUsers.filter(u => u.role === 'admin' && u.status === 'Disabled').map((user) => (
                      <tr key={user.id} className="um-table-row-modern">
                        <td>
                          <div className="um-user-info-display">
                            <span className="um-username">{user.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="um-email-text">{user.email}</span>
                        </td>
                        <td>
                          <span className={`um-modern-badge role-${user.role}`}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`um-modern-badge status-${user.status.toLowerCase()}`}>
                            {user.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="um-modern-edit-btn"
                            onClick={() => handleEditUser(user)}
                            title="Edit User"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="um-empty-state">
                        <div className="um-empty-content">
                          <div className="um-empty-icon">🚫</div>
                          <h4>No disabled admins</h4>
                          <p>All admins are currently active</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Disabled Users Table */}
          <div className="um-modern-table-section">
            <div className="um-table-header-modern">
              <h3>Disabled Users</h3>
              <span className="um-table-count">{filteredUsers.filter(u => u.role === 'user' && u.status === 'Disabled').length} total</span>
            </div>
            <div className="um-modern-table-container">
              <table className="um-modern-table">
                <thead>
                  <tr>
                    <th style={{ width: '25%' }}>Username</th>
                    <th style={{ width: '35%' }}>Email</th>
                    <th style={{ width: '15%' }}>Role</th>
                    <th style={{ width: '15%' }}>Status</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.filter(u => u.role === 'user' && u.status === 'Disabled').length > 0 ? (
                    filteredUsers.filter(u => u.role === 'user' && u.status === 'Disabled').map((user) => (
                      <tr key={user.id} className="um-table-row-modern">
                        <td>
                          <div className="um-user-info-display">
                            <span className="um-username">{user.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="um-email-text">{user.email}</span>
                        </td>
                        <td>
                          <span className={`um-modern-badge role-${user.role}`}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`um-modern-badge status-${user.status.toLowerCase()}`}>
                            {user.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="um-modern-edit-btn"
                            onClick={() => handleEditUser(user)}
                            title="Edit User"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="um-empty-state">
                        <div className="um-empty-content">
                          <div className="um-empty-icon">🚫</div>
                          <h4>No disabled users</h4>
                          <p>All users are currently active</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>


      </div>

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div className="um-modal-overlay" role="dialog" aria-modal="true" aria-label="Edit user">
          <div className="um-modal">
            <h3>Edit User Role</h3>
            <div className="um-user-info">
              <p>
                <strong>Name:</strong> {editingUser.name}
              </p>
              <p>
                <strong>Email:</strong> {editingUser.email}
              </p>
            </div>
            <div className="um-form-group">
              <label>Role:</label>
              <select
                value={editingUser.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="um-form-group">
              <label>Status:</label>
              <select
                value={editingUser.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
              >
                <option value="Enabled">Enabled</option>
                <option value="Disabled">Disabled</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div className="um-modal-actions">
              <button type="button" className="um-btn um-btn-save" onClick={saveUserChanges}>
                Save Changes
              </button>
              <button
                type="button"
                className="um-btn um-btn-cancel"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="um-modal-overlay" role="dialog" aria-modal="true" aria-label="Confirm delete">
          <div className="um-modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete user "{userToDelete?.name}"?</p>
            <div className="um-modal-actions">
              <button type="button" className="um-btn um-btn-delete" onClick={confirmDelete}>
                Delete
              </button>
              <button
                type="button"
                className="um-btn um-btn-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Mode Confirmation Modal */}
      {showMaintenanceModal && (
        <div className="um-logout-modal-overlay" onClick={cancelMaintenanceToggle}>
          <div className="um-logout-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="um-logout-modal-header">
              <div className="um-logout-modal-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
              <h3 className="um-logout-modal-title">
                {maintenanceMode ? "Exit Maintenance Mode?" : "Enable Maintenance Mode?"}
              </h3>
            </div>
            
            <div className="um-logout-modal-body">
              <p className="um-logout-modal-message">
                {maintenanceMode ? (
                  "Are you sure you want to exit maintenance mode? All users will be restored to their previous status."
                ) : (
                  "Are you sure you want to enable maintenance mode? All users will be set to maintenance status after a 3-minute countdown. You can stop the countdown at any time."
                )}
              </p>
            </div>
            
            <div className="um-logout-modal-actions">
              <button 
                className="um-logout-modal-confirm"
                onClick={confirmMaintenanceToggle}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
                {maintenanceMode ? "Exit Maintenance" : "Start Countdown"}
              </button>
              <button 
                className="um-logout-modal-cancel"
                onClick={cancelMaintenanceToggle}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stop Countdown Confirmation Modal */}
      {showStopCountdownModal && (
        <div className="um-logout-modal-overlay" onClick={cancelStopCountdown}>
          <div className="um-logout-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="um-logout-modal-header">
              <div className="um-logout-modal-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
              <h3 className="um-logout-modal-title">
                Stop Maintenance Countdown?
              </h3>
            </div>
            
            <div className="um-logout-modal-body">
              <p className="um-logout-modal-message">
                Are you sure you want to stop the maintenance mode countdown? The system will remain in its current state and no changes will be applied.
              </p>
            </div>
            
            <div className="um-logout-modal-actions">
              <button 
                className="um-logout-modal-confirm"
                onClick={confirmStopCountdown}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 6h12v12H6z"/>
                </svg>
                Stop Countdown
              </button>
              <button 
                className="um-logout-modal-cancel"
                onClick={cancelStopCountdown}
              >
                Continue Countdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;      