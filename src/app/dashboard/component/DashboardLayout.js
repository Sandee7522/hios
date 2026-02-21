"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "../dashboard.module.css";
import { logout, getUserProfile } from "../utils/auth";

export default function DashboardLayout({ children, role }) {
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // =============================
  // 🔍 Debug helper (dev only)
  // =============================
  const debug = (...args) => {
    if (process.env.NODE_ENV === "development") {
      console.log("[DashboardLayout]", ...args);
    }
  };

  // =============================
  // ✅ Load profile safely
  // =============================
  useEffect(() => {
    try {
      debug("Fetching user profile...");

      const profile = getUserProfile();

      if (!profile) {
        debug("No profile found");
        setUserProfile(null);
        return;
      }

      setUserProfile(profile);
      debug("Profile loaded", profile);
    } catch (error) {
      console.error("❌ Failed to load user profile:", error);
      setUserProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  // =============================
  // ✅ Navigation (memoized)
  // =============================
  const navigationItems = useMemo(() => {
    const commonItems = [
      {
        name: "Dashboard",
        href: `/dashboard/${role}-dashboard`,
      },
      {
        name: "Profile",
        href: `/dashboard/${role}-dashboard/profile`,
      },
    ];

    switch (role) {
      case "admin":
        return [
          ...commonItems,
          {
            name: "Users",
            href: "/dashboard/admin-dashboard/users",

          },
          {
            name: "Roles",
            href: "/dashboard/admin-dashboard/roles",
  
          },
          {
            name: "Settings",
            href: "/dashboard/admin-dashboard/settings",
          },
        ];

      case "instructor":
        return [
          ...commonItems,
          {
            name: "Courses",
            href: "/dashboard/instructor-dashboard/courses",
            icon: "📚",
          },
          {
            name: "Students",
            href: "/dashboard/instructor-dashboard/students",
            icon: "🎓",
          },
          {
            name: "Assignments",
            href: "/dashboard/instructor-dashboard/assignments",
            icon: "📝",
          },
        ];

      default:
        return [
          ...commonItems,
          {
            name: "My Courses",
            href: "/dashboard/user-dashboard/courses",

          },
          {
            name: "Assignments",
            href: "/dashboard/user-dashboard/assignments",

          },
          {
            name: "Progress",
            href: "/dashboard/user-dashboard/progress",

          },
        ];
    }
  }, [role]);

  // =============================
  // 🚪 Logout handler (safe)
  // =============================
  const handleLogout = useCallback(() => {
    try {
      const confirmed = window.confirm("Are you sure you want to logout?");
      if (!confirmed) return;

      debug("User logging out...");
      logout();
    } catch (error) {
      console.error("❌ Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  }, []);

  // =============================
  // 🎯 Helpers
  // =============================
  const getRoleTitle = () => {
    switch (role) {
      case "admin":
        return "Admin Panel";
      case "instructor":
        return "Instructor Hub";
      default:
        return "Student Portal";
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case "admin":
        return "⚡";
      case "instructor":
        return "📖";
      default:
        return "🎓";
    }
  };

  // =============================
  // 🛑 Early error guard
  // =============================
  if (!role) {
    console.error("❌ DashboardLayout: role prop is required");
    return null;
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* ================= Top Navbar ================= */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backgroundColor: "var(--dashboard-surface)",
          borderBottom: "1px solid var(--dashboard-border)",
          boxShadow: "var(--dashboard-shadow-md)",
        }}
      >
        <div
          style={{ maxWidth: "1600px", margin: "0 auto", padding: "0 1.5rem" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "70px",
            }}
          >
            {/* ===== Brand ===== */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  background:
                    "linear-gradient(135deg, var(--dashboard-primary), var(--dashboard-info))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                }}
              >
                {getRoleIcon()}
              </div>

              <div>
                <h2
                  style={{ margin: 0, fontSize: "1.25rem", fontWeight: "700" }}
                >
                  {getRoleTitle()}
                </h2>

                <p
                  style={{
                    margin: 0,
                    fontSize: "0.75rem",
                    color: "var(--dashboard-text-muted)",
                  }}
                >
                  {loadingProfile ? "Loading..." : userProfile?.name || "User"}
                </p>
              </div>
            </motion.div>

            {/* ===== Desktop Nav ===== */}
            <div
              className={styles.desktopNav}
              style={{ display: "flex", gap: "0.5rem" }}
            >
              {navigationItems.map((item, index) => {
                const isActive = pathname === item.href;

                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.625rem 1rem",
                        borderRadius: "var(--dashboard-radius-md)",
                        color: isActive
                          ? "var(--dashboard-primary)"
                          : "var(--dashboard-text-secondary)",
                        backgroundColor: isActive
                          ? "var(--dashboard-primary-light)"
                          : "transparent",
                        textDecoration: "none",
                        fontWeight: isActive ? "600" : "500",
                        fontSize: "0.875rem",
                        transition: "var(--dashboard-transition)",
                      }}
                    >
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* ===== User Area ===== */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "var(--dashboard-text-secondary)",
                }}
              >
                {userProfile?.email || ""}
              </span>

              <motion.div
                whileHover={{ scale: 1.1 }}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, var(--dashboard-primary), var(--dashboard-success))",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}
              >
                {userProfile?.name?.charAt(0)?.toUpperCase() || "U"}
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`}
              >
                🚪 Logout
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ================= Main Content ================= */}
      <main
        style={{ maxWidth: "1600px", margin: "0 auto", padding: "2rem 1.5rem" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
