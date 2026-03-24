"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { TfiMenuAlt } from "react-icons/tfi";
import { requestWithAuth } from "@/app/dashboard/utils/apiClient";
import styles from "@/app/dashboard/dashboard.module.css";
import ModulesSidebar from "./ModulesSidebar";
import LearningMetrial from "./LearningMetrial";
import {
  MODULE_BY_COURSEID,
  GET_ALL_MODULES_BYID,
  GET_LESSON,
} from "@/app/dashboard/utils/api";
import MyLoader from "@/components/landing/MyLoder";
import PageHeader from "@/components/common/PageHeader";

export default function ModulesPage() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  /* ── State ── */
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);

  // lessons for the currently selected module
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const [modulesLoading, setModulesLoading] = useState(true);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [modulesError, setModulesError] = useState("");
  const [lessonsError, setLessonsError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* ============================================================
     1. Fetch modules by courseId  →  MODULE_BY_COURSEID
     ============================================================ */
  useEffect(() => {
    if (!courseId) {
      setModulesLoading(false);
      setModulesError(
        "No courseId provided. Please navigate here from a course page.",
      );
      return;
    }

    let isMounted = true;

    const fetchModules = async () => {
      try {
        setModulesLoading(true);
        setModulesError("");

        const res = await requestWithAuth(MODULE_BY_COURSEID, {
          method: "POST",
          body: { courseId },
          allowedRoles: ["user", "student"],
        });

        console.log("[Modules] MODULE_BY_COURSEID response:", res);

        // Response shape: { message, data: [...] }
        const list = Array.isArray(res?.data) ? res.data : [];

        if (isMounted) {
          setModules(list);
          if (list.length > 0) {
            setSelectedModule(list[0]);
          }
        }
      } catch (err) {
        console.error("[Modules] MODULE_BY_COURSEID error:", err);
        if (isMounted)
          setModulesError(err?.message || "Failed to load modules.");
      } finally {
        if (isMounted) setModulesLoading(false);
      }
    };

    fetchModules();
    return () => {
      isMounted = false;
    };
  }, [courseId]);

  /* ============================================================
     2. Fetch lessons for selected module  →  GET_LESSON?moduleId=
     ============================================================ */
  const fetchLessons = useCallback(async (moduleId) => {
    if (!moduleId) return;
    let isMounted = true;

    try {
      setLessonsLoading(true);
      setLessonsError("");
      setLessons([]);
      setSelectedLesson(null);

      const res = await requestWithAuth(`${GET_LESSON}?moduleId=${moduleId}`, {
        method: "GET",
        allowedRoles: ["user", "student"],
      });

      console.log("[Modules] GET_LESSON response:", res);

      // Response shape: { message, data: [...] }
      const list = Array.isArray(res?.data) ? res.data : [];
      const sorted = [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      if (isMounted) {
        setLessons(sorted);
        if (sorted.length > 0) {
          setSelectedLesson(sorted[0]);
        }
      }
    } catch (err) {
      console.error("[Modules] GET_LESSON error:", err);
      if (isMounted) setLessonsError(err?.message || "Failed to load lessons.");
    } finally {
      if (isMounted) setLessonsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  /* Auto-fetch lessons when selectedModule changes */
  useEffect(() => {
    if (selectedModule?._id) {
      fetchLessons(selectedModule._id);
    }
  }, [selectedModule?._id, fetchLessons]);

  /* ============================================================
     3. Handle module selection (also calls GET_ALL_MODULES_BYID)
     ============================================================ */
  const handleSelectModule = useCallback(async (mod) => {
    setSelectedModule(mod);

    // Optional: fetch full module detail for updated description etc.
    try {
      const res = await requestWithAuth(GET_ALL_MODULES_BYID, {
        method: "POST",
        body: { id: mod._id },
        allowedRoles: ["user", "student"],
      });
      console.log("[Modules] GET_ALL_MODULES_BYID response:", res);
      const detail = res?.data;
      if (detail) {
        setSelectedModule((prev) => ({ ...prev, ...detail }));
      }
    } catch (err) {
      // Non-critical — we already have basic module info
      console.warn("[Modules] GET_ALL_MODULES_BYID error (non-critical):", err);
    }
  }, []);

  /* ============================================================
     LOADING STATE
     ============================================================ */
  if (modulesLoading) {
    return (
      <div className={styles.flexCenter}>
        <MyLoader />{" "}
      </div>
    );
  }

  /* ============================================================
     ERROR STATE
     ============================================================ */
  if (modulesError) {
    return (
      <div
        className={styles.flexCenter}
        style={{ minHeight: "100vh", background: "var(--dashboard-bg)" }}
      >
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderRadius: "var(--dashboard-radius-md)",
            background: "var(--dashboard-danger-light)",
            color: "var(--dashboard-danger)",
            maxWidth: "480px",
            textAlign: "center",
            fontSize: "0.9rem",
          }}
        >
          {modulesError}
        </div>
      </div>
    );
  }

  /* ============================================================
     MAIN RENDER
     ============================================================ */
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--dashboard-bg)",
        color: "var(--dashboard-text-primary)",
      }}
    >
      {/* ── Top Navbar ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 500, padding: "0.5rem 1rem 0" }}>
        <PageHeader
          title={selectedModule?.title || "Learning Dashboard"}
          subtitle={selectedLesson?.title || "Select a lesson to start learning"}
          actions={
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-700/80 bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              aria-label="Toggle sidebar"
            >
              <TfiMenuAlt size={20} />
            </button>
          }
        />
      </div>

      {/* ── Body ── */}
      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          height: "calc(100vh - 60px)",
        }}
      >
        {/* ── Sidebar ── */}

        <ModulesSidebar
          modules={modules}
          lessons={lessons}
          lessonsLoading={lessonsLoading}
          selectedModuleId={selectedModule?._id}
          selectedLessonId={selectedLesson?._id}
          onSelectModule={handleSelectModule}
          onSelectLesson={(lesson) => setSelectedLesson(lesson)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* ── Main Content ── */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          {/* Lesson Video + Info */}
          <div
            style={{
              background: "var(--dashboard-surface)",
              border: "1px solid var(--dashboard-border)",
              borderRadius: "var(--dashboard-radius-lg)",
              padding: "1.25rem",
            }}
          >
            <LearningMetrial lesson={selectedLesson} />
          </div>

          {/* Lessons list for current module */}
          {selectedModule && (
            <div
              style={{
                background: "var(--dashboard-surface)",
                border: "1px solid var(--dashboard-border)",
                borderRadius: "var(--dashboard-radius-lg)",
                padding: "1.25rem",
              }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "var(--dashboard-text-primary)",
                  margin: "0 0 1rem",
                }}
              >
                {selectedModule.title} — Lessons
              </h3>

              {lessonsLoading ? (
                <div
                  className={styles.flexCenter}
                  style={{ minHeight: "80px" }}
                >
                  <div className={styles.loading} />
                </div>
              ) : lessonsError ? (
                <p
                  style={{
                    color: "var(--dashboard-danger)",
                    fontSize: "0.875rem",
                  }}
                >
                  {lessonsError}
                </p>
              ) : lessons.length === 0 ? (
                <p
                  style={{
                    color: "var(--dashboard-text-muted)",
                    fontSize: "0.875rem",
                  }}
                >
                  No lessons available for this module.
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {lessons.map((lesson, idx) => {
                    const isActive = selectedLesson?._id === lesson._id;
                    return (
                      <button
                        key={lesson._id || idx}
                        onClick={() => setSelectedLesson(lesson)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.75rem 1rem",
                          borderRadius: "var(--dashboard-radius-md)",
                          border: `1px solid ${isActive ? "var(--dashboard-primary)" : "var(--dashboard-border)"}`,
                          background: isActive
                            ? "var(--dashboard-primary-light)"
                            : "transparent",
                          cursor: "pointer",
                          color: isActive
                            ? "var(--dashboard-primary)"
                            : "var(--dashboard-text-secondary)",
                          textAlign: "left",
                          transition: "all 0.2s ease",
                          width: "100%",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: isActive ? 600 : 400,
                          }}
                        >
                          {lesson.order ?? idx + 1}. {lesson.title}
                        </span>
                        {lesson.isPublished === false && (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              padding: "2px 8px",
                              borderRadius: "20px",
                              background: "var(--dashboard-warning-light)",
                              color: "var(--dashboard-warning)",
                            }}
                          >
                            Draft
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
