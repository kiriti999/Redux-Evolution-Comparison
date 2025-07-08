// src/App.js
import React from 'react';
import { Provider } from 'react-redux';
import store from './store/classical';
import UserListClassical from './components/classical/UserListClassical';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <header className="App-header">
          <h1>Redux Learning Project</h1>
          <p>Classical Redux with connect() and mapStateToProps</p>
        </header>
        
        <main className="App-main">
          <UserListClassical />
        </main>
        
        <footer className="App-footer">
          <p>
            This demonstrates the classical Redux pattern with:
            connect(), mapStateToProps, mapDispatchToProps, and class components
          </p>
        </footer>
      </div>
    </Provider>
  );
}

export default App;