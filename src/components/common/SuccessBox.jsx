"use client";

import { useEffect, useState } from "react";
import { MdCheckCircleOutline, MdClose } from "react-icons/md";

export default function SuccessBox({
  message,
  duration = 4000,
  className = "",
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  if (!message) return null;

  return (
    <div
      role="status"
      className={`transition-all duration-500 ease-out transform 
      ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}
      flex justify-between items-start rounded-xl border border-emerald-500/30 -mt-14
      bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 ${className}`}
    >
      <div className="flex items-start gap-3">
        <MdCheckCircleOutline size={20} className="mt-0.5" />
        <p className="leading-relaxed">{message}</p>
      </div>

      <button
        onClick={() => setVisible(false)}
        className="ml-3 text-emerald-400 hover:text-emerald-200"
      >
        <MdClose size={18} />
      </button>
    </div>
  );
}
