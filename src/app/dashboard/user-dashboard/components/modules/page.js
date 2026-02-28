"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import { TfiMenuAlt } from "react-icons/tfi";
import { IoClose } from "react-icons/io5";

const Page = () => {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <div className={styles.container}>
      {/* ✅ Navbar */}
      <header className={styles.navbar}>
        <button
          className={styles.menuBtn}
          onClick={() => setOpenSidebar(true)}
        >
          <TfiMenuAlt size={22} />
        </button>

        <h2 className={styles.logo}>Learning Dashboard</h2>
      </header>

      <div className={styles.wrapper}>
        {/* ✅ Sidebar */}
        <aside
          className={`${styles.sidebar} ${
            openSidebar ? styles.sidebarOpen : ""
          }`}
        >
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>Menu</h2>
            <IoClose
              size={22}
              className={styles.closeBtn}
              onClick={() => setOpenSidebar(false)}
            />
          </div>

          <div className={styles.menuItem}>Video Section</div>
          <div className={styles.menuItem}>Quiz Section</div>
        </aside>

        {/* ✅ Overlay for mobile */}
        {openSidebar && (
          <div
            className={styles.overlay}
            onClick={() => setOpenSidebar(false)}
          />
        )}

        {/* ✅ Main Content */}
        <main className={styles.main}>
          {/* Video */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Video Container</h3>

            <div className={styles.videoBox}>
              <video
                controls
                width="100%"
                src="https://www.w3schools.com/html/mov_bbb.mp4"
              />
            </div>
          </div>

          {/* Quiz */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Quiz Container</h3>

            <div className={styles.quizBox}>
              <p>
                <strong>Q1:</strong> What is React?
              </p>

              <div className={styles.option}>A. Library</div>
              <div className={styles.option}>B. Framework</div>
              <div className={styles.option}>C. Database</div>
              <div className={styles.option}>D. Language</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Page;