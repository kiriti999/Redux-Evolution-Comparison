# 🚀 Complete Redux Learning Setup Guide

This guide provides **three complete implementations** of the same functionality using different Redux approaches, so you can compare and understand the evolution of Redux patterns.

## 📁 Project Structure

```
redux-learning-project/
├── server/                           # Backend (shared for all approaches)
│   ├── server.js                     # Express server with User API
│   ├── package.json                  # Server dependencies
│   └── .env                          # MongoDB connection
├── client/                           # Frontend with all three approaches
│   ├── src/
│   │   ├── components/
│   │   │   ├── classical/
│   │   │   │   └── UserListClassical.js    # connect() + mapStateToProps
│   │   │   ├── modern/
│   │   │   │   └── UserListModern.js       # useSelector + useDispatch
│   │   │   └── rtk/
│   │   │       └── UserListRTK.js          # Redux Toolkit
│   │   ├── store/
│   │   │   ├── classical/
│   │   │   │   └── index.js                # Classical Redux store
│   │   │   ├── modern/
│   │   │   │   └── index.js                # Modern Redux store
│   │   │   └── rtk/
│   │   │       ├── index.js                # RTK store
│   │   │       └── userSlice.js            # RTK slice
│   │   ├── App.js                          # Tab-based comparison app
│   │   ├── App.css                         # Enhanced styling
│   │   └── index.js                        # React entry point
│   └── package.json                        # Frontend dependencies
└── README.md
```

## 🔧 Installation Steps

### 1. Install Backend Dependencies
```bash
cd server
npm install express mongoose dotenv cors helmet morgan bcryptjs jsonwebtoken express-rate-limit
npm install -D nodemon
```

### 2. Install Frontend Dependencies

**For Classical Redux:**
```bash
cd client
npm install react react-dom react-scripts
npm install redux react-redux redux-thunk redux-devtools-extension
```

**For Modern Hooks (same as classical):**
```bash
# Already installed above
```

**For Redux Toolkit:**
```bash
npm install @reduxjs/toolkit
# react-redux is already installed
```

### 3. Environment Setup

**Backend `.env` file:**
```