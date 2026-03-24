"use client";

import { useState } from "react";
import { GENERATE_COUPON } from "@/app/dashboard/utils/api";
import { requestWithAuth } from "@/app/dashboard/utils/apiClient";

export default function GenerateCouponModal({ user, onClose, onSuccess }) {
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("30");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedCoupon, setGeneratedCoupon] = useState(null);

  const handleGenerate = async () => {
    if (!discountValue || Number(discountValue) <= 0) {
      setError("Enter a valid discount value");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await requestWithAuth(GENERATE_COUPON, {
        method: "POST",
        body: {
          userId: user.id,
          discountType,
          discountValue: Number(discountValue),
          maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
          expiresInDays: Number(expiresInDays) || 30,
        },
        allowedRoles: ["admin"],
      });

      if (result?.data) {
        setGeneratedCoupon(result.data);
        onSuccess?.(`Coupon generated: ${result.data.code}`);
      }
    } catch (err) {
      setError(err.message || "Failed to generate coupon");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (generatedCoupon?.code) {
      navigator.clipboard.writeText(generatedCoupon.code);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-semibold text-white">Generate Discount Coupon</h3>
            <p className="text-sm text-slate-400 mt-0.5">
              For <span className="text-emerald-400 font-medium">{user?.name || user?.email}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition text-xl">&times;</button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Generated coupon display */}
          {generatedCoupon ? (
            <div className="space-y-4">
              <div className="text-center p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Coupon Code</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-bold text-emerald-400 tracking-[6px]">
                    {generatedCoupon.code}
                  </span>
                  <button
                    onClick={copyCode}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Copy"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-400">
                  <span>{generatedCoupon.discountType === "percentage" ? `${generatedCoupon.discountValue}% OFF` : `₹${generatedCoupon.discountValue} OFF`}</span>
                  <span>Expires: {new Date(generatedCoupon.expiresAt).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-lg bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 transition"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Discount Type */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Discount Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {["percentage", "flat"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setDiscountType(type)}
                      className={`py-2 rounded-lg text-sm font-medium transition ${
                        discountType === type
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      {type === "percentage" ? "Percentage (%)" : "Flat (₹)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">
                  Discount Value {discountType === "percentage" ? "(1-100%)" : "(₹)"}
                </label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === "percentage" ? "e.g. 20" : "e.g. 500"}
                  min="1"
                  max={discountType === "percentage" ? "100" : undefined}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none"
                />
              </div>

              {/* Max Discount (for percentage) */}
              {discountType === "percentage" && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">
                    Max Discount (₹) <span className="text-slate-600">optional</span>
                  </label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    placeholder="e.g. 1000"
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none"
                  />
                </div>
              )}

              {/* Expires In */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Expires In (Days)</label>
                <input
                  type="number"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                  placeholder="30"
                  min="1"
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-lg bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    "Generate Coupon"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
