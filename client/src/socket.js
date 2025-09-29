import { io } from "socket.io-client"

const URL = "http://localhost:5000" // later replace with backend URL
export const socket = io(URL)
