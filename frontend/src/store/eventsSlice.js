import { createSlice } from '@reduxjs/toolkit'

const eventsSlice = createSlice({
    name: 'events',
    initialState: {
        list: [],
        selected: null,
        filters: { tags: [], difficulty: '', status: 'all' },
        loading: false,
        error: null,
    },
    reducers: {
        setEvents: (state, action) => { state.list = action.payload },
        setSelected: (state, action) => { state.selected = action.payload },
        setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload } },
        setLoading: (state, action) => { state.loading = action.payload },
        setError: (state, action) => { state.error = action.payload },
        registerForEvent: (state, action) => {
            const ev = state.list.find(e => e.id === action.payload)
            if (ev) ev.is_registered = true
        },
    },
})

export const { setEvents, setSelected, setFilters, setLoading, setError, registerForEvent } = eventsSlice.actions
export default eventsSlice.reducer
