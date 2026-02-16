'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../dashboard/dashboard.module.css';
import { setAuthData } from '../dashboard/utils/auth';
import { REGISTER } from '../dashboard/api';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(REGISTER, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            // Log response for debugging
            console.log('Register API Response:', data);

            if (!response.ok) {
                // Handle API error messages
                const errorMessage = data.message || data.error || 'Registration failed';
                throw new Error(errorMessage);
            }

            // Extract token and user data
            // Based on user provided structure:
            // data.data (wrapper) -> data.data.data (payload with token)
            // But sometimes APIs are flattened. Let's try to handle both or debug.
            // User sample:
            // "data": { "success": true, "data": { "user": ..., "accessToken": ... } }
            // So: const payload = data.data?.data;

            const payload = data.data?.data || data.data; // Fallback just in case

            if (!payload || !payload.accessToken) {
                console.error('Unexpected response structure:', data);
                throw new Error('Registration successful but failed to log in automatically. Please sign in.');
            }

            const token = payload.accessToken;
            // User role might be nested in user object
            const user = payload.user;
            const role = user?.role?.user_type || 'user'; // Default to user if not found

            // Save auth data
            setAuthData(token, role, user);

            // Redirect
            setTimeout(() => {
                router.push('/dashboard');
            }, 100);

        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message || 'An error occurred during registration');
            setLoading(false);
        }
    };

    return (
        <div className={styles.dashboardContainer} style={{ minHeight: '100vh' }}>
            <div className={styles.flexCenter} style={{ minHeight: '100vh', padding: '1rem' }}>
                <div className={styles.card} style={{ maxWidth: '450px', width: '100%' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h1 className={styles.headerTitle} style={{ marginBottom: '0.5rem' }}>
                            Create Account 🚀
                        </h1>
                        <p className={styles.textSecondary}>
                            Join us and start your journey today
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

                    <form onSubmit={handleRegister}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Full Name</label>
                            <input
                                type="text"
                                className={styles.formInput}
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

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
                                placeholder="Create a strong password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
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
                                    Creating Account...
                                </span>
                            ) : (
                                'Sign Up'
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <p className={styles.textMuted} style={{ fontSize: '0.875rem' }}>
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                style={{
                                    color: 'var(--dashboard-primary)',
                                    textDecoration: 'none',
                                    fontWeight: '500',
                                }}
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
