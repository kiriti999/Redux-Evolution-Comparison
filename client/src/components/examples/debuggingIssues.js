/* eslint-disable no-undef */
// --- REAL WORLD EXAMPLE: E-commerce Product Page ---
// Shows how wrapper hell happens in real applications

import React, { Component } from 'react';
import { connect, compose } from 'react-redux';

// All the HOCs a product page might need:
const ProductPage = ({ product, user, cart, recommendations }) => (
    <div>
        <h1>{product.name}</h1>
        <p>{product.price}</p>
        <button>Add to Cart</button>
    </div>
);

// The wrapper hell for a real product page:
const EnhancedProductPage = compose(
    connect(mapStateToProps, mapDispatchToProps),
    withRouter,
    withAuth,
    withLoading,
    withErrorBoundary,
    withAnalytics,
    withABTesting,
    withFeatureFlags,
    withGeoLocation,
    withDeviceDetection,
    withCacheInvalidation,
    withRealTimeUpdates
)(ProductPage);

// React DevTools shows:
/*
<Connect(WithRouter(WithAuth(WithLoading(WithErrorBoundary(WithAnalytics(WithABTesting(WithFeatureFlags(WithGeoLocation(WithDeviceDetection(WithCacheInvalidation(WithRealTimeUpdates(ProductPage)))))))))))))>
  ... 12 levels of nesting ...
    <ProductPage />
  ... 12 levels of nesting ...
</Connect>
*/

// --- DEBUGGING ISSUES ---
// Common problems when debugging HOC wrapper hell:

// 1. Props not reaching the component
const BuggyHOC = (WrappedComponent) => {
    return class extends React.Component {
        render() {
            // BUG: Forgot to spread props
            return <WrappedComponent someHardcodedProp="value" />;
        }
    };
};

// 2. Display names not set properly
const UnnamedHOC = (WrappedComponent) => {
    const Enhanced = class extends React.Component {
        render() {
            return <WrappedComponent {...this.props} />;
        }
    };

    // Without this, React DevTools shows <Unknown>
    Enhanced.displayName = `UnnamedHOC(${WrappedComponent.displayName || WrappedComponent.name})`;

    return Enhanced;
};

// 3. Ref forwarding issues
const HOCWithoutRefForwarding = (WrappedComponent) => {
    return class extends React.Component {
        render() {
            // BUG: Refs don't work because they're not forwarded
            return <WrappedComponent {...this.props} />;
        }
    };
};

// Fixed version with ref forwarding
const HOCWithRefForwarding = (WrappedComponent) => {
    const Enhanced = React.forwardRef((props, ref) => {
        return <WrappedComponent {...props} ref={ref} />;
    });

    Enhanced.displayName = `HOCWithRefForwarding(${WrappedComponent.displayName || WrappedComponent.name})`;

    return Enhanced;
};