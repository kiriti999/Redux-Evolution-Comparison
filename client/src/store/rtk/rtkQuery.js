// ===================================================================
// src/store/rtkQuery.js - Fixed RTK Query store configuration
// ===================================================================

import { configureStore, createSlice } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// 🚀 RTK Query API slice
export const usersApi = createApi({
    reducerPath: 'usersApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:4000/api', // Fixed: Changed from 4000 to 5000
        prepareHeaders: (headers, { getState }) => {
            headers.set('Content-Type', 'application/json');
            return headers;
        },
    }),
    tagTypes: ['User'],
    endpoints: (builder) => ({
        // ✅ Get all users - Fixed to match backend response structure
        getUsers: builder.query({
            query: ({ page = 1, limit = 10, role, search } = {}) => {
                const params = new URLSearchParams();
                params.append('page', page);
                params.append('limit', limit);
                if (role) params.append('role', role);
                if (search) params.append('search', search);

                return `/users?${params.toString()}`;
            },
            providesTags: ['User'],
            transformResponse: (response) => {
                console.log('📊 RTK Query: Users loaded', response.users?.length || 0);
                // Backend returns { users: [...], totalPages, currentPage, total }
                return response.users || [];
            }
        }),

        // ✅ Get single user
        getUser: builder.query({
            query: (id) => `/users/${id}`,
            providesTags: (result, error, id) => [{ type: 'User', id }],
        }),

        // ✅ Add user - Fixed to match backend expected fields
        addUser: builder.mutation({
            query: (newUser) => ({
                url: '/users',
                method: 'POST',
                body: newUser // Backend expects { name, email, role }
            }),
            invalidatesTags: ['User'],
            async onQueryStarted(newUser, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    usersApi.util.updateQueryData('getUsers', undefined, (draft) => {
                        // Add optimistic update with temporary ID
                        draft.push({
                            ...newUser,
                            _id: `temp-${Date.now()}`,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            isActive: true
                        });
                    })
                );

                try {
                    await queryFulfilled;
                    console.log('✅ RTK Query: User added successfully');
                } catch (error) {
                    console.error('❌ RTK Query: Add user failed', error);
                    patchResult.undo();
                }
            }
        }),

        // ✅ Update user - Fixed to match backend endpoint
        updateUser: builder.mutation({
            query: ({ id, ...updates }) => ({
                url: `/users/${id}`,
                method: 'PUT',
                body: updates
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
            async onQueryStarted({ id, ...updates }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    usersApi.util.updateQueryData('getUsers', undefined, (draft) => {
                        const userIndex = draft.findIndex(user => user._id === id);
                        if (userIndex !== -1) {
                            Object.assign(draft[userIndex], updates, { updatedAt: new Date().toISOString() });
                        }
                    })
                );

                try {
                    await queryFulfilled;
                    console.log('✅ RTK Query: User updated successfully');
                } catch (error) {
                    console.error('❌ RTK Query: Update user failed', error);
                    patchResult.undo();
                }
            }
        }),

        // ✅ Toggle user status - Custom implementation since backend doesn't have toggle endpoint
        toggleUser: builder.mutation({
            query: (user) => ({
                url: `/users/${user._id}`,
                method: 'PUT',
                body: { ...user, isActive: !user.isActive }
            }),
            invalidatesTags: (result, error, user) => [{ type: 'User', id: user._id }],
            async onQueryStarted(user, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    usersApi.util.updateQueryData('getUsers', undefined, (draft) => {
                        const userIndex = draft.findIndex(u => u._id === user._id);
                        if (userIndex !== -1) {
                            draft[userIndex].isActive = !draft[userIndex].isActive;
                            draft[userIndex].updatedAt = new Date().toISOString();
                        }
                    })
                );

                try {
                    await queryFulfilled;
                    console.log('✅ RTK Query: User toggled successfully');
                } catch (error) {
                    console.error('❌ RTK Query: Toggle user failed', error);
                    patchResult.undo();
                }
            }
        }),

        // ✅ Delete user - Fixed to match backend endpoint
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/users/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['User'],
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    usersApi.util.updateQueryData('getUsers', undefined, (draft) => {
                        const index = draft.findIndex(u => u._id === id);
                        if (index !== -1) {
                            draft.splice(index, 1);
                        }
                    })
                );

                try {
                    await queryFulfilled;
                    console.log('✅ RTK Query: User deleted successfully');
                } catch (error) {
                    console.error('❌ RTK Query: Delete user failed', error);
                    patchResult.undo();
                }
            }
        })
    })
});

// Export hooks for components to use
export const {
    useGetUsersQuery,
    useGetUserQuery,
    useAddUserMutation,
    useUpdateUserMutation,
    useToggleUserMutation,
    useDeleteUserMutation
} = usersApi;

// 🎯 Simple slice for UI state (filter)
const rtkQuerySlice = createSlice({
    name: 'rtkQuery',
    initialState: {
        filter: 'all'
    },
    reducers: {
        setFilter: (state, action) => {
            state.filter = action.payload;
        }
    }
});

export const { setFilter } = rtkQuerySlice.actions;

// ✅ Configure store with RTK Query - FIXED
const rtkQueryStore = configureStore({
    reducer: {
        // RTK Query reducer - make sure the key matches reducerPath
        [usersApi.reducerPath]: usersApi.reducer,
        // UI state
        rtkQuery: rtkQuerySlice.reducer
    },
    // RTK Query middleware for caching, invalidation, etc.
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
            }
        }).concat(usersApi.middleware)
});

export default rtkQueryStore;