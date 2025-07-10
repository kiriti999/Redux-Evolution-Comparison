// ===================================================================
// src/App.js - Complete comparison app with RTK Query (FIXED)
// ===================================================================
import React, { useState } from 'react';
import { Provider } from 'react-redux';

// Import all five stores
import classicalStore from './store/classical';
import modernStore from './store/modern';
import rtkStore from './store/rtk';
import hocHellStore from './store/hocHell';
import rtkQueryStore from './store/rtk/rtkQuery'; // Fixed: Import the correct RTK Query store

// Import all five components
import UserListClassical from './components/classical/UserListClassical';
import UserListModern from './components/modern/UserListModern';
import UserListRTK from './components/rtk/UserListRTK';
import UserListHOCHell from './components/hocHell/UserListHOCHell';
import UserListRTKQuery from './components/rtkQuery/UserListRTKQuery';

import './App.css';

// Error Boundary Component for each tab
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`Error in ${this.props.tabName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong in {this.props.tabName}</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.toString()}</pre>
          </details>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [activeTab, setActiveTab] = useState('classical');

  const tabs = [
    { id: 'classical', label: 'Classical Redux', component: UserListClassical, store: classicalStore },
    { id: 'modern', label: 'Modern Hooks', component: UserListModern, store: modernStore },
    { id: 'rtk', label: 'Redux Toolkit', component: UserListRTK, store: rtkStore },
    { id: 'hocHell', label: 'HOC Hell', component: UserListHOCHell, store: hocHellStore },
    { id: 'rtkQuery', label: 'RTK Query', component: UserListRTKQuery, store: rtkQueryStore }
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);
  const CurrentComponent = currentTab.component;
  const currentStore = currentTab.store;

  return (
    <div className="App">
      <header className="App-header">
        <h1>Redux Evolution Comparison</h1>
        <p>Compare Classical Redux, Modern Hooks, Redux Toolkit, HOC Hell, and RTK Query</p>
        <div className="header-info">
          <span className="current-tab">Current: {currentTab.label}</span>
          {activeTab === 'rtkQuery' && (
            <span className="backend-status">
              📡 Backend required on port 4000
            </span>
          )}
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
            {tab.id === 'rtkQuery' && <span className="badge">API</span>}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <main className="tab-content">
        <Provider store={currentStore}>
          <ErrorBoundary tabName={currentTab.label}>
            <CurrentComponent />
          </ErrorBoundary>
        </Provider>
      </main>

      {/* Comparison Footer */}
      <footer className="comparison-footer">
        <div className="comparison-grid">
          <div className="comparison-item">
            <h3>🏛️ Classical Redux</h3>
            <ul>
              <li>connect() HOC</li>
              <li>mapStateToProps</li>
              <li>mapDispatchToProps</li>
              <li>Manual action types</li>
              <li>Hand-written reducers</li>
              <li>Class components</li>
            </ul>
            <div className="complexity-meter">
              <span>Complexity: </span>
              <div className="meter high">●●●●●</div>
            </div>
          </div>

          <div className="comparison-item">
            <h3>🆕 Modern Hooks</h3>
            <ul>
              <li>useSelector hook</li>
              <li>useDispatch hook</li>
              <li>Function components</li>
              <li>Same logic, cleaner syntax</li>
              <li>Direct store access</li>
              <li>No HOC wrapper</li>
            </ul>
            <div className="complexity-meter">
              <span>Complexity: </span>
              <div className="meter medium">●●●○○</div>
            </div>
          </div>

          <div className="comparison-item">
            <h3>🚀 Redux Toolkit</h3>
            <ul>
              <li>createSlice</li>
              <li>createAsyncThunk</li>
              <li>Immer integration</li>
              <li>Auto-generated actions</li>
              <li>Built-in best practices</li>
              <li>Minimal boilerplate</li>
            </ul>
            <div className="complexity-meter">
              <span>Complexity: </span>
              <div className="meter low">●●○○○</div>
            </div>
          </div>

          <div className="comparison-item">
            <h3>😱 HOC Hell</h3>
            <ul>
              <li>Multiple nested HOCs</li>
              <li>Deep component trees</li>
              <li>Debugging nightmare</li>
              <li>Performance issues</li>
              <li>Props drilling</li>
              <li>Hard to trace data flow</li>
            </ul>
            <div className="complexity-meter">
              <span>Complexity: </span>
              <div className="meter extreme">●●●●●</div>
            </div>
          </div>

          <div className="comparison-item">
            <h3>⚡ RTK Query</h3>
            <ul>
              <li>Automatic caching</li>
              <li>Background refetching</li>
              <li>Optimistic updates</li>
              <li>Generated hooks</li>
              <li>Built-in loading states</li>
              <li>Minimal API code</li>
            </ul>
            <div className="complexity-meter">
              <span>Complexity: </span>
              <div className="meter low">●○○○○</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;