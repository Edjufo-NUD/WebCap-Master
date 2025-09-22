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
  const usersPerPage = 10;

  // ➜ Detect phone size (<=640px) to apply inline styles that beat all CSS
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.matchMedia("(max-width: 640px)").matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener ? mq.addEventListener("change", onChange) : mq.addListener(onChange);
    return () => {
      mq.removeEventListener ? mq.removeEventListener("change", onChange) : mq.removeListener(onChange);
    };
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

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
            role: u.role || "user",
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
    } else {
      alert("Failed to delete user.");
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
    } else {
      alert("Failed to update user.");
    }
  };

  const handleInputChange = (field, value) => {
    setEditingUser({ ...editingUser, [field]: value });
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

  // Inline styles for modal on phones (overrides any CSS conflicts)
  const modalStyle = isMobile
    ? { width: "100%", maxWidth: "none", boxSizing: "border-box", margin: "20px" }
    : undefined;
  const modalActionsStyle = isMobile
    ? { display: "flex", flexDirection: "column", alignItems: "stretch", gap: 10 }
    : undefined;
  const modalBtnStyle = isMobile
    ? { width: "100%", minWidth: 0, marginRight: 0, boxSizing: "border-box" }
    : undefined;

  return (
    <div className="user-management-container">
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />

      <div className="user-management-content">
        <h1 className="user-management-title">User Management</h1>

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
                            user.status === "Disabled" ? "disabled" : user.role
                          }`}
                        >
                          {user.status === "Disabled" ? "Disabled" : user.role}
                        </span>
                      </td>
                      <td
                        style={{
                          color: user.status === "Disabled" ? "#c62828" : "green",
                          fontWeight: "bold",
                        }}
                      >
                        {user.status}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          className="btn btn-edit"
                          onClick={() => handleEditUser(user)}
                          title="Edit"
                          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "10px" }}
                        >
                          {/* Edit icon */}
                          <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M14.846 2.854a2.25 2.25 0 0 1 3.182 3.182l-1.06 1.06-3.182-3.182 1.06-1.06ZM12.782 4.918l3.182 3.182-8.21 8.21a2.25 2.25 0 0 1-1.06.59l-3.182.796a.75.75 0 0 1-.91-.91l.796-3.182a2.25 2.25 0 0 1 .59-1.06l8.21-8.21Z"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>No admins found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Users */}
          <div className="users-table-container">
            <h3 style={{ color: "#222", fontWeight: "bold", letterSpacing: "1px" }}>Users</h3>
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
                            user.status === "Disabled" ? "disabled" : user.role
                          }`}
                        >
                          {user.status === "Disabled" ? "Disabled" : user.role}
                        </span>
                      </td>
                      <td
                        style={{
                          color: user.status === "Disabled" ? "#c62828" : "green",
                          fontWeight: "bold",
                        }}
                      >
                        {user.status}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          className="btn btn-edit"
                          onClick={() => handleEditUser(user)}
                          title="Edit"
                          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "10px" }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M14.846 2.854a2.25 2.25 0 0 1 3.182 3.182l-1.06 1.06-3.182-3.182 1.06-1.06ZM12.782 4.918l3.182 3.182-8.21 8.21a2.25 2.25 0 0 1-1.06.59l-3.182.796a.75.75 0 0 1-.91-.91l.796-3.182a2.25 2.25 0 0 1 .59-1.06l8.21-8.21Z"/>
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

        {/* EXTERNAL PAGINATION CARDS - Outside of main card */}
        {totalAdminPages > 1 && (
          <div className="pagination-card">
            <div className="pagination-content">
              <div className="pagination-left">
                <button 
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
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal" style={modalStyle}>
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
              </select>
            </div>
            <div className="modal-actions" style={modalActionsStyle}>
              <button className="btn btn-save" onClick={saveUserChanges} style={modalBtnStyle}>
                Save Changes
              </button>
              <button className="btn btn-cancel" onClick={() => setShowEditModal(false)} style={modalBtnStyle}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal" style={modalStyle}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete user "{userToDelete?.name}"?</p>
            <div className="modal-actions" style={modalActionsStyle}>
              <button className="btn btn-delete" onClick={confirmDelete} style={modalBtnStyle}>
                Delete
              </button>
              <button className="btn btn-cancel" onClick={() => setShowDeleteModal(false)} style={modalBtnStyle}>
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