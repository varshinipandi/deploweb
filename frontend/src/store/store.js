import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import eventsReducer from './eventsSlice'
import leaderboardReducer from './leaderboardSlice'
import feedReducer from './feedSlice'
import teamsReducer from './teamsSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        events: eventsReducer,
        leaderboard: leaderboardReducer,
        feed: feedReducer,
        teams: teamsReducer,
    },
})

export default store
