"use client";

import React from "react";
import { FiVideo } from "react-icons/fi";
import { RiProgress2Line } from "react-icons/ri";

/** Convert a YouTube share/watch URL to an embeddable URL */
function toEmbedUrl(url) {
  if (!url) return null;
  try {
    // Handle https://youtu.be/<id>?si=...
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;

    // Handle https://www.youtube.com/watch?v=<id>
    const longMatch = url.match(/[?&]v=([^?&]+)/);
    if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}`;
  } catch (_) {}
  return null; // not a YouTube URL — treat as direct video src
}

function isYouTubeUrl(url) {
  return url && (url.includes("youtu.be") || url.includes("youtube.com"));
}

export default function LearningMetrial({ lesson }) {
  if (!lesson) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "300px",
          color: "var(--dashboard-text-muted)",
          textAlign: "center",
          gap: "0.75rem",
        }}
      >
        <FiVideo size={48} style={{ opacity: 0.25 }} />
        <p style={{ fontSize: "0.9rem" }}>
          Select a lesson from the sidebar or list below to start learning.
        </p>
      </div>
    );
  }

  const embedUrl = isYouTubeUrl(lesson.videoUrl)
    ? toEmbedUrl(lesson.videoUrl)
    : null;

  return (
    <div className="flex flex-col w-full">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <h2
          className="text-[1.05rem] sm:text-[1.15rem] font-bold"
          style={{ color: "var(--dashboard-text-primary)" }}
        >
          {lesson.title || "Untitled Lesson"}
        </h2>

        <div className="self-start sm:self-auto">
          <RiProgress2Line size={28} className="sm:size-8" />
        </div>
      </div>

      {/* ── Description ── */}
      {lesson.description && (
        <p
          className="text-sm leading-relaxed mb-4 sm:mb-6"
          style={{ color: "var(--dashboard-text-secondary)" }}
        >
          {lesson.description}
        </p>
      )}

      {/* ── Video ── */}
      {lesson.videoUrl ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "90rem",
              borderRadius: "var(--dashboard-radius-lg)",
              background: "#000",
              aspectRatio: "16 / 9",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {embedUrl ? (
              <iframe
                key={lesson._id}
                src={embedUrl}
                title={lesson.title || "Lesson Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  width: "100%",
                  height: "100%",
                  border: 0,
                  display: "block",
                }}
              />
            ) : (
              <video
                key={lesson._id}
                controls
                controlsList="nodownload"
                style={{ width: "100%", height: "100%", display: "block" }}
                src={lesson.videoUrl}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "900px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              textAlign: "center",
              padding: "2rem",
              borderRadius: "var(--dashboard-radius-lg)",
              background: "var(--dashboard-bg)",
              border: "1px dashed var(--dashboard-border)",
              aspectRatio: "16 / 9",
              color: "var(--dashboard-text-muted)",
            }}
          >
            <FiVideo size={36} style={{ opacity: 0.3 }} />
            <p style={{ fontSize: "0.875rem" }}>No video for this lesson.</p>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      {lesson.content && lesson.content !== lesson.description && (
        <div
          className="p-4 text-sm leading-relaxed"
          style={{
            borderRadius: "var(--dashboard-radius-md)",
            background: "var(--dashboard-bg)",
            border: "1px solid var(--dashboard-border)",
            color: "var(--dashboard-text-secondary)",
          }}
        >
          {lesson.content}
        </div>
      )}
    </div>
  );
}
