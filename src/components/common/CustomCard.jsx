"use client";

export default function CustomCard({ title, value, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-2xl border border-indigo-800/45 bg-[linear-gradient(160deg,#141834_0%,#12162d_48%,#101323_100%)] px-4 py-4 shadow-[0_14px_34px_rgba(5,8,24,0.72)] hover:border-indigo-600/60 hover:shadow-[0_16px_36px_rgba(8,14,36,0.8)] hover:translate-y-[-2px] transition"
    >
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold text-slate-300">{title}</p>
        <span className="w-10 h-10 rounded-xl border border-cyan-500/35 bg-cyan-500/10 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.18)] inline-flex items-center justify-center">
          {icon}
        </span>
      </div>
      <p className="mt-2 text-4xl font-extrabold text-slate-100 tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-slate-500">View details</p>
    </button>
  );
}
