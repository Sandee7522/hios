import React, { useState, useEffect } from "react";
import { IoClose, IoAddCircleOutline, IoTrashOutline } from "react-icons/io5";
import { PiPlusCircleBold, PiPencilSimpleBold } from "react-icons/pi";
import {
  CREATE_COURSE_ADMIN,
  UPDATE_COURSE_ADMIN,
  GET_ALL_CATEGORY_ADMIN,
} from "../../utils/api";
import { requestWithAuth } from "../../utils/apiClient";
import { getUserProfile } from "../../utils/auth";
import MyButtonLoader from "@/components/common/MyButtonLodder";
import CustomInput from "@/components/common/CustomInpute";
import "./category.css";

const CreateAndUpdateCourse = ({ onClose, onSuccess, initialData }) => {
  const isEdit = !!initialData?._id;
  const profile = getUserProfile();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    shortDescription: "",
    previewVideo: "",
    categoryId: "",
    level: "beginner",
    courseLanguage: "English",
    price: "",
    discount: "0",
    totalFee: "",
    currency: "INR",
    partialPaymentEnabled: true,
    minimumPayment: "0",
    durationHours: "",
    durationMinutes: "",
    status: "draft",
    isPublished: false,
  });

  // Array fields
  const [requirements, setRequirements] = useState([""]);
  const [whatYouWillLearn, setWhatYouWillLearn] = useState([""]);
  const [tags, setTags] = useState([""]);

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catRes = await requestWithAuth(GET_ALL_CATEGORY_ADMIN, {
          method: "POST",
          body: { page: 1, pageSize: 100 },
          allowedRoles: ["admin"],
        });
        const catList = catRes?.data?.data || catRes?.data || [];
        setCategories(Array.isArray(catList) ? catList : []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Populate form for edit
  useEffect(() => {
    if (initialData?._id) {
      setFormData({
        title: initialData.title || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        shortDescription: initialData.shortDescription || "",
        previewVideo: initialData.previewVideo || "",
        categoryId: initialData.categoryId?._id || initialData.categoryId || "",
        level: initialData.level || "beginner",
        courseLanguage: initialData.courseLanguage || "English",
        price: String(initialData.price ?? ""),
        discount: String(initialData.discount ?? "0"),
        totalFee: String(initialData.totalFee ?? ""),
        currency: initialData.currency || "INR",
        partialPaymentEnabled: initialData.partialPaymentEnabled ?? true,
        minimumPayment: String(initialData.minimumPayment ?? "0"),
        durationHours: String(initialData.duration?.hours ?? ""),
        durationMinutes: String(initialData.duration?.minutes ?? ""),
        status: initialData.status || "draft",
        isPublished: initialData.isPublished ?? false,
      });
      if (initialData.requirements?.length) setRequirements(initialData.requirements);
      if (initialData.whatYouWillLearn?.length) setWhatYouWillLearn(initialData.whatYouWillLearn);
      if (initialData.tags?.length) setTags(initialData.tags);
      if (initialData.thumbnail) setThumbnailPreview(initialData.thumbnail);
    }
  }, [initialData]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleThumbnail = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  // Array helpers
  const updateItem = (setter, idx, val) => setter((p) => p.map((v, i) => (i === idx ? val : v)));
  const addItem = (setter) => setter((p) => [...p, ""]);
  const removeItem = (setter, idx) => setter((p) => p.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const instructorId = profile?._id || profile?.id || "";
      const cleanReqs = requirements.filter((r) => r.trim());
      const cleanLearn = whatYouWillLearn.filter((w) => w.trim());
      const cleanTags = tags.filter((t) => t.trim());
      const duration = {};
      if (formData.durationHours) duration.hours = Number(formData.durationHours);
      if (formData.durationMinutes) duration.minutes = Number(formData.durationMinutes);

      if (isEdit) {
        const updateData = {
          title: formData.title,
          slug: formData.slug || undefined,
          description: formData.description,
          shortDescription: formData.shortDescription || undefined,
          previewVideo: formData.previewVideo || undefined,
          instructorId,
          categoryId: formData.categoryId || undefined,
          level: formData.level,
          courseLanguage: formData.courseLanguage,
          price: Number(formData.price),
          discount: Number(formData.discount),
          totalFee: Number(formData.totalFee),
          currency: formData.currency,
          partialPaymentEnabled: formData.partialPaymentEnabled,
          minimumPayment: Number(formData.minimumPayment),
          duration,
          requirements: cleanReqs,
          whatYouWillLearn: cleanLearn,
          tags: cleanTags,
          status: formData.status,
          isPublished: formData.isPublished,
        };

        await requestWithAuth(UPDATE_COURSE_ADMIN, {
          method: "POST",
          body: { id: initialData._id, data: updateData },
          allowedRoles: ["admin"],
        });
      } else {
        // Create — FormData (thumbnail file upload)
        const fd = new FormData();
        fd.append("title", formData.title);
        if (formData.slug) fd.append("slug", formData.slug);
        fd.append("description", formData.description);
        if (formData.shortDescription) fd.append("shortDescription", formData.shortDescription);
        if (formData.previewVideo) fd.append("previewVideo", formData.previewVideo);
        fd.append("instructorId", instructorId);
        if (formData.categoryId) fd.append("categoryId", formData.categoryId);
        fd.append("level", formData.level);
        fd.append("courseLanguage", formData.courseLanguage);
        fd.append("price", formData.price);
        fd.append("discount", formData.discount);
        fd.append("totalFee", formData.totalFee);
        fd.append("currency", formData.currency);
        fd.append("partialPaymentEnabled", String(formData.partialPaymentEnabled));
        fd.append("minimumPayment", formData.minimumPayment);
        fd.append("duration", JSON.stringify(duration));
        fd.append("requirements", JSON.stringify(cleanReqs));
        fd.append("whatYouWillLearn", JSON.stringify(cleanLearn));
        fd.append("tags", JSON.stringify(cleanTags));
        fd.append("status", formData.status);
        fd.append("isPublished", String(formData.isPublished));

        if (thumbnailFile) fd.append("thumbnail", thumbnailFile);

        await requestWithAuth(CREATE_COURSE_ADMIN, {
          method: "POST",
          body: fd,
          allowedRoles: ["admin"],
        });
      }

      onSuccess?.(isEdit ? "Course updated successfully" : "Course created successfully");
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render dynamic array field
  const renderArrayField = (label, items, setter) => (
    <div className="form-group">
      <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {label}
        <button
          type="button"
          onClick={() => addItem(setter)}
          style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}
        >
          <IoAddCircleOutline size={16} /> Add
        </button>
      </label>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: "flex", gap: "8px", marginTop: idx > 0 ? "6px" : "0" }}>
          <CustomInput
            value={item}
            onChange={(v) => updateItem(setter, idx, v)}
            placeholder={`Item ${idx + 1}`}
            disabled={loading}
          />
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => removeItem(setter, idx)}
              style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "0 4px" }}
            >
              <IoTrashOutline size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="delete-modal-container"
        style={{ maxWidth: "640px", maxHeight: "85vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="create_name">
            {isEdit ? <PiPencilSimpleBold size={28} color="#3b82f6" /> : <PiPlusCircleBold size={28} color="#3b82f6" />}
            <h2>{isEdit ? "Update Course" : "Create Course"}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <IoClose size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-error">{error}</div>}

          {/* Title & Slug */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label>Title *</label>
              <CustomInput value={formData.title} onChange={(v) => handleChange("title", v)} placeholder="Course title" disabled={loading} />
            </div>
            <div className="form-group">
              <label>Slug</label>
              <CustomInput value={formData.slug} onChange={(v) => handleChange("slug", v)} placeholder="auto-generated if empty" disabled={loading} />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description *</label>
            <CustomInput value={formData.description} onChange={(v) => handleChange("description", v)} placeholder="Min 10 characters" disabled={loading} />
          </div>

          {/* Short Description */}
          <div className="form-group">
            <label>Short Description</label>
            <CustomInput value={formData.shortDescription} onChange={(v) => handleChange("shortDescription", v)} placeholder="Brief summary" disabled={loading} />
          </div>

          {/* Thumbnail */}
          <div className="form-group">
            <label>Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnail}
              disabled={loading}
              style={{ padding: "8px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#e2e8f0", fontSize: "13px" }}
            />
            {thumbnailPreview && (
              <img src={thumbnailPreview} alt="preview" style={{ marginTop: "8px", width: "100px", height: "60px", objectFit: "cover", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)" }} />
            )}
          </div>

          {/* Preview Video */}
          <div className="form-group">
            <label>Preview Video URL</label>
            <CustomInput value={formData.previewVideo} onChange={(v) => handleChange("previewVideo", v)} placeholder="https://youtube.com/..." disabled={loading} />
          </div>

          {/* Instructor (auto) & Category */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label>Instructor</label>
              <CustomInput value={profile?.name || "Logged-in User"} disabled />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={formData.categoryId} onChange={(e) => handleChange("categoryId", e.target.value)} disabled={loading} className="modal-select">
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Level & Language */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label>Level</label>
              <select value={formData.level} onChange={(e) => handleChange("level", e.target.value)} disabled={loading} className="modal-select">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="form-group">
              <label>Language</label>
              <CustomInput value={formData.courseLanguage} onChange={(v) => handleChange("courseLanguage", v)} placeholder="English" disabled={loading} />
            </div>
          </div>

          {/* Price, Discount, Total Fee, Currency */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label>Price *</label>
              <CustomInput type="number" value={formData.price} onChange={(v) => handleChange("price", v)} placeholder="999" disabled={loading} />
            </div>
            <div className="form-group">
              <label>Discount</label>
              <CustomInput type="number" value={formData.discount} onChange={(v) => handleChange("discount", v)} placeholder="0" disabled={loading} />
            </div>
            <div className="form-group">
              <label>Total Fee *</label>
              <CustomInput type="number" value={formData.totalFee} onChange={(v) => handleChange("totalFee", v)} placeholder="999" disabled={loading} />
            </div>
            <div className="form-group">
              <label>Currency</label>
              <CustomInput value={formData.currency} onChange={(v) => handleChange("currency", v)} placeholder="INR" disabled={loading} />
            </div>
          </div>

          {/* Partial Payment & Minimum */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group checkbox" style={{ paddingTop: "8px" }}>
              <label>
                <input type="checkbox" checked={formData.partialPaymentEnabled} onChange={(e) => handleChange("partialPaymentEnabled", e.target.checked)} />
                Partial Payment Enabled
              </label>
            </div>
            <div className="form-group">
              <label>Minimum Payment</label>
              <CustomInput type="number" value={formData.minimumPayment} onChange={(v) => handleChange("minimumPayment", v)} placeholder="0" disabled={loading} />
            </div>
          </div>

          {/* Duration */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label>Duration (Hours)</label>
              <CustomInput type="number" value={formData.durationHours} onChange={(v) => handleChange("durationHours", v)} placeholder="5" disabled={loading} />
            </div>
            <div className="form-group">
              <label>Duration (Minutes)</label>
              <CustomInput type="number" value={formData.durationMinutes} onChange={(v) => handleChange("durationMinutes", v)} placeholder="30" disabled={loading} />
            </div>
          </div>

          {/* Requirements */}
          {renderArrayField("Requirements", requirements, setRequirements)}

          {/* What You'll Learn */}
          {renderArrayField("What You'll Learn", whatYouWillLearn, setWhatYouWillLearn)}

          {/* Tags */}
          {renderArrayField("Tags", tags, setTags)}

          {/* Status & isPublished */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label>Status</label>
              <select value={formData.status} onChange={(e) => handleChange("status", e.target.value)} disabled={loading} className="modal-select">
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="form-group checkbox" style={{ alignSelf: "end", paddingBottom: "4px" }}>
              <label>
                <input type="checkbox" checked={formData.isPublished} onChange={(e) => handleChange("isPublished", e.target.checked)} />
                Published
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? <MyButtonLoader /> : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAndUpdateCourse;
