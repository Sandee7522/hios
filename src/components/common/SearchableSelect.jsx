"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiSearch } from "react-icons/fi";

export default function SearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select option",
  searchPlaceholder = "Search...",
  disabled = false,
  className = "",
}) {
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = useMemo(
    () => options.find((o) => String(o.value) === String(value)),
    [options, value],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => String(o.label || "").toLowerCase().includes(q));
  }, [options, search]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((p) => !p)}
        className="w-full flex items-center justify-between rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white hover:border-slate-500 transition"
      >
        <span className={selected ? "text-white" : "text-slate-400"}>
          {selected?.label || placeholder}
        </span>
        <FiChevronDown className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-[1400] mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-800">
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5">
              <FiSearch className="text-slate-400" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent outline-none text-sm text-white placeholder:text-slate-500"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500">No options found</div>
            ) : (
              filtered.map((opt) => {
                const active = String(opt.value) === String(value);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`w-full text-left px-3 py-2 text-sm transition ${
                      active
                        ? "bg-cyan-900/30 text-cyan-200"
                        : "text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
