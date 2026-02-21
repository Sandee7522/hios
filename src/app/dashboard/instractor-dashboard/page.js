"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../component/DashboardLayout";
import styles from "../dashboard.module.css";
import { getUserProfile, getUserRole } from "../utils/auth";
import { GET_INSTRUCTOR_COURSES } from "../api";
import { requestWithAuth } from "../utils/apiClient";
import Footer from "@/components/landing/Footer";

export default function InstructorDashboard() {
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userProfile = getUserProfile();
    setProfile(userProfile);

    const role = getUserRole();
    if (role !== "instructor") {
      setError("You do not have permission to view the instructor dashboard.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch only this instructor's courses (backend already scopes by instructor)
        const response = await requestWithAuth(GET_INSTRUCTOR_COURSES, {
          method: "POST",
          body: {
            page: 1,
            pageSize: 10,
            sort: "desc",
          },
          allowedRoles: ["instructor"],
        });

        const courseResult = response?.data;
        const apiCourses = courseResult?.data || [];

        // Map API courses into the existing card shape
        const mappedCourses = apiCourses.map((course) => ({
          id: course._id,
          name: course.title,
          students: course.enrolledCount || 0,
          assignments: course.assignmentsCount || 0,
          status: course.isPublished ? "active" : "draft",
        }));

        setCourses(mappedCourses);

        // NOTE: Students section still uses placeholder data.
        // When you have a real endpoint (e.g. instructor/students),
        // you can plug it in here using the same pattern.
        setStudents([
          {
            id: 1,
            name: "John Doe",
            course: "Sample Course",
            progress: 85,
            grade: "A",
          },
        ]);
      } catch (err) {
        console.error("Instructor dashboard load error:", err);
        setError(err.message || "Failed to load instructor data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="instructor">
        <div className={styles.flexCenter} style={{ minHeight: "400px" }}>
          <div className={styles.loading}></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout role="instructor">
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
          <div className={styles.mb3}>
            <h1 className={styles.headerTitle}>
              Welcome, {profile?.name || "Instructor"}! 📚
            </h1>
            <p className={styles.textSecondary}>
              Manage your courses and track student progress
            </p>
          </div>

          {/* Stats Grid */}
          <div className={`${styles.grid} ${styles.gridCols4} ${styles.mb3}`}>
            <div className={styles.statCard}>
              <h3 className={styles.statValue}>3</h3>
              <p className={styles.statLabel}>Active Courses</p>
            </div>

            <div className={styles.statCard}>
              <h3 className={styles.statValue}>105</h3>
              <p className={styles.statLabel}>Total Students</p>
              <div
                className={`${styles.statChange} ${styles.statChangePositive}`}
              >
                ↑ 8 new this week
              </div>
            </div>

            <div className={styles.statCard}>
              <h3 className={styles.statValue}>19</h3>
              <p className={styles.statLabel}>Assignments</p>
            </div>

            <div className={styles.statCard}>
              <h3 className={styles.statValue}>12</h3>
              <p className={styles.statLabel}>Pending Grades</p>
              <div
                className={`${styles.statChange} ${styles.statChangeNegative}`}
              >
                Needs attention
              </div>
            </div>
          </div>

          {/* Courses Section */}
          <div className={`${styles.card} ${styles.mb3}`}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>My Courses</h2>
              <button
                className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}
              >
                + Create Course
              </button>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.grid}>
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className={`${styles.card} ${styles.cardHover}`}
                  >
                    <div
                      className={styles.flexBetween}
                      style={{ marginBottom: "1rem" }}
                    >
                      <h3
                        className={styles.cardTitle}
                        style={{ fontSize: "1.125rem", margin: 0 }}
                      >
                        {course.name}
                      </h3>
                      <span
                        className={
                          course.status === "active"
                            ? styles.badgeSuccess
                            : styles.badgeWarning
                        }
                      >
                        {course.status}
                      </span>
                    </div>

                    <div
                      className={`${styles.flexRow} ${styles.gap1} ${styles.mb2}`}
                    >
                      <div>
                        <p
                          className={styles.textMuted}
                          style={{ fontSize: "0.75rem" }}
                        >
                          Students
                        </p>
                        <p
                          className={styles.textPrimary}
                          style={{ fontSize: "1.25rem", fontWeight: "600" }}
                        >
                          {course.students}
                        </p>
                      </div>
                      <div>
                        <p
                          className={styles.textMuted}
                          style={{ fontSize: "0.75rem" }}
                        >
                          Assignments
                        </p>
                        <p
                          className={styles.textPrimary}
                          style={{ fontSize: "1.25rem", fontWeight: "600" }}
                        >
                          {course.assignments}
                        </p>
                      </div>
                    </div>

                    <div className={`${styles.flexRow} ${styles.gap1}`}>
                      <button
                        className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                        style={{ flex: 1 }}
                      >
                        View
                      </button>
                      <button
                        className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}
                        style={{ flex: 1 }}
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Students */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Recent Student Activity</h2>
              <button
                className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
              >
                View All
              </button>
            </div>

            <div className={styles.cardBody}>
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th className={styles.tableHeaderCell}>Student Name</th>
                    <th className={styles.tableHeaderCell}>Course</th>
                    <th className={styles.tableHeaderCell}>Progress</th>
                    <th className={styles.tableHeaderCell}>Grade</th>
                    <th className={styles.tableHeaderCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className={styles.tableRow}>
                      <td className={styles.tableCell}>
                        <strong>{student.name}</strong>
                      </td>
                      <td className={styles.tableCell}>{student.course}</td>
                      <td className={styles.tableCell}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <div
                            style={{
                              width: "100px",
                              height: "6px",
                              backgroundColor: "var(--dashboard-border)",
                              borderRadius: "3px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${student.progress}%`,
                                height: "100%",
                                backgroundColor: "var(--dashboard-success)",
                              }}
                            ></div>
                          </div>
                          <span style={{ fontSize: "0.875rem" }}>
                            {student.progress}%
                          </span>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <span className={styles.badgePrimary}>
                          {student.grade}
                        </span>
                      </td>
                      <td className={styles.tableCell}>
                        <button
                          className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardLayout>
      <Footer />
    </>
  );
}
