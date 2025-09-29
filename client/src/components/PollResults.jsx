import "./PollResults.css"

export default function PollResults({ poll, showHeader = true, hideQuestionHeader = false }) {
  if (!poll) return null

  const totalVotes = poll.choices.reduce((sum, c) => sum + c.votes, 0)

  return (
  <div className="poll-results-bg">
      {showHeader && (
        <div className="poll-results-header">
          <h3>Question</h3>
          <button className="view-history-btn">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            View Poll history
          </button>
        </div>
      )}

      {!hideQuestionHeader && (
        <div className="poll-results-question">
          {poll.question}
        </div>
      )}

      <div className="poll-results-list">
        {poll.choices.map((choice, i) => {
          const percentage = totalVotes > 0 ? (choice.votes / totalVotes) * 100 : 0
          return (
            <div key={i} className="poll-result-item">
              <div className="poll-result-number">{i + 1}</div>
              <div className="poll-result-text">{choice.text}</div>
              <div className="poll-result-bar">
                <div
                  className="poll-result-fill"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <div className="poll-result-percentage">{Math.round(percentage)}%</div>
            </div>
          )
        })}
      </div>

      {showHeader && (
        <div className="action-buttons">
          <button className="ask-question-btn">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Ask a new question
          </button>
        </div>
      )}

      {/* Floating Action Button for Chat */}
      <button className="fab">
        <svg className="fab-icon" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  )
}
  