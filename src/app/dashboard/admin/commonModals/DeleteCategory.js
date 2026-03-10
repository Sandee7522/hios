import React, { useState } from "react";
import { IoClose, IoWarningOutline } from "react-icons/io5";
import "./category.css";
import { DELETE_CATEGORY_ADMIN } from "../../utils/api";
import MyButtonLoader from "@/components/common/MyButtonLodder";
import { requestWithAuth } from "../../utils/apiClient";

const DeleteCtgModal = ({ category, onClose, onSuccess }) => {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {

    if (!category?._id) {
      setError("Invalid category");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await requestWithAuth(DELETE_CATEGORY_ADMIN, {
        method: "POST",
        body: JSON.stringify({
          category_id: category._id,
        }),
      });

      const result = await res.json();
      console.log("delete result:", result);

      if (res.status === 200) {
        onSuccess?.("Category deleted successfully");
        onClose();
      } else {
        setError(result?.message || "Failed to delete category");
      }

    } catch (err) {
      console.error("delete error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="delete-modal-container"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="delete-modal-header">
          <div className="delete-icon-wrapper">
            <IoWarningOutline size={32} color="#dc2626" />
            <h3>Delete Category</h3>
          </div>

          <button className="modal-close-btn" onClick={onClose}>
            <IoClose size={24} />
          </button>
        </div>

        <div className="delete-modal-content">

          <p className="delete-message">
            Are you sure you want to delete
            <strong> {category?.name}</strong> ?
          </p>

          {error && (
            <div className="delete-error">
              {error}
            </div>
          )}

        </div>

        <div className="delete-modal-footer">

          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn-delete"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? <MyButtonLoader /> : "Delete"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default DeleteCtgModal;