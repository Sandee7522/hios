'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { setAuthData } from '../../dashboard/utils/auth';
import { LOGIN, REGISTER, VERIFY_OTP, RESEND_OTP, VERIFY_LOGIN_OTP, RESEND_LOGIN_OTP } from '../../dashboard/utils/api';
import Link from 'next/link';

/* ============================================================
   SLIDING AUTH PAGE — Sign In (default) / Sign Up
   ============================================================ */

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>}>
      <AuthPageContent />
    </Suspense>
  );
}

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);

  // Open Sign Up panel if redirected from /register
  useEffect(() => {
    if (searchParams.get('mode') === 'signup') {
      setIsSignUp(true);
    }
  }, [searchParams]);

  /* ---- Sign In state ---- */
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);

  /* ---- Sign Up state ---- */
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [showRegPw, setShowRegPw] = useState(false);

  /* ---- OTP state ---- */
  const [showOtpPanel, setShowOtpPanel] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  /* ---- Admin Login OTP state ---- */
  const [showAdminOtp, setShowAdminOtp] = useState(false);
  const [adminOtpEmail, setAdminOtpEmail] = useState('');
  const [adminOtpValues, setAdminOtpValues] = useState(['', '', '', '', '', '']);
  const [adminOtpLoading, setAdminOtpLoading] = useState(false);
  const [adminOtpError, setAdminOtpError] = useState('');
  const [adminResendLoading, setAdminResendLoading] = useState(false);
  const [adminResendMsg, setAdminResendMsg] = useState('');

  /* ---- Toggle ---- */
  const toggle = () => {
    setLoginError('');
    setRegError('');
    setIsSignUp((prev) => !prev);
  };

  /* ============ SIGN IN ============ */
  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch(LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid credentials');

      // Admin requires OTP
      if (data.data?.requireOtp) {
        setAdminOtpEmail(loginEmail);
        setShowAdminOtp(true);
        setAdminOtpValues(['', '', '', '', '', '']);
        setAdminOtpError('');
        setLoginLoading(false);
        return;
      }

      const token = data.data?.accessToken;
      const role = data.data?.user?.role?.user_type;
      const user = {
        _id: data.data?.user?.id,
        id: data.data?.user?.id,
        name: data.data?.user?.name,
        email: data.data?.user?.email,
      };
      if (!token || !role) throw new Error('Invalid server response');
      setAuthData(token, role, user);
      setTimeout(() => router.push('/dashboard'), 100);
    } catch (err) {
      setLoginError(err.message);
      setLoginLoading(false);
    }
  }, [loginEmail, loginPassword, router]);

  /* ============ VERIFY ADMIN LOGIN OTP ============ */
  const handleAdminOtpVerify = useCallback(async (e) => {
    e.preventDefault();
    const otp = adminOtpValues.join('');
    if (otp.length !== 6) { setAdminOtpError('Please enter all 6 digits'); return; }

    setAdminOtpLoading(true);
    setAdminOtpError('');
    try {
      const res = await fetch(VERIFY_LOGIN_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminOtpEmail, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');

      const payload = data.data;
      const token = payload?.accessToken;
      const user = payload?.user;
      const role = user?.role?.user_type || 'admin';
      if (!token) throw new Error('Verification failed');

      setAuthData(token, role, { _id: user?.id, id: user?.id, name: user?.name, email: user?.email });
      setTimeout(() => router.push('/dashboard'), 100);
    } catch (err) {
      setAdminOtpError(err.message);
      setAdminOtpLoading(false);
    }
  }, [adminOtpValues, adminOtpEmail, router]);

  /* ============ RESEND ADMIN LOGIN OTP ============ */
  const handleAdminResendOtp = useCallback(async () => {
    setAdminResendLoading(true);
    setAdminResendMsg('');
    setAdminOtpError('');
    try {
      const res = await fetch(RESEND_LOGIN_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminOtpEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to resend');
      setAdminResendMsg('New OTP sent to verification email!');
      setAdminOtpValues(['', '', '', '', '', '']);
    } catch (err) {
      setAdminOtpError(err.message);
    } finally {
      setAdminResendLoading(false);
    }
  }, [adminOtpEmail]);

  /* ============ SIGN UP — sends OTP ============ */
  const handleRegister = useCallback(async (e) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError('');
    try {
      const res = await fetch(REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      // Show OTP panel
      setOtpEmail(regEmail);
      setShowOtpPanel(true);
      setOtpValues(['', '', '', '', '', '']);
      setOtpError('');
    } catch (err) {
      setRegError(err.message);
    } finally {
      setRegLoading(false);
    }
  }, [regName, regEmail, regPassword]);

  /* ============ VERIFY OTP ============ */
  const handleVerifyOtp = useCallback(async (e) => {
    e.preventDefault();
    const otp = otpValues.join('');
    if (otp.length !== 6) { setOtpError('Please enter all 6 digits'); return; }

    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await fetch(VERIFY_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');

      const payload = data.data;
      const token = payload?.accessToken;
      const user = payload?.user;
      const role = user?.role?.user_type || 'user';
      if (!token) throw new Error('Verification failed');

      setAuthData(token, role, { _id: user?.id, id: user?.id, name: user?.name, email: user?.email });
      setTimeout(() => router.push('/dashboard'), 100);
    } catch (err) {
      setOtpError(err.message);
      setOtpLoading(false);
    }
  }, [otpValues, otpEmail, router]);

  /* ============ RESEND OTP ============ */
  const handleResendOtp = useCallback(async () => {
    setResendLoading(true);
    setResendMsg('');
    setOtpError('');
    try {
      const res = await fetch(RESEND_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to resend');
      setResendMsg('New OTP sent to your email!');
      setOtpValues(['', '', '', '', '', '']);
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setResendLoading(false);
    }
  }, [otpEmail]);

  /* ============ SLIDE VARIANTS ============ */
  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  const direction = isSignUp ? 1 : -1;

  return (
    <div className="min-h-screen bg-[#060d1f] flex items-center justify-center p-4 overflow-hidden">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-[120px]" />
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 rounded-3xl overflow-hidden border border-cyan-900/30 bg-[#0a1628]/90 backdrop-blur-xl shadow-2xl shadow-black/50 min-h-140">

        {/* ===== LEFT — Brand Image (stays fixed) ===== */}
        <div className="relative col-span-1 lg:col-span-2 hidden lg:flex flex-col items-center justify-center p-8 bg-linear-to-b from-[#0a1628] via-[#0d1a30] to-[#0a1628] border-r border-cyan-900/20">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
          </div>

          <motion.div
            className="relative w-52 h-52 rounded-2xl overflow-hidden mb-6 shadow-xl shadow-cyan-900/20 border border-cyan-800/20"
            animate={{ y: isSignUp ? -8 : 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <img src="/coaching.png" alt="SARKAR CAREER ACADEMY" className="w-full h-full object-cover" />
          </motion.div>

          <p className="text-cyan-400/60 text-sm tracking-wider uppercase mb-1">SARKAR CAREER </p>
          <h2 className="text-2xl font-bold text-white tracking-wide">ACADEMY</h2>
          <div className="mt-6 w-20 h-px bg-linear-to-r from-transparent via-cyan-500/40 to-transparent" />

          {/* Dynamic text based on panel */}
          <AnimatePresence mode="wait">
            <motion.p
              key={isSignUp ? 'signup' : 'signin'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-4 text-cyan-700/80 text-xs text-center max-w-55 leading-relaxed"
            >
              {isSignUp
                ? 'Begin your journey into the mystical arts'
                : 'Welcome back, seeker of knowledge'}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* ===== RIGHT — Sliding Form Panel ===== */}
        <div className="col-span-1 lg:col-span-3 relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {!isSignUp ? (
              /* ============ SIGN IN PANEL ============ */
              <motion.div
                key="signin"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center min-h-140"
              >
                <MobileLogo />

                <AnimatePresence mode="wait">
                  {!showAdminOtp ? (
                    /* ---- Normal Login Form ---- */
                    <motion.div key="login-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Welcome Back!</h1>
                      <p className="text-slate-500 text-sm mb-7">Sign in to your account</p>

                      {loginError && <ErrorBox message={loginError} />}

                      <form onSubmit={handleLogin} className="space-y-5">
                        <InputField label="Email Address" type="email" value={loginEmail} onChange={setLoginEmail} placeholder="careeracademy1995@gmail.com" />
                        <PasswordField label="Password" value={loginPassword} onChange={setLoginPassword} show={showLoginPw} toggleShow={() => setShowLoginPw(!showLoginPw)} />

                        <div className="flex justify-end">
                          <Link href="/forgot-password" className="text-xs text-cyan-500/70 hover:text-cyan-400 transition">
                            Forgot password?
                          </Link>
                        </div>

                        <SubmitButton loading={loginLoading} text="Sign In" loadingText="Signing in..." />
                      </form>

                      <p className="mt-8 text-center text-sm text-slate-600">
                        Don't have an account?{' '}
                        <button onClick={toggle} className="text-cyan-400 hover:text-cyan-300 font-medium transition">Create Account</button>
                      </p>
                    </motion.div>
                  ) : (
                    /* ---- Admin OTP Verification ---- */
                    <motion.div key="admin-otp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Admin Verification</h1>
                      <p className="text-slate-500 text-sm mb-7">
                        OTP sent to verification email for <span className="text-red-400">{adminOtpEmail}</span>
                      </p>

                      {adminOtpError && <ErrorBox message={adminOtpError} />}
                      {adminResendMsg && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="mb-5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                          {adminResendMsg}
                        </motion.div>
                      )}

                      <form onSubmit={handleAdminOtpVerify} className="space-y-6">
                        <OtpInput values={adminOtpValues} onChange={setAdminOtpValues} />
                        <SubmitButton loading={adminOtpLoading} text="Verify & Login" loadingText="Verifying..." />
                      </form>

                      <div className="mt-6 flex items-center justify-between">
                        <button
                          onClick={() => { setShowAdminOtp(false); setAdminOtpError(''); setAdminResendMsg(''); }}
                          className="text-sm text-slate-500 hover:text-slate-300 transition"
                        >
                          ← Back to Login
                        </button>
                        <button
                          onClick={handleAdminResendOtp}
                          disabled={adminResendLoading}
                          className="text-sm text-red-400 hover:text-red-300 font-medium transition disabled:opacity-50"
                        >
                          {adminResendLoading ? 'Sending...' : 'Resend OTP'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              /* ============ SIGN UP / OTP PANEL ============ */
              <motion.div
                key="signup"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center min-h-140"
              >
                <MobileLogo />

                <AnimatePresence mode="wait">
                  {!showOtpPanel ? (
                    /* ---- Registration Form ---- */
                    <motion.div key="reg-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Create Account</h1>
                      <p className="text-slate-500 text-sm mb-7">Start your mystical journey today</p>

                      {regError && <ErrorBox message={regError} />}

                      <form onSubmit={handleRegister} className="space-y-5">
                        <InputField label="Full Name" type="text" value={regName} onChange={setRegName} placeholder="Your name" />
                        <InputField label="Email Address" type="email" value={regEmail} onChange={setRegEmail} placeholder="careeracademy1995@gmail.com" />
                        <PasswordField label="Password" value={regPassword} onChange={setRegPassword} show={showRegPw} toggleShow={() => setShowRegPw(!showRegPw)} minLength={6} placeholder="Min 6 characters" />
                        <SubmitButton loading={regLoading} text="Create Account" loadingText="Sending OTP..." />
                      </form>

                      <p className="mt-8 text-center text-sm text-slate-600">
                        Already have an account?{' '}
                        <button onClick={toggle} className="text-cyan-400 hover:text-cyan-300 font-medium transition">Sign In</button>
                      </p>
                    </motion.div>
                  ) : (
                    /* ---- OTP Verification Form ---- */
                    <motion.div key="otp-form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Verify Your Email</h1>
                      <p className="text-slate-500 text-sm mb-7">
                        We sent a 6-digit OTP to <span className="text-cyan-400">{otpEmail}</span>
                      </p>

                      {otpError && <ErrorBox message={otpError} />}
                      {resendMsg && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="mb-5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                          {resendMsg}
                        </motion.div>
                      )}

                      <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <OtpInput values={otpValues} onChange={setOtpValues} />
                        <SubmitButton loading={otpLoading} text="Verify & Continue" loadingText="Verifying..." />
                      </form>

                      <div className="mt-6 flex items-center justify-between">
                        <button
                          onClick={() => { setShowOtpPanel(false); setOtpError(''); setResendMsg(''); }}
                          className="text-sm text-slate-500 hover:text-slate-300 transition"
                        >
                          ← Back
                        </button>
                        <button
                          onClick={handleResendOtp}
                          disabled={resendLoading}
                          className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition disabled:opacity-50"
                        >
                          {resendLoading ? 'Sending...' : 'Resend OTP'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   REUSABLE COMPONENTS
   ============================================================ */

function MobileLogo() {
  return (
    <div className="lg:hidden flex items-center gap-3 mb-7 justify-center">
      <div className="w-11 h-11 rounded-xl overflow-hidden border border-cyan-800/30">
        <img src="/coaching.png" alt="SARKAR CAREER ACADEMY" className="w-full h-full object-cover" />
      </div>
      <div>
        <p className="text-cyan-400/60 text-[10px] tracking-wider uppercase">SARKAR CAREER</p>
        <p className="text-white font-bold text-sm">ACADEMY</p>
      </div>
    </div>
  );
}

function InputField({ label, type, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-2 uppercase tracking-wider font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-cyan-900/30 text-white text-sm placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all"
      />
    </div>
  );
}

function PasswordField({ label, value, onChange, show, toggleShow, minLength = 1, placeholder = "Enter your password" }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-2 uppercase tracking-wider font-medium">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          minLength={minLength}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-cyan-900/30 text-white text-sm placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all pr-12"
        />
        <button
          type="button"
          onClick={toggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition"
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}

function SubmitButton({ loading, text, loadingText }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-300 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 shadow-lg shadow-blue-900/30 hover:shadow-blue-800/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {loadingText}
        </>
      ) : text}
    </button>
  );
}

function ErrorBox({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
    >
      {message}
    </motion.div>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function OtpInput({ values, onChange }) {
  const handleChange = (index, val) => {
    // Allow only alphanumeric
    const char = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-1);
    const newValues = [...values];
    newValues[index] = char;
    onChange(newValues);

    // Auto-focus next input
    if (char && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
    const newValues = [...values];
    for (let i = 0; i < 6; i++) {
      newValues[i] = pasted[i] || '';
    }
    onChange(newValues);
    // Focus last filled input
    const lastIndex = Math.min(pasted.length, 6) - 1;
    if (lastIndex >= 0) {
      const el = document.getElementById(`otp-${lastIndex}`);
      el?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-3" onPaste={handlePaste}>
      {values.map((val, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="text"
          maxLength={1}
          value={val}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-white/5 border border-cyan-900/30
                     text-cyan-300 placeholder-slate-700 focus:border-cyan-500/50 focus:outline-none
                     focus:ring-1 focus:ring-cyan-500/20 transition-all uppercase"
        />
      ))}
    </div>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
