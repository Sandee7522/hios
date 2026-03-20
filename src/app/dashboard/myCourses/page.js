"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import DashboardLayout from "../component/DashboardLayout";
import { USER_ENROLLMENTS } from "../utils/api";
import { requestWithAuth } from "../utils/apiClient";
import MyLoader from "@/components/landing/MyLoder";

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await requestWithAuth(USER_ENROLLMENTS, {
          method: "GET",
          allowedRoles: ["user", "student"],
        });

        if (res?.success && Array.isArray(res.data)) {
          setEnrollments(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch enrollments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  return (
    <DashboardLayout role="user">
      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mb-8"
        >
          My Courses
        </motion.h1>

        {loading ? (
          <MyLoader />
        ) : enrollments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-slate-400 text-lg mb-4">
              You are not enrolled in any courses yet.
            </p>
            <Link
              href="/dashboard/component"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition"
            >
              Browse Courses
            </Link>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment, index) => {
              const course = enrollment.courseId;
              if (!course) return null;

              return (
                <motion.div
                  key={enrollment._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden hover:border-blue-500/30 transition-all duration-300"
                >
                  {/* Thumbnail */}
                  {course.thumbnail && (
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Payment status badge */}
                      <span
                        className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${
                          enrollment.paymentStatus === "full"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : enrollment.paymentStatus === "partial"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {enrollment.paymentStatus === "full"
                          ? "Paid"
                          : enrollment.paymentStatus === "partial"
                          ? "Partial"
                          : "Pending"}
                      </span>
                    </div>
                  )}

                  <div className="p-5 space-y-3">
                    {/* Title */}
                    <h2 className="text-lg font-semibold text-white line-clamp-2">
                      {course.title}
                    </h2>

                    {/* Instructor */}
                    {course.instructorId?.name && (
                      <p className="text-sm text-slate-400">
                        {course.instructorId.name}
                      </p>
                    )}

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Progress</span>
                        <span>{enrollment.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${enrollment.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Continue Button */}
                    <Link
                      href={`/dashboard/component/modules?courseId=${course._id}`}
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full mt-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition"
                      >
                        {enrollment.progress > 0
                          ? "Continue Learning"
                          : "Start Learning"}
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
