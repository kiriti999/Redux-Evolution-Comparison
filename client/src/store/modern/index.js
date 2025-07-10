// src/store/modern/index.js
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// Action Types (same as classical)
export const USER_ACTIONS = {
    FETCH_USERS_REQUEST: 'FETCH_USERS_REQUEST',
    FETCH_USERS_SUCCESS: 'FETCH_USERS_SUCCESS',
    FETCH_USERS_FAILURE: 'FETCH_USERS_FAILURE',
    ADD_USER_REQUEST: 'ADD_USER_REQUEST',
    ADD_USER_SUCCESS: 'ADD_USER_SUCCESS',
    ADD_USER_FAILURE: 'ADD_USER_FAILURE',
    UPDATE_USER_REQUEST: 'UPDATE_USER_REQUEST',
    UPDATE_USER_SUCCESS: 'UPDATE_USER_SUCCESS',
    UPDATE_USER_FAILURE: 'UPDATE_USER_FAILURE',
    DELETE_USER_REQUEST: 'DELETE_USER_REQUEST',
    DELETE_USER_SUCCESS: 'DELETE_USER_SUCCESS',
    DELETE_USER_FAILURE: 'DELETE_USER_FAILURE',
    CLEAR_ERROR: 'CLEAR_ERROR'
};

// Action Creators (same as classical)
export const userActions = {
    fetchUsersRequest: () => ({ type: USER_ACTIONS.FETCH_USERS_REQUEST }),
    fetchUsersSuccess: (users) => ({ type: USER_ACTIONS.FETCH_USERS_SUCCESS, payload: users }),
    fetchUsersFailure: (error) => ({ type: USER_ACTIONS.FETCH_USERS_FAILURE, payload: error }),

    addUserRequest: () => ({ type: USER_ACTIONS.ADD_USER_REQUEST }),
    addUserSuccess: (user) => ({ type: USER_ACTIONS.ADD_USER_SUCCESS, payload: user }),
    addUserFailure: (error) => ({ type: USER_ACTIONS.ADD_USER_FAILURE, payload: error }),

    updateUserRequest: () => ({ type: USER_ACTIONS.UPDATE_USER_REQUEST }),
    updateUserSuccess: (user) => ({ type: USER_ACTIONS.UPDATE_USER_SUCCESS, payload: user }),
    updateUserFailure: (error) => ({ type: USER_ACTIONS.UPDATE_USER_FAILURE, payload: error }),

    deleteUserRequest: () => ({ type: USER_ACTIONS.DELETE_USER_REQUEST }),
    deleteUserSuccess: (userId) => ({ type: USER_ACTIONS.DELETE_USER_SUCCESS, payload: userId }),
    deleteUserFailure: (error) => ({ type: USER_ACTIONS.DELETE_USER_FAILURE, payload: error }),

    clearError: () => ({ type: USER_ACTIONS.CLEAR_ERROR })
};

// Thunk Actions (same as classical but exported for direct use)
export const fetchUsers = () => async (dispatch) => {
    dispatch(userActions.fetchUsersRequest());
    try {
        const response = await fetch(`${API_BASE_URL}/api/users`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        dispatch(userActions.fetchUsersSuccess(data.users || data));
    } catch (error) {
        dispatch(userActions.fetchUsersFailure(error.message));
    }
};

export const addUser = (userData) => async (dispatch) => {
    dispatch(userActions.addUserRequest());
    try {
        const response = await fetch(`${API_BASE_URL}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const user = await response.json();
        dispatch(userActions.addUserSuccess(user));
    } catch (error) {
        dispatch(userActions.addUserFailure(error.message));
    }
};

export const updateUser = ({ id, userData }) => async (dispatch) => {
    dispatch(userActions.updateUserRequest());
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const user = await response.json();
        dispatch(userActions.updateUserSuccess(user));
    } catch (error) {
        dispatch(userActions.updateUserFailure(error.message));
    }
};

export const deleteUser = (id) => async (dispatch) => {
    dispatch(userActions.deleteUserRequest());
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        dispatch(userActions.deleteUserSuccess(id));
    } catch (error) {
        dispatch(userActions.deleteUserFailure(error.message));
    }
};

// Selectors (NEW: Exported for reuse)
export const selectUsers = (state) => state.users.users;
export const selectUsersLoading = (state) => state.users.loading;
export const selectUsersError = (state) => state.users.error;
export const selectUserById = (state, userId) =>
    state.users.users.find(user => user._id === userId);

// Enhanced selectors with memoization (using simple caching)
let cachedActiveUsers = null;
let lastUsers = null;

export const selectActiveUsers = (state) => {
    const currentUsers = state.users.users;
    if (currentUsers !== lastUsers) {
        cachedActiveUsers = currentUsers.filter(user => user.isActive);
        lastUsers = currentUsers;
    }
    return cachedActiveUsers;
};

// Reducer (same as classical)
const initialUserState = {
    users: [],
    loading: false,
    error: null
};

const userReducer = (state = initialUserState, action) => {
    switch (action.type) {
        case USER_ACTIONS.FETCH_USERS_REQUEST:
        case USER_ACTIONS.ADD_USER_REQUEST:
        case USER_ACTIONS.UPDATE_USER_REQUEST:
        case USER_ACTIONS.DELETE_USER_REQUEST:
            return { ...state, loading: true, error: null };

        case USER_ACTIONS.FETCH_USERS_SUCCESS:
            return { ...state, loading: false, users: action.payload };

        case USER_ACTIONS.ADD_USER_SUCCESS:
            return { ...state, loading: false, users: [...state.users, action.payload] };

        case USER_ACTIONS.UPDATE_USER_SUCCESS:
            return {
                ...state,
                loading: false,
                users: state.users.map(user =>
                    user._id === action.payload._id ? action.payload : user
                )
            };

        case USER_ACTIONS.DELETE_USER_SUCCESS:
            return {
                ...state,
                loading: false,
                users: state.users.filter(user => user._id !== action.payload)
            };

        case USER_ACTIONS.FETCH_USERS_FAILURE:
        case USER_ACTIONS.ADD_USER_FAILURE:
        case USER_ACTIONS.UPDATE_USER_FAILURE:
        case USER_ACTIONS.DELETE_USER_FAILURE:
            return { ...state, loading: false, error: action.payload };

        case USER_ACTIONS.CLEAR_ERROR:
            return { ...state, error: null };

        default:
            return state;
    }
};

// Root Reducer
const rootReducer = combineReducers({
    users: userReducer
});

// Store
const store = createStore(
    rootReducer,
    composeWithDevTools(applyMiddleware(thunk))
);

export default store;