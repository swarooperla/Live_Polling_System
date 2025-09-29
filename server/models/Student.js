import mongoose from "mongoose"

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  socketId: String
})

export default mongoose.model("Student", studentSchema)
