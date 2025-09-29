import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { socket } from "../socket"
import PollResults from "./PollResults"
import { useSelector } from "react-redux"
import "../App.css"
import "./StudentPanel.css"

export default function StudentPanel() {
  const [name, setName] = useState("")
  const [registered, setRegistered] = useState(false)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [participantCount, setParticipantCount] = useState(0)

  const poll = useSelector(state => state.poll.currentPoll)

  const registerStudent = () => {
    if (!name) return toast.error("Enter a name")
    socket.emit("register_student", name, res => {
      if (res.error) return toast.error(res.error)
      setRegistered(true)
    })
  }

  const submitAnswer = () => {
    if (selected === null) return toast.error("Choose an option")
    if (timeLeft <= 0) return toast.error("Time is up! You cannot submit an answer.")
    socket.emit("submit_answer", { pollId: poll._id, choiceIndex: selected }, res => {
      if (res.error) toast.error(res.error)
      else setAnswered(true)
    })
  }

  useEffect(() => {
    setSelected(null)
    setAnswered(false)
    if (poll?.timeLimit) {
      console.log("Setting timer from timeLimit:", poll.timeLimit)
      setTimeLeft(poll.timeLimit)
    } else if (poll?.timer) {
      console.log("Setting timer from timer:", poll.timer)
      setTimeLeft(poll.timer)
    } else {
      console.log("Setting default timer: 60")
      setTimeLeft(60) // Default 60 seconds
    }
  }, [poll?._id])

  useEffect(() => {
    if (timeLeft > 0 && !answered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !answered) {
      setAnswered(true)
    }
  }, [timeLeft, answered])

  useEffect(() => {
    // Listen for participant count updates
    socket.on("participant_count", count => {
      setParticipantCount(count)
    })

    return () => {
      socket.off("participant_count")
    }
  }, [])

  if (!registered) {
    return (
      <div className="student-panel-bg">
        <div className="student-panel-container">
          <div className="student-logo">
            <span className="student-logo-icon">⭐</span>
            Intervue Poll
          </div>
          <div className="student-title">Let's Get Started</div>
          <div className="student-desc">
            If you're a student, you'll be able to <strong>submit your answers</strong>, participate in live polls, and see how your responses compare with your classmates.
          </div>
          <div className="student-card">
            <label className="student-label">Enter your Name</label>
            <input
              className="student-input"
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && registerStudent()}
            />
            <button
              onClick={registerStudent}
              className="student-btn"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!poll) {
    return (
      <div className="student-panel-bg">
        <div className="student-panel-container">
          <div className="student-wait-card">
            <div className="student-wait-title">No Active Poll</div>
            <div className="student-wait-desc">Please wait for your teacher to start a poll...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <div className="quiz-container">
        <div className="animate-fade-in">
          {/* Quiz Header */}
          <div className="quiz-header">
            <div className="flex items-center gap-4">
              <span className="question-number">Question 1</span>
              <div className="timer">
                <svg className="timer-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
            </div>
            
            <div className="participants">
              <div className="participant-avatars">
                <div className="participant-avatar">A</div>
                <div className="participant-avatar">B</div>
              </div>
              <span className="text-sm font-medium text-gray-700">{participantCount || 2}</span>
            </div>
          </div>

          {/* Question Card */}
          <div className="question-card">
            <div className="question-header">
              {poll.question}
            </div>
            
            <div className="question-options">
              {!answered ? (
                <>
                  {poll.choices.map((choice, i) => (
                    <div
                      key={i}
                      onClick={() => setSelected(i)}
                      className={`option-item ${selected === i ? "selected" : ""}`}
                    >
                      <div className="option-number">{i + 1}</div>
                      <div className="option-text">{choice.text}</div>
                    </div>
                  ))}
                  
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={submitAnswer}
                      className="btn btn-primary btn-lg"
                      disabled={selected === null || timeLeft <= 0}
                    >
                      Submit
                    </button>
                  </div>
                </>
              ) : (
                <PollResults poll={poll} showHeader={false} hideQuestionHeader={true} />
              )}
            </div>
          </div>

          {/* Floating Action Button */}
          <button className="fab">
            <svg className="fab-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
