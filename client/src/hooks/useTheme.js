// ===================================================================
// src/hooks/useTheme.js - Theme hook (replaces withTheme HOC)
// ===================================================================

import { useState, useEffect } from 'react';

export function useTheme() {
    const [theme, setTheme] = useState({
        primary: '#007bff',
        secondary: '#6c757d',
        background: '#ffffff',
        text: '#212529',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    });

    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        console.log('🎨 useTheme: Hook initialized');
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setDarkMode(savedTheme === 'dark');
        }
    }, []);

    useEffect(() => {
        if (darkMode) {
            setTheme({
                primary: '#0d6efd',
                secondary: '#6c757d',
                background: '#212529',
                text: '#ffffff',
                success: '#198754',
                danger: '#dc3545',
                warning: '#ffc107',
                info: '#0dcaf0'
            });
        } else {
            setTheme({
                primary: '#007bff',
                secondary: '#6c757d',
                background: '#ffffff',
                text: '#212529',
                success: '#28a745',
                danger: '#dc3545',
                warning: '#ffc107',
                info: '#17a2b8'
            });
        }
    }, [darkMode]);

    const toggleTheme = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
        console.log('🎨 useTheme: Theme toggled to', newDarkMode ? 'dark' : 'light');
    };

    return {
        theme,
        darkMode,
        toggleTheme
    };
}