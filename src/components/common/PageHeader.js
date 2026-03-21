"use client";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";

const PageHeader = ({ title, subtitle, actions }) => {
  const router = useRouter();

  return (
    <div className="mb-4 rounded-2xl border border-indigo-900/40 bg-[linear-gradient(160deg,#141834_0%,#131730_55%,#111427_100%)] px-4 py-3 sm:px-5 shadow-[0_10px_24px_rgba(5,8,24,0.65)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-700/80 bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            aria-label="Go back"
          >
            <IoArrowBack size={18} />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-100 leading-tight">{title}</h1>
            {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 sm:justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
