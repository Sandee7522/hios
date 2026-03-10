"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../component/DashboardLayout";
import styles from "../dashboard.module.css";
import { getUserProfile, getUserRole } from "../utils/auth";
import { GET_ALL_ROLES } from "../utils/api";
import { requestWithAuth } from "../utils/apiClient";
import MyLoader from "@/components/landing/MyLoder";
import ErrorBox from "@/components/common/ErrorBox";
import SuccessBox from "@/components/common/SuccessBox";

export default function AdminDashboard() {
  const [profile, setProfile] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    const userProfile = getUserProfile();
    setProfile(userProfile);

    const role = getUserRole();

    if (role !== "admin") {
      setError("You do not have permission to view the admin dashboard.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const rolesResponse = await requestWithAuth(GET_ALL_ROLES, {
          method: "GET",
          allowedRoles: ["admin"],
        });

        const rolesData = rolesResponse?.data || [];

        const mappedRoles = rolesData.map((roleItem) => ({
          id: roleItem._id,
          name: roleItem.user_type,
          users: roleItem.userCount || 0,
          permissions:
            Array.isArray(roleItem.permissions) &&
              roleItem.permissions.length > 0
              ? `${roleItem.permissions.length} permissions`
              : "No permissions configured",
        }));

        setRoles(mappedRoles);

        setSuccessMessage("Roles loaded successfully");
      } catch (err) {
        console.error("Admin dashboard data load error:", err);
        setError(err.message || "Failed to load admin data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case "admin":
        return styles.badgeDanger;
      case "instructor":
        return styles.badgePrimary;
      default:
        return styles.badgeInfo;
    }
  };

  if (loading) {
    return (
      <MyLoader />
    );
  }

  return (
    <div className="admin-layout">

      <main className="admin-layout__content">
        <ErrorBox message={error} />
        <SuccessBox message={successMessage} />
        <div className={styles.fadeIn}>
          <div className={styles.mb3}>
            <h1 className={styles.headerTitle}>Admin Dashboard ⚡</h1>
            <p className={styles.textSecondary}>
              Manage system roles and permissions
            </p>
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
                  <div
                    key={role.id}
                    className={`${styles.card} ${styles.cardHover}`}
                  >
                    <div
                      className={styles.flexBetween}
                      style={{ marginBottom: "1rem" }}
                    >
                      <h3
                        className={styles.cardTitle}
                        style={{
                          fontSize: "1.125rem",
                          margin: 0,
                          textTransform: "capitalize",
                        }}
                      >
                        {role.name}
                      </h3>

                      <span className={getRoleBadgeStyle(role.name)}>
                        {role.users}
                      </span>
                    </div>

                    <p className={`${styles.textMuted} ${styles.mb2}`}>
                      {role.permissions}
                    </p>

                    <button
                      className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                      style={{ width: "100%" }}
                    >
                      Edit Permissions
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
