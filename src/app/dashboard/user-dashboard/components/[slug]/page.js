"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { GET_COURSE_BY_SLUG } from "../../../api";
import styles from "../../../dashboard.module.css";
import DashboardLayout from "@/app/dashboard/component/DashboardLayout";
import { requestWithAuth } from "@/app/dashboard/utils/apiClient";

/* ================= HELPERS ================= */

const formatDuration = (duration) => {
  if (!duration) return null;
  const h = duration.hours || 0;
  const m = duration.minutes || 0;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  if (m) return `${m}m`;
  return null;
};

/* ================= COMPONENT ================= */

export default function CourseDetailPage() {
  const { slug } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) {
      console.warn("[CourseDetail] Missing slug in params");
      setLoading(false);
      setError("Invalid course link.");
      return;
    }

    let isMounted = true;

    const fetchCourse = async () => {
      console.group("[CourseDetail] Fetch Course");
      console.log("Slug:", slug);

      try {
        setLoading(true);
        setError("");

        const response = await requestWithAuth(
          GET_COURSE_BY_SLUG(slug),
          {
            method: "GET",
            allowedRoles: ["user", "student"],
          }
        );

        console.log("API response:", response);

        const data = response?.data;

        if (!data) {
          console.warn("[CourseDetail] Empty course data");
          if (isMounted) setError("Course not found.");
          return;
        }

        if (isMounted) {
          setCourse(data);
          console.log("[CourseDetail] Course loaded successfully");
        }
      } catch (err) {
        console.error("[CourseDetail] Fetch error:", err);

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load course.";

        if (isMounted) setError(message);
      } finally {
        if (isMounted) setLoading(false);
        console.groupEnd();
      }
    };

    fetchCourse();

    return () => {
      isMounted = false;
      console.log("[CourseDetail] Cleanup — request cancelled");
    };
  }, [slug]);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <DashboardLayout role="user">
        <div className={styles.flexCenter} style={{ minHeight: "400px" }}>
          <div className={styles.loading}></div>
        </div>
      </DashboardLayout>
    );
  }

  /* ================= ERROR ================= */

  if (error || !course) {
    console.warn("[CourseDetail] Render error state:", error);

    return (
      <DashboardLayout role="user">
        <div
          style={{
            padding: "1rem",
            borderRadius: "var(--dashboard-radius-md)",
            backgroundColor: "var(--dashboard-danger-light)",
            color: "var(--dashboard-danger)",
            fontSize: "0.875rem",
          }}
        >
          {error || "Course not found."}
        </div>
      </DashboardLayout>
    );
  }

  /* ================= RENDER ================= */

  return (
    <DashboardLayout role="user">
      <div className={styles.fadeIn}>
        {/* Thumbnail */}
        {course.thumbnail && (
          <div className="w-full overflow-hidden rounded-xl mb-6 max-h-80 bg-gray-100">
            <img
              src={course.thumbnail}
              alt={course.title || "course-thumbnail"}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.warn("[CourseDetail] Thumbnail failed to load");
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}

        <div className={styles.card}>
          <div className={styles.cardBody}>
            {/* Title */}
            <h1 className={`${styles.headerTitle} mb-2`}>
              {course.title || "Untitled Course"}
            </h1>

            {/* Meta */}
            <div className="text-sm space-y-1 mb-4">
              {course.instructorId?.name && (
                <p>
                  Instructor:{" "}
                  <span className={styles.textSecondary}>
                    {course.instructorId.name}
                  </span>
                </p>
              )}

              {course.level && (
                <p>
                  Level: <span className="capitalize">{course.level}</span>
                </p>
              )}

              {course.courseLanguage && (
                <p>
                  Language:{" "}
                  <span className="capitalize">
                    {course.courseLanguage}
                  </span>
                </p>
              )}

              {formatDuration(course.duration) && (
                <p>Duration: {formatDuration(course.duration)}</p>
              )}

              {course.categoryId?.name && (
                <p>Category: {course.categoryId.name}</p>
              )}
            </div>

            {/* Price */}
            {course.totalFee !== undefined && (
              <div className="mb-5 p-4 rounded-xl bg-muted/40 border border-border">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-primary">
                    {course.currency}{" "}
                    {Number(course.totalFee).toLocaleString()}.00
                  </span>

                  {course.discount > 0 && (
                    <>
                      <span className="text-sm text-muted-foreground line-through">
                        {course.currency}{" "}
                        {course.price?.toLocaleString()}
                      </span>

                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium">
                        -{course.discount}% OFF
                      </span>
                    </>
                  )}
                </div>

                {course.partialPaymentEnabled && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Partial payment available. Min: {course.currency}{" "}
                    {course.minimumPayment}
                  </p>
                )}

                <button
                  className={`${styles.btn} ${styles.btnPrimary} w-full mt-4 py-3`}
                  onClick={() =>
                    console.log("[CourseDetail] Enroll clicked:", course._id)
                  }
                >
                  Enroll Now
                </button>
              </div>
            )}

            {/* Description */}
            {course.description && (
              <div className="mb-5">
                <h2 className={`${styles.cardTitle} mb-2`}>
                  About this Course
                </h2>
                <p className={styles.textSecondary}>
                  {course.description}
                </p>
              </div>
            )}

            {/* What You'll Learn */}
            {course.whatYouWillLearn?.length > 0 && (
              <div className="mb-5">
                <h2 className={`${styles.cardTitle} mb-2`}>
                  What You'll Learn
                </h2>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {course.whatYouWillLearn.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {course.requirements?.length > 0 && (
              <div className="mb-5">
                <h2 className={`${styles.cardTitle} mb-2`}>
                  Requirements
                </h2>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {course.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            {course.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-full bg-muted border border-border text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}