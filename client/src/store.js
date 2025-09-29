import { configureStore } from "@reduxjs/toolkit"
import pollReducer from "./features/pollSlice"

export default configureStore({
  reducer: { poll: pollReducer }
})
