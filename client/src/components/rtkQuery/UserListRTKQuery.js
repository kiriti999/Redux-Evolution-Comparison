// ===================================================================
// src/components/UserListRTKQuery.js - Fixed Component
// ===================================================================

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    useGetUsersQuery,
    useAddUserMutation,
    useToggleUserMutation,
    useDeleteUserMutation,
    setFilter
} from '../../store/rtk/rtkQuery';

const UserListRTKQuery = () => {
    const dispatch = useDispatch();

    // Get filter from Redux state - Fixed selector
    const filter = useSelector((state) => state.rtkQuery?.filter || 'all');

    // Local state for new user form
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' });
    const [showAddForm, setShowAddForm] = useState(false);

    // RTK Query hooks
    const { data: users = [], error, isLoading, isFetching } = useGetUsersQuery();
    const [addUser, { isLoading: isAdding }] = useAddUserMutation();
    const [toggleUser, { isLoading: isToggling }] = useToggleUserMutation();
    const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

    // Filter users based on current filter
    const filteredUsers = users.filter(user => {
        if (filter === 'all') return true;
        if (filter === 'active') return user.isActive;
        if (filter === 'inactive') return !user.isActive;
        if (filter === 'admin') return user.role === 'admin';
        return true;
    });

    // Handle form submission
    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!newUser.name || !newUser.email) return;

        try {
            await addUser(newUser).unwrap();
            setNewUser({ name: '', email: '', role: 'user' });
            setShowAddForm(false);
        } catch (error) {
            console.error('Failed to add user:', error);
        }
    };

    // Handle toggle user status
    const handleToggleUser = async (user) => {
        try {
            await toggleUser(user).unwrap();
        } catch (error) {
            console.error('Failed to toggle user:', error);
        }
    };

    // Handle delete user
    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(userId).unwrap();
            } catch (error) {
                console.error('Failed to delete user:', error);
            }
        }
    };

    if (isLoading) return <div className="loading">Loading users...</div>;
    if (error) return <div className="error">Error loading users: {error.message}</div>;

    return (
        <div className="user-list-container">
            <div className="header">
                <h2>
                    Users ({filteredUsers.length})
                    {isFetching && <span className="fetching"> 🔄</span>}
                </h2>

                {/* Filter Controls */}
                <div className="filters">
                    <button
                        className={filter === 'all' ? 'active' : ''}
                        onClick={() => dispatch(setFilter('all'))}
                    >
                        All ({users.length})
                    </button>
                    <button
                        className={filter === 'active' ? 'active' : ''}
                        onClick={() => dispatch(setFilter('active'))}
                    >
                        Active ({users.filter(u => u.isActive).length})
                    </button>
                    <button
                        className={filter === 'inactive' ? 'active' : ''}
                        onClick={() => dispatch(setFilter('inactive'))}
                    >
                        Inactive ({users.filter(u => !u.isActive).length})
                    </button>
                    <button
                        className={filter === 'admin' ? 'active' : ''}
                        onClick={() => dispatch(setFilter('admin'))}
                    >
                        Admins ({users.filter(u => u.role === 'admin').length})
                    </button>
                </div>

                {/* Add User Button */}
                <button
                    className="add-user-btn"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? 'Cancel' : 'Add User'}
                </button>
            </div>

            {/* Add User Form */}
            {showAddForm && (
                <form onSubmit={handleAddUser} className="add-user-form">
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Name"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            required
                        />
                        <select
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button type="submit" disabled={isAdding}>
                            {isAdding ? 'Adding...' : 'Add User'}
                        </button>
                    </div>
                </form>
            )}

            {/* Users List */}
            <div className="users-list">
                {filteredUsers.map(user => (
                    <div key={user._id} className={`user-card ${user.isActive ? 'active' : 'inactive'}`}>
                        <div className="user-info">
                            <h3>{user.name}</h3>
                            <p className="email">{user.email}</p>
                            <span className={`role ${user.role}`}>{user.role}</span>
                            <span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        <div className="user-actions">
                            <button
                                onClick={() => handleToggleUser(user)}
                                disabled={isToggling}
                                className="toggle-btn"
                            >
                                {user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                                onClick={() => handleDeleteUser(user._id)}
                                disabled={isDeleting}
                                className="delete-btn"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div className="no-users">
                    No users found for filter: {filter}
                </div>
            )}
        </div>
    );
};

export default UserListRTKQuery;