import React, { useState, useEffect } from "react";
import Sidebar from "../Admin/Sidebar";
import { supabase } from "../supabasebaseClient";
import "./UserManagement.css";

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
  }, []);

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

  const totalAdmins = admins.length;
  const totalUsers = regularUsers.length;
  const totalAdminPages = Math.ceil(totalAdmins / usersPerPage) || 1;
  const totalUserPages = Math.ceil(totalUsers / usersPerPage) || 1;

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
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            {notification.message}
          </div>
        </div>
      )}
      
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />

      <div className="user-management-content">
        <h1 className="user-management-title">User Management</h1>

        {/* Analytics Cards */}
        <div className="analytics-cards">
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4V6C15 7.1 14.1 8 13 8H11C9.9 8 9 7.1 9 6V4L3 7V9H21ZM21 10H3V22H21V10Z"/>
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-value">{totalUsers}</div>
              <div className="stat-label">Total Users</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4V6C15 7.1 14.1 8 13 8H11C9.9 8 9 7.1 9 6V4L3 7V9H21ZM21 10H3V22H21V10Z"/>
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-value">{totalAdmins}</div>
              <div className="stat-label">Total Admins</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 2v20l-5.5-5.5L10 2zM14 2l5.5 14.5L14 22V2z"/>
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-value">{users.filter(u => u.status === 'Disabled').length}</div>
              <div className="stat-label">Disabled Users</div>
            </div>
          </div>
        </div>

        <div className="user-management-card">
          <h2 className="user-management-card-title">Manage Users</h2>

          <input
            type="text"
            className="user-search-bar"
            placeholder="Search by username, email, role, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Admins */}
          <div className="users-table-container" style={{ marginBottom: 32 }}>
            <h3 style={{ color: "#222", fontWeight: "bold", letterSpacing: "1px" }}>Admins</h3>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAdmins.length > 0 ? (
                  paginatedAdmins.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span
                          className={`role-badge ${
                            user.status === "Disabled" ? "disabled" : 
                            user.status === "Maintenance" ? "maintenance" : user.role
                          }`}
                        >
                          {user.status === "Disabled" ? "Disabled" : 
                           user.status === "Maintenance" ? "Maintenance" : user.role}
                        </span>
                      </td>
                      <td
                        style={{
                          color: user.status === "Disabled" ? "#c62828" : 
                                 user.status === "Maintenance" ? "#f57c00" : "green",
                          fontWeight: "bold",
                        }}
                      >
                        {user.status}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="btn btn-edit"
                          onClick={() => handleEditUser(user)}
                          title="Edit"
                          style={{
                            // keep inline-flex here for the small icon button in table only
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "10px",
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="20"
                            width="20"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M14.846 2.854a2.25 2.25 0 0 1 3.182 3.182l-1.06 1.06-3.182-3.182 1.06-1.06ZM12.782 4.918l3.182 3.182-8.21 8.21a2.25 2.25 0 0 1-1.06.59l-3.182.796a.75.75 0 0 1-.91-.91l.796-3.182a2.25 2.25 0 0 1 .59-1.06l8.21-8.21Z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      No admins found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Users */}
          <div className="users-table-container">
            <div className="users-header">
              <h3 style={{ color: "#222", fontWeight: "bold", letterSpacing: "1px" }}>Users</h3>
              
              {/* Maintenance Mode Switch */}
              <div className="maintenance-toggle">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={toggleMaintenanceMode}
                    disabled={isTogglingMaintenance}
                  />
                  <span className="slider round"></span>
                </label>
                <span className="maintenance-label">
                  {maintenanceMode ? "Maintenance ON" : "Maintenance OFF"}
                </span>
                {isTogglingMaintenance && <span className="loading-spinner">⟳</span>}
              </div>
            </div>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRegularUsers.length > 0 ? (
                  paginatedRegularUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span
                          className={`role-badge ${
                            user.status === "Disabled" ? "disabled" : 
                            user.status === "Maintenance" ? "maintenance" : user.role
                          }`}
                        >
                          {user.status === "Disabled" ? "Disabled" : 
                           user.status === "Maintenance" ? "Maintenance" : user.role}
                        </span>
                      </td>
                      <td
                        style={{
                          color: user.status === "Disabled" ? "#c62828" : 
                                 user.status === "Maintenance" ? "#f57c00" : "green",
                          fontWeight: "bold",
                        }}
                      >
                        {user.status}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="btn btn-edit"
                          onClick={() => handleEditUser(user)}
                          title="Edit"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "10px",
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="20"
                            width="20"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M14.846 2.854a2.25 2.25 0 0 1 3.182 3.182l-1.06 1.06-3.182-3.182 1.06-1.06ZM12.782 4.918l3.182 3.182-8.21 8.21a2.25 2.25 0 0 1-1.06.59l-3.182.796a.75.75 0 0 1-.91-.91l.796-3.182a2.25 2.25 0 0 1 .59-1.06l8.21-8.21Z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* EXTERNAL PAGINATION CARDS */}
        {totalAdminPages > 1 && (
          <div className="pagination-card">
            <div className="pagination-content">
              <div className="pagination-left">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
              </div>
              <span className="pagination-info">
                Showing {(currentPage - 1) * usersPerPage + 1}{" - "}
                {Math.min(currentPage * usersPerPage, totalAdmins)} of {totalAdmins} admins
              </span>
              <div className="pagination-right">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleNextPage(totalAdminPages)}
                  disabled={currentPage === totalAdminPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {totalUserPages > 1 && (
          <div className="pagination-card">
            <div className="pagination-content">
              <div className="pagination-left">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
              </div>
              <span className="pagination-info">
                Showing {(currentPage - 1) * usersPerPage + 1}{" - "}
                {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} users
              </span>
              <div className="pagination-right">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleNextPage(totalUserPages)}
                  disabled={currentPage === totalUserPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Edit user">
          <div className="modal">
            <h3>Edit User Role</h3>
            <div className="user-info">
              <p>
                <strong>Name:</strong> {editingUser.name}
              </p>
              <p>
                <strong>Email:</strong> {editingUser.email}
              </p>
            </div>
            <div className="form-group">
              <label>Role:</label>
              <select
                value={editingUser.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
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
            <div className="modal-actions">
              <button type="button" className="btn btn-save" onClick={saveUserChanges}>
                Save Changes
              </button>
              <button
                type="button"
                className="btn btn-cancel"
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
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Confirm delete">
          <div className="modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete user "{userToDelete?.name}"?</p>
            <div className="modal-actions">
              <button type="button" className="btn btn-delete" onClick={confirmDelete}>
                Delete
              </button>
              <button
                type="button"
                className="btn btn-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
