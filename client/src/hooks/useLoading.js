// ===================================================================
// src/hooks/useLoading.js - Loading hook (replaces withLoading HOC)
// ===================================================================

import { useState, useCallback } from 'react';

export function useLoading() {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Loading...');

    const startLoading = useCallback((message = 'Loading...') => {
        console.log('⏳ useLoading: Starting loading', message);
        setLoadingMessage(message);
        setIsLoading(true);
    }, []);

    const stopLoading = useCallback(() => {
        console.log('⏳ useLoading: Stopping loading');
        setIsLoading(false);
    }, []);

    const withLoading = useCallback(async (asyncFunction, message = 'Loading...') => {
        startLoading(message);
        try {
            const result = await asyncFunction();
            return result;
        } finally {
            stopLoading();
        }
    }, [startLoading, stopLoading]);

    return {
        isLoading,
        loadingMessage,
        startLoading,
        stopLoading,
        withLoading
    };
}