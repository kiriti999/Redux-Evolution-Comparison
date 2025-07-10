// src/components/rtk/UserListRTK.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    setSelectedUser,
    clearSelectedUser,
    clearError,
    // Selectors
    selectUsers,
    selectSelectedUser,
    selectUsersLoading,
    selectUsersError,
    selectFetchLoading,
    selectAddLoading,
    selectUpdateLoading,
    selectDeleteLoading,
    selectActiveUsers,
    selectUserStats
} from '../../store/rtk/userSlice';

const UserListRTK = () => {
    const dispatch = useDispatch();

    // 🚀 RTK Selectors (Clean and optimized)
    const users = useSelector(selectUsers);
    const selectedUser = useSelector(selectSelectedUser);
    const loading = useSelector(selectUsersLoading);
    const error = useSelector(selectUsersError);

    // Specific loading states
    const fetchLoading = useSelector(selectFetchLoading);
    const addLoading = useSelector(selectAddLoading);
    const updateLoading = useSelector(selectUpdateLoading);
    const deleteLoading = useSelector(selectDeleteLoading);

    // Memoized selectors
    const activeUsers = useSelector(selectActiveUsers);
    const userStats = useSelector(selectUserStats);

    // 🔄 Effects
    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    // 🎯 Event handlers with RTK actions
    const handleAddUser = () => {
        if (addLoading) return;

        const userData = {
            name: 'New User',
            email: `user${Date.now()}@example.com`,
            role: 'user'
        };
        dispatch(addUser(userData));
    };

    const handleUpdateUser = (user) => {
        if (updateLoading) return;

        const updatedData = {
            ...user,
            name: `${user.name} (Updated)`,
            updatedAt: new Date().toISOString()
        };
        dispatch(updateUser({ id: user._id, userData: updatedData }));
    };

    const handleDeleteUser = (userId) => {
        if (deleteLoading) return;

        if (window.confirm('Are you sure you want to delete this user?')) {
            dispatch(deleteUser(userId));
        }
    };

    const handleSelectUser = (user) => {
        dispatch(setSelectedUser(user));
    };

    const handleClearSelection = () => {
        dispatch(clearSelectedUser());
    };

    const handleClearError = () => {
        dispatch(clearError());
    };

    const handleRefresh = () => {
        if (fetchLoading) return;
        dispatch(fetchUsers());
    };

    // 🔄 Loading state
    if (fetchLoading && users.length === 0) {
        return <div className="loading">Loading users...</div>;
    }

    return (
        <div className="user-list-rtk">
            <h2>Users - Redux Toolkit (RTK)</h2>

            {/* Stats Section */}
            <div className="stats-section">
                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-label">Total Users:</span>
                        <span className="stat-value">{userStats.total}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Active:</span>
                        <span className="stat-value">{userStats.active}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Inactive:</span>
                        <span className="stat-value">{userStats.inactive}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Admins:</span>
                        <span className="stat-value">{userStats.admins}</span>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="error">
                    <span>Error: {error}</span>
                    <button onClick={handleClearError} className="error-close">×</button>
                </div>
            )}

            {/* Action Buttons */}
            <div className="actions">
                <button
                    onClick={handleRefresh}
                    disabled={fetchLoading}
                    className="refresh-btn"
                >
                    {fetchLoading ? 'Refreshing...' : 'Refresh Users'}
                </button>

                <button
                    onClick={handleAddUser}
                    disabled={addLoading}
                    className="add-btn"
                >
                    {addLoading ? 'Adding...' : 'Add User'}
                </button>

                {selectedUser && (
                    <button
                        onClick={handleClearSelection}
                        className="clear-btn"
                    >
                        Clear Selection
                    </button>
                )}
            </div>

            {/* Loading overlay for refresh */}
            {fetchLoading && users.length > 0 && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <span>Refreshing users...</span>
                </div>
            )}

            {/* Users Grid */}
            <div className="user-grid">
                {users.map(user => (
                    <div
                        key={user._id}
                        className={`user-card ${selectedUser?._id === user._id ? 'selected' : ''}`}
                        onClick={() => handleSelectUser(user)}
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
                                disabled={updateLoading}
                                className="update-btn"
                            >
                                {updateLoading ? 'Updating...' : 'Update'}
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteUser(user._id);
                                }}
                                disabled={deleteLoading}
                                className="delete-btn"
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* No Users State */}
            {users.length === 0 && !fetchLoading && (
                <div className="no-users">
                    <p>No users found. Click "Add User" to create one.</p>
                </div>
            )}

            {/* Selected User Details */}
            {selectedUser && (
                <div className="selected-user-details">
                    <h3>Selected User Details</h3>
                    <div className="details-content">
                        <div className="user-detail">
                            <strong>ID:</strong> {selectedUser._id}
                        </div>
                        <div className="user-detail">
                            <strong>Name:</strong> {selectedUser.name}
                        </div>
                        <div className="user-detail">
                            <strong>Email:</strong> {selectedUser.email}
                        </div>
                        <div className="user-detail">
                            <strong>Role:</strong> {selectedUser.role}
                        </div>
                        <div className="user-detail">
                            <strong>Status:</strong> {selectedUser.isActive ? 'Active' : 'Inactive'}
                        </div>
                        <div className="user-detail">
                            <strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleString()}
                        </div>
                        {selectedUser.updatedAt && (
                            <div className="user-detail">
                                <strong>Updated:</strong> {new Date(selectedUser.updatedAt).toLocaleString()}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Debug Information */}
            <div className="debug-info">
                <h4>Debug Info (Redux Toolkit):</h4>
                <div className="debug-grid">
                    <div className="debug-item">
                        <span className="debug-label">Total Users:</span>
                        <span className="debug-value">{users.length}</span>
                    </div>
                    <div className="debug-item">
                        <span className="debug-label">Active Users:</span>
                        <span className="debug-value">{activeUsers.length}</span>
                    </div>
                    <div className="debug-item">
                        <span className="debug-label">General Loading:</span>
                        <span className="debug-value">{loading.toString()}</span>
                    </div>
                    <div className="debug-item">
                        <span className="debug-label">Fetch Loading:</span>
                        <span className="debug-value">{fetchLoading.toString()}</span>
                    </div>
                    <div className="debug-item">
                        <span className="debug-label">Add Loading:</span>
                        <span className="debug-value">{addLoading.toString()}</span>
                    </div>
                    <div className="debug-item">
                        <span className="debug-label">Update Loading:</span>
                        <span className="debug-value">{updateLoading.toString()}</span>
                    </div>
                    <div className="debug-item">
                        <span className="debug-label">Delete Loading:</span>
                        <span className="debug-value">{deleteLoading.toString()}</span>
                    </div>
                    <div className="debug-item">
                        <span className="debug-label">Error:</span>
                        <span className="debug-value">{error || 'None'}</span>
                    </div>
                    <div className="debug-item">
                        <span className="debug-label">Selected User:</span>
                        <span className="debug-value">{selectedUser?.name || 'None'}</span>
                    </div>
                </div>
            </div>

            {/* RTK Benefits Notice */}
            <div className="rtk-benefits">
                <h4>🚀 RTK Benefits in This Component:</h4>
                <ul>
                    <li>✅ Automatic action types generation</li>
                    <li>✅ Built-in loading states (pending/fulfilled/rejected)</li>
                    <li>✅ Immer integration for immutable updates</li>
                    <li>✅ Memoized selectors with createSelector</li>
                    <li>✅ Less boilerplate code</li>
                    <li>✅ Better TypeScript support</li>
                    <li>✅ Automatic Redux DevTools integration</li>
                </ul>
            </div>
        </div>
    );
};

export default UserListRTK;