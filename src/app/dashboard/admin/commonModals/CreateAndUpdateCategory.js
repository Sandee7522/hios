import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { PiPlusCircleBold } from "react-icons/pi";
import styles from "../../dashboard.module.css";

import {
  CREATE_CATEGORY_ADMIN,
  UPDATE_CATEGORY_ADMIN,
} from "../../utils/api";
import { requestWithAuth } from "../../utils/apiClient";
import MyButtonLoader from "@/components/common/MyButtonLodder";
import "./category.css";
import CustomInput from "@/components/common/CustomInpute";

const CreateCategoryModal = ({ onClose, onSuccess, initialData }) => {

  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        icon: initialData.icon || "",
        isActive: initialData.isActive ?? true,
      });
    }
  }, [initialData]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const url = isEdit
        ? `${UPDATE_CATEGORY_ADMIN}/${initialData._id}`
        : CREATE_CATEGORY_ADMIN;

      const method = isEdit ? "PUT" : "POST";

      const res = await requestWithAuth(url, {
        method,
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.status === 200 || res.status === 201) {
        onSuccess?.(
          isEdit
            ? "Category updated successfully"
            : "Category created successfully"
        );
        onClose();
      } else {
        setError(result?.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="create_name">
            <PiPlusCircleBold size={34} color="#2563eb" />
            <h2>{isEdit ? "Update Category" : "Create Category"}</h2>
          </div>

          <button className="modal-close-btn" onClick={onClose}>
            <IoClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-error">{error}</div>}

          <div className="form-group">
            <label>Name *</label>
            <CustomInput
              value={formData.name}
              onChange={(v) => handleChange("name", v)}
              placeholder="Category name"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Slug</label>
            <CustomInput
              value={formData.slug}
              onChange={(v) => handleChange("slug", v)}
              placeholder="category-slug"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <CustomInput
              value={formData.description}
              onChange={(v) => handleChange("description", v)}
              placeholder="Category description"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Icon URL</label>
            <CustomInput
              value={formData.icon}
              onChange={(v) => handleChange("icon", v)}
              placeholder="https://icon.png"
              disabled={loading}
            />
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  handleChange("isActive", e.target.checked)
                }
              />
              Active
            </label>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <MyButtonLoader />
              ) : isEdit ? (
                "Update"
              ) : (
                "Create"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCategoryModal;