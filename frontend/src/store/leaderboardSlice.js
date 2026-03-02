import { createSlice } from '@reduxjs/toolkit'

const leaderboardSlice = createSlice({
    name: 'leaderboard',
    initialState: { entries: [], myRank: null, loading: false },
    reducers: {
        setEntries: (state, action) => { state.entries = action.payload },
        setMyRank: (state, action) => { state.myRank = action.payload },
        setLoading: (state, action) => { state.loading = action.payload },
        updateEntry: (state, action) => {
            const idx = state.entries.findIndex(e => e.user_id === action.payload.user_id)
            if (idx !== -1) state.entries[idx] = action.payload
        },
    },
})

export const { setEntries, setMyRank, setLoading, updateEntry } = leaderboardSlice.actions
export default leaderboardSlice.reducer
