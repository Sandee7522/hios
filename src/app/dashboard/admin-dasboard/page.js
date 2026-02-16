'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../component/DashboardLayout';
import styles from '../dashboard.module.css';
import { getUserProfile } from '../utils/auth';

export default function AdminDashboard() {
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    // Load admin profile
    const userProfile = getUserProfile();
    setProfile(userProfile);

    // Mock data for demonstration - replace with actual API calls
    setUsers([
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active', joinDate: '2024-01-15' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'instructor', status: 'active', joinDate: '2024-02-20' },
      { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'user', status: 'active', joinDate: '2024-03-10' },
      { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', role: 'instructor', status: 'inactive', joinDate: '2024-01-05' },
      { id: 5, name: 'Tom Brown', email: 'tom@example.com', role: 'admin', status: 'active', joinDate: '2023-12-01' },
    ]);

    setRoles([
      { id: 1, name: 'admin', users: 2, permissions: 'Full Access' },
      { id: 2, name: 'instructor', users: 15, permissions: 'Course Management' },
      { id: 3, name: 'user', users: 105, permissions: 'Basic Access' },
    ]);

    setLoading(false);
  }, []);

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'admin':
        return styles.badgeDanger;
      case 'instructor':
        return styles.badgePrimary;
      default:
        return styles.badgeInfo;
    }
  };

  const getStatusBadgeStyle = (status) => {
    return status === 'active' ? styles.badgeSuccess : styles.badgeWarning;
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className={styles.flexCenter} style={{ minHeight: '400px' }}>
          <div className={styles.loading}></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className={styles.fadeIn}>
        {/* Welcome Section */}
        <div className={styles.mb3}>
          <h1 className={styles.headerTitle}>Admin Dashboard ⚡</h1>
          <p className={styles.textSecondary}>Manage users, roles, and system settings</p>
        </div>

        {/* Stats Grid */}
        <div className={`${styles.grid} ${styles.gridCols4} ${styles.mb3}`}>
          <div className={styles.statCard}>
            <h3 className={styles.statValue}>122</h3>
            <p className={styles.statLabel}>Total Users</p>
            <div className={`${styles.statChange} ${styles.statChangePositive}`}>
              ↑ 12% this month
            </div>
          </div>

          <div className={styles.statCard}>
            <h3 className={styles.statValue}>15</h3>
            <p className={styles.statLabel}>Instructors</p>
          </div>

          <div className={styles.statCard}>
            <h3 className={styles.statValue}>3</h3>
            <p className={styles.statLabel}>Roles</p>
          </div>

          <div className={styles.statCard}>
            <h3 className={styles.statValue}>98%</h3>
            <p className={styles.statLabel}>System Uptime</p>
            <div className={`${styles.statChange} ${styles.statChangePositive}`}>
              All systems operational
            </div>
          </div>
        </div>

        {/* Roles Section */}
        <div className={`${styles.card} ${styles.mb3}`}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>System Roles</h2>
            <button
              className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}
              onClick={() => setShowRoleModal(true)}
            >
              + Create Role
            </button>
          </div>

          <div className={styles.cardBody}>
            <div className={`${styles.grid} ${styles.gridCols3}`}>
              {roles.map((role) => (
                <div key={role.id} className={`${styles.card} ${styles.cardHover}`}>
                  <div className={styles.flexBetween} style={{ marginBottom: '1rem' }}>
                    <h3 className={styles.cardTitle} style={{ fontSize: '1.125rem', margin: 0, textTransform: 'capitalize' }}>
                      {role.name}
                    </h3>
                    <span className={getRoleBadgeStyle(role.name)}>
                      {role.users}
                    </span>
                  </div>
                  <p className={`${styles.textMuted} ${styles.mb2}`}>
                    {role.permissions}
                  </p>
                  <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`} style={{ width: '100%' }}>
                    Edit Permissions
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>User Management</h2>
            <div className={`${styles.flexRow} ${styles.gap1}`}>
              <input
                type="text"
                placeholder="Search users..."
                className={styles.formInput}
                style={{ width: '200px', padding: '0.5rem' }}
              />
              <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}>
                Filter
              </button>
            </div>
          </div>

          <div className={styles.cardBody}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableHeaderCell}>Name</th>
                  <th className={styles.tableHeaderCell}>Email</th>
                  <th className={styles.tableHeaderCell}>Role</th>
                  <th className={styles.tableHeaderCell}>Status</th>
                  <th className={styles.tableHeaderCell}>Join Date</th>
                  <th className={styles.tableHeaderCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <div className={styles.flexRow} style={{ alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--dashboard-primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                          }}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <strong>{user.name}</strong>
                      </div>
                    </td>
                    <td className={styles.tableCell}>{user.email}</td>
                    <td className={styles.tableCell}>
                      <span className={getRoleBadgeStyle(user.role)}>
                        {user.role}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={getStatusBadgeStyle(user.status)}>
                        {user.status}
                      </span>
                    </td>
                    <td className={styles.tableCell}>{user.joinDate}</td>
                    <td className={styles.tableCell}>
                      <div className={`${styles.flexRow} ${styles.gap1}`}>
                        <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}>
                          Edit
                        </button>
                        <button className={`${styles.btn} ${styles.btnWarning} ${styles.btnSmall}`}>
                          Assign Role
                        </button>
                      </div>
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
