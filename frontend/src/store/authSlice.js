import { createSlice } from '@reduxjs/toolkit'

const token = localStorage.getItem('hq_token')
const user = localStorage.getItem('hq_user')

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: token || null,
        user: user ? JSON.parse(user) : null,
        isAuthenticated: !!token,
        loading: false,
        error: null,
    },
    reducers: {
        setCredentials: (state, action) => {
            state.token = action.payload.token
            state.user = action.payload.user
            state.isAuthenticated = true
            state.error = null
            localStorage.setItem('hq_token', action.payload.token)
            localStorage.setItem('hq_user', JSON.stringify(action.payload.user))
        },
        logout: (state) => {
            state.token = null
            state.user = null
            state.isAuthenticated = false
            localStorage.removeItem('hq_token')
            localStorage.removeItem('hq_user')
        },
        setLoading: (state, action) => { state.loading = action.payload },
        setError: (state, action) => { state.error = action.payload },
        clearError: (state) => { state.error = null },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload }
            localStorage.setItem('hq_user', JSON.stringify(state.user))
        },
    },
})

export const { setCredentials, logout, setLoading, setError, clearError, updateUser } = authSlice.actions
export default authSlice.reducer
