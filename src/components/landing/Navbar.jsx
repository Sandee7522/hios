"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Home, BookOpen, Phone, Mail, LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserRole } from "@/app/dashboard/utils/auth";
import Image from "next/image";

export default function Navbar() {
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
    { name: "Courses", href: "#programs" },
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
            <Link href="/" className="flex items-center gap-2 md:gap-3 group shrink-0">
              <Image
                src="/logos.png"
                alt="SARKAR CAREER ACADEMY"
                width={230}
                height={60}
                className="w-[100px] sm:w-[150px] md:w-[230px] h-auto object-contain"
              />
              <div className="flex flex-col justify-center">
                <span className="text-[11px] sm:text-sm md:text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400 leading-tight">
                  SARKAR CAREER ACADEMY
                </span>
                <span className="text-[7px] sm:text-[8px] md:text-[10px] text-blue-400 font-medium">
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
          </div>
        </div>
      </nav>

      {/* GLOBAL FIX FOR HORIZONTAL SCROLL ON MOBILE */}
      <style dangerouslySetInnerHTML={{
        __html: `
        html, body {
          max-width: 100vw;
          overflow-x: hidden;
        }
      `}} />

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#020617]/95 backdrop-blur-lg border-t border-white/10 z-[100] flex justify-around items-center pt-3 pb-4 px-2 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
        <Link href="/" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
          <Home size={20} />
          <span className="text-[10px] font-medium tracking-wide">Home</span>
        </Link>
        <Link href="#courses" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
          <BookOpen size={20} />
          <span className="text-[10px] font-medium tracking-wide">Courses</span>
        </Link>
        <Link href="#contact" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
          <Phone size={20} />
          <span className="text-[10px] font-medium tracking-wide">Contact</span>
        </Link>
        {userRole ? (
          <Link href="/dashboard" className="flex flex-col items-center gap-1.5 text-blue-400 transition-colors">
            <User size={20} />
            <span className="text-[10px] font-medium tracking-wide">Dashboard</span>
          </Link>
        ) : (
          <Link href="/login" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
            <LogIn size={20} />
            <span className="text-[10px] font-medium tracking-wide">Login</span>
          </Link>
        )}
      </div>
    </header>
  );
}
