import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { useDispatch } from "react-redux"
import { socket } from "./socket"
import { setPoll } from "./features/pollSlice"
import Home from "./components/Home"
import StudentPanel from "./components/StudentPanel"
import TeacherPanel from "./components/TeacherPanel"
import TeacherDashboard from "./components/TeacherDashboard"
import PollHistory from "./components/PollHistory"
import "./App.css"

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    socket.on("new_poll", poll => dispatch(setPoll(poll)))
    socket.on("poll_update", poll => dispatch(setPoll(poll)))
    socket.on("poll_ended", poll => dispatch(setPoll(poll)))

    return () => {
      socket.off("new_poll")
      socket.off("poll_update")
      socket.off("poll_ended")
    }
  }, [dispatch])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student" element={<StudentPanel />} />
        <Route path="/teacher" element={<TeacherPanel />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/poll-history" element={<PollHistory />} />
      </Routes>
    </Router>
  )
}

export default App
