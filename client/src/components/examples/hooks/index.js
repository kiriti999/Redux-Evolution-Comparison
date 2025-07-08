/* eslint-disable no-undef */
// --- CUSTOM HOOKS IMPLEMENTATION ---
// Much cleaner and more testable

import { useEffect } from 'react';

const useAuth = (isAuthenticated, history) => {
    useEffect(() => {
        if (!isAuthenticated) {
            history.push('/login');
        }
    }, [isAuthenticated, history]);
};

const useAnalytics = (componentName) => {
    useEffect(() => {
        analytics.track('component_mounted', { component: componentName });

        return () => {
            analytics.track('component_unmounted', { component: componentName });
        };
    }, [componentName]);
};

const useErrorBoundary = () => {
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleError = (error) => {
            setError(error);
        };

        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

    if (error) {
        return <div>Something went wrong: {error.message}</div>;
    }
};