// src/store/rtk/userSlice.js
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// 🚀 RTK Async Thunks (Much cleaner than manual thunks!)
export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.users || data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addUser = createAsyncThunk(
    'users/addUser',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateUser = createAsyncThunk(
    'users/updateUser',
    async ({ id, userData }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return userId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 🎯 RTK Slice (Combines actions, action creators, and reducers!)
const userSlice = createSlice({
    name: 'users',
    initialState: {
        users: [],
        selectedUser: null,
        loading: false,
        error: null,
        // Additional loading states for specific operations
        fetchLoading: false,
        addLoading: false,
        updateLoading: false,
        deleteLoading: false
    },
    reducers: {
        // ✨ Synchronous actions (RTK uses Immer internally - direct mutations allowed!)
        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload;
        },
        clearSelectedUser: (state) => {
            state.selectedUser = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        // Local state actions (without API calls)
        addUserLocally: (state, action) => {
            state.users.push(action.payload);
        },
        removeUserLocally: (state, action) => {
            state.users = state.users.filter(user => user._id !== action.payload);
        }
    },
    extraReducers: (builder) => {
        // 🔥 RTK handles async actions automatically with extraReducers

        // FETCH USERS
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.fetchLoading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.fetchLoading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.fetchLoading = false;
                state.error = action.payload;
            })

        // ADD USER
        builder
            .addCase(addUser.pending, (state) => {
                state.addLoading = true;
                state.error = null;
            })
            .addCase(addUser.fulfilled, (state, action) => {
                state.addLoading = false;
                state.users.push(action.payload);
            })
            .addCase(addUser.rejected, (state, action) => {
                state.addLoading = false;
                state.error = action.payload;
            })

        // UPDATE USER
        builder
            .addCase(updateUser.pending, (state) => {
                state.updateLoading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.updateLoading = false;
                const index = state.users.findIndex(user => user._id === action.payload._id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
                // Update selected user if it's the one being updated
                if (state.selectedUser?._id === action.payload._id) {
                    state.selectedUser = action.payload;
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload;
            })

        // DELETE USER
        builder
            .addCase(deleteUser.pending, (state) => {
                state.deleteLoading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.deleteLoading = false;
                state.users = state.users.filter(user => user._id !== action.payload);
                // Clear selected user if it was deleted
                if (state.selectedUser?._id === action.payload) {
                    state.selectedUser = null;
                }
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.deleteLoading = false;
                state.error = action.payload;
            });
    }
});

// 📤 Export actions (RTK generates these automatically!)
export const {
    setSelectedUser,
    clearSelectedUser,
    clearError,
    addUserLocally,
    removeUserLocally
} = userSlice.actions;

// 🎯 RTK Selectors (Optimized with createSelector)
export const selectUsers = (state) => state.users.users;
export const selectSelectedUser = (state) => state.users.selectedUser;
export const selectUsersLoading = (state) => state.users.loading;
export const selectUsersError = (state) => state.users.error;

// Specific loading selectors
export const selectFetchLoading = (state) => state.users.fetchLoading;
export const selectAddLoading = (state) => state.users.addLoading;
export const selectUpdateLoading = (state) => state.users.updateLoading;
export const selectDeleteLoading = (state) => state.users.deleteLoading;

// 🚀 Memoized selectors (RTK includes reselect)
export const selectActiveUsers = createSelector(
    [selectUsers],
    (users) => users.filter(user => user.isActive)
);

export const selectInactiveUsers = createSelector(
    [selectUsers],
    (users) => users.filter(user => !user.isActive)
);

export const selectUsersByRole = createSelector(
    [selectUsers, (state, role) => role],
    (users, role) => users.filter(user => user.role === role)
);

export const selectUsersCount = createSelector(
    [selectUsers],
    (users) => users.length
);

export const selectUserStats = createSelector(
    [selectUsers],
    (users) => ({
        total: users.length,
        active: users.filter(user => user.isActive).length,
        inactive: users.filter(user => !user.isActive).length,
        admins: users.filter(user => user.role === 'admin').length,
        regularUsers: users.filter(user => user.role === 'user').length
    })
);

// Complex selector with multiple parameters
export const selectUserById = createSelector(
    [selectUsers, (state, userId) => userId],
    (users, userId) => users.find(user => user._id === userId)
);

// Export the reducer
export default userSlice.reducer;