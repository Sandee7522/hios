"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile, getUserRole } from "../utils/auth";
import { GET_ADMIN_DASHBOARD_STATS } from "../utils/api";
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
    { key: "totalEarning", title: "Total Earning", value: stats.totalEarning ?? 0, icon: <MdCurrencyRupee size={18} />, href: "/dashboard/admin/all-courses" },
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
            onClick={() => card.href && router.push(card.href)}
            title={card.title}
            value={card.value}
            icon={card.icon}
          />
        ))}
      </div>
    </>
  );
}
