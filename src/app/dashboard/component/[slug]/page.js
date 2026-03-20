"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  GET_COURSE_BY_SLUG,
  CREATE_ORDER,
  CREATE_PAYMENT,
  VERIFY_PAYMENT,
  FAILED_PAYMENT,
  MAKE_ENROLL,
  SINGLE_ENROLLMENT,
} from "../../utils/api";
import DashboardLayout from "@/app/dashboard/component/DashboardLayout";
import { requestWithAuth } from "@/app/dashboard/utils/apiClient";
import MyLoader from "@/components/landing/MyLoder";
import SuccessBox from "@/components/common/SuccessBox";
import ErrorBox from "@/components/common/ErrorBox";
import { motion, AnimatePresence } from "framer-motion";

/* ================= HELPERS ================= */

const formatDuration = (duration) => {
  if (!duration) return null;
  const h = duration.hours || 0;
  const m = duration.minutes || 0;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  if (m) return `${m}m`;
  return null;
};

/* ================= LOAD RAZORPAY SCRIPT ================= */

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/* ================= ANIMATIONS ================= */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const listItem = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

/* ================= META BADGE ================= */

function MetaBadge({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
      <span className="text-blue-400 text-sm">{icon}</span>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">{label}</span>
        <span className="text-sm text-slate-200 capitalize font-medium">{value}</span>
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

export default function CourseDetailPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentPercent, setPaymentPercent] = useState(100);
  const [paying, setPaying] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const getPayAmount = () => {
    const total = Number(course.totalFee || 0);
    return ((total * paymentPercent) / 100).toFixed(2);
  };

  /* ================= FETCH COURSE ================= */

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError("Invalid course link.");
      return;
    }

    let isMounted = true;

    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await requestWithAuth(GET_COURSE_BY_SLUG(slug), {
          method: "GET",
          allowedRoles: ["user", "student"],
        });

        const data = response?.data;

        if (!data) {
          if (isMounted) setError("Course not found.");
          return;
        }

        if (isMounted) setCourse(data);
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load course.";
        if (isMounted) setError(message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCourse();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  /* ================= RAZORPAY PAYMENT HANDLER ================= */

  const handlePayment = useCallback(async () => {
    if (paying) return;
    setPaying(true);

    try {
      /* ---- Step 1: Load Razorpay checkout script ---- */
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setErrorMsg("Failed to load Razorpay. Check your internet.");
        setPaying(false);
        return;
      }

      const amount = Number(getPayAmount());
      const currency = course.currency || "INR";
      let enrollmentId = null;

      /* ---- Step 2: Get or create enrollment ---- */
      const enrollRes = await requestWithAuth(MAKE_ENROLL, {
        method: "POST",
        body: {
          courseId: course._id,
          totalFee: Number(course.totalFee || 0),
        },
        allowedRoles: ["user", "student"],
      });

      if (enrollRes?.success && enrollRes?.data?._id) {
        // New enrollment created successfully
        enrollmentId = enrollRes.data._id;
      } else if (
        enrollRes?.success === false &&
        enrollRes?.message?.toLowerCase().includes("already enrolled")
      ) {
        // Already enrolled — fetch existing enrollment to get _id
        const existingRes = await requestWithAuth(SINGLE_ENROLLMENT, {
          method: "POST",
          body: { courseId: course._id },
          allowedRoles: ["user", "student"],
        });

        if (existingRes?.success && existingRes?.data?._id) {
          // Already fully paid → redirect to modules
          if (existingRes.data.paymentStatus === "full") {
            setSuccessMsg("Already paid! Redirecting to course...");
            router.push(`/dashboard/myCourses`);
            return;
          }
          enrollmentId = existingRes.data._id;
        } else {
          throw new Error("Could not fetch existing enrollment");
        }
      } else {
        throw new Error(enrollRes?.message || "Enrollment failed");
      }

      /* ---- Step 3: Create Razorpay order on backend ---- */
      const orderRes = await requestWithAuth(CREATE_ORDER, {
        method: "POST",
        body: { amount, currency, courseId: course._id },
        allowedRoles: ["user", "student"],
      });

      const order = orderRes?.data;
      if (!order?.id) {
        throw new Error("Failed to create Razorpay order");
      }

      /* ---- Step 4: Save payment record (pending) in DB ---- */
      await requestWithAuth(CREATE_PAYMENT, {
        method: "POST",
        body: {
          courseId: course._id,
          enrollmentId,
          razorpayOrderId: order.id,
          amount,
          currency,
        },
        allowedRoles: ["user", "student"],
      });

      /* ---- Step 5: Open Razorpay Checkout ---- */
      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "HIOS",
        description: course.title || "Course Payment",
        order_id: order.id,

        handler: async function (response) {
          // Payment success → verify signature on backend
          try {
            setSuccessMsg("Verifying payment...");

            await requestWithAuth(VERIFY_PAYMENT, {
              method: "POST",
              body: {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
              allowedRoles: ["user", "student"],
            });

            setSuccessMsg("Payment successful! Redirecting...");
            setTimeout(() => {
              router.push(`/dashboard/myCourses`);
            }, 1500);
          } catch (verifyErr) {
            console.error("Verify error:", verifyErr);
            setErrorMsg("Payment verification failed. Contact support.");
          } finally {
            setPaying(false);
          }
        },

        modal: {
          ondismiss: async function () {
            // User closed Razorpay popup → mark payment failed
            try {
              await requestWithAuth(FAILED_PAYMENT, {
                method: "POST",
                body: { razorpayOrderId: order.id },
                allowedRoles: ["user", "student"],
              });
            } catch {
              // silent
            }
            setErrorMsg("Payment cancelled");
            setPaying(false);
          },
        },

        theme: { color: "#3b82f6" },
      });

      rzp.on("payment.failed", async function (response) {
        try {
          await requestWithAuth(FAILED_PAYMENT, {
            method: "POST",
            body: { razorpayOrderId: order.id },
            allowedRoles: ["user", "student"],
          });
        } catch {
          // silent
        }
        setErrorMsg(response.error?.description || "Payment failed");
        setPaying(false);
      });

      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      setErrorMsg(err?.message || "Something went wrong");
      setPaying(false);
    }
  }, [course, paymentPercent, paying, router]);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <DashboardLayout role="user">
        <MyLoader />
      </DashboardLayout>
    );
  }

  /* ================= ERROR ================= */

  if (error || !course) {
    return (
      <DashboardLayout role="user">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
        >
          {error || "Course not found."}
        </motion.div>
      </DashboardLayout>
    );
  }

  /* ================= RENDER ================= */

  return (
    <DashboardLayout role="user">
      {/* Notification Bars */}
      <div className="max-w-6xl mx-auto mb-4">
        <SuccessBox message={successMsg} key={successMsg} />
        <ErrorBox message={errorMsg} key={errorMsg} />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* ===== HERO SECTION ===== */}
        <motion.div
          variants={fadeUp}
          custom={0}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-800/50 to-blue-900/30 backdrop-blur-xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
            {/* LEFT — Course Info */}
            <div className="lg:col-span-3 p-8 lg:p-10 flex flex-col justify-center">
              {course.categoryId?.name && (
                <motion.span
                  variants={fadeUp}
                  custom={1}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 text-xs font-semibold uppercase tracking-wider w-fit mb-4 border border-blue-500/20"
                >
                  {course.categoryId.name}
                </motion.span>
              )}

              <motion.h1
                variants={fadeUp}
                custom={2}
                className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-4"
              >
                {course.title || "Untitled Course"}
              </motion.h1>

              {course.instructorId?.name && (
                <motion.div variants={fadeUp} custom={3} className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {course.instructorId.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Instructor</p>
                    <p className="text-white font-medium text-sm">{course.instructorId.name}</p>
                  </div>
                </motion.div>
              )}

              <motion.div variants={fadeUp} custom={4} className="flex flex-wrap gap-2">
                {course.level && (
                  <MetaBadge icon="📊" label="Level" value={course.level} />
                )}
                {course.courseLanguage && (
                  <MetaBadge icon="🌐" label="Language" value={course.courseLanguage} />
                )}
                {formatDuration(course.duration) && (
                  <MetaBadge icon="⏱️" label="Duration" value={formatDuration(course.duration)} />
                )}
              </motion.div>
            </div>

            {/* RIGHT — Thumbnail */}
            <div className="lg:col-span-2 relative">
              {course.thumbnail && (
                <motion.div
                  variants={scaleIn}
                  className="relative h-full min-h-[280px] lg:min-h-full overflow-hidden group"
                >
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-transparent to-transparent lg:block hidden" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent lg:hidden" />

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ===== CONTENT GRID ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN — Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Short Description */}
            {course.shortDescription && (
              <motion.div variants={fadeUp} custom={0.5}>
                <p className="text-slate-300 text-base leading-relaxed">
                  {course.shortDescription}
                </p>
              </motion.div>
            )}

            {/* Course Highlights Bar */}
            <motion.div
              variants={fadeUp}
              custom={1}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              {formatDuration(course.duration) && (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
                  <p className="text-2xl font-bold text-white">{formatDuration(course.duration)}</p>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-1">Duration</p>
                </div>
              )}
              {course.level && (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
                  <p className="text-2xl font-bold text-white capitalize">{course.level}</p>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-1">Level</p>
                </div>
              )}
              {course.courseLanguage && (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
                  <p className="text-2xl font-bold text-white capitalize">{course.courseLanguage}</p>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-1">Language</p>
                </div>
              )}
              {course.partialPaymentEnabled && (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-400">Yes</p>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-1">EMI Available</p>
                </div>
              )}
            </motion.div>

            {/* About */}
            {course.description && (
              <motion.div
                variants={fadeUp}
                custom={1.5}
                className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 lg:p-8"
              >
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-blue-500 inline-block" />
                  About this Course
                </h2>
                <p className="text-slate-400 leading-relaxed text-sm whitespace-pre-line">
                  {course.description}
                </p>
              </motion.div>
            )}

            {/* Preview Video */}
            {course.previewVideo && (
              <motion.div
                variants={fadeUp}
                custom={2}
                className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 lg:p-8"
              >
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-purple-500 inline-block" />
                  Preview Video
                </h2>
                <div className="rounded-xl overflow-hidden aspect-video bg-black">
                  <video
                    src={course.previewVideo}
                    controls
                    className="w-full h-full object-contain"
                    poster={course.thumbnail}
                  />
                </div>
              </motion.div>
            )}

            {/* What You'll Learn */}
            {course.whatYouWillLearn?.length > 0 && (
              <motion.div
                variants={fadeUp}
                custom={2.5}
                className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 lg:p-8"
              >
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-emerald-500 inline-block" />
                  What You'll Learn
                </h2>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {course.whatYouWillLearn.map((item, i) => (
                    <motion.div
                      key={i}
                      variants={listItem}
                      className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10"
                    >
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span className="text-sm text-slate-300">{item}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Requirements */}
            {course.requirements?.length > 0 && (
              <motion.div
                variants={fadeUp}
                custom={3}
                className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 lg:p-8"
              >
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-amber-500 inline-block" />
                  Requirements
                </h2>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="space-y-2"
                >
                  {course.requirements.map((req, i) => (
                    <motion.div
                      key={i}
                      variants={listItem}
                      className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                      <span className="text-sm text-slate-300">{req}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Tags */}
            {course.tags?.length > 0 && (
              <motion.div variants={fadeUp} custom={3.5} className="flex flex-wrap gap-2">
                {course.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 text-slate-400 border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>
            )}
          </div>

          {/* RIGHT COLUMN — Payment Card (sticky) */}
          <div className="lg:col-span-1">
            {course.totalFee !== undefined && (
              <motion.div
                variants={fadeUp}
                custom={2}
                className="sticky top-24"
              >
                <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-xl p-6 space-y-6">
                  {/* Price display */}
                  <div className="text-center">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Course Fee</p>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={paymentPercent}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                        className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
                      >
                        {course.currency || "INR"} {getPayAmount()}
                      </motion.div>
                    </AnimatePresence>

                    {/* Original price + discount */}
                    {course.discount > 0 && course.price > 0 && (
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="text-sm text-slate-500 line-through">
                          {course.currency || "INR"} {Number(course.price).toLocaleString()}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold">
                          {course.discount}% OFF
                        </span>
                      </div>
                    )}

                    {paymentPercent !== 100 && (
                      <p className="text-slate-500 text-xs mt-1">
                        of {course.currency || "INR"} {Number(course.totalFee).toFixed(2)} total
                      </p>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  {/* Payment options */}
                  <div>
                    <p className="text-slate-400 text-xs font-medium mb-3 uppercase tracking-wider">Choose Payment Plan</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[25, 50, 100].map((percent) => (
                        <motion.button
                          key={percent}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setPaymentPercent(percent)}
                          disabled={paying}
                          className={`relative py-3 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden ${
                            paymentPercent === percent
                              ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                              : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10 hover:border-white/20"
                          }`}
                        >
                          {paymentPercent === percent && (
                            <motion.div
                              layoutId="activePayment"
                              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          <span className="relative z-10">{percent}%</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button — Razorpay Payment */}
                  <motion.button
                    whileHover={!paying ? { scale: 1.02 } : {}}
                    whileTap={!paying ? { scale: 0.98 } : {}}
                    onClick={handlePayment}
                    disabled={paying}
                    className={`w-full py-4 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${
                      paying
                        ? "bg-blue-500/50 text-white/70 cursor-not-allowed shadow-none"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/20 hover:shadow-blue-500/40"
                    }`}
                  >
                    {paying ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                          <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                        Pay {course.currency || "INR"} {getPayAmount()}
                      </>
                    )}
                  </motion.button>

                  {/* Trust indicators */}
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      Secure Payment
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      Razorpay Protected
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
