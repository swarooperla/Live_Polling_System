import { createSlice } from "@reduxjs/toolkit"

const pollSlice = createSlice({
  name: "poll",
  initialState: { currentPoll: null, polls: [] },
  reducers: {
    setPoll(state, action) { state.currentPoll = action.payload },
    setPolls(state, action) { state.polls = action.payload }
  }
})

export const { setPoll, setPolls } = pollSlice.actions
export default pollSlice.reducer
