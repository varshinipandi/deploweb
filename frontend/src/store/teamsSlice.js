import { createSlice } from '@reduxjs/toolkit'

const teamsSlice = createSlice({
    name: 'teams',
    initialState: { list: [], compatibilityResult: null, loading: false },
    reducers: {
        setTeams: (state, action) => { state.list = action.payload },
        setCompatibilityResult: (state, action) => { state.compatibilityResult = action.payload },
        clearCompatibility: (state) => { state.compatibilityResult = null },
        addTeam: (state, action) => { state.list.push(action.payload) },
        setLoading: (state, action) => { state.loading = action.payload },
    },
})

export const { setTeams, setCompatibilityResult, clearCompatibility, addTeam, setLoading } = teamsSlice.actions
export default teamsSlice.reducer
