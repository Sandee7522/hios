"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { getUserRole } from "@/app/dashboard/utils/auth";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    // Check if user is logged in
    const role = getUserRole();
    setUserRole(role);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "#about" },
    { name: "Courses", href: "#courses" },
    { name: "Gallery", href: "#gallery" },
    { name: "Contact Us", href: "#contact" },
  ];

  return (
    <header className="w-full relative z-50">
      {/* Top Bar - Only visible on desktop, integrated nicely with dark theme */}
      <div className="hidden md:block bg-[#0f172a] text-slate-300 text-xs py-1.5 px-4 md:px-10 border-b border-white/5">
        <div className="container mx-auto flex justify-between items-center h-full">
          <div>
            स्पर्धा परीक्षा, पोलीस भरती, सैनिक भरती, इतर भरती
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
              <Phone size={14} />
              <span>8805667100 / 8380066963</span>
            </div>
            <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
              <Mail size={14} />
              <span>careeracademy1995@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`fixed md:sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-[#020617]/80 backdrop-blur-xl border-b border-white/10"
          : "bg-[#020617] md:bg-transparent"
          }`}
      >
        <div className="container mx-auto px-4 md:px-10">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.7)] transition-all duration-300">
                S
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 leading-tight">
                  SARKAR CAREER ACADEMY
                </span>
                <span className="text-[10px] text-blue-400 font-medium">
                  लेखक, मार्गदर्शक <span className="text-red-400">Ravindra Sarkar</span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <div className="flex items-center gap-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-sm font-medium text-gray-300 hover:text-white hover:shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all duration-300"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-4">
                {userRole ? (
                  <Link href="/dashboard">
                    <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all duration-300 border-none rounded-md">
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login">
                      <Button
                        variant="ghost"
                        className="text-gray-300 hover:text-white hover:bg-white/10"
                      >
                        Log In
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all duration-300 border-none rounded-md">
                        Enroll Now
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-[#020617] border-b border-white/10"
            >
              <div className="container px-4 py-4 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="block text-sm font-medium py-2 text-gray-300 hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}

                {/* Mobile Contact Info */}
                <div className="py-2 flex flex-col gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2"><Phone size={14} /> 8805667100 / 8380066963</div>
                  <div className="flex items-center gap-2"><Mail size={14} /> careeracademy1995@gmail.com</div>
                </div>

                <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                  {userRole ? (
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white border-none">
                        Go to Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button
                          variant="outline"
                          className="w-full border-white/20 text-white hover:bg-white/10"
                        >
                          Log In
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-linear-to-r from-blue-600 to-cyan-500 text-white border-none">
                          Enroll Now
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
