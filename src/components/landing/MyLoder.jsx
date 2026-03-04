import React from "react";
import { motion } from "framer-motion";

const MyLoader = () => {
  const brandName = "HIOS";

  // Har letter ke liye animation settings
  const containerVars = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Ek ek karke letter aayenge
      },
    },
  };

  const letterVars = {
    initial: { opacity: 0, y: 10, filter: "blur(5px)" },
    animate: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      textShadow: "0px 0px 8px rgba(168, 85, 247, 0.8)", // Glowing effect
    },
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#08080a] z-50">
      {/* Visual Icon Section */}
      <div>
        {" "}
        <div className="relative mb-10 flex items-center justify-center gap-4">
          <motion.div
            className="absolute -inset-4 border border-purple-500/20 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="w-6 h-6 border-t-2 border-r-2 border-purple-500 rounded-full"
            animate={{ rotate: [0, 360, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="w-6 h-6 border-t-2 border-r-2 border-purple-500 rounded-full"
            animate={{ rotate: [0, 360, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />{" "}
          <motion.div
            className="w-6 h-6 border-t-2 border-r-2 border-purple-500 rounded-full"
            animate={{ rotate: [0, 360, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        {/* Animated HIOS Text */}
        <motion.h2
          variants={containerVars}
          initial="initial"
          animate="animate"
          className="text-3xl ml-5 font-bold tracking-[0.8em] text-white uppercase"
          style={{ fontFamily: "'Cinzel', serif" }} // Occult style font
        >
          {brandName.split("").map((char, index) => (
            <motion.span
              key={index}
              variants={letterVars}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </motion.h2>{" "}
      </div>

      {/* Subtle Glow Line */}
      <motion.div
        className="h-px bg-linear-to-r from-transparent via-purple-600 to-transparent mt-4"
        initial={{ width: "10px" }}
        animate={{ width: "200px" }}
        transition={{
          duration: 3,
          delay: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    </div>
  );
};

export default MyLoader;
