import mongoose from "mongoose"

const choiceSchema = new mongoose.Schema({
  text: String,
  votes: { type: Number, default: 0 }
})

const pollSchema = new mongoose.Schema({
  question: String,
  choices: [choiceSchema],
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  timeLimit: { type: Number, default: 60 }
})

export default mongoose.model("Poll", pollSchema)
