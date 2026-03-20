"use client";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";

const PageHeader = ({ title, subtitle }) => {
  const router = useRouter();

  return (
    <div className="flex items-center gap-4 mb-3">
      <button
        onClick={() => router.back()}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition"
      >
        <IoArrowBack size={18} />
      </button>
      <div>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
};

export default PageHeader;
