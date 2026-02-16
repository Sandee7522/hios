'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../dashboard/dashboard.module.css';
import { setAuthData } from '../dashboard/utils/auth';
import { LOGIN } from '../dashboard/api';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Call your login API
            const response = await fetch(LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            // Log the complete response to see the structure
            console.log('Complete API Response:', data);
            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(data.message || 'Invalid credentials');
            }

            // Extract role and user data from response
            // Your API structure: data.accessToken, data.user.role.user_type
            let token = data.data?.accessToken;
            let role = data.data?.user?.role?.user_type;
            let user = {
                id: data.data?.user?.id,
                name: data.data?.user?.name,
                email: data.data?.user?.email,
                isEmailVerified: data.data?.user?.isEmailVerified
            };

            console.log('Extracted values:', { token, role, user });

            if (!token || !role) {
                console.error('Missing data in response:', {
                    hasToken: !!token,
                    hasRole: !!role,
                    fullResponse: data
                });
                throw new Error('Invalid response from server. Missing token or role.');
            }

            console.log('Login successful:', { role, user }); // Debug log

            // Set authentication data in cookies
            setAuthData(token, role, user);

            // Small delay to ensure cookies are set
            setTimeout(() => {
                // Redirect to dashboard (will auto-redirect to role-specific dashboard)
                router.push('/dashboard');
            }, 100);

        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Login failed. Please try again.');
            setLoading(false);
        }
    };



    return (
        <div className={styles.dashboardContainer} style={{ minHeight: '100vh' }}>
            <div className={styles.flexCenter} style={{ minHeight: '100vh', padding: '1rem' }}>
                <div className={styles.card} style={{ maxWidth: '450px', width: '100%' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h1 className={styles.headerTitle} style={{ marginBottom: '0.5rem' }}>
                            Welcome Back! 👋
                        </h1>
                        <p className={styles.textSecondary}>
                            Sign in to access your dashboard
                        </p>
                    </div>

                    {error && (
                        <div
                            style={{
                                padding: '1rem',
                                backgroundColor: 'var(--dashboard-danger-light)',
                                color: 'var(--dashboard-danger)',
                                borderRadius: 'var(--dashboard-radius-md)',
                                marginBottom: '1.5rem',
                                fontSize: '0.875rem',
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Email Address</label>
                            <input
                                type="email"
                                className={styles.formInput}
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Password</label>
                            <input
                                type="password"
                                className={styles.formInput}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}
                            style={{ width: '100%', marginTop: '1rem' }}
                            disabled={loading}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <span className={styles.loading}></span>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>



                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <p className={styles.textMuted} style={{ fontSize: '0.875rem' }}>
                            Don't have an account?{' '}
                            <a
                                href="/register"
                                style={{
                                    color: 'var(--dashboard-primary)',
                                    textDecoration: 'none',
                                    fontWeight: '500',
                                }}
                            >
                                Sign up
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
