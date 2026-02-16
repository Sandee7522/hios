'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../component/DashboardLayout';
import styles from '../dashboard.module.css';
import { getUserProfile } from '../utils/auth';

export default function UserDashboard() {
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user profile
    const userProfile = getUserProfile();
    setProfile(userProfile);

    // Mock data for demonstration - replace with actual API calls
    setCourses([
      { id: 1, name: 'Introduction to Programming', progress: 75, instructor: 'Dr. Smith' },
      { id: 2, name: 'Web Development Basics', progress: 50, instructor: 'Prof. Johnson' },
      { id: 3, name: 'Database Management', progress: 30, instructor: 'Dr. Williams' },
    ]);

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="user">
        <div className={styles.flexCenter} style={{ minHeight: '400px' }}>
          <div className={styles.loading}></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="user">
      <div className={styles.fadeIn}>
        {/* Welcome Section */}
        <div className={styles.mb3}>
          <h1 className={styles.headerTitle}>Welcome back, {profile?.name || 'Student'}! 👋</h1>
          <p className={styles.textSecondary}>Here's your learning progress overview</p>
        </div>

        {/* Stats Grid */}
        <div className={`${styles.grid} ${styles.gridCols3} ${styles.mb3}`}>
          <div className={styles.statCard}>
            <h3 className={styles.statValue}>3</h3>
            <p className={styles.statLabel}>Enrolled Courses</p>
            <div className={`${styles.statChange} ${styles.statChangePositive}`}>
              ↑ 1 new this month
            </div>
          </div>

          <div className={styles.statCard}>
            <h3 className={styles.statValue}>52%</h3>
            <p className={styles.statLabel}>Average Progress</p>
            <div className={`${styles.statChange} ${styles.statChangePositive}`}>
              ↑ 12% from last week
            </div>
          </div>

          <div className={styles.statCard}>
            <h3 className={styles.statValue}>5</h3>
            <p className={styles.statLabel}>Pending Assignments</p>
            <div className={`${styles.statChange} ${styles.statChangeNegative}`}>
              2 due this week
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>My Courses</h2>
            <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}>
              Browse Courses
            </button>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.grid}>
              {courses.map((course) => (
                <div key={course.id} className={`${styles.card} ${styles.cardHover}`}>
                  <h3 className={styles.cardTitle} style={{ fontSize: '1.125rem' }}>
                    {course.name}
                  </h3>
                  <p className={`${styles.textMuted} ${styles.mb2}`}>
                    Instructor: {course.instructor}
                  </p>

                  {/* Progress Bar */}
                  <div className={styles.mb1}>
                    <div className={styles.flexBetween} style={{ marginBottom: '0.5rem' }}>
                      <span className={styles.textSecondary} style={{ fontSize: '0.875rem' }}>
                        Progress
                      </span>
                      <span className={styles.textPrimary} style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                        {course.progress}%
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: 'var(--dashboard-border)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${course.progress}%`,
                          height: '100%',
                          backgroundColor: 'var(--dashboard-primary)',
                          transition: 'width 0.3s ease',
                        }}
                      ></div>
                    </div>
                  </div>

                  <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`} style={{ width: '100%', marginTop: '1rem' }}>
                    Continue Learning →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
