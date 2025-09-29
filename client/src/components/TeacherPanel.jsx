import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { socket } from "../socket"
import PollResults from "./PollResults"
import "./TeacherPanel.css"

export default function TeacherPanel() {
  const navigate = useNavigate()
  const [question, setQuestion] = useState("")
  const [choices, setChoices] = useState(["", ""])
  const [timer, setTimer] = useState(60)
  const [correctAnswers, setCorrectAnswers] = useState({})
  const [isCreating, setIsCreating] = useState(false)
  const [activePoll, setActivePoll] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [participants, setParticipants] = useState([])

  // ✅ helper functions
  // Real-time socket listeners for poll updates and participants
  useEffect(() => {
    // Only listen if showing results and poll is active
    if (showResults && activePoll) {
      // Poll results update
      const handlePollUpdate = (poll) => {
        setActivePoll(poll)
      }
      // Participant names update
      const handleParticipantNames = (names) => {
        setParticipants(names)
      }
      socket.on("poll_update", handlePollUpdate)
      socket.on("participant_names", handleParticipantNames)

      // Request initial participant names
      socket.emit("get_participant_names", (names) => {
        if (Array.isArray(names)) setParticipants(names)
      })

      // Cleanup listeners on unmount or when poll ends
      return () => {
        socket.off("poll_update", handlePollUpdate)
        socket.off("participant_names", handleParticipantNames)
      }
    }
  }, [showResults, activePoll])
  const updateChoice = (index, value) => {
    setChoices(prevChoices => {
      const newChoices = [...prevChoices]
      newChoices[index] = value
      return newChoices
    })
  }

  const addChoice = () => setChoices([...choices, ""])

  const removeChoice = (index) => {
    setChoices(prevChoices => prevChoices.filter((_, i) => i !== index))
  }

  const setCorrectAnswer = (index, value) => {
    setCorrectAnswers(prev => ({ ...prev, [index]: value }))
  }

  const clearActivePolls = () => {
    socket.emit("clear_active_polls", res => {
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success("All active polls cleared!")
        setActivePoll(null)
        setShowResults(false)
      }
    })
  }

  const getActivePoll = () => {
    socket.emit("get_active_poll", res => {
      if (res.success) {
        setActivePoll(res.poll)
        if (res.poll) {
          toast.info(`Active poll found: "${res.poll.question}"`)
        } else {
          toast.info("No active polls found")
        }
      }
    })
  }

  const createPoll = async () => {
    if (!question.trim()) return toast.error("Enter a question")
    if (choices.some(c => !c.trim())) return toast.error("Fill all choices")
    setIsCreating(true)
    socket.emit("create_poll", {
      question,
      choices: choices.map(text => ({ text })),
      timer
    }, res => {
      setIsCreating(false)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success("Poll created successfully!")
        setQuestion("")
        setChoices(["", ""])
        setCorrectAnswers({})
        setActivePoll(res.poll)
        setShowResults(true)
      }
    })
  }

  if (showResults && activePoll) {
    return (
      <div className="teacher-panel-bg">
        <div className="teacher-panel-container">
          <div className="animate-fade-in">
            {/* Header with navigation */}
            <div className="teacher-header">
              <div className="teacher-logo">
                <span className="teacher-logo-icon">⚡</span>
                Intervue Poll
              </div>
              <div className="teacher-actions">
                <button
                  onClick={clearActivePolls}
                  className="teacher-btn danger"
                >
                  End Poll
                </button>
              </div>
            </div>
            {/* Live Participants */}
            <div className="teacher-participants">
              <div className="teacher-participants-title">Live Participants:</div>
              <div className="teacher-participants-list">
                {participants.length === 0 ? (
                  <span className="text-gray-400">No participants yet.</span>
                ) : (
                  participants.map((name, idx) => (
                    <span key={idx} className="teacher-participant">{name}</span>
                  ))
                )}
              </div>
            </div>
            {/* Live Results */}
            <div className="poll-results-bg">
              <PollResults poll={activePoll} showHeader={false} />
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="teacher-panel-bg">
      <div className="teacher-panel-container">
        <div className="animate-fade-in">
          {/* Header */}
          <div className="teacher-header">
            <div className="teacher-logo">
              <span className="teacher-logo-icon">⚡</span>
              Intervue Poll
            </div>
            <div className="teacher-actions">
              <button
                onClick={getActivePoll}
                className="teacher-btn secondary"
              >
                Check Active Poll
              </button>
              <button
                onClick={clearActivePolls}
                className="teacher-btn danger"
              >
                Clear All Polls
              </button>
            </div>
          </div>
          {/* Main Form */}
          <div className="teacher-form-card">
            {/* Question Input */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <label className="teacher-form-label">Enter your question</label>
                <select
                  value={timer}
                  onChange={(e) => setTimer(parseInt(e.target.value))}
                  className="teacher-form-select"
                >
                  <option value={30}>30 seconds</option>
                  <option value={60}>60 seconds</option>
                  <option value={120}>2 minutes</option>
                  <option value={300}>5 minutes</option>
                </select>
              </div>
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Enter your question here..."
                className="teacher-form-textarea"
                maxLength={200}
              />
              <div style={{ textAlign: 'right', fontSize: '0.95rem', color: '#6b7280', marginTop: '0.5rem' }}>
                {question.length}/200
              </div>
            </div>
            {/* Options */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <label className="teacher-form-label">Edit Options</label>
              </div>
              {choices.map((choice, i) => (
                <div key={i} className="teacher-choice-row">
                  <span className="teacher-choice-number">{i + 1}</span>
                  <input
                    value={choice}
                    onChange={e => updateChoice(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="teacher-choice-input"
                  />
                  <div className="teacher-choice-actions">
                    {choices.length > 2 && (
                      <button
                        onClick={() => removeChoice(i)}
                        className="teacher-btn danger"
                        type="button"
                        style={{ padding: '0.3rem 0.7rem', fontSize: '1rem' }}
                      >
                        ✕
                      </button>
                    )}

                  </div>
                </div>
              ))}
              <button
                onClick={addChoice}
                className="teacher-add-choice-btn"
                type="button"
              >
                <span style={{ fontSize: '1.2rem' }}>+</span> Add More option
              </button>
            </div>
            {/* Action Button */}
            <div className="teacher-form-actions">
              <button
                onClick={createPoll}
                className="teacher-ask-btn"
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Ask Question"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
