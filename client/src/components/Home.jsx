import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../App.css"

export default function Home() {
  const [role, setRole] = useState(null)
  const navigate = useNavigate()

  const handleContinue = () => {
    if (role === "student") navigate("/student")
    if (role === "teacher") navigate("/teacher-dashboard")
  }

  return (
    <div className="app-container">
      <div className="page-container">
        <div className="content-wrapper">
          <div className="role-selection animate-fade-in">
            {/* Logo/Brand */}
            <div className="logo">
              <div className="logo-icon">⭐</div>
              Intervue Poll
            </div>

            {/* Main Title */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to the Live Polling System
              </h1>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                Please select the role that best describes you to begin using the live polling system
              </p>
            </div>

            {/* Role Selection Cards */}
            <div className="role-cards">
              <div
                className={`role-card ${role === "student" ? "selected" : ""}`}
                onClick={() => setRole("student")}
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-3">I'm a Student</h2>
                <p className="text-gray-600 leading-relaxed">
                  Submit answers and participate in live polls, and see how your responses compare with your classmates.
                </p>
              </div>

              <div
                className={`role-card ${role === "teacher" ? "selected" : ""}`}
                onClick={() => setRole("teacher")}
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-3">I'm a Teacher</h2>
                <p className="text-gray-600 leading-relaxed">
                  Create and manage polls, ask questions, and monitor your students' responses in real-time.
                </p>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!role}
              className={`btn btn-primary btn-lg ${!role ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
