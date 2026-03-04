"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden relative">
      <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center"
      >
        <motion.h1
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-7xl md:text-8xl font-bold mb-6 bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
        >
          404
        </motion.h1>

        <p className="text-xl text-slate-400 mb-8">
          Page you are looking for does not exist.
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur transition"
          >
            Go Back
          </button>

          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition"
          >
            Go Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
