import { io } from "socket.io-client"

// Get backend URL from environment variable
const URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"

// Initialize socket connection
export const socket = io(URL, {
  transports: ["websocket"], // prefer websocket over long polling
})
