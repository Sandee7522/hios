"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import DashboardLayout from "../component/DashboardLayout";
import { GET_ALL_COURSES } from "../utils/api";
import { requestWithAuth } from "../utils/apiClient";
import MyLoader from "@/components/landing/MyLoder";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await requestWithAuth(GET_ALL_COURSES, {
          method: "POST",
          body: { page: 1, pageSize: 20, sort: "desc" },
          allowedRoles: ["user", "student"],
        });

        const apiCourses = response?.data?.data || [];
        setCourses(apiCourses);
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="user">
        <MyLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="user">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">Explore Courses</h1>
          <p className="text-slate-400 text-sm mt-1">
            {courses.length} courses available
          </p>
        </motion.div>

        {/* Course Grid */}
        {courses.length === 0 ? (
          <p className="text-slate-500 text-center py-16">
            No courses available right now.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course, i) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <Link href={`/dashboard/component/${course.slug}`}>
                  <div className="group rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden cursor-pointer hover:border-blue-500/25 transition-all duration-300 hover:-translate-y-1">
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden bg-slate-800">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm">
                          No Image
                        </div>
                      )}

                      {/* Level badge */}
                      {course.level && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider bg-black/50 text-white backdrop-blur-sm border border-white/10">
                          {course.level}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      {/* Title */}
                      <h3 className="text-base font-semibold text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
                        {course.title}
                      </h3>

                      {/* Instructor */}
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {(course.instructorId?.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-slate-400 truncate">
                          {course.instructorId?.name || "Unknown"}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-white">
                            {course.currency || "INR"}{" "}
                            {Number(course.totalFee || 0).toLocaleString()}
                          </span>
                          {course.discount > 0 && course.price > 0 && (
                            <span className="text-xs text-slate-500 line-through">
                              {course.currency || "INR"} {course.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {course.discount > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/20">
                            {course.discount}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
