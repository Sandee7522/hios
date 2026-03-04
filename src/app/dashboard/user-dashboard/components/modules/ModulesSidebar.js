"use client";

import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { FiChevronDown, FiChevronRight, FiPlayCircle } from "react-icons/fi";
export default function ModulesSidebar({
  modules = [],
  lessons = [],
  lessonsLoading = false,
  selectedModuleId,
  selectedLessonId,
  onSelectModule,
  onSelectLesson,
  isOpen,
  onClose,
}) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 900,
            display: "none",
          }}
          className="sidebar-overlay"
        />
      )}

      <aside
        style={{
          width: isOpen ? "335px" : "0",
          minWidth: isOpen ? "px" : "0",
          overflow: "hidden",
          background: "var(--dashboard-surface)",
          borderRight: "1px solid var(--dashboard-border)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          transition: "width 0.3s ease, min-width 0.3s ease",
        }}
      >
        <div
          style={{
            width: "330px",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "1rem",
              borderBottom: "1px solid var(--dashboard-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--dashboard-text-primary)",
              }}
            >
              Course Modules
            </span>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--dashboard-text-muted)",
                cursor: "pointer",
                display: "flex",
              }}
            >
              <IoClose size={18} />
            </button>
          </div>

          {/* Modules */}
          <nav style={{ flex: 1, overflowY: "auto" }}>
            {modules.length === 0 ? (
              <p
                style={{
                  padding: "2rem",
                  color: "var(--dashboard-text-muted)",
                  fontSize: "1rem",
                }}
              >
                No modules available.
              </p>
            ) : (
              modules.map((mod, idx) => {
                const isActiveModule = selectedModuleId === mod._id;
                return (
                  <div key={mod._id || idx}>
                    {/* Module Row */}
                    <button
                      onClick={() => onSelectModule(mod)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "0.75rem 1rem",
                        background: isActiveModule
                          ? "var(--dashboard-primary-light)"
                          : "transparent",
                        border: "none",
                        borderBottom: "1px solid var(--dashboard-border)",
                        cursor: "pointer",
                        color: isActiveModule
                          ? "var(--dashboard-primary)"
                          : "var(--dashboard-text-secondary)",
                        textAlign: "left",
                        transition: "background 0.2s",
                      }}
                    >
                      <span
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          background: isActiveModule
                            ? "var(--dashboard-primary)"
                            : "var(--dashboard-border)",
                          color: isActiveModule
                            ? "#fff"
                            : "var(--dashboard-text-muted)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span
                        style={{
                          fontSize: "1.6rem",
                          fontWeight: isActiveModule ? 900 : 800,
                          flex: 1,
                        }}
                      >
                        {mod.title || `Module ${idx + 1}`}
                      </span>
                      {isActiveModule ? (
                        <FiChevronDown size={14} style={{ flexShrink: 0 }} />
                      ) : (
                        <FiChevronRight size={14} style={{ flexShrink: 0 }} />
                      )}
                    </button>

                    {/* Lessons for this module (shown when active) */}
                    {isActiveModule && (
                      <div style={{ background: "var(--dashboard-bg)" }}>
                        {lessonsLoading ? (
                          <p
                            style={{
                              padding: "0.6rem 1.5rem",
                              fontSize: "1rem",
                              color: "var(--dashboard-text-muted)",
                            }}
                          >
                            Loading lessons…
                          </p>
                        ) : lessons.length === 0 ? (
                          <p
                            style={{
                              padding: "0.6rem 1.5rem",
                              fontSize: "0.75rem",
                              color: "var(--dashboard-text-muted)",
                            }}
                          >
                            No lessons yet.
                          </p>
                        ) : (
                          lessons.map((lesson, lIdx) => {
                            const isActiveLesson =
                              selectedLessonId === lesson._id;
                            return (
                              <button
                                key={lesson._id || lIdx}
                                onClick={() => onSelectLesson(lesson)}
                                style={{
                                  width: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "1rem",
                                  padding: "0.55rem 0.6rem 0.55rem 1.75rem",
                                  background: isActiveLesson
                                    ? "var(--dashboard-primary-light)"
                                    : "transparent",
                                  border: "none",
                                  borderBottom:
                                    "1px solid var(--dashboard-border)",
                                  cursor: "pointer",
                                  color: isActiveLesson
                                    ? "var(--dashboard-primary)"
                                    : "var(--dashboard-text-muted)",
                                  textAlign: "left",
                                  fontSize: "1rem",
                                  fontWeight: isActiveLesson ? 500 : 300,
                                  transition: "background 0.2s",
                                }}
                              >
                                <FiPlayCircle
                                  size={23}
                                  style={{ flexShrink: 0, opacity: 0.7 }}
                                />
                                {lesson.order ?? lIdx + 1}. {lesson.title}
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </nav>
        </div>
      </aside>
    </>
  );
}
