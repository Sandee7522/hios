'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { setAuthData } from '../../dashboard/utils/auth';
import { LOGIN, REGISTER } from '../../dashboard/utils/api';
import Link from 'next/link';

/* ============================================================
   SLIDING AUTH PAGE — Sign In (default) / Sign Up
   ============================================================ */

export default function AuthPage() {
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

  /* ============ SIGN UP ============ */
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

      const payload = data.data?.data || data.data;
      if (!payload?.accessToken) throw new Error('Registration successful! Please sign in.');

      const token = payload.accessToken;
      const user = payload.user;
      const role = user?.role?.user_type || 'user';
      setAuthData(token, role, { _id: user?.id, id: user?.id, name: user?.name, email: user?.email });
      setTimeout(() => router.push('/dashboard'), 100);
    } catch (err) {
      setRegError(err.message);
      setRegLoading(false);
    }
  }, [regName, regEmail, regPassword, router]);

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
      <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 rounded-3xl overflow-hidden border border-cyan-900/30 bg-[#0a1628]/90 backdrop-blur-xl shadow-2xl shadow-black/50 min-h-[560px]">

        {/* ===== LEFT — Brand Image (stays fixed) ===== */}
        <div className="relative col-span-1 lg:col-span-2 hidden lg:flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#0a1628] via-[#0d1a30] to-[#0a1628] border-r border-cyan-900/20">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
          </div>

          <motion.div
            className="relative w-52 h-52 rounded-2xl overflow-hidden mb-6 shadow-xl shadow-cyan-900/20 border border-cyan-800/20"
            animate={{ y: isSignUp ? -8 : 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <img src="/hios.jpg" alt="HIOS" className="w-full h-full object-cover" />
          </motion.div>

          <p className="text-cyan-400/60 text-sm tracking-wider uppercase mb-1">Hamsa Institute of</p>
          <h2 className="text-2xl font-bold text-white tracking-wide">Occult Science</h2>
          <div className="mt-6 w-20 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

          {/* Dynamic text based on panel */}
          <AnimatePresence mode="wait">
            <motion.p
              key={isSignUp ? 'signup' : 'signin'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-4 text-cyan-700/80 text-xs text-center max-w-[220px] leading-relaxed"
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
                className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center min-h-[560px]"
              >
                {/* Mobile logo */}
                <MobileLogo />

                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Welcome Back!</h1>
                <p className="text-slate-500 text-sm mb-7">Sign in to your account</p>

                {loginError && <ErrorBox message={loginError} />}

                <form onSubmit={handleLogin} className="space-y-5">
                  <InputField
                    label="Email Address"
                    type="email"
                    value={loginEmail}
                    onChange={setLoginEmail}
                    placeholder="you@example.com"
                  />
                  <PasswordField
                    label="Password"
                    value={loginPassword}
                    onChange={setLoginPassword}
                    show={showLoginPw}
                    toggleShow={() => setShowLoginPw(!showLoginPw)}
                  />

                  <div className="flex justify-end">
                    <Link href="/forgot-password" className="text-xs text-cyan-500/70 hover:text-cyan-400 transition">
                      Forgot password?
                    </Link>
                  </div>

                  <SubmitButton loading={loginLoading} text="Sign In" loadingText="Signing in..." />
                </form>

                <p className="mt-8 text-center text-sm text-slate-600">
                  Don't have an account?{' '}
                  <button onClick={toggle} className="text-cyan-400 hover:text-cyan-300 font-medium transition">
                    Create Account
                  </button>
                </p>
              </motion.div>
            ) : (
              /* ============ SIGN UP PANEL ============ */
              <motion.div
                key="signup"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center min-h-[560px]"
              >
                <MobileLogo />

                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Create Account</h1>
                <p className="text-slate-500 text-sm mb-7">Start your mystical journey today</p>

                {regError && <ErrorBox message={regError} />}

                <form onSubmit={handleRegister} className="space-y-5">
                  <InputField
                    label="Full Name"
                    type="text"
                    value={regName}
                    onChange={setRegName}
                    placeholder="Your name"
                  />
                  <InputField
                    label="Email Address"
                    type="email"
                    value={regEmail}
                    onChange={setRegEmail}
                    placeholder="you@example.com"
                  />
                  <PasswordField
                    label="Password"
                    value={regPassword}
                    onChange={setRegPassword}
                    show={showRegPw}
                    toggleShow={() => setShowRegPw(!showRegPw)}
                    minLength={6}
                    placeholder="Min 6 characters"
                  />

                  <SubmitButton loading={regLoading} text="Create Account" loadingText="Creating..." />
                </form>

                <p className="mt-8 text-center text-sm text-slate-600">
                  Already have an account?{' '}
                  <button onClick={toggle} className="text-cyan-400 hover:text-cyan-300 font-medium transition">
                    Sign In
                  </button>
                </p>
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
        <img src="/hios.jpg" alt="HIOS" className="w-full h-full object-cover" />
      </div>
      <div>
        <p className="text-cyan-400/60 text-[10px] tracking-wider uppercase">Hamsa Institute of</p>
        <p className="text-white font-bold text-sm">Occult Science</p>
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

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
