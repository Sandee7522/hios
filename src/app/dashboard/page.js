'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole, isAuthenticated } from './utils/auth';
import styles from './dashboard.module.css';

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check authentication and redirect based on role
        const checkAuthAndRedirect = () => {
            const authenticated = isAuthenticated();
            const role = getUserRole();

            console.log('Dashboard routing check:', { authenticated, role }); // Debug log

            if (!authenticated) {
                // Redirect to login if not authenticated
                console.log('Not authenticated, redirecting to login');
                router.push('/login');
                return;
            }

            // Redirect to appropriate dashboard based on role
            switch (role) {
                case 'admin':
                    console.log('Redirecting to admin dashboard');
                    router.push('/dashboard/admin-dasboard');
                    break;
                case 'instructor':
                    console.log('Redirecting to instructor dashboard');
                    router.push('/dashboard/instractor-dashboard');
                    break;
                case 'user':
                    console.log('Redirecting to user dashboard');
                    router.push('/dashboard/user-dashboard');
                    break;
                default:
                    // If role is not recognized, redirect to login
                    console.log('Role not recognized:', role, 'redirecting to login');
                    router.push('/login');
            }
        };

        checkAuthAndRedirect();
    }, [router]);

    return (
        <div className={styles.dashboardContainer}>
            <div className={`${styles.flexCenter}`} style={{ minHeight: '100vh' }}>
                <div className={styles.card} style={{ textAlign: 'center', minWidth: '300px' }}>
                    <div className={styles.loading} style={{ margin: '0 auto' }}></div>
                    <p className={`${styles.textSecondary} ${styles.mt2}`}>
                        Loading dashboard...
                    </p>
                </div>
            </div>
        </div>
    );
}
