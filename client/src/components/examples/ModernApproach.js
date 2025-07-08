// --- SOLUTION: Modern Hooks Approach ---
// Compare the clean hooks version

import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useLoading } from './hooks/useLoading';
import { useAnalytics } from './hooks/useAnalytics';
import { useErrorBoundary } from './hooks/useErrorBoundary';
import { fetchUsers } from '../../store/classical';

const ModernUserDashboard = () => {
    // All the same functionality, but as hooks
    const user = useSelector(state => state.user.current);
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const isLoading = useSelector(state => state.user.loading);
    const posts = useSelector(state => state.posts.items);
    const notifications = useSelector(state => state.notifications.items);

    const dispatch = useDispatch();
    const history = useHistory();

    // Custom hooks for cross-cutting concerns
    useAuth(isAuthenticated, history);
    useLoading(isLoading);
    useAnalytics('UserDashboard');
    useErrorBoundary();

    const fetchUser = (id) => dispatch(fetchUsers(id));
    const fetchPosts = () => dispatch(fetchPosts());

    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            <h1>Welcome, {user?.name}</h1>
            <div>Posts: {posts.length}</div>
            <div>Notifications: {notifications.length}</div>
        </div>
    );
};