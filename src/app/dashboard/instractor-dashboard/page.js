'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../component/DashboardLayout';
import styles from '../dashboard.module.css';
import { getUserProfile } from '../utils/auth';

export default function InstructorDashboard() {
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load instructor profile
    const userProfile = getUserProfile();
    setProfile(userProfile);

    // Mock data for demonstration - replace with actual API calls
    setCourses([
      { id: 1, name: 'Introduction to Programming', students: 45, assignments: 8, status: 'active' },
      { id: 2, name: 'Web Development Basics', students: 32, assignments: 6, status: 'active' },
      { id: 3, name: 'Database Management', students: 28, assignments: 5, status: 'draft' },
    ]);

    setStudents([
      { id: 1, name: 'John Doe', course: 'Intro to Programming', progress: 85, grade: 'A' },
      { id: 2, name: 'Jane Smith', course: 'Web Development', progress: 72, grade: 'B+' },
      { id: 3, name: 'Mike Johnson', course: 'Database Management', progress: 90, grade: 'A+' },
      { id: 4, name: 'Sarah Williams', course: 'Intro to Programming', progress: 68, grade: 'B' },
    ]);

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="instructor">
        <div className={styles.flexCenter} style={{ minHeight: '400px' }}>
          <div className={styles.loading}></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="instructor">
      <div className={styles.fadeIn}>
        {/* Welcome Section */}
        <div className={styles.mb3}>
          <h1 className={styles.headerTitle}>Welcome, {profile?.name || 'Instructor'}! 📚</h1>
          <p className={styles.textSecondary}>Manage your courses and track student progress</p>
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
            <div className={`${styles.statChange} ${styles.statChangePositive}`}>
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
            <div className={`${styles.statChange} ${styles.statChangeNegative}`}>
              Needs attention
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div className={`${styles.card} ${styles.mb3}`}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>My Courses</h2>
            <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}>
              + Create Course
            </button>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.grid}>
              {courses.map((course) => (
                <div key={course.id} className={`${styles.card} ${styles.cardHover}`}>
                  <div className={styles.flexBetween} style={{ marginBottom: '1rem' }}>
                    <h3 className={styles.cardTitle} style={{ fontSize: '1.125rem', margin: 0 }}>
                      {course.name}
                    </h3>
                    <span className={course.status === 'active' ? styles.badgeSuccess : styles.badgeWarning}>
                      {course.status}
                    </span>
                  </div>

                  <div className={`${styles.flexRow} ${styles.gap1} ${styles.mb2}`}>
                    <div>
                      <p className={styles.textMuted} style={{ fontSize: '0.75rem' }}>Students</p>
                      <p className={styles.textPrimary} style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                        {course.students}
                      </p>
                    </div>
                    <div>
                      <p className={styles.textMuted} style={{ fontSize: '0.75rem' }}>Assignments</p>
                      <p className={styles.textPrimary} style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                        {course.assignments}
                      </p>
                    </div>
                  </div>

                  <div className={`${styles.flexRow} ${styles.gap1}`}>
                    <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`} style={{ flex: 1 }}>
                      View
                    </button>
                    <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`} style={{ flex: 1 }}>
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
            <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          style={{
                            width: '100px',
                            height: '6px',
                            backgroundColor: 'var(--dashboard-border)',
                            borderRadius: '3px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${student.progress}%`,
                              height: '100%',
                              backgroundColor: 'var(--dashboard-success)',
                            }}
                          ></div>
                        </div>
                        <span style={{ fontSize: '0.875rem' }}>{student.progress}%</span>
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={styles.badgePrimary}>{student.grade}</span>
                    </td>
                    <td className={styles.tableCell}>
                      <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}>
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
  );
}
