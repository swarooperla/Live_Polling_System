import React from "react"
import "./ConfirmModal.css"

export default function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <div className="confirm-modal-title">{title}</div>
        <div className="confirm-modal-message">{message}</div>
        <div className="confirm-modal-actions">
          <button className="confirm-btn danger" onClick={onConfirm}>Confirm</button>
          <button className="confirm-btn" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
