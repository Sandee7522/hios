import React, { useState } from "react";
import { IoClose, IoWarningOutline } from "react-icons/io5";
import "./category.css";
import { DELETE_COURSE_ADMIN } from "../../utils/api";
import MyButtonLoader from "@/components/common/MyButtonLodder";
import { requestWithAuth } from "../../utils/apiClient";

const DeleteCourseModal = ({ course, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!course?._id) {
      setError("Invalid course");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await requestWithAuth(DELETE_COURSE_ADMIN, {
        method: "POST",
        body: { courseId: course._id },
        allowedRoles: ["admin"],
      });

      onSuccess?.("Course deleted successfully");
      onClose();
    } catch (err) {
      console.error("delete course error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="delete-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-header">
          <div className="delete-icon-wrapper">
            <IoWarningOutline size={32} color="#dc2626" />
            <h3>Delete Course</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <IoClose size={24} />
          </button>
        </div>

        <div className="delete-modal-content">
          <p className="delete-message">
            Are you sure you want to delete
            <strong> {course?.title}</strong>? This will also remove all modules and lessons.
          </p>
          {error && <div className="delete-error">{error}</div>}
        </div>

        <div className="delete-modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn-delete" onClick={handleDelete} disabled={loading}>
            {loading ? <MyButtonLoader /> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCourseModal;
