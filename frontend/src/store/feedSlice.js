import { createSlice } from '@reduxjs/toolkit'

const feedSlice = createSlice({
    name: 'feed',
    initialState: { posts: [], loading: false, threatResult: null },
    reducers: {
        setPosts: (state, action) => { state.posts = action.payload },
        addPost: (state, action) => { state.posts.unshift(action.payload) },
        setThreatResult: (state, action) => { state.threatResult = action.payload },
        clearThreat: (state) => { state.threatResult = null },
        votePost: (state, action) => {
            const post = state.posts.find(p => p.id === action.payload.id)
            if (post) {
                post.upvotes = action.payload.upvotes
                post.downvotes = action.payload.downvotes
            }
        },
        addReply: (state, action) => {
            const post = state.posts.find(p => p.id === action.payload.post_id)
            if (post) {
                if (!post.replies) post.replies = []
                post.replies.push(action.payload)
            }
        },
        setLoading: (state, action) => { state.loading = action.payload },
    },
})

export const { setPosts, addPost, setThreatResult, clearThreat, votePost, addReply, setLoading } = feedSlice.actions
export default feedSlice.reducer
