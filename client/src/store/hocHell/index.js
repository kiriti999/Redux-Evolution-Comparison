// src/store/hocHell.js - HOC Hell store (same as classical for comparison)
// Store
import { createStore } from 'redux';

const initialState = {
    users: [
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com', active: true },
        { id: 2, name: 'Bob Smith', email: 'bob@example.com', active: false },
        { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', active: true }
    ],
    loading: false,
    error: null,
    filter: 'all'
};

// Action types
const ADD_USER = 'ADD_USER';
const TOGGLE_USER = 'TOGGLE_USER';
const DELETE_USER = 'DELETE_USER';
const SET_FILTER = 'SET_FILTER';
const SET_LOADING = 'SET_LOADING';
const SET_ERROR = 'SET_ERROR';

// Action creators
export const addUser = (user) => ({
    type: ADD_USER,
    payload: user
});

export const toggleUser = (id) => ({
    type: TOGGLE_USER,
    payload: id
});

export const deleteUser = (id) => ({
    type: DELETE_USER,
    payload: id
});

export const setFilter = (filter) => ({
    type: SET_FILTER,
    payload: filter
});

export const setLoading = (loading) => ({
    type: SET_LOADING,
    payload: loading
});

export const setError = (error) => ({
    type: SET_ERROR,
    payload: error
});

// Reducer
const hocHellReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_USER:
            return {
                ...state,
                users: [...state.users, { ...action.payload, id: Date.now() }]
            };
        case TOGGLE_USER:
            return {
                ...state,
                users: state.users.map(user =>
                    user.id === action.payload ? { ...user, active: !user.active } : user
                )
            };
        case DELETE_USER:
            return {
                ...state,
                users: state.users.filter(user => user.id !== action.payload)
            };
        case SET_FILTER:
            return {
                ...state,
                filter: action.payload
            };
        case SET_LOADING:
            return {
                ...state,
                loading: action.payload
            };
        case SET_ERROR:
            return {
                ...state,
                error: action.payload
            };
        default:
            return state;
    }
};


const hocHellStore = createStore(hocHellReducer);

export default hocHellStore;
