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

// CORS middleware for REST API
const allowedOrigins = [
  "https://live-polling-system-dusky.vercel.app", // deployed frontend
  "http://localhost:5173",                       // local vite
  "http://localhost:3000"                        // CRA (just in case)
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());


// ---------------------- SERVER SETUP ----------------------
const server = http.createServer(app)

// ---------------------- SOCKET.IO SETUP ----------------------
const io = new Server(server, {
  cors: {
    origin: "*", // TODO: restrict to frontend URL in production
    methods: ["GET", "POST", "DELETE", "OPTIONS"]
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

  socket.on("register_student", async (name, callback) => {
    try {
      const exists = await Student.findOne({ name })
      if (exists) return callback({ error: "Name already taken" })

      const student = new Student({ name, socketId: socket.id })
      await student.save()

      callback({ success: true, student })

      const students = await Student.find({}, 'name')
      io.emit("participant_names", students.map(s => s.name))
    } catch (err) {
      callback({ error: "Server error" })
    }
  })

  socket.on("create_poll", async (pollData, callback) => {
    try {
      const activePoll = await Poll.findOne({ isActive: true })
      if (activePoll) {
        if (callback) callback({ success: false, error: "Wait till the current poll completes" })
        return
      }

      const poll = new Poll({ ...pollData, timeLimit: pollData.timer || 60 })
      await poll.save()

      io.emit("new_poll", poll)

      const students = await Student.find({}, 'name')
      io.emit("participant_names", students.map(s => s.name))
      callback({ success: true, poll })
    } catch (err) {
      console.error("Create poll error:", err)
      callback({ error: "Failed to create poll" })
    }
  })

  socket.on("submit_answer", async ({ pollId, choiceIndex }, callback) => {
    try {
      const poll = await Poll.findById(pollId)
      if (!poll || !poll.isActive) return callback({ error: "Poll not found" })

      poll.choices[choiceIndex].votes += 1
      await poll.save()

      io.emit("poll_update", poll)
      callback({ success: true })
    } catch (err) {
      callback({ error: "Failed to submit answer" })
    }
  })

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

  socket.on("clear_active_polls", async (callback) => {
    try {
      await Poll.updateMany({ isActive: true }, { isActive: false })
      io.emit("all_polls_ended")
      callback({ success: true })
    } catch (err) {
      callback({ error: "Failed to clear polls" })
    }
  })

  socket.on("get_active_poll", async (callback) => {
    try {
      const activePoll = await Poll.findOne({ isActive: true })
      callback({ success: true, poll: activePoll })
    } catch (err) {
      callback({ error: "Failed to get active poll" })
    }
  })

  socket.on("disconnect", async () => {
    await Student.deleteOne({ socketId: socket.id })
    console.log("Client disconnected:", socket.id)
  })
})

// ---------------------- REST API ----------------------
app.get("/", (req, res) => {
  res.send("Backend is running 🚀")
})

// Handle preflight for DELETE routes
app.options("/api/students", (req, res) => res.sendStatus(200))
app.options("/api/polls", (req, res) => res.sendStatus(200))

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

// Get all polls
app.get("/api/polls", async (req, res) => {
  const polls = await Poll.find().sort({ createdAt: -1 })
  res.json(polls)
})

// ---------------------- SERVER LISTEN ----------------------
const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
