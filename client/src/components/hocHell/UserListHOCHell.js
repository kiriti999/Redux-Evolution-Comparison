// ===================================================================
// src/components/hocHell/UserListHOCHell.js - HOC Hell component
// ===================================================================

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { addUser, toggleUser, deleteUser, setFilter } from '../../store/hocHell';

// HOC 1: Authentication HOC
const withAuth = (WrappedComponent) => {
    return class WithAuth extends Component {
        constructor(props) {
            super(props);
            this.state = { isAuthenticated: true };
        }

        render() {
            console.log('🔐 withAuth HOC rendering');
            if (!this.state.isAuthenticated) {
                return <div>Please log in</div>;
            }
            return <WrappedComponent {...this.props} isAuthenticated={this.state.isAuthenticated} />;
        }
    };
};

// HOC 2: Loading HOC
const withLoading = (WrappedComponent) => {
    return class WithLoading extends Component {
        constructor(props) {
            super(props);
            this.state = { isLoading: false };
        }

        componentDidMount() {
            console.log('⏳ withLoading HOC mounted');
            this.setState({ isLoading: true });
            setTimeout(() => {
                this.setState({ isLoading: false });
            }, 1000);
        }

        render() {
            console.log('⏳ withLoading HOC rendering');
            if (this.state.isLoading) {
                return <div>Loading...</div>;
            }
            return <WrappedComponent {...this.props} isLoading={this.state.isLoading} />;
        }
    };
};

// HOC 3: Error Boundary HOC
const withErrorBoundary = (WrappedComponent) => {
    return class WithErrorBoundary extends Component {
        constructor(props) {
            super(props);
            this.state = { hasError: false };
        }

        static getDerivedStateFromError(error) {
            return { hasError: true };
        }

        componentDidCatch(error, errorInfo) {
            console.error('❌ Error caught by HOC:', error, errorInfo);
        }

        render() {
            console.log('❌ withErrorBoundary HOC rendering');
            if (this.state.hasError) {
                return <div>Something went wrong!</div>;
            }
            return <WrappedComponent {...this.props} />;
        }
    };
};

// HOC 4: Analytics HOC
const withAnalytics = (WrappedComponent) => {
    return class WithAnalytics extends Component {
        componentDidMount() {
            console.log('📊 withAnalytics HOC: Component mounted');
        }

        componentDidUpdate() {
            console.log('📊 withAnalytics HOC: Component updated');
        }

        trackEvent = (eventName, data) => {
            console.log(`📊 Analytics: ${eventName}`, data);
        };

        render() {
            console.log('📊 withAnalytics HOC rendering');
            return <WrappedComponent {...this.props} trackEvent={this.trackEvent} />;
        }
    };
};

// HOC 5: Theme HOC
const withTheme = (WrappedComponent) => {
    return class WithTheme extends Component {
        constructor(props) {
            super(props);
            this.state = {
                theme: {
                    primary: '#007bff',
                    secondary: '#6c757d',
                    background: '#ffffff',
                    text: '#212529'
                }
            };
        }

        render() {
            console.log('🎨 withTheme HOC rendering');
            return <WrappedComponent {...this.props} theme={this.state.theme} />;
        }
    };
};

// Base Component (the actual user list)
class UserListBase extends Component {
    constructor(props) {
        super(props);
        this.state = {
            newUserName: '',
            newUserEmail: ''
        };
    }

    componentDidMount() {
        console.log('👤 UserListBase: Component mounted');
        console.log('👤 UserListBase: Props received:', Object.keys(this.props));
    }

    handleSubmit = (e) => {
        e.preventDefault();
        if (this.state.newUserName && this.state.newUserEmail) {
            const newUser = {
                name: this.state.newUserName,
                email: this.state.newUserEmail,
                active: true
            };
            this.props.addUser(newUser);
            this.props.trackEvent('user_added', newUser);
            this.setState({ newUserName: '', newUserEmail: '' });
        }
    };

    handleToggle = (id) => {
        this.props.toggleUser(id);
        this.props.trackEvent('user_toggled', { id });
    };

    handleDelete = (id) => {
        this.props.deleteUser(id);
        this.props.trackEvent('user_deleted', { id });
    };

    render() {
        console.log('👤 UserListBase: Rendering with', this.props.users.length, 'users');

        const filteredUsers = this.props.users.filter(user => {
            if (this.props.filter === 'active') return user.active;
            if (this.props.filter === 'inactive') return !user.active;
            return true;
        });

        return (
            <div style={{
                backgroundColor: this.props.theme.background,
                color: this.props.theme.text,
                padding: '20px'
            }}>
                <h2>HOC Hell User Management</h2>
                <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <h4>🔍 DevTools Inspection Guide:</h4>
                    <p>Open Chrome DevTools → Components tab to see the HOC hell:</p>
                    <ul>
                        <li>WithAuth → WithLoading → WithErrorBoundary → WithAnalytics → WithTheme → Connect(UserListBase)</li>
                        <li>Notice how deep the component tree becomes</li>
                        <li>Each HOC adds its own wrapper making debugging difficult</li>
                        <li>Props are passed through multiple layers</li>
                    </ul>
                </div>

                <form onSubmit={this.handleSubmit} style={{ marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder="Name"
                        value={this.state.newUserName}
                        onChange={(e) => this.setState({ newUserName: e.target.value })}
                        style={{ marginRight: '10px' }}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={this.state.newUserEmail}
                        onChange={(e) => this.setState({ newUserEmail: e.target.value })}
                        style={{ marginRight: '10px' }}
                    />
                    <button type="submit">Add User</button>
                </form>

                <div style={{ marginBottom: '20px' }}>
                    <button
                        onClick={() => this.props.setFilter('all')}
                        style={{ backgroundColor: this.props.filter === 'all' ? this.props.theme.primary : '#e9ecef' }}
                    >
                        All ({this.props.users.length})
                    </button>
                    <button
                        onClick={() => this.props.setFilter('active')}
                        style={{ backgroundColor: this.props.filter === 'active' ? this.props.theme.primary : '#e9ecef', marginLeft: '10px' }}
                    >
                        Active ({this.props.users.filter(u => u.active).length})
                    </button>
                    <button
                        onClick={() => this.props.setFilter('inactive')}
                        style={{ backgroundColor: this.props.filter === 'inactive' ? this.props.theme.primary : '#e9ecef', marginLeft: '10px' }}
                    >
                        Inactive ({this.props.users.filter(u => !u.active).length})
                    </button>
                </div>

                <div>
                    {filteredUsers.map(user => (
                        <div key={user.id} style={{
                            border: '1px solid #ddd',
                            padding: '10px',
                            margin: '5px 0',
                            backgroundColor: user.active ? '#d4edda' : '#f8d7da'
                        }}>
                            <h4>{user.name}</h4>
                            <p>{user.email}</p>
                            <p>Status: {user.active ? 'Active' : 'Inactive'}</p>
                            <button onClick={() => this.handleToggle(user.id)}>
                                {user.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button onClick={() => this.handleDelete(user.id)} style={{ marginLeft: '10px' }}>
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

// Redux connect HOC
const mapStateToProps = (state) => ({
    users: state.users,
    loading: state.loading,
    error: state.error,
    filter: state.filter
});

const mapDispatchToProps = {
    addUser,
    toggleUser,
    deleteUser,
    setFilter
};

// The HOC Hell: Multiple HOCs wrapped around the component
// This creates a deep component tree that's hard to debug
const UserListHOCHell = withAuth(
    withLoading(
        withErrorBoundary(
            withAnalytics(
                withTheme(
                    connect(mapStateToProps, mapDispatchToProps)(UserListBase)
                )
            )
        )
    )
);

export default UserListHOCHell