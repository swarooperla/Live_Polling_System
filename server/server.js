// API route for poll history (for frontend)
import express from "express"
import http from "http"
import { Server } from "socket.io"
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose"

// Models
import Poll from "./models/Poll.js"
import Student from "./models/Student.js"

dotenv.config()

// ---------------------- APP SETUP ----------------------
const app = express()
app.use(cors())
app.use(express.json())

const server = http.createServer(app)

// ---------------------- SOCKET.IO SETUP ----------------------
const io = new Server(server, {
  cors: {
    origin: "*", // TODO: restrict to frontend URL in production
    methods: ["GET", "POST"]
  }
})

// ---------------------- MONGO CONNECTION ----------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err))

// ---------------------- SOCKET.IO EVENTS ----------------------
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id)

  // Register student with unique name
  socket.on("register_student", async (name, callback) => {
    try {
      const exists = await Student.findOne({ name })
      if (exists) return callback({ error: "Name already taken" })

      const student = new Student({ name, socketId: socket.id })
      await student.save()

      callback({ success: true, student })
  // Emit updated participant list to all clients
  const students = await Student.find({}, 'name')
  io.emit("participant_names", students.map(s => s.name))
    } catch (err) {
      callback({ error: "Server error" })
    }
  })

  // Teacher creates a poll
  socket.on("create_poll", async (pollData, callback) => {
    try {
      // Check for active poll before creating a new one
      const activePoll = await Poll.findOne({ isActive: true })
      if (activePoll) {
        // Do not end the current poll, just send error
        if (callback) callback({ success: false, error: "Wait till the current poll completes" })
        return
      }

      const poll = new Poll({
        ...pollData,
        timeLimit: pollData.timer || 60
      })
      await poll.save()

      io.emit("new_poll", poll) // notify everyone
  // Emit current participant names to all clients
  const students = await Student.find({}, 'name')
  io.emit("participant_names", students.map(s => s.name))
      callback({ success: true, poll })
    } catch (err) {
      console.error("Create poll error:", err)
      callback({ error: "Failed to create poll" })
    }
  })

  // Student submits answer
  socket.on("submit_answer", async ({ pollId, choiceIndex }, callback) => {
    try {
      const poll = await Poll.findById(pollId)
      if (!poll || !poll.isActive) return callback({ error: "Poll not found" })

      poll.choices[choiceIndex].votes += 1
      await poll.save()

      io.emit("poll_update", poll) // notify everyone
      callback({ success: true })
    } catch (err) {
      callback({ error: "Failed to submit answer" })
    }
  })

  // Teacher ends poll
  socket.on("end_poll", async (pollId, callback) => {
    try {
      const poll = await Poll.findById(pollId)
      if (!poll) return callback({ error: "Poll not found" })

      poll.isActive = false
      await poll.save()

      io.emit("poll_ended", poll)
      callback({ success: true })
    } catch (err) {
      callback({ error: "Failed to end poll" })
    }
  })

  // Clear all active polls (for debugging/management)
  socket.on("clear_active_polls", async (callback) => {
    try {
      await Poll.updateMany({ isActive: true }, { isActive: false })
      io.emit("all_polls_ended")
      callback({ success: true })
    } catch (err) {
      callback({ error: "Failed to clear polls" })
    }
  })

  // Get current active poll
  socket.on("get_active_poll", async (callback) => {
    try {
      const activePoll = await Poll.findOne({ isActive: true })
      callback({ success: true, poll: activePoll })
    } catch (err) {
      callback({ error: "Failed to get active poll" })
    }
  })

  // On disconnect → remove student
  socket.on("disconnect", async () => {
    await Student.deleteOne({ socketId: socket.id })
    console.log("Client disconnected:", socket.id)
  })
})

// ---------------------- REST API ----------------------
app.get("/", (req, res) => {
  res.send("Backend is running 🚀")
})

// Delete all students
app.delete("/api/students", async (req, res) => {
  try {
    await Student.deleteMany({})
    res.json({ success: true, message: "All students deleted." })
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete students." })
  }
})

// Delete all poll history
app.delete("/api/polls", async (req, res) => {
  try {
    await Poll.deleteMany({})
    res.json({ success: true, message: "All poll history deleted." })
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete poll history." })
  }
})

app.get("/api/polls", async (req, res) => {
  const polls = await Poll.find().sort({ createdAt: -1 })
  res.json(polls)
})


// ---------------------- SERVER LISTEN ----------------------
const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
