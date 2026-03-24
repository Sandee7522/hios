import React, { useState, useEffect } from "react";
import { IoClose, IoAddCircleOutline, IoTrashOutline } from "react-icons/io5";
import { HiOutlineDocumentText } from "react-icons/hi2";
import {
  COURSE_DETAILS_ADMIN,
  GET_COURSE_DETAILS_ADMIN,
} from "../../utils/api";
import { requestWithAuth } from "../../utils/apiClient";
import { getUserProfile } from "../../utils/auth";
import MyButtonLoader from "@/components/common/MyButtonLodder";
import CustomInput from "@/components/common/CustomInpute";
import "./category.css";

const CourseDetailsModal = ({ course, onClose, onSuccess }) => {
  const profile = getUserProfile();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({
    detailedDescription: "",
    courseOutline: "",
    teacherName: "",
    teacherDesignation: "",
    teacherBio: "",
    demoVideo: "",
    certificateEnabled: false,
  });

  const [teacherImgFile, setTeacherImgFile] = useState(null);
  const [teacherImgPreview, setTeacherImgPreview] = useState("");
  const [existingTeacherImgId, setExistingTeacherImgId] = useState("");

  const [syllabus, setSyllabus] = useState([{ title: "", description: "" }]);
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);
  const [targetAudience, setTargetAudience] = useState([""]);
  const [prerequisites, setPrerequisites] = useState([""]);

  // Fetch existing course details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setFetching(true);
        const res = await requestWithAuth(GET_COURSE_DETAILS_ADMIN(course._id), {
          method: "GET",
          allowedRoles: ["admin"],
        });

        if (res?.data) {
          const d = res.data;
          setIsEdit(true);
          setFormData({
            detailedDescription: d.detailedDescription || "",
            courseOutline: d.courseOutline || "",
            teacherName: d.teacherName || "",
            teacherDesignation: d.teacherDesignation || "",
            teacherBio: d.teacherBio || "",
            demoVideo: d.demoVideo || "",
            certificateEnabled: d.certificateEnabled || false,
          });
          if (d.teacherImg) setTeacherImgPreview(d.teacherImg);
          if (d.teacherImgId) setExistingTeacherImgId(d.teacherImgId);
          if (d.syllabus?.length) setSyllabus(d.syllabus);
          if (d.faqs?.length) setFaqs(d.faqs);
          if (d.targetAudience?.length) setTargetAudience(d.targetAudience);
          if (d.prerequisites?.length) setPrerequisites(d.prerequisites);
        }
      } catch {
        // No existing details — that's fine, create mode
      } finally {
        setFetching(false);
      }
    };

    fetchDetails();
  }, [course._id]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleTeacherImg = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setTeacherImgFile(file);
      setTeacherImgPreview(URL.createObjectURL(file));
    }
  };

  // Array helpers
  const addItem = (setter, template) => setter((p) => [...p, template]);
  const removeItem = (setter, idx) => setter((p) => p.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const fd = new FormData();
      fd.append("courseId", course._id);
      fd.append("instructorId", course.instructorId?._id || course.instructorId || profile?._id || "");
      fd.append("detailedDescription", formData.detailedDescription);
      fd.append("courseOutline", formData.courseOutline);
      fd.append("teacherName", formData.teacherName);
      fd.append("teacherDesignation", formData.teacherDesignation);
      fd.append("teacherBio", formData.teacherBio);
      fd.append("demoVideo", formData.demoVideo);
      fd.append("certificateEnabled", String(formData.certificateEnabled));

      fd.append("syllabus", JSON.stringify(syllabus.filter((s) => s.title.trim())));
      fd.append("faqs", JSON.stringify(faqs.filter((f) => f.question.trim())));
      fd.append("targetAudience", JSON.stringify(targetAudience.filter((t) => t.trim())));
      fd.append("prerequisites", JSON.stringify(prerequisites.filter((p) => p.trim())));

      if (teacherImgFile) fd.append("teacherImgFile", teacherImgFile);
      if (existingTeacherImgId) fd.append("oldTeacherImgId", existingTeacherImgId);
      if (teacherImgPreview && !teacherImgFile) fd.append("teacherImg", teacherImgPreview);
      if (existingTeacherImgId && !teacherImgFile) fd.append("teacherImgId", existingTeacherImgId);

      await requestWithAuth(COURSE_DETAILS_ADMIN, {
        method: "POST",
        body: fd,
        allowedRoles: ["admin"],
      });

      onSuccess?.(isEdit ? "Course details updated" : "Course details created");
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save course details");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="modal-overlay">
        <div className="delete-modal-container" style={{ maxWidth: "400px", textAlign: "center", padding: "2rem" }}>
          <MyButtonLoader />
          <p style={{ color: "#94a3b8", marginTop: "1rem" }}>Loading course details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="delete-modal-container"
        style={{ maxWidth: "640px", width: "94%", maxHeight: "85vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="create_name">
            <HiOutlineDocumentText size={28} color="#8b5cf6" />
            <h2>Course Details — {course.title}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <IoClose size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-error">{error}</div>}

          {/* Detailed Description */}
          <div className="form-group">
            <label>Detailed Description</label>
            <textarea
              value={formData.detailedDescription}
              onChange={(e) => handleChange("detailedDescription", e.target.value)}
              placeholder="Full course description..."
              rows={4}
              disabled={loading}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 resize-none focus:border-purple-500/50 focus:outline-none"
            />
          </div>

          {/* Course Outline */}
          <div className="form-group">
            <label>Course Outline</label>
            <textarea
              value={formData.courseOutline}
              onChange={(e) => handleChange("courseOutline", e.target.value)}
              placeholder="Week-by-week or topic-wise outline..."
              rows={3}
              disabled={loading}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 resize-none focus:border-purple-500/50 focus:outline-none"
            />
          </div>

          {/* Teacher Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-group">
              <label>Teacher Name</label>
              <CustomInput value={formData.teacherName} onChange={(v) => handleChange("teacherName", v)} placeholder="Instructor name" disabled={loading} />
            </div>
            <div className="form-group">
              <label>Teacher Designation</label>
              <CustomInput value={formData.teacherDesignation} onChange={(v) => handleChange("teacherDesignation", v)} placeholder="e.g. Senior Developer" disabled={loading} />
            </div>
          </div>

          {/* Teacher Bio */}
          <div className="form-group">
            <label>Teacher Bio</label>
            <textarea
              value={formData.teacherBio}
              onChange={(e) => handleChange("teacherBio", e.target.value)}
              placeholder="About the instructor..."
              rows={2}
              disabled={loading}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 resize-none focus:border-purple-500/50 focus:outline-none"
            />
          </div>

          {/* Teacher Image */}
          <div className="form-group">
            <label>Teacher Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleTeacherImg}
              disabled={loading}
              style={{ padding: "8px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#e2e8f0", fontSize: "13px" }}
            />
            {teacherImgPreview && (
              <img src={teacherImgPreview} alt="teacher" style={{ marginTop: "8px", width: "80px", height: "80px", objectFit: "cover", borderRadius: "50%", border: "2px solid rgba(139,92,246,0.4)" }} />
            )}
          </div>

          {/* Demo Video */}
          <div className="form-group">
            <label>Demo Video URL</label>
            <CustomInput value={formData.demoVideo} onChange={(v) => handleChange("demoVideo", v)} placeholder="https://youtube.com/..." disabled={loading} />
          </div>

          {/* Syllabus */}
          <div className="form-group">
            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              Syllabus
              <button type="button" onClick={() => addItem(setSyllabus, { title: "", description: "" })} style={{ background: "none", border: "none", color: "#8b5cf6", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}>
                <IoAddCircleOutline size={16} /> Add
              </button>
            </label>
            {syllabus.map((item, idx) => (
              <div key={idx} style={{ display: "flex", gap: "8px", marginTop: idx > 0 ? "6px" : "0", alignItems: "start" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <CustomInput value={item.title} onChange={(v) => setSyllabus((p) => p.map((s, i) => i === idx ? { ...s, title: v } : s))} placeholder={`Topic ${idx + 1}`} disabled={loading} />
                  <CustomInput value={item.description} onChange={(v) => setSyllabus((p) => p.map((s, i) => i === idx ? { ...s, description: v } : s))} placeholder="Description" disabled={loading} />
                </div>
                {syllabus.length > 1 && (
                  <button type="button" onClick={() => removeItem(setSyllabus, idx)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "8px 4px" }}>
                    <IoTrashOutline size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* FAQs */}
          <div className="form-group">
            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              FAQs
              <button type="button" onClick={() => addItem(setFaqs, { question: "", answer: "" })} style={{ background: "none", border: "none", color: "#8b5cf6", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}>
                <IoAddCircleOutline size={16} /> Add
              </button>
            </label>
            {faqs.map((item, idx) => (
              <div key={idx} style={{ display: "flex", gap: "8px", marginTop: idx > 0 ? "6px" : "0", alignItems: "start" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <CustomInput value={item.question} onChange={(v) => setFaqs((p) => p.map((f, i) => i === idx ? { ...f, question: v } : f))} placeholder={`Question ${idx + 1}`} disabled={loading} />
                  <CustomInput value={item.answer} onChange={(v) => setFaqs((p) => p.map((f, i) => i === idx ? { ...f, answer: v } : f))} placeholder="Answer" disabled={loading} />
                </div>
                {faqs.length > 1 && (
                  <button type="button" onClick={() => removeItem(setFaqs, idx)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "8px 4px" }}>
                    <IoTrashOutline size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Target Audience */}
          <div className="form-group">
            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              Target Audience
              <button type="button" onClick={() => addItem(setTargetAudience, "")} style={{ background: "none", border: "none", color: "#8b5cf6", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}>
                <IoAddCircleOutline size={16} /> Add
              </button>
            </label>
            {targetAudience.map((item, idx) => (
              <div key={idx} style={{ display: "flex", gap: "8px", marginTop: idx > 0 ? "6px" : "0" }}>
                <CustomInput value={item} onChange={(v) => setTargetAudience((p) => p.map((t, i) => i === idx ? v : t))} placeholder={`Audience ${idx + 1}`} disabled={loading} />
                {targetAudience.length > 1 && (
                  <button type="button" onClick={() => removeItem(setTargetAudience, idx)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "0 4px" }}>
                    <IoTrashOutline size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Prerequisites */}
          <div className="form-group">
            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              Prerequisites
              <button type="button" onClick={() => addItem(setPrerequisites, "")} style={{ background: "none", border: "none", color: "#8b5cf6", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}>
                <IoAddCircleOutline size={16} /> Add
              </button>
            </label>
            {prerequisites.map((item, idx) => (
              <div key={idx} style={{ display: "flex", gap: "8px", marginTop: idx > 0 ? "6px" : "0" }}>
                <CustomInput value={item} onChange={(v) => setPrerequisites((p) => p.map((pr, i) => i === idx ? v : pr))} placeholder={`Prerequisite ${idx + 1}`} disabled={loading} />
                {prerequisites.length > 1 && (
                  <button type="button" onClick={() => removeItem(setPrerequisites, idx)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "0 4px" }}>
                    <IoTrashOutline size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Certificate */}
          <div className="form-group checkbox" style={{ paddingTop: "8px" }}>
            <label>
              <input type="checkbox" checked={formData.certificateEnabled} onChange={(e) => handleChange("certificateEnabled", e.target.checked)} />
              Certificate Enabled
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? <MyButtonLoader /> : isEdit ? "Update Details" : "Save Details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseDetailsModal;
