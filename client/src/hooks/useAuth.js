// ===================================================================
// src/hooks/useAuth.js - Authentication hook (replaces withAuth HOC)
// ===================================================================

import { useState, useEffect } from 'react';

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        console.log('🔐 useAuth: Hook initialized');
        // Mock authentication check
        setUser({ id: 1, name: 'Current User', email: 'user@example.com' });
    }, []);

    const login = (credentials) => {
        console.log('🔐 useAuth: Logging in', credentials);
        setIsAuthenticated(true);
        setUser({ id: 1, name: 'Current User', email: 'user@example.com' });
    };

    const logout = () => {
        console.log('🔐 useAuth: Logging out');
        setIsAuthenticated(false);
        setUser(null);
    };

    return {
        isAuthenticated,
        user,
        login,
        logout
    };
}