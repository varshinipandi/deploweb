import axios from 'axios'
import { store } from '../store/store'
import { logout } from '../store/authSlice'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = store.getState().auth.token
        if (token) config.headers.Authorization = `Bearer ${token}`
        return config
    },
    (error) => Promise.reject(error)
)

// Handle 401 responses — logout user
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            store.dispatch(logout())
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// ── Auth ────────────────────────────────────────────
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    me: () => api.get('/auth/me'),
}

// ── Events ──────────────────────────────────────────
export const eventsAPI = {
    list: (params) => api.get('/events', { params }),
    detail: (id) => api.get(`/events/${id}`),
    create: (data) => api.post('/events', data),
    register: (id) => api.post(`/events/${id}/register`),
}

// ── Teams ────────────────────────────────────────────
export const teamsAPI = {
    list: () => api.get('/teams'),
    create: (data) => api.post('/teams', data),
    compatibility: (data) => api.post('/teams/compatibility', data),
    radar: (id) => api.get(`/teams/${id}/radar`),
}

// ── Leaderboard ──────────────────────────────────────
export const leaderboardAPI = {
    list: () => api.get('/leaderboard'),
    me: () => api.get('/leaderboard/me'),
}

// ── Community Feed ────────────────────────────────────
export const feedAPI = {
    posts: (page = 1) => api.get('/feed/posts', { params: { page } }),
    createPost: (data) => api.post('/feed/posts', data),
    upvote: (id) => api.post(`/feed/posts/${id}/upvote`),
    downvote: (id) => api.post(`/feed/posts/${id}/downvote`),
    reply: (id, data) => api.post(`/feed/posts/${id}/reply`, data),
}

// ── Profile ──────────────────────────────────────────
export const profileAPI = {
    get: (userId) => api.get(`/profile/${userId}`),
    update: (data) => api.put('/profile/me', data),
    roadmap: (userId) => api.get(`/profile/${userId}/roadmap`),
}

export default api
