'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from '../dashboard.module.css';
import { logout, getUserProfile } from '../utils/auth';

export default function DashboardLayout({ children, role }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const userProfile = getUserProfile();

    // Navigation items based on role
    const getNavigationItems = () => {
        const commonItems = [
            { name: 'Dashboard', href: `/dashboard/${role}-dashboard`, icon: '📊' },
            { name: 'Profile', href: `/dashboard/${role}-dashboard/profile`, icon: '👤' },
        ];

        if (role === 'admin') {
            return [
                ...commonItems,
                { name: 'Users', href: '/dashboard/admin-dasboard/users', icon: '👥' },
                { name: 'Roles', href: '/dashboard/admin-dasboard/roles', icon: '🔐' },
                { name: 'Settings', href: '/dashboard/admin-dasboard/settings', icon: '⚙️' },
            ];
        }

        if (role === 'instructor') {
            return [
                ...commonItems,
                { name: 'Courses', href: '/dashboard/instractor-dashboard/courses', icon: '📚' },
                { name: 'Students', href: '/dashboard/instractor-dashboard/students', icon: '🎓' },
                { name: 'Assignments', href: '/dashboard/instractor-dashboard/assignments', icon: '📝' },
            ];
        }

        // user role
        return [
            ...commonItems,
            { name: 'My Courses', href: '/dashboard/user-dashboard/courses', icon: '📚' },
            { name: 'Assignments', href: '/dashboard/user-dashboard/assignments', icon: '📝' },
            { name: 'Progress', href: '/dashboard/user-dashboard/progress', icon: '📈' },
        ];
    };

    const navigationItems = getNavigationItems();

    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            logout();
        }
    };

    return (
        <div className={styles.dashboardContainer}>
            {/* Top Navbar */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 100 }}
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    backgroundColor: 'var(--dashboard-surface)',
                    borderBottom: '1px solid var(--dashboard-border)',
                    boxShadow: 'var(--dashboard-shadow-md)',
                }}
            >
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
                        {/* Logo/Brand */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                        >
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, var(--dashboard-primary), var(--dashboard-info))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                            }}>
                                {role === 'admin' ? '⚡' : role === 'instructor' ? '📖' : '🎓'}
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'var(--dashboard-text-primary)' }}>
                                    {role === 'admin' ? 'Admin Panel' : role === 'instructor' ? 'Instructor Hub' : 'Student Portal'}
                                </h2>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--dashboard-text-muted)' }}>
                                    {userProfile?.name || 'User'}
                                </p>
                            </div>
                        </motion.div>

                        {/* Desktop Navigation */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="desktop-nav">
                            {navigationItems.map((item, index) => {
                                const isActive = pathname === item.href;
                                return (
                                    <motion.div
                                        key={item.name}
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Link
                                            href={item.href}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.625rem 1rem',
                                                borderRadius: 'var(--dashboard-radius-md)',
                                                color: isActive ? 'var(--dashboard-primary)' : 'var(--dashboard-text-secondary)',
                                                backgroundColor: isActive ? 'var(--dashboard-primary-light)' : 'transparent',
                                                textDecoration: 'none',
                                                fontWeight: isActive ? '600' : '500',
                                                fontSize: '0.875rem',
                                                transition: 'var(--dashboard-transition)',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActive) e.currentTarget.style.backgroundColor = 'var(--dashboard-surface-hover)';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <span>{item.icon}</span>
                                            <span>{item.name}</span>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* User Menu */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="desktop-nav">
                                <span style={{ fontSize: '0.875rem', color: 'var(--dashboard-text-secondary)' }}>
                                    {userProfile?.email}
                                </span>
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--dashboard-primary), var(--dashboard-success))',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                                </motion.div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleLogout}
                                className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`}
                            >
                                🚪 Logout
                            </motion.button>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                style={{
                                    display: 'none',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--dashboard-text-primary)',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                }}
                                className="mobile-menu-btn"
                            >
                                {mobileMenuOpen ? '✕' : '☰'}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{
                                paddingBottom: '1rem',
                                borderTop: '1px solid var(--dashboard-border)',
                                marginTop: '0.5rem',
                            }}
                            className="mobile-nav"
                        >
                            {navigationItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.75rem 1rem',
                                            color: isActive ? 'var(--dashboard-primary)' : 'var(--dashboard-text-secondary)',
                                            backgroundColor: isActive ? 'var(--dashboard-primary-light)' : 'transparent',
                                            textDecoration: 'none',
                                            fontWeight: isActive ? '600' : '500',
                                            borderRadius: 'var(--dashboard-radius-md)',
                                            marginTop: '0.5rem',
                                        }}
                                    >
                                        <span>{item.icon}</span>
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </motion.div>
                    )}
                </div>
            </motion.nav>

            {/* Main Content */}
            <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {children}
                </motion.div>
            </main>

            {/* Responsive Styles */}
            <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-nav {
            display: none !important;
          }
        }
      `}</style>
        </div>
    );
}
