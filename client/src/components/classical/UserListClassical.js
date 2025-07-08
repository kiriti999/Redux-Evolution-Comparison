// src/components/classical/UserListClassical.js
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchUsers, addUser, updateUser, deleteUser, userActions } from '../../store/classical';

class UserListClassical extends Component {
    componentDidMount() {
        this.props.fetchUsers();
    }

    handleAddUser = () => {
        const userData = {
            name: 'New User',
            email: `user${Date.now()}@example.com`,
            role: 'user'
        };
        this.props.addUser(userData);
    };

    handleUpdateUser = (user) => {
        const updatedData = {
            ...user,
            name: `${user.name} (Updated)`,
            updatedAt: new Date().toISOString()
        };
        this.props.updateUser(user._id, updatedData);
    };

    handleDeleteUser = (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            this.props.deleteUser(userId);
        }
    };

    handleSelectUser = (user) => {
        this.props.setSelectedUser(user);
    };

    handleClearSelection = () => {
        this.props.clearSelectedUser();
    };

    render() {
        const { users, selectedUser, loading, error } = this.props;

        if (loading) {
            return <div className="loading">Loading users...</div>;
        }

        if (error) {
            return <div className="error">Error: {error}</div>;
        }

        return (
            <div className="user-list-classical">
                <h2>Users - Classical Redux (connect + mapStateToProps)</h2>

                <div className="actions">
                    <button onClick={this.handleAddUser} className="add-btn">
                        Add User
                    </button>
                    {selectedUser && (
                        <button onClick={this.handleClearSelection} className="clear-btn">
                            Clear Selection
                        </button>
                    )}
                </div>

                <div className="user-grid">
                    {users.map(user => (
                        <div
                            key={user._id}
                            className={`user-card ${selectedUser?._id === user._id ? 'selected' : ''}`}
                            onClick={() => this.handleSelectUser(user)}
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
                                        this.handleUpdateUser(user);
                                    }}
                                    className="update-btn"
                                >
                                    Update
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        this.handleDeleteUser(user._id);
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
                    <h4>Debug Info (Classical Redux):</h4>
                    <p>Total users: {users.length}</p>
                    <p>Loading: {loading.toString()}</p>
                    <p>Error: {error || 'None'}</p>
                    <p>Selected user: {selectedUser?.name || 'None'}</p>
                </div>
            </div>
        );
    }
}

// 🏛️ CLASSICAL REDUX: mapStateToProps and mapDispatchToProps

// mapStateToProps - Maps Redux state to component props
const mapStateToProps = (state) => {
    return {
        users: state.users.users,
        selectedUser: state.users.selectedUser,
        loading: state.users.loading,
        error: state.users.error
    };
};

// mapDispatchToProps - Maps action creators to component props
const mapDispatchToProps = (dispatch) => {
    return {
        // Async thunk actions
        fetchUsers: () => dispatch(fetchUsers()),
        addUser: (userData) => dispatch(addUser(userData)),
        updateUser: (id, userData) => dispatch(updateUser(id, userData)),
        deleteUser: (id) => dispatch(deleteUser(id)),

        // Synchronous actions
        setSelectedUser: (user) => dispatch(userActions.setSelectedUser(user)),
        clearSelectedUser: () => dispatch(userActions.clearSelectedUser())
    };
};

// Connect the component to Redux store
export default connect(mapStateToProps, mapDispatchToProps)(UserListClassical);