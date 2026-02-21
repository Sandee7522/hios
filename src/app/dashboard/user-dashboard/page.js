"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../component/DashboardLayout";
import styles from "../dashboard.module.css";
import { getUserProfile, getUserRole } from "../utils/auth";
import { GET_ALL_COURSES } from "../api";
import { requestWithAuth } from "../utils/apiClient";
import Footer from "@/components/landing/Footer";

export default function UserDashboard() {
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * Format duration object {hours, minutes} to readable string
   * Reusable helper function to prevent React rendering errors
   */
  const formatDuration = (duration) => {
    if (!duration) return null;
    if (typeof duration === "string") return duration;
    if (typeof duration === "object") {
      const hours = duration.hours || 0;
      const minutes = duration.minutes || 0;
      if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m`;
      } else if (hours > 0) {
        return `${hours}h`;
      } else if (minutes > 0) {
        return `${minutes}m`;
      }
    }
    return null;
  };

  useEffect(() => {
    const userProfile = getUserProfile();
    setProfile(userProfile);

    const role = getUserRole();
    if (role !== "user" && role !== "student") {
      setError("You do not have permission to view the student dashboard.");
      setLoading(false);
      return;
    }

    const fetchCourses = async () => {
      try {
        // Fetch published courses list; backend already filters to isPublished=true
        const response = await requestWithAuth(GET_ALL_COURSES, {
          method: "POST",
          body: {
            page: 1,
            pageSize: 10,
            sort: "desc",
          },
          // Any authenticated learner-type role can access this
          allowedRoles: ["user", "student"],
        });

        const result = response?.data;
        console.log("result::::::::::::::::::::", result);
        const apiCourses = result?.data || [];

        // Map API courses with all important fields for UI display
        const mappedCourses = apiCourses.map((course) => ({
          id: course._id,
          name: course.title,
          slug: course.slug,
          description: course.description,
          thumbnail: course.thumbnail,
          previewVideo: course.previewVideo,
          instructor: course.instructorId?.name || "Unknown instructor",
          instructorId: course.instructorId,
          categoryId: course.categoryId,
          level: course.level,
          courseLanguage: course.courseLanguage,
          price: course.price,
          discount: course.discount,
          totalFee: course.totalFee,
          currency: course.currency || "INR",
          partialPaymentEnabled: course.partialPaymentEnabled,
          minimumPayment: course.minimumPayment,
          duration: course.duration,
          requirements: course.requirements || [],
          whatYouWillLearn: course.whatYouWillLearn || [],
          tags: course.tags || [],
          progress: course.progress || 0,
          status: course.status,
          isPublished: course.isPublished,
        }));

        setCourses(mappedCourses);
      } catch (err) {
        console.error("User dashboard load error:", err);
        setError(err.message || "Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="user">
        <div className={styles.flexCenter} style={{ minHeight: "400px" }}>
          <div className={styles.loading}></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout role="user">
        <div className={styles.fadeIn}>
          {error && (
            <div
              style={{
                padding: "1rem",
                marginBottom: "1.5rem",
                borderRadius: "var(--dashboard-radius-md)",
                backgroundColor: "var(--dashboard-danger-light)",
                color: "var(--dashboard-danger)",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </div>
          )}
          {/* Welcome Section */}
          <div
            className={`${styles.mb3} flex flex-col items-center text-center`}
          >
            <h1 className={styles.headerTitle}>
              Welcome back, {profile?.name || "Student"}! 👋
            </h1>
            <p className={styles.textSecondary}>
              Here's your learning progress overview
            </p>
            <p className={`${styles.textSecondary} mt-2`}>
              This page contains all your published courses.
            </p>
            <p className={`${styles.textPrimary} mt-2 font-semibold`}>
              Keep pushing forward—every step takes you closer to your goals! 🚀
            </p>
          </div>

          {/* Enrolled Courses */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>All Courses</h2>
              <button
                className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}
              >
                Browse Courses
              </button>
            </div>

            <div className={styles.cardBody}>
              {/* Responsive grid: 1 col mobile, 2 col sm, 3 col lg+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {courses.map((course) => (
                  <div
                    key={course.id || course._id}
                    className={`
            ${styles.card} 
            ${styles.cardHover} 
            flex flex-col 
            overflow-hidden 
            transition-all duration-300 
            hover:shadow-xl hover:-translate-y-1
          `}
                  >
                    {/* Course Thumbnail */}
                    {course.thumbnail && (
                      <div className="aspect-4/3 w-full overflow-hidden bg-gray-100">
                        <img
                          src={course.thumbnail}
                          alt={course.name || "Course thumbnail"}
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Card Content */}
                    <div className="flex flex-col grow p-5 md:p-6">
                      <h3
                        className={`${styles.cardTitle} text-lg md:text-xl mb-2 line-clamp-2`}
                      >
                        {course.name || course.title || "Untitled Course"}
                      </h3>

                      {/* Short Description */}
                      {course.shortDescription && (
                        <p
                          className={`${styles.textMuted} text-sm md:text-base mb-4 line-clamp-3`}
                        >
                          {course.shortDescription}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="text-xs md:text-sm text-muted-foreground space-y-1 mb-4">
                        {course.instructor && (
                          <p>
                            Instructor:{" "}
                            <span className={styles.textSecondary}>
                              {course.instructor}
                            </span>
                          </p>
                        )}
                        {course.level && (
                          <p>
                            Level:{" "}
                            <span className="capitalize">{course.level}</span>
                          </p>
                        )}
                        {course.duration && formatDuration(course.duration) && (
                          <p>Duration: {formatDuration(course.duration)}</p>
                        )}
                      </div>

                      {/* Price Block */}

                      {/* What You Will Learn */}
                      {course.whatYouWillLearn?.length > 0 && (
                        <div className="mb-4 md:mb-5">
                          <p
                            className={`${styles.textSecondary} text-[11px] sm:text-xs md:text-sm font-semibold mb-2`}
                          >
                            What You'll Learn:
                          </p>
                          <ul
                            className="
                            text-[11px] sm:text-xs md:text-sm
                            text-muted-foreground
                            flex flex-wrap gap-x-3 gap-y-1.5
                            list-disc pl-5
                            marker:text-primary/70
                            sm:pl-4
                          "
                            style={{
                              // Reduce unnecessary left space on small screens, more list in single line on wide screens
                              marginLeft: 0,
                            }}
                          >
                            {course.whatYouWillLearn
                              .slice(0, 3)
                              .map((item, idx) => (
                                <li
                                  key={idx}
                                  className="flex-1 min-w-30 max-w-[60%] truncate md:max-w-[70%] wrap-break-word"
                                  style={{ listStylePosition: "inside" }}
                                >
                                  {item}
                                </li>
                              ))}
                            {course.whatYouWillLearn.length > 3 && (
                              <li className="text-primary/80 text-[11px] sm:text-xs min-w-fit font-medium">
                                +{course.whatYouWillLearn.length - 3} more
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Tags */}
                      {course.tags?.length > 0 && (
                        <div
                          className="flex flex-wrap gap-2 mb-2 md:mb-3"
                          style={{
                            backgroundColor:
                              "var(--dashboard-surface, #f4f4f7)", // fallback color if var not found
                            borderRadius: "12px",
                          }}
                        >
                          {course.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-muted border border-border text-muted-foreground whitespace-nowrap"
                              style={{
                                backgroundColor: "rgba(246, 222, 222, 0.04)",
                                marginRight: "0.5rem",
                                marginBottom: "0.15rem",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {course.totalFee !== undefined && (
                        <div className="mb-4 md:mb-5 p-3 md:p-4 rounded-xl bg-muted/40 border border-border">
                          {/* Original Price + Discount */}

                          {/* Final Price (Professional UI, Responsive) */}
                          <div className="flex flex-col sm:flex-row sm:flex-wrap items-end gap-2 sm:gap-3">
                            <span className="text-xl xs:text-2xl md:text-3xl font-extrabold text-primary tracking-tight whitespace-nowrap flex items-baseline gap-2 sm:gap-3">
                              {/* Price and currency */}
                              <span>
                                {course.currency}
                                <span
                                  style={{
                                    fontVariantNumeric: "tabular-nums",
                                    letterSpacing: "0.02em",
                                  }}
                                  className="ml-0.5"
                                >
                                  {course.totalFee.toLocaleString(undefined, {
                                    minimumFractionDigits: 0,
                                  })}
                                  .00
                                </span>
                              </span>

                              {/* Discount - show below price on mobile, right to price on md+ */}
                              {course.discount > 0 && course.price && (
                                <span className="flex flex-row items-baseline space-x-2">
                                  <span className="text-xs md:text-sm text-muted-foreground line-through whitespace-nowrap">
                                    {course.currency}{" "}
                                    {course.price.toLocaleString()}
                                  </span>
                                  <span className="text-[10px] md:text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium whitespace-nowrap">
                                    -{course.discount}% OFF
                                  </span>
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <button
                        className={`
                          ${styles.btn} 
                          ${styles.btnSecondary} 
                          mt-[-4px
                          w-full 
                          py-3 
                          text-sm md:text-base
                        `}
                      >
                        Continue to Payment →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
      <Footer />
    </>
  );
}
