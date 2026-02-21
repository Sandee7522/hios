'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../component/DashboardLayout';
import styles from '../dashboard.module.css';
import { getUserProfile, getUserRole } from '../utils/auth';
import { GET_ALL_USERS, GET_ALL_ROLES } from '../api';
import { requestWithAuth } from '../utils/apiClient';
import Footer from '@/components/landing/Footer';

export default function AdminDashboard() {
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    const userProfile = getUserProfile();
    setProfile(userProfile);

    // Guard this page so only admins can load admin data
    const role = getUserRole();
    if (role !== 'admin') {
      setError('You do not have permission to view the admin dashboard.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // 1) Fetch users list (admin-only endpoint)
        const usersResponse = await requestWithAuth(GET_ALL_USERS, {
          method: 'POST',
          body: {
            page: 1,
            pageSize: 20,
            sort: 'desc',
          },
          allowedRoles: ['admin'],
        });

        // API helper wraps data in { status, message, data }
        const usersData = usersResponse?.data?.users || [];

        // Normalize users into the shape required by the table UI
        const mappedUsers = usersData.map((user) => ({
          id: user.id || user._id,
          name: user.name,
          email: user.email,
          role: user.role?.user_type || 'user',
          status: user.isEmailVerified ? 'active' : 'inactive',
          joinDate: user.created_at
            ? new Date(user.created_at).toISOString().slice(0, 10)
            : '',
        }));

        // 2) Fetch roles list (admin-only endpoint)
        const rolesResponse = await requestWithAuth(GET_ALL_ROLES, {
          method: 'GET',
          allowedRoles: ['admin'],
        });

        const rolesData = rolesResponse?.data || [];

        // Normalize roles into the cards we already render
        const mappedRoles = rolesData.map((roleItem) => ({
          id: roleItem._id,
          name: roleItem.user_type,
          users: roleItem.userCount || 0,
          permissions:
            Array.isArray(roleItem.permissions) && roleItem.permissions.length > 0
              ? `${roleItem.permissions.length} permissions`
              : 'No permissions configured',
        }));

        setUsers(mappedUsers);
        setRoles(mappedRoles);
      } catch (err) {
        console.error('Admin dashboard data load error:', err);
        setError(err.message || 'Failed to load admin data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    <>
    <DashboardLayout role="admin">
      <div className={styles.fadeIn}>
        {/* Permission / error message */}
        {error && (
          <div
            style={{
              padding: '1rem',
              marginBottom: '1.5rem',
              borderRadius: 'var(--dashboard-radius-md)',
              backgroundColor: 'var(--dashboard-danger-light)',
              color: 'var(--dashboard-danger)',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

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
     <Footer />
    </>
  );
}
