/* eslint-disable no-undef */
// ===========================================
// HOC "WRAPPER HELL" EXAMPLES
// ===========================================

// --- PROBLEM: Multiple HOCs Creating Wrapper Hell ---

import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

// Multiple HOCs stacked together
const withAuth = (WrappedComponent) => {
    return class WithAuth extends React.Component {
        componentDidMount() {
            if (!this.props.isAuthenticated) {
                this.props.history.push('/login');
            }
        }

        render() {
            return this.props.isAuthenticated ? (
                <WrappedComponent {...this.props} />
            ) : null;
        }
    };
};

const withLoading = (WrappedComponent) => {
    return class WithLoading extends React.Component {
        render() {
            return this.props.isLoading ? (
                <div>Loading...</div>
            ) : (
                <WrappedComponent {...this.props} />
            );
        }
    };
};

const withErrorBoundary = (WrappedComponent) => {
    return class WithErrorBoundary extends React.Component {
        constructor(props) {
            super(props);
            this.state = { hasError: false };
        }

        componentDidCatch(error, errorInfo) {
            this.setState({ hasError: true });
            console.error('Error caught by boundary:', error, errorInfo);
        }

        render() {
            if (this.state.hasError) {
                return <div>Something went wrong.</div>;
            }
            return <WrappedComponent {...this.props} />;
        }
    };
};

const withAnalytics = (WrappedComponent) => {
    return class WithAnalytics extends React.Component {
        componentDidMount() {
            // Track component mount
            analytics.track('component_mounted', {
                component: WrappedComponent.name,
                props: this.props
            });
        }

        componentWillUnmount() {
            // Track component unmount
            analytics.track('component_unmounted', {
                component: WrappedComponent.name
            });
        }

        render() {
            return <WrappedComponent {...this.props} />;
        }
    };
};

// Redux mappers
const mapStateToProps = (state) => ({
    user: state.user.current,
    isAuthenticated: state.auth.isAuthenticated,
    isLoading: state.user.loading,
    posts: state.posts.items,
    notifications: state.notifications.items
});

const mapDispatchToProps = (dispatch) => ({
    fetchUser: (id) => dispatch(fetchUser(id)),
    fetchPosts: () => dispatch(fetchPosts()),
    markNotificationRead: (id) => dispatch(markNotificationRead(id))
});

// Simple base component
const UserDashboard = ({ user, posts, notifications, fetchUser, fetchPosts }) => {
    return (
        <div>
            <h1>Welcome, {user?.name}</h1>
            <div>Posts: {posts.length}</div>
            <div>Notifications: {notifications.length}</div>
        </div>
    );
};

// --- THE WRAPPER HELL ---
// This is what happens when you combine multiple HOCs:

// Method 1: Nested HOCs (Pyramid of doom)
const EnhancedUserDashboard = connect(
    mapStateToProps,
    mapDispatchToProps
)(
    withRouter(
        withAuth(
            withLoading(
                withErrorBoundary(
                    withAnalytics(UserDashboard)
                )
            )
        )
    )
);

// Method 2: Using compose (still complex)
const EnhancedUserDashboardComposed = compose(
    connect(mapStateToProps, mapDispatchToProps),
    withRouter,
    withAuth,
    withLoading,
    withErrorBoundary,
    withAnalytics
)(UserDashboard);

// --- DEBUGGING NIGHTMARE ---
// What the component tree looks like in React DevTools:

/*
<Connect(WithRouter(WithAuth(WithLoading(WithErrorBoundary(WithAnalytics(UserDashboard))))))>
  <WithRouter(WithAuth(WithLoading(WithErrorBoundary(WithAnalytics(UserDashboard)))))>
    <WithAuth(WithLoading(WithErrorBoundary(WithAnalytics(UserDashboard))))>
      <WithLoading(WithErrorBoundary(WithAnalytics(UserDashboard)))>
        <WithErrorBoundary(WithAnalytics(UserDashboard))>
          <WithAnalytics(UserDashboard)>
            <UserDashboard>
              <!-- Actual component content -->
            </UserDashboard>
          </WithAnalytics>
        </WithErrorBoundary>
      </WithLoading>
    </WithAuth>
  </WithRouter>
</Connect>
*/

// --- PROP DRILLING AND CONFUSION ---
// Props have to pass through multiple layers

const ProblematicHOC = (WrappedComponent) => {
    return class extends React.Component {
        render() {
            const { specialProp, ...restProps } = this.props;

            // This HOC consumes specialProp but forgets to pass it down
            // Or maybe it transforms it incorrectly
            return <WrappedComponent {...restProps} transformedProp={specialProp} />;
        }
    };
};

// Now debugging becomes a nightmare:
// - Where did my prop go?
// - Which HOC is modifying my props?
// - Why is my component not receiving expected props?

// --- PERFORMANCE ISSUES ---
// Each HOC creates a new component instance

const ExpensiveHOC = (WrappedComponent) => {
    return class extends React.Component {
        // This runs on every render of the parent
        expensiveCalculation = () => {
            return this.props.data.reduce((acc, item) => {
                return acc + item.value * Math.random(); // Expensive operation
            }, 0);
        };

        render() {
            const result = this.expensiveCalculation();
            return <WrappedComponent {...this.props} expensiveResult={result} />;
        }
    };
};

// Multiple expensive HOCs compound the problem
const MultipleExpensiveHOCs = compose(
    ExpensiveHOC,
    AnotherExpensiveHOC,
    YetAnotherExpensiveHOC
)(BaseComponent);