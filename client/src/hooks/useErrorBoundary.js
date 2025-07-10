// ===================================================================
// src/hooks/useErrorBoundary.js - Error Boundary Hook
// ===================================================================

import { useState, useCallback } from 'react';

export function useErrorBoundary() {
    const [error, setError] = useState(null);

    const resetError = useCallback(() => {
        setError(null);
    }, []);

    const captureError = useCallback((error) => {
        console.error('❌ useErrorBoundary: Error captured', error);
        setError(error);
    }, []);

    // Throw error to trigger error boundary
    if (error) {
        throw error;
    }

    return {
        captureError,
        resetError
    };
}