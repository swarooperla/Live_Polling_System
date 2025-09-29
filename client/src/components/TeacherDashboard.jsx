import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./TeacherDashboard.css"
import axios from "axios"
import { toast } from "react-toastify"
import ConfirmModal from "./ConfirmModal"

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState(null)

  const openModal = (type) => {
    setModalType(type)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalType(null)
  }

  const handleConfirm = async () => {
    if (modalType === "students") {
      try {
        const res = await axios.delete("/api/students")
        if (res.data.success) {
          toast.success(res.data.message)
        } else {
          toast.error(res.data.error || "Failed to delete students.")
        }
      } catch {
        toast.error("Failed to delete students.")
      }
    } else if (modalType === "polls") {
      try {
        const res = await axios.delete("/api/polls")
        if (res.data.success) {
          toast.success(res.data.message)
        } else {
          toast.error(res.data.error || "Failed to delete poll history.")
        }
      } catch {
        toast.error("Failed to delete poll history.")
      }
    }
    closeModal()
  }

  return (
    <div className="dashboard-bg">
      <div className="dashboard-container">
        <div className="dashboard-title">Teacher Dashboard</div>
        <div className="dashboard-desc">Welcome! Choose an option below:</div>
        <div className="dashboard-actions">
          <button className="dashboard-btn" onClick={() => navigate("/teacher")}>Create New Poll</button>
          <button className="dashboard-btn" onClick={() => navigate("/poll-history")}>View Poll History</button>
        </div>
        <div className="dashboard-actions" style={{ marginTop: "2.5rem" }}>
          <button className="dashboard-btn danger" onClick={() => openModal("students")}>Delete All Students Data</button>
          <button className="dashboard-btn danger" onClick={() => openModal("polls")}>Delete All Poll History</button>
        </div>
        <ConfirmModal
          open={modalOpen}
          title={modalType === "students" ? "Delete All Students Data" : "Delete All Poll History"}
          message={modalType === "students"
            ? "Are you sure you want to delete ALL students data? This action cannot be undone."
            : "Are you sure you want to delete ALL poll history? This action cannot be undone."}
          onConfirm={handleConfirm}
          onCancel={closeModal}
        />
      </div>
    </div>
  )
}
