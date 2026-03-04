"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../dashboard.module.css";
import { logout, getUserProfile } from "../utils/auth";

export default function DashboardLayout({ children, role }) {
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef(null);

  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  // =============================
  // Load Profile
  // =============================
  useEffect(() => {
    try {
      const profile = getUserProfile();
      setUserProfile(profile || null);
    } catch (error) {
      console.error("Profile load failed:", error);
      setUserProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  // =============================
  // Close dropdown on outside click
  // =============================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =============================
  // Navigation
  // =============================
  const navigationItems = useMemo(() => {
    return [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Profile", href: "/dashboard/profile" },
    ];
  }, []);

  // =============================
  // Logout
  // =============================
  const handleLogout = useCallback(() => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;
    logout();
  }, []);

  if (!role) return null;

  return (
    <div className={styles.dashboardContainer}>
      {/* ================= NAVBAR ================= */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backgroundColor: "var(--dashboard-surface)",
          borderBottom: "1px solid var(--dashboard-border)",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "70px",
            }}
          >
            {/* ===== Left Brand ===== */}
            <h2 style={{ fontWeight: "700" }}>
              {role === "admin"
                ? "Admin Panel"
                : role === "instructor"
                ? "Instructor Hub"
                : "Student Portal"}
            </h2>

            {/* ===== Navigation ===== */}
            <div style={{ display: "flex", gap: "1rem" }}>
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "6px",
                      backgroundColor: isActive ? "#1e293b" : "transparent",
                      color: isActive ? "#3b82f6" : "#94a3b8",
                      textDecoration: "none",
                    }}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* ===== User Section ===== */}
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                onClick={() => setProfileOpen((prev) => !prev)}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #3b82f6, #10b981)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                {userProfile?.name?.charAt(0)?.toUpperCase() || "U"}
              </motion.div>

              {/* ===== Dropdown ===== */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "55px",
                      width: "260px",
                      backgroundColor: "#0f172a",
                      borderRadius: "12px",
                      padding: "1rem",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                      border: "1px solid #1e293b",
                      zIndex: 999,
                    }}
                  >
                    {/* User Info */}
                    <div style={{ marginBottom: "1rem" }}>
                      <p style={{ fontWeight: "600", margin: 0 }}>
                        {userProfile?.name || "User"}
                      </p>
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "#94a3b8",
                          margin: 0,
                        }}
                      >
                        {userProfile?.email || ""}
                      </p>
                    </div>

                    <hr style={{ borderColor: "#1e293b" }} />

                    {/* Links */}
                    <div style={{ marginTop: "0.8rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <button
                        onClick={() => {
                          router.push("/dashboard/myCourses");
                          setProfileOpen(false);
                        }}
                        style={dropdownBtnStyle}
                      >
                        📚 My Courses
                      </button>

                      <button
                        onClick={() => {
                          router.push("/dashboard/profile");
                          setProfileOpen(false);
                        }}
                        style={dropdownBtnStyle}
                      >
                        ⚙ Profile
                      </button>

                      <button
                        onClick={handleLogout}
                        style={{ ...dropdownBtnStyle, color: "#ef4444" }}
                      >
                        🚪 Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ================= MAIN ================= */}
      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {children}
      </main>
    </div>
  );
}

// =============================
// Dropdown Button Style
// =============================
const dropdownBtnStyle = {
  background: "transparent",
  border: "none",
  color: "#e2e8f0",
  padding: "0.5rem",
  borderRadius: "6px",
  textAlign: "left",
  cursor: "pointer",
  transition: "0.2s",
};