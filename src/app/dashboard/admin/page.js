"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile, getUserRole } from "../utils/auth";
import { GET_ADMIN_DASHBOARD_STATS, SEND_EARNING_OTP, VERIFY_EARNING_OTP } from "../utils/api";
import { requestWithAuth } from "../utils/apiClient";
import MyLoader from "@/components/landing/MyLoder";
import ErrorBox from "@/components/common/ErrorBox";
import SuccessBox from "@/components/common/SuccessBox";
import CustomCard from "@/components/common/CustomCard";
import { FiUsers, FiGrid, FiLayers, FiBookOpen, FiCheckCircle, FiClock } from "react-icons/fi";
import { MdAdminPanelSettings, MdOndemandVideo, MdSchool, MdCurrencyRupee } from "react-icons/md";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    users: 0,
    admin: 0,
    instructor: 0,
    allCategory: 0,
    allModules: 0,
    allLesson: 0,
    totalSellingCourse: 0,
    totalCourse: 0,
    activeCourse: 0,
    pendingCourse: 0,
    totalEarning: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Earning OTP state
  const [showEarningOtp, setShowEarningOtp] = useState(false);
  const [earningOtpValues, setEarningOtpValues] = useState(["", "", "", "", "", ""]);
  const [earningOtpLoading, setEarningOtpLoading] = useState(false);
  const [earningOtpSending, setEarningOtpSending] = useState(false);
  const [earningOtpError, setEarningOtpError] = useState("");
  const [earningVerified, setEarningVerified] = useState(false);

  useEffect(() => {
    getUserProfile();
    const role = getUserRole();

    if (role !== "admin") {
      setError("You do not have permission to view the admin dashboard.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const statsResponse = await requestWithAuth(GET_ADMIN_DASHBOARD_STATS, {
          method: "GET",
          allowedRoles: ["admin"],
        });

        setStats(statsResponse?.data || {});
        setSuccessMessage("Dashboard loaded successfully");
      } catch (err) {
        console.error("Admin dashboard data load error:", err);
        setError(err.message || "Failed to load admin data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <MyLoader />
    );
  }

  // ── Earning OTP handlers ──
  const handleEarningCardClick = async () => {
    if (earningVerified) return; // already verified, no need
    setShowEarningOtp(true);
    setEarningOtpSending(true);
    setEarningOtpError("");
    setEarningOtpValues(["", "", "", "", "", ""]);
    try {
      await requestWithAuth(SEND_EARNING_OTP, {
        method: "POST",
        allowedRoles: ["admin"],
      });
    } catch (err) {
      setEarningOtpError(err.message || "Failed to send OTP");
    } finally {
      setEarningOtpSending(false);
    }
  };

  const handleVerifyEarningOtp = async () => {
    const otp = earningOtpValues.join("");
    if (otp.length !== 6) { setEarningOtpError("Enter all 6 digits"); return; }
    setEarningOtpLoading(true);
    setEarningOtpError("");
    try {
      await requestWithAuth(VERIFY_EARNING_OTP, {
        method: "POST",
        body: { otp },
        allowedRoles: ["admin"],
      });
      setEarningVerified(true);
      setShowEarningOtp(false);
    } catch (err) {
      setEarningOtpError(err.message || "Invalid OTP");
    } finally {
      setEarningOtpLoading(false);
    }
  };

  const handleResendEarningOtp = async () => {
    setEarningOtpSending(true);
    setEarningOtpError("");
    setEarningOtpValues(["", "", "", "", "", ""]);
    try {
      await requestWithAuth(SEND_EARNING_OTP, {
        method: "POST",
        allowedRoles: ["admin"],
      });
    } catch (err) {
      setEarningOtpError(err.message || "Failed to resend OTP");
    } finally {
      setEarningOtpSending(false);
    }
  };

  const handleEarningOtpChange = (index, val) => {
    const char = val.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(-1);
    const newVals = [...earningOtpValues];
    newVals[index] = char;
    setEarningOtpValues(newVals);
    if (char && index < 5) document.getElementById(`eotp-${index + 1}`)?.focus();
  };

  const handleEarningOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !earningOtpValues[index] && index > 0) {
      document.getElementById(`eotp-${index - 1}`)?.focus();
    }
  };

  const cards = [
    { key: "users", title: "Users", value: stats.users ?? 0, icon: <FiUsers size={18} />, href: "/dashboard/admin/all-users" },
    { key: "admin", title: "Admin", value: stats.admin ?? 0, icon: <MdAdminPanelSettings size={18} />, href: "/dashboard/admin/all-users" },
    { key: "instructor", title: "Instructor", value: stats.instructor ?? 0, icon: <MdSchool size={18} />, href: "/dashboard/admin/all-users" },
    { key: "allCategory", title: "All Category", value: stats.allCategory ?? 0, icon: <FiGrid size={18} />, href: "/dashboard/admin/all-category" },
    { key: "allModules", title: "All Modules", value: stats.allModules ?? 0, icon: <FiLayers size={18} />, href: "/dashboard/admin/all-modules" },
    { key: "allLesson", title: "All Lesson", value: stats.allLesson ?? 0, icon: <MdOndemandVideo size={18} />, href: "/dashboard/admin/all-lesson" },
    { key: "totalCourse", title: "Number of Course", value: stats.totalCourse ?? 0, icon: <FiBookOpen size={18} />, href: "/dashboard/admin/all-courses" },
    { key: "activeCourse", title: "Active Course", value: stats.activeCourse ?? 0, icon: <FiCheckCircle size={18} />, href: "/dashboard/admin/all-courses" },
    { key: "pendingCourse", title: "Pending Course", value: stats.pendingCourse ?? 0, icon: <FiClock size={18} />, href: "/dashboard/admin/all-courses" },
    {
      key: "otherCourse",
      title: "Other Course",
      value: Math.max(
        0,
        (stats.totalCourse ?? 0) - (stats.activeCourse ?? 0) - (stats.pendingCourse ?? 0),
      ),
      icon: <FiLayers size={18} />,
      href: "/dashboard/admin/all-courses",
    },
    { key: "totalEarning", title: "Total Earning", value: earningVerified ? `₹${stats.totalEarning ?? 0}` : "●●●●●", icon: <MdCurrencyRupee size={18} />, onClick: earningVerified ? null : handleEarningCardClick },
    { key: "totalSellingCourse", title: "Total Selling Course", value: stats.totalSellingCourse ?? 0, icon: <MdCurrencyRupee size={18} />, href: "/dashboard/admin/all-courses" },
  ];

  return (
    <>
      <ErrorBox message={error} />
      <SuccessBox message={successMessage} />

      <div className="mb-5 rounded-2xl border border-indigo-900/35 bg-[linear-gradient(160deg,#12162f_0%,#0f1326_100%)] px-5 py-4 shadow-[0_12px_28px_rgba(5,8,24,0.6)]">
        <h1 className="text-4xl font-extrabold text-slate-100 tracking-tight">Admin Dashboard ⚡</h1>
        <p className="text-slate-400 mt-1">Overview of key platform metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <CustomCard
            key={card.key}
            onClick={card.onClick || (() => card.href && router.push(card.href))}
            title={card.title}
            value={card.value}
            icon={card.icon}
          />
        ))}
      </div>

      {/* ── Earning OTP Modal ── */}
      {showEarningOtp && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4"
          onClick={() => setShowEarningOtp(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white mb-1">Verify to View Earnings</h3>
            <p className="text-sm text-slate-400 mb-5">
              {earningOtpSending ? "Sending OTP..." : "OTP sent to verification email"}
            </p>

            {earningOtpError && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {earningOtpError}
              </div>
            )}

            {/* OTP Inputs */}
            <div className="flex justify-center gap-3 mb-5">
              {earningOtpValues.map((val, i) => (
                <input
                  key={i}
                  id={`eotp-${i}`}
                  type="text"
                  inputMode="text"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleEarningOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleEarningOtpKeyDown(i, e)}
                  className="w-11 h-13 text-center text-lg font-bold rounded-xl bg-white/5 border border-emerald-900/30
                             text-emerald-300 focus:border-emerald-500/50 focus:outline-none
                             focus:ring-1 focus:ring-emerald-500/20 transition-all uppercase"
                />
              ))}
            </div>

            {/* Actions */}
            <button
              onClick={handleVerifyEarningOtp}
              disabled={earningOtpLoading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {earningOtpLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying...
                </>
              ) : (
                "Verify & View Earnings"
              )}
            </button>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setShowEarningOtp(false)}
                className="text-sm text-slate-500 hover:text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleResendEarningOtp}
                disabled={earningOtpSending}
                className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition disabled:opacity-50"
              >
                {earningOtpSending ? "Sending..." : "Resend OTP"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
