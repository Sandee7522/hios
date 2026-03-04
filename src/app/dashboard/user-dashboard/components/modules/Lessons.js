"use client";

import React from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiPlayCircle,
  FiFileText,
  FiClock,
} from "react-icons/fi";

/**
 * Lessons
 * Displays a list of lessons for a module.
 * Clicking a lesson triggers onSelectLesson.
 */
export default function Lessons({
  lessons = [],
  selectedLessonId,
  onSelectLesson,
}) {
  if (!lessons || lessons.length === 0) {
    return (
      <p
        style={{
          color: "var(--dashboard-text-muted)",
          fontSize: "0.875rem",
          padding: "0.5rem 0",
        }}
      >
        No lessons available for this module.
      </p>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      {lessons.map((lesson, idx) => {
        const isActive = selectedLessonId === lesson._id;
        return (
          <button
            key={lesson._id || idx}
            onClick={() => onSelectLesson(lesson)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              borderRadius: "var(--dashboard-radius-md)",
              border: `1px solid ${isActive ? "var(--dashboard-primary)" : "var(--dashboard-border)"}`,
              background: isActive
                ? "var(--dashboard-primary-light)"
                : "var(--dashboard-surface)",
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
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                flex: 1,
              }}
            >
              <FiPlayCircle
                size={16}
                style={{
                  flexShrink: 0,
                  color: isActive
                    ? "var(--dashboard-primary)"
                    : "var(--dashboard-text-muted)",
                }}
              />
              <span
                style={{
                  fontWeight: isActive ? 600 : 400,
                  fontSize: "0.875rem",
                }}
              >
                {idx + 1}. {lesson.title || lesson.name || `Lesson ${idx + 1}`}
              </span>
            </span>

            {lesson.duration && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  fontSize: "0.75rem",
                  color: "var(--dashboard-text-muted)",
                  flexShrink: 0,
                }}
              >
                <FiClock size={12} />
                {lesson.duration}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
