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
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 new state for search
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, username, email, role, status");
    if (!error) {
      setUsers(
        (data || [])
          .filter((u) => u.role !== "superadmin") // <-- Exclude superadmin
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
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", userToDelete.id);

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

  // 🔍 filter users based on searchTerm
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / usersPerPage);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="user-management-container">
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />

      <div className="user-management-content">
        <h1 className="user-management-title">User Management</h1>

        <div className="user-management-card">
          <h2 className="user-management-card-title">Manage Users</h2>

          {/* 🔍 Search bar */}
          <input
            type="text"
            className="user-search-bar"
            placeholder="Search by username, email, role, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="users-table-container">
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
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
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
                          {/* Edit icon SVG */}
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
            {/* Pagination controls and info */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
              <span style={{ minWidth: 180 }}>
                Showing {(currentPage - 1) * usersPerPage + paginatedUsers.length} of {totalUsers} users
              </span>
              <div>
                {currentPage > 1 && (
                  <button
                    className="btn"
                    onClick={handlePrevPage}
                    style={{ marginRight: 8, padding: "8px 12px" }}
                    title="Previous"
                  >
                    {/* Left arrow icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.7 15.3a1 1 0 0 1-1.4 0l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 1 1 1.4 1.4L9.42 10l4.3 4.3a1 1 0 0 1 0 1.4z"/>
                    </svg>
                  </button>
                )}
                {currentPage < totalPages && (
                  <button
                    className="btn"
                    onClick={handleNextPage}
                    style={{ padding: "8px 12px" }}
                    title="Next"
                  >
                    {/* Right arrow icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 4.7a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 1 1-1.4-1.4L10.58 10l-4.3-4.3a1 1 0 0 1 0-1.4z"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
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
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-save" onClick={saveUserChanges}>
                Save Changes
              </button>
              <button
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
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete user "{userToDelete?.name}"?</p>
            <div className="modal-actions">
              <button className="btn btn-delete" onClick={confirmDelete}>
                Delete
              </button>
              <button
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
