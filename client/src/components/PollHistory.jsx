import React, { useEffect, useState } from "react"
import axios from "axios"
import "./PollHistory.css"

const BACKEND_URL = "https://live-polling-system-2-itph.onrender.com"

export default function PollHistory() {
  const [polls, setPolls] = useState([])

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/polls`).then(res => {
      if (Array.isArray(res.data)) {
        setPolls(res.data)
      } else if (res.data && Array.isArray(res.data.polls)) {
        setPolls(res.data.polls)
      } else {
        setPolls([])
      }
    }).catch(() => setPolls([]))
  }, [])

  return (
    <div className="poll-history-bg">
      <div className="poll-history-wrapper">
        <h1 className="poll-history-title">Poll History</h1>
        {Array.isArray(polls) && polls.length === 0 ? (
          <div className="poll-empty">No polls found.</div>
        ) : Array.isArray(polls) ? (
          polls.map(poll => {
            const totalVotes = poll.choices.reduce((sum, c) => sum + c.votes, 0)
            return (
              <div key={poll._id} className="poll-card">
                <div className="poll-header">
                  <div className="poll-question">{poll.question}</div>
                  <span className={`poll-status${poll.isActive ? ' active' : ''}`}>{poll.isActive ? "Active" : "Completed"}</span>
                </div>
                <div className="poll-choices">
                  {poll.choices.map((choice, i) => (
                    <div key={i} className="poll-choice-row">
                      <span className="poll-choice-number">{i + 1}</span>
                      <span className="poll-choice-text">{choice.text}</span>
                      <div className="poll-choice-bar">
                        <div className="poll-choice-fill" style={{ width: `${totalVotes > 0 ? (choice.votes / totalVotes) * 100 : 0}%` }}></div>
                      </div>
                      <span className="poll-choice-votes">{choice.votes} votes</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          <div className="poll-error">Error loading polls.</div>
        )}
      </div>
    </div>
  )
}
