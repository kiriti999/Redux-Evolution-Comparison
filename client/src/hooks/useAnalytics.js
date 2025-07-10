// ===================================================================
// src/hooks/useAnalytics.js - Analytics hook (replaces withAnalytics HOC)
// ===================================================================

import { useCallback } from 'react';

export function useAnalytics() {
    const trackEvent = useCallback((eventName, data = {}) => {
        console.log(`📊 Analytics: ${eventName}`, data);

        // Mock analytics tracking
        if (window.gtag) {
            window.gtag('event', eventName, data);
        }

        // Mock other analytics services
        if (window.mixpanel) {
            window.mixpanel.track(eventName, data);
        }

        // Custom analytics logic
        const analyticsData = {
            event: eventName,
            timestamp: new Date().toISOString(),
            data,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        // In real app, you might send this to your analytics service
        console.log('📊 Analytics payload:', analyticsData);
    }, []);

    const trackPageView = useCallback((page) => {
        console.log('📊 Analytics: Page view', page);
        trackEvent('page_view', { page });
    }, [trackEvent]);

    const trackUserInteraction = useCallback((element, action) => {
        console.log('📊 Analytics: User interaction', element, action);
        trackEvent('user_interaction', { element, action });
    }, [trackEvent]);

    return {
        trackEvent,
        trackPageView,
        trackUserInteraction
    };
}
