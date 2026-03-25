import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

// Helper to get initial state from localStorage
const getInitialState = () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        return {
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false,
            error: null
        };
    }

    try {
        const decoded = jwtDecode(token);
        
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            return {
                isAuthenticated: false,
                user: null,
                token: null,
                loading: false,
                error: null
            };
        }

        return {
            isAuthenticated: true,
            user: {
                id: decoded.id,
                role: decoded.role
            },
            token,
            loading: false,
            error: null
        };
    } catch (err) {
        localStorage.removeItem('token');
        return {
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false,
            error: null
        };
    }
};

const authSlice = createSlice({
    name: 'auth',
    initialState: getInitialState(),
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            const { token, user } = action.payload;
            state.isAuthenticated = true;
            state.user = user;
            state.token = token;
            state.loading = false;
            state.error = null;
            localStorage.setItem('token', token);
        },
        loginFailure: (state, action) => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.loading = false;
            state.error = null;
            localStorage.removeItem('token');
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
        },
        clearError: (state) => {
            state.error = null;
        }
    }
});

export const {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
    updateUser,
    clearError
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
