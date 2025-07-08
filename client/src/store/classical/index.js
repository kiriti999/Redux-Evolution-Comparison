// src/store/classical/index.js
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

// API base URL - adjust based on your backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// Action Types
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
    SET_SELECTED_USER: 'SET_SELECTED_USER',
    CLEAR_SELECTED_USER: 'CLEAR_SELECTED_USER'
};

export const PRODUCT_ACTIONS = {
    FETCH_PRODUCTS_REQUEST: 'FETCH_PRODUCTS_REQUEST',
    FETCH_PRODUCTS_SUCCESS: 'FETCH_PRODUCTS_SUCCESS',
    FETCH_PRODUCTS_FAILURE: 'FETCH_PRODUCTS_FAILURE',
    ADD_PRODUCT_REQUEST: 'ADD_PRODUCT_REQUEST',
    ADD_PRODUCT_SUCCESS: 'ADD_PRODUCT_SUCCESS',
    ADD_PRODUCT_FAILURE: 'ADD_PRODUCT_FAILURE',
    UPDATE_PRODUCT_REQUEST: 'UPDATE_PRODUCT_REQUEST',
    UPDATE_PRODUCT_SUCCESS: 'UPDATE_PRODUCT_SUCCESS',
    UPDATE_PRODUCT_FAILURE: 'UPDATE_PRODUCT_FAILURE',
    DELETE_PRODUCT_REQUEST: 'DELETE_PRODUCT_REQUEST',
    DELETE_PRODUCT_SUCCESS: 'DELETE_PRODUCT_SUCCESS',
    DELETE_PRODUCT_FAILURE: 'DELETE_PRODUCT_FAILURE',
    SET_SELECTED_PRODUCT: 'SET_SELECTED_PRODUCT',
    CLEAR_SELECTED_PRODUCT: 'CLEAR_SELECTED_PRODUCT'
};

// Action Creators
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

    setSelectedUser: (user) => ({ type: USER_ACTIONS.SET_SELECTED_USER, payload: user }),
    clearSelectedUser: () => ({ type: USER_ACTIONS.CLEAR_SELECTED_USER })
};

export const productActions = {
    fetchProductsRequest: () => ({ type: PRODUCT_ACTIONS.FETCH_PRODUCTS_REQUEST }),
    fetchProductsSuccess: (products) => ({ type: PRODUCT_ACTIONS.FETCH_PRODUCTS_SUCCESS, payload: products }),
    fetchProductsFailure: (error) => ({ type: PRODUCT_ACTIONS.FETCH_PRODUCTS_FAILURE, payload: error }),

    addProductRequest: () => ({ type: PRODUCT_ACTIONS.ADD_PRODUCT_REQUEST }),
    addProductSuccess: (product) => ({ type: PRODUCT_ACTIONS.ADD_PRODUCT_SUCCESS, payload: product }),
    addProductFailure: (error) => ({ type: PRODUCT_ACTIONS.ADD_PRODUCT_FAILURE, payload: error }),

    updateProductRequest: () => ({ type: PRODUCT_ACTIONS.UPDATE_PRODUCT_REQUEST }),
    updateProductSuccess: (product) => ({ type: PRODUCT_ACTIONS.UPDATE_PRODUCT_SUCCESS, payload: product }),
    updateProductFailure: (error) => ({ type: PRODUCT_ACTIONS.UPDATE_PRODUCT_FAILURE, payload: error }),

    deleteProductRequest: () => ({ type: PRODUCT_ACTIONS.DELETE_PRODUCT_REQUEST }),
    deleteProductSuccess: (productId) => ({ type: PRODUCT_ACTIONS.DELETE_PRODUCT_SUCCESS, payload: productId }),
    deleteProductFailure: (error) => ({ type: PRODUCT_ACTIONS.DELETE_PRODUCT_FAILURE, payload: error }),

    setSelectedProduct: (product) => ({ type: PRODUCT_ACTIONS.SET_SELECTED_PRODUCT, payload: product }),
    clearSelectedProduct: () => ({ type: PRODUCT_ACTIONS.CLEAR_SELECTED_PRODUCT })
};

// Thunk Actions (Async Actions)
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

export const updateUser = (id, userData) => async (dispatch) => {
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

export const fetchProducts = () => async (dispatch) => {
    dispatch(productActions.fetchProductsRequest());
    try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        dispatch(productActions.fetchProductsSuccess(data.products || data));
    } catch (error) {
        dispatch(productActions.fetchProductsFailure(error.message));
    }
};

export const addProduct = (productData) => async (dispatch) => {
    dispatch(productActions.addProductRequest());
    try {
        const response = await fetch(`${API_BASE_URL}/api/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const product = await response.json();
        dispatch(productActions.addProductSuccess(product));
    } catch (error) {
        dispatch(productActions.addProductFailure(error.message));
    }
};

// Reducers
const initialUserState = {
    users: [],
    selectedUser: null,
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
                ),
                selectedUser: action.payload
            };

        case USER_ACTIONS.DELETE_USER_SUCCESS:
            return {
                ...state,
                loading: false,
                users: state.users.filter(user => user._id !== action.payload),
                selectedUser: null
            };

        case USER_ACTIONS.FETCH_USERS_FAILURE:
        case USER_ACTIONS.ADD_USER_FAILURE:
        case USER_ACTIONS.UPDATE_USER_FAILURE:
        case USER_ACTIONS.DELETE_USER_FAILURE:
            return { ...state, loading: false, error: action.payload };

        case USER_ACTIONS.SET_SELECTED_USER:
            return { ...state, selectedUser: action.payload };

        case USER_ACTIONS.CLEAR_SELECTED_USER:
            return { ...state, selectedUser: null };

        default:
            return state;
    }
};

const initialProductState = {
    products: [],
    selectedProduct: null,
    loading: false,
    error: null
};

const productReducer = (state = initialProductState, action) => {
    switch (action.type) {
        case PRODUCT_ACTIONS.FETCH_PRODUCTS_REQUEST:
        case PRODUCT_ACTIONS.ADD_PRODUCT_REQUEST:
        case PRODUCT_ACTIONS.UPDATE_PRODUCT_REQUEST:
        case PRODUCT_ACTIONS.DELETE_PRODUCT_REQUEST:
            return { ...state, loading: true, error: null };

        case PRODUCT_ACTIONS.FETCH_PRODUCTS_SUCCESS:
            return { ...state, loading: false, products: action.payload };

        case PRODUCT_ACTIONS.ADD_PRODUCT_SUCCESS:
            return { ...state, loading: false, products: [...state.products, action.payload] };

        case PRODUCT_ACTIONS.UPDATE_PRODUCT_SUCCESS:
            return {
                ...state,
                loading: false,
                products: state.products.map(product =>
                    product._id === action.payload._id ? action.payload : product
                ),
                selectedProduct: action.payload
            };

        case PRODUCT_ACTIONS.DELETE_PRODUCT_SUCCESS:
            return {
                ...state,
                loading: false,
                products: state.products.filter(product => product._id !== action.payload),
                selectedProduct: null
            };

        case PRODUCT_ACTIONS.FETCH_PRODUCTS_FAILURE:
        case PRODUCT_ACTIONS.ADD_PRODUCT_FAILURE:
        case PRODUCT_ACTIONS.UPDATE_PRODUCT_FAILURE:
        case PRODUCT_ACTIONS.DELETE_PRODUCT_FAILURE:
            return { ...state, loading: false, error: action.payload };

        case PRODUCT_ACTIONS.SET_SELECTED_PRODUCT:
            return { ...state, selectedProduct: action.payload };

        case PRODUCT_ACTIONS.CLEAR_SELECTED_PRODUCT:
            return { ...state, selectedProduct: null };

        default:
            return state;
    }
};

// Root Reducer
const rootReducer = combineReducers({
    users: userReducer,
    products: productReducer
});

// Store
const store = createStore(
    rootReducer,
    composeWithDevTools(applyMiddleware(thunk))
);

export default store;