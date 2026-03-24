'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FORGET_PASSWORD, VERIFY_RESET_OTP, RESET_PASSWORD } from '../../dashboard/utils/api';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Steps: 'email' → 'otp' → 'reset' → 'done'
  const [step, setStep] = useState('email');

  // Email step
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  // OTP step
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  // Reset step
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  /* ============ STEP 1: Send OTP ============ */
  const handleSendOtp = useCallback(async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailError('');
    try {
      const res = await fetch(FORGET_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      setStep('otp');
    } catch (err) {
      setEmailError(err.message);
    } finally {
      setEmailLoading(false);
    }
  }, [email]);

  /* ============ STEP 2: Verify OTP ============ */
  const handleVerifyOtp = useCallback(async (e) => {
    e.preventDefault();
    const otp = otpValues.join('');
    if (otp.length !== 6) { setOtpError('Please enter all 6 characters'); return; }

    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await fetch(VERIFY_RESET_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid OTP');
      setStep('reset');
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setOtpLoading(false);
    }
  }, [email, otpValues]);

  /* ============ Resend OTP ============ */
  const handleResendOtp = useCallback(async () => {
    setResendLoading(true);
    setResendMsg('');
    setOtpError('');
    try {
      const res = await fetch(FORGET_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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
  }, [email]);

  /* ============ STEP 3: Reset Password ============ */
  const handleResetPassword = useCallback(async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }
    setResetLoading(true);
    setResetError('');
    try {
      const otp = otpValues.join('');
      const res = await fetch(RESET_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Password reset failed');
      setStep('done');
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  }, [email, otpValues, newPassword, confirmPassword]);

  return (
    <div className="min-h-screen bg-[#060d1f] flex items-center justify-center p-4 overflow-hidden">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 rounded-3xl overflow-hidden border border-cyan-900/30 bg-[#0a1628]/90 backdrop-blur-xl shadow-2xl shadow-black/50 min-h-[560px]">

        {/* Left — Brand */}
        <div className="relative col-span-1 lg:col-span-2 hidden lg:flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#0a1628] via-[#0d1a30] to-[#0a1628] border-r border-cyan-900/20">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
          </div>
          <div className="relative w-52 h-52 rounded-2xl overflow-hidden mb-6 shadow-xl shadow-cyan-900/20 border border-cyan-800/20">
            <img src="/hios.jpg" alt="HIOS" className="w-full h-full object-cover" />
          </div>
          <p className="text-cyan-400/60 text-sm tracking-wider uppercase mb-1">Hamsa Institute of</p>
          <h2 className="text-2xl font-bold text-white tracking-wide">Occult Science</h2>
          <div className="mt-6 w-20 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
          <p className="mt-4 text-cyan-700/80 text-xs text-center max-w-[220px] leading-relaxed">
            Reset your password securely
          </p>
        </div>

        {/* Right — Form */}
        <div className="col-span-1 lg:col-span-3 p-8 sm:p-10 lg:p-12 flex flex-col justify-center min-h-[560px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-7 justify-center">
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-cyan-800/30">
              <img src="/hios.jpg" alt="HIOS" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-cyan-400/60 text-[10px] tracking-wider uppercase">Hamsa Institute of</p>
              <p className="text-white font-bold text-sm">Occult Science</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* ====== STEP 1: Enter Email ====== */}
            {step === 'email' && (
              <motion.div key="email-step" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Forgot Password?</h1>
                <p className="text-slate-500 text-sm mb-7">Enter your email and we'll send you an OTP</p>

                {emailError && <ErrorBox message={emailError} />}

                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div>
                    <label className="block text-xs text-slate-500 mb-2 uppercase tracking-wider font-medium">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-cyan-900/30 text-white text-sm placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all"
                    />
                  </div>
                  <SubmitButton loading={emailLoading} text="Send OTP" loadingText="Sending..." />
                </form>

                <p className="mt-8 text-center text-sm text-slate-600">
                  Remember your password?{' '}
                  <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition">Sign In</Link>
                </p>
              </motion.div>
            )}

            {/* ====== STEP 2: Verify OTP ====== */}
            {step === 'otp' && (
              <motion.div key="otp-step" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Verify OTP</h1>
                <p className="text-slate-500 text-sm mb-7">
                  We sent a 6-digit OTP to <span className="text-cyan-400">{email}</span>
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
                  <SubmitButton loading={otpLoading} text="Verify OTP" loadingText="Verifying..." />
                </form>

                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={() => { setStep('email'); setOtpError(''); setResendMsg(''); }}
                    className="text-sm text-slate-500 hover:text-slate-300 transition"
                  >
                    &larr; Change Email
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

            {/* ====== STEP 3: New Password ====== */}
            {step === 'reset' && (
              <motion.div key="reset-step" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Set New Password</h1>
                <p className="text-slate-500 text-sm mb-7">Choose a strong password for your account</p>

                {resetError && <ErrorBox message={resetError} />}

                <form onSubmit={handleResetPassword} className="space-y-5">
                  <PasswordField
                    label="New Password"
                    value={newPassword}
                    onChange={setNewPassword}
                    show={showNewPw}
                    toggleShow={() => setShowNewPw(!showNewPw)}
                    placeholder="Min 6 characters"
                    minLength={6}
                  />
                  <PasswordField
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    show={showConfirmPw}
                    toggleShow={() => setShowConfirmPw(!showConfirmPw)}
                    placeholder="Re-enter password"
                    minLength={6}
                  />
                  <SubmitButton loading={resetLoading} text="Reset Password" loadingText="Resetting..." />
                </form>
              </motion.div>
            )}

            {/* ====== STEP 4: Success ====== */}
            {step === 'done' && (
              <motion.div key="done-step" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Password Reset!</h1>
                <p className="text-slate-500 text-sm mb-8">Your password has been changed successfully</p>
                <Link
                  href="/login"
                  className="inline-block px-8 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 shadow-lg shadow-blue-900/30 transition-all duration-300"
                >
                  Go to Sign In
                </Link>
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

function OtpInput({ values, onChange }) {
  const handleChange = (index, val) => {
    const char = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-1);
    const newValues = [...values];
    newValues[index] = char;
    onChange(newValues);
    if (char && index < 5) {
      const next = document.getElementById(`reset-otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      const prev = document.getElementById(`reset-otp-${index - 1}`);
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
    const lastIndex = Math.min(pasted.length, 6) - 1;
    if (lastIndex >= 0) {
      document.getElementById(`reset-otp-${lastIndex}`)?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-3" onPaste={handlePaste}>
      {values.map((val, i) => (
        <input
          key={i}
          id={`reset-otp-${i}`}
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
