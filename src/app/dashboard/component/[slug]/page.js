"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { GET_COURSE_BY_SLUG } from "../../utils/api";
import styles from "../../dashboard.module.css";
import DashboardLayout from "@/app/dashboard/component/DashboardLayout";
import { requestWithAuth } from "@/app/dashboard/utils/apiClient";
import Link from "next/link";
import MyLoader from "@/components/landing/MyLoder";

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
  const [paymentPercent, setPaymentPercent] = useState(100);

  const getPayAmount = () => {
    const total = Number(course.totalFee || 0);
    return ((total * paymentPercent) / 100).toFixed(2);
  };

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

        const response = await requestWithAuth(GET_COURSE_BY_SLUG(slug), {
          method: "GET",
          allowedRoles: ["user", "student"],
        });

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
        <MyLoader />
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
      <div className={styles.card}>
        {/* ===== TOP GRID ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ================= LEFT DETAILS ================= */}
          <div className="lg:col-span-2">
            <div>
              <div className={styles.cardBody}>
                {/* Title */}
                <h1 className={`${styles.headerTitle} mb-2`}>
                  {course.title || "Untitled Course"}
                </h1>

                {/* Meta */}
                <div className="text-sm space-y-1 mb-6">
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

                {/* Description */}
                {course.description && (
                  <div className="mb-6">
                    <h2 className={`${styles.cardTitle} mb-2`}>
                      About this Course
                    </h2>
                    <p className={styles.textSecondary}>{course.description}</p>
                  </div>
                )}

                {/* Learn */}
                {course.whatYouWillLearn?.length > 0 && (
                  <div className="mb-6">
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
                  <div className="mb-6">
                    <h2 className={`${styles.cardTitle} mb-2`}>Requirements</h2>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      {course.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ================= RIGHT IMAGE ================= */}
          <div className="lg:col-span-1">
            {course.thumbnail && (
              <div className="sticky top-24">
                <div className="overflow-hidden rounded-2xl bg-gray-100 group cursor-pointer">
                  {/* 🔥 Hover Effect */}
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full  h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* overlay */}
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground">
                      Preview Course
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= PAYMENT SECTION ================= */}
        {course.totalFee !== undefined && (
          <div className="mt-10">
            <div className="p-6 rounded-2xl border border-border bg-muted/40">
              {/* Price */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h3 className="text-xl font-bold">Choose Payment</h3>

                <div className="text-3xl font-extrabold text-primary">
                  {course.currency} {getPayAmount()}
                </div>
              </div>

              {/* 🔥 Payment Options */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[25, 50, 100].map((percent) => (
                  <button
                    key={percent}
                    onClick={() => setPaymentPercent(percent)}
                    className={`py-3 rounded-xl border font-semibold transition ${
                      paymentPercent === percent
                        ? "bg-primary text-white border-primary"
                        : " hover:bg-muted border-border"
                    }`}
                  >
                    Pay {percent}%
                  </button>
                ))}
              </div>

              {/* Enroll */}
              <Link
                href={`/dashboard/component/modules?courseId=${course._id}`}
              >
                <button
                  className={`${styles.btn} ${styles.btnPrimary} w-full py-3`}
                >
                  Continue to Payment
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
