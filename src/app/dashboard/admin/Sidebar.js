"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  FiHome, FiUsers, FiChevronDown, FiMenu, FiX,
} from "react-icons/fi";
import { MdOutlineSupportAgent, MdGroupRemove } from "react-icons/md";
import { TbCategoryPlus, TbViewfinder } from "react-icons/tb";
import { FaCheckToSlot } from "react-icons/fa6";
import { LuGitMerge } from "react-icons/lu";
import { SiCcleaner, SiCoursera } from "react-icons/si";
import { GiPopcorn } from "react-icons/gi";

export const menuIconMap = [
  { path: "/dashboard/admin", label: "Dashboard", icon: <FiHome /> },
  { path: "/dashboard/admin/all-users", label: "All Users", icon: <FiUsers /> },
  { path: "/dashboard/admin/all-category", label: "All Category", icon: <SiCoursera size={18} /> },
  { path: "/dashboard/admin/all-courses", label: "All Courses", icon: <SiCoursera size={18} /> },
  { path: "/dashboard/admin/all-modules", label: "All Modules", icon: <FiUsers /> },
  { path: "/dashboard/admin/all-lesson", label: "All Lesson", icon: <FiUsers /> },
  {
    key: "Support Management",
    icon: <MdOutlineSupportAgent size={18} />,
    children: [
      { path: "/dashboard/category", label: "Category", icon: <TbCategoryPlus /> },
      { path: "/dashboard/supportTicket", label: "Support Ticket", icon: <FaCheckToSlot /> },
    ],
  },
  { path: "/dashboard/merge-request", label: "Merge Request", icon: <LuGitMerge size={18} /> },
  { path: "/dashboard/findRelationship", label: "Find Relationship", icon: <TbViewfinder size={18} /> },
  {
    key: "Cleanup",
    icon: <SiCcleaner size={16} />,
    children: [
      { path: "/dashboard/cleanup/corrupt-relationship", label: "Corrupt Relationship", icon: <GiPopcorn /> },
      { path: "/dashboard/cleanup/remove-number", label: "Remove Number", icon: <MdGroupRemove /> },
    ],
  },
];

/* ── Motion variants ── */
const drawerVariants = {
  hidden: { x: "-100%", opacity: 0.8 },
  visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit: { x: "-100%", opacity: 0, transition: { duration: 0.22, ease: "easeIn" } },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

const subMenuVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: "auto", opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.18, ease: "easeIn" } },
};

const DESKTOP_BREAKPOINT = 1024; // px – matches lg in Tailwind

/* ── Shared nav content ── */
function SidebarNav({ pathname, openMenus, toggleMenu, onClose }) {
  const isActive = (path) => pathname === path;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-indigo-900/35 shrink-0 bg-slate-950/35">
        <span className="flex items-center gap-2.5 text-[20px] font-bold text-slate-100 tracking-wide">
          <FiHome size={18} className="text-slate-300" />
          Admin Panel
        </span>
        {/* Close button – only rendered in mobile drawer */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="flex items-center justify-center p-1 rounded-md
                       text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <FiX size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <ul className="flex flex-col gap-1.5">
          {menuIconMap.map((item, index) => {
            if (item.children) {
              const menuOpen = openMenus[item.key];
              return (
                <li key={index}>
                  <button
                    onClick={() => toggleMenu(item.key)}
                    aria-expanded={menuOpen}
                    className="w-full flex items-center justify-between
                               px-3.5 py-2.5 rounded-xl text-[18px]
                               text-slate-300/80 hover:text-white hover:bg-slate-800/60
                               transition-colors duration-150"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-slate-400 shrink-0">{item.icon}</span>
                      <span className="truncate">{item.key}</span>
                    </span>
                    <motion.span
                      animate={{ rotate: menuOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-slate-500 shrink-0"
                    >
                      <FiChevronDown size={14} />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {menuOpen && (
                      <motion.ul
                        variants={subMenuVariants}
                        initial="hidden" animate="visible" exit="exit"
                        className="overflow-hidden ml-6 mt-1 border-l border-indigo-900/35 flex flex-col gap-1"
                      >
                        {item.children.map((child, i) => (
                          <li key={i}>
                            <Link
                              href={child.path}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[18px]
                                no-underline transition-colors duration-150
                                ${isActive(child.path)
                                  ? "bg-slate-800/80 text-slate-100 border border-slate-600/60"
                                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                                }`}
                            >
                              <span className="shrink-0">{child.icon}</span>
                              <span className="truncate">{child.label}</span>
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
              );
            }

            return (
              <li key={index}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[18px]
                    no-underline transition-colors duration-150
                    ${isActive(item.path)
                      ? "bg-slate-800/80 text-slate-100 border border-slate-600/60"
                      : "text-slate-300/80 hover:text-white hover:bg-slate-800/60"
                    }`}
                >
                  <span className={`shrink-0 ${isActive(item.path) ? "text-slate-100" : "text-slate-400"}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

/* ── Main Sidebar component ── */
export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false); // safe default for SSR

  const toggleMenu = (key) =>
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));

  // Detect desktop vs mobile — only on client
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Lock scroll on mobile when drawer is open
  useEffect(() => {
    if (!isDesktop) {
      document.body.style.overflow = mobileOpen ? "hidden" : "";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen, isDesktop]);

  /* ── Desktop: always-visible fixed sidebar ── */
  if (isDesktop) {
    return (
      <aside
        className="fixed top-16 left-0 z-[900] flex flex-col
                   w-[290px] h-[calc(100vh-4rem)]
                   bg-[linear-gradient(170deg,#141834_0%,#131730_55%,#111427_100%)] border-r border-indigo-900/35 shadow-[6px_0_24px_rgba(5,8,24,0.5)]"
      >
        <SidebarNav
          pathname={pathname}
          openMenus={openMenus}
          toggleMenu={toggleMenu}
          onClose={null}
        />
      </aside>
    );
  }

  /* ── Mobile: hamburger + animated drawer + backdrop ── */
  return (
    <>
      {/* Hamburger */}
      <motion.button
        onClick={() => setMobileOpen((p) => !p)}
        aria-label={mobileOpen ? "Close sidebar" : "Open sidebar"}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        className="fixed top-[4.4rem] left-3 z-[1000] flex items-center justify-center
                   w-9 h-9 rounded-xl border border-slate-700/80 bg-[#141834]
                   text-slate-300 shadow-lg hover:border-slate-500 hover:bg-slate-800/70
                   transition-colors duration-200"
      >
        <AnimatePresence mode="wait" initial={false}>
          {mobileOpen ? (
            <motion.span key="x"
              initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}
              className="flex"
            >
              <FiX size={20} />
            </motion.span>
          ) : (
            <motion.span key="menu"
              initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}
              className="flex"
            >
              <FiMenu size={20} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            variants={backdropVariants}
            initial="hidden" animate="visible" exit="exit"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-[899] bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            variants={drawerVariants}
            initial="hidden" animate="visible" exit="exit"
            className="fixed top-16 left-0 z-[900] flex flex-col
                       w-[300px] sm:w-[320px]
                       h-[calc(100vh-4rem)]
                       bg-[linear-gradient(170deg,#141834_0%,#131730_55%,#111427_100%)] border-r border-indigo-900/35 shadow-[6px_0_24px_rgba(5,8,24,0.5)]"
          >
            <SidebarNav
              pathname={pathname}
              openMenus={openMenus}
              toggleMenu={toggleMenu}
              onClose={() => setMobileOpen(false)}
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
