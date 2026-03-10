"use client";

import DashboardLayout from "../component/DashboardLayout";
import Sidebar from "./Sidebar";

export default function AdminLayout({ children }) {
  return (
    <DashboardLayout role="admin">
      <div className="flex min-h-screen">
        <Sidebar />

        {/*
          Desktop (lg+): sidebar is fixed 260px wide → push content with ml-[260px]
          Mobile (<lg):  sidebar is off-canvas drawer → content takes full width (ml-0)
          Top padding accounts for the fixed top navbar (4rem / 64px)
        */}
        <main
          className="flex-1 min-w-0 w-full
                     ml-0 lg:ml-[260px]
                     pt-20 px-4 pb-6
                     sm:px-5
                     md:px-6
                     lg:px-8 lg:pt-20
                     transition-all duration-300"
        >
          {children}
        </main>
      </div>
    </DashboardLayout>
  );
}