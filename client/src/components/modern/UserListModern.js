// src/components/modern/UserListModern.js
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUsers, addUser, updateUser, deleteUser } from '../../store/modern';

const UserListModern = () => {
    const dispatch = useDispatch();
    const [selectedUserId, setSelectedUserId] = useState(null);

    // 🆕 MODERN REDUX: useSelector hooks
    const users = useSelector(state => state.users.users);
    const loading = useSelector(state => state.users.loading);
    const error = useSelector(state => state.users.error);
    const selectedUser = useSelector(state =>
        state.users.users.find(user => user._id === selectedUserId)
    );

    // 🔄 useEffect replaces componentDidMount
    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    // 🎯 Event handlers using useDispatch
    const handleAddUser = () => {
        const userData = {
            name: 'New User',
            email: `user${Date.now()}@example.com`,
            role: 'user'
        };
        dispatch(addUser(userData));
    };

    const handleUpdateUser = (user) => {
        const updatedData = {
            ...user,
            name: `${user.name} (Updated)`,
            updatedAt: new Date().toISOString()
        };
        dispatch(updateUser({ id: user._id, userData: updatedData }));
    };

    const handleDeleteUser = (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            dispatch(deleteUser(userId));
        }
    };

    const handleSelectUser = (userId) => {
        setSelectedUserId(userId);
    };

    const handleClearSelection = () => {
        setSelectedUserId(null);
    };

    // 🔄 Early returns for loading/error states
    if (loading && users.length === 0) {
        return <div className="loading">Loading users...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    return (
        <div className="user-list-modern">
            <h2>Users - Modern Redux (useSelector + useDispatch)</h2>

            <div className="actions">
                <button onClick={handleAddUser} className="add-btn">
                    Add User
                </button>
                {selectedUser && (
                    <button onClick={handleClearSelection} className="clear-btn">
                        Clear Selection
                    </button>
                )}
            </div>

            {/* Loading overlay for refreshing */}
            {loading && users.length > 0 && (
                <div className="loading-overlay">Refreshing...</div>
            )}

            <div className="user-grid">
                {users.map(user => (
                    <div
                        key={user._id}
                        className={`user-card ${selectedUser?._id === user._id ? 'selected' : ''}`}
                        onClick={() => handleSelectUser(user._id)}
                    >
                        <div className="user-info">
                            <h3>{user.name}</h3>
                            <p className="email">{user.email}</p>
                            <p className="role">Role: {user.role}</p>
                            <p className="status">
                                Status: {user.isActive ? 'Active' : 'Inactive'}
                            </p>
                            <p className="date">
                                Created: {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="user-actions">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateUser(user);
                                }}
                                className="update-btn"
                            >
                                Update
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteUser(user._id);
                                }}
                                className="delete-btn"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {users.length === 0 && (
                <div className="no-users">
                    <p>No users found. Click "Add User" to create one.</p>
                </div>
            )}

            {selectedUser && (
                <div className="selected-user-details">
                    <h3>Selected User Details</h3>
                    <div className="details-content">
                        <pre>{JSON.stringify(selectedUser, null, 2)}</pre>
                    </div>
                </div>
            )}

            {/* Debug information */}
            <div className="debug-info">
                <h4>Debug Info (Modern Redux Hooks):</h4>
                <p>Total users: {users.length}</p>
                <p>Loading: {loading.toString()}</p>
                <p>Error: {error || 'None'}</p>
                <p>Selected user: {selectedUser?.name || 'None'}</p>
            </div>
        </div>
    );
};

export default UserListModern;