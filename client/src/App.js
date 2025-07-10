// src/App.js - Complete comparison app
import React, { useState } from 'react';
import { Provider } from 'react-redux';

// Import all three stores
import classicalStore from './store/classical';
import modernStore from './store/modern';
import rtkStore from './store/rtk';

// Import all three components
import UserListClassical from './components/classical/UserListClassical';
import UserListModern from './components/modern/UserListModern';
import UserListRTK from './components/rtk/UserListRTK';

import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('classical');

  const tabs = [
    { id: 'classical', label: 'Classical Redux', component: UserListClassical, store: classicalStore },
    { id: 'modern', label: 'Modern Hooks', component: UserListModern, store: modernStore },
    { id: 'rtk', label: 'Redux Toolkit', component: UserListRTK, store: rtkStore }
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);
  const CurrentComponent = currentTab.component;
  const currentStore = currentTab.store;

  return (
    <div className="App">
      <header className="App-header">
        <h1>Redux Evolution Comparison</h1>
        <p>Compare Classical Redux, Modern Hooks, and Redux Toolkit</p>
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
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <main className="tab-content">
        <Provider store={currentStore}>
          <CurrentComponent />
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
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;