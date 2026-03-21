import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { PiPlusCircleBold, PiPencilSimpleBold } from "react-icons/pi";

import {
  CREATE_CATEGORY_ADMIN,
  UPDATE_CATEGORY_ADMIN,
} from "../../utils/api";
import { requestWithAuth } from "../../utils/apiClient";
import MyButtonLoader from "@/components/common/MyButtonLodder";
import "./category.css";
import CustomInput from "@/components/common/CustomInpute";

const CreateCategoryModal = ({ onClose, onSuccess, initialData }) => {
  const isEdit = !!initialData?._id;

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState("");

  useEffect(() => {
    if (initialData?._id) {
      setFormData({
        name: initialData.name || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        isActive: initialData.isActive ?? true,
      });
      setIconPreview(initialData.icon || "");
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

      if (isEdit) {
        // Update — POST to updateCategoryById with categoryId in body
        const fd = new FormData();
        fd.append("categoryId", initialData._id);
        fd.append("name", formData.name);
        fd.append("slug", formData.slug);
        fd.append("description", formData.description || "");
        fd.append("icon", initialData?.icon || "");
        if (initialData?.iconId) fd.append("oldIconPublicId", initialData.iconId);
        if (initialData?.iconId) fd.append("iconId", initialData.iconId);
        fd.append("isActive", String(formData.isActive));
        if (iconFile) fd.append("iconFile", iconFile);

        await requestWithAuth(UPDATE_CATEGORY_ADMIN, {
          method: "POST",
          body: fd,
          allowedRoles: ["admin"],
        });
      } else {
        // Create — POST to createCategory
        const fd = new FormData();
        fd.append("name", formData.name);
        fd.append("slug", formData.slug);
        fd.append("description", formData.description || "");
        fd.append("isActive", String(formData.isActive));
        if (iconFile) fd.append("iconFile", iconFile);

        await requestWithAuth(CREATE_CATEGORY_ADMIN, {
          method: "POST",
          body: fd,
          allowedRoles: ["admin"],
        });
      }

      onSuccess?.(
        isEdit ? "Category updated successfully" : "Category created successfully"
      );
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="delete-modal-container" style={{ maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="create_name">
            {isEdit ? (
              <PiPencilSimpleBold size={28} color="#3b82f6" />
            ) : (
              <PiPlusCircleBold size={28} color="#3b82f6" />
            )}
            <h2>{isEdit ? "Update Category" : "Create Category"}</h2>
          </div>

          <button className="modal-close-btn" onClick={onClose}>
            <IoClose size={20} />
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
            <label>Upload Icon</label>
            <input
              type="file"
              accept="image/*"
              disabled={loading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setIconFile(file);
                const preview = URL.createObjectURL(file);
                setIconPreview(preview);
              }}
              style={{
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                color: "#e2e8f0",
                fontSize: "13px",
              }}
            />
            {iconPreview && (
              <img
                src={iconPreview}
                alt="icon-preview"
                style={{
                  marginTop: "8px",
                  width: "60px",
                  height: "60px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
            )}
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
