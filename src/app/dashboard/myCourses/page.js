"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../component/DashboardLayout";
import styles from "../dashboard.module.css";
import MyLoader from "@/components/landing/MyLoder";



export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCourses([
        {
          id: 1,
          title: "Advanced React Mastery",
          progress: 75,
          instructor: "John Doe",
        },
        {
          id: 2,
          title: "Node.js Backend Bootcamp",
          progress: 40,
          instructor: "Jane Smith",
        },
        {
          id: 3,
          title: "Full Stack MERN Project",
          progress: 90,
          instructor: "Michael Lee",
        },
      ]);
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardLayout role="user">
      <div className={styles.card}>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8"
        >
          📚 My Courses
        </motion.h1>

        {loading ? (
          <MyLoader />
        ) : courses.length === 0 ? (
          <p className="text-slate-400">
            You are not enrolled in any courses.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md hover:shadow-xl transition"
              >
                <h2 className="text-xl font-semibold mb-2">
                  {course.title}
                </h2>

                <p className="text-sm text-slate-400 mb-4">
                  Instructor: {course.instructor}
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 rounded-full h-3 mb-2">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>

                <p className="text-sm text-slate-400">
                  {course.progress}% Completed
                </p>

                <button className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition">
                  Continue Learning
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}