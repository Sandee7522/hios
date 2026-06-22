"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Users, GraduationCap, Trophy, BookOpen } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <>
      <section className="relative w-full bg-[#0d47a1] overflow-hidden pt-12 md:pt-20 pb-32 md:pb-40">

        {/* Background Decorative element to add some wave or subtle texture */}
        <div className="absolute bottom-0 left-0 right-0 h-40 opacity-20 pointer-events-none z-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-full object-cover origin-bottom transform translate-y-12">
            <path fill="#ffffff" fillOpacity="1" d="M0,224L60,213.3C120,203,240,181,360,186.7C480,192,600,224,720,240C840,256,960,256,1080,240C1200,224,1320,192,1380,176L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
          </svg>
        </div>

        <div className="container mx-auto px-4 md:px-10 grid lg:grid-cols-2 gap-12 items-center relative z-10">

          {/* LEFT CONTENT */}
          <div className="text-left space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#facc15] font-bold text-lg md:text-xl tracking-wide uppercase"
            >
              Your Success is Our Mission
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white leading-[1.1]"
            >
              A Trusted Name For
              <span className="block text-[#facc15] mt-3">
                Competitive Exams
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white text-lg md:text-[22px] leading-relaxed max-w-xl font-medium pt-2"
            >
              PSI, STI, ASO, Dy.SP/ACP, Dy. Collector, Tahsildar,
              <br />
              IAS, IPS Foundation Batch –
              <br />
              English / Hindi Medium
              <span className="block mt-6 text-white font-bold opacity-90">Expert Guidance. Proven Results.</span>
            </motion.p>

            {/* BUTTONS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 pt-6"
            >
              <Link href="#programs">
                <Button className="h-14 px-8 bg-[#facc15] text-[#113264] hover:bg-yellow-400 font-extrabold text-base rounded hover:scale-105 transition-transform shadow-lg border-2 border-[#facc15]">
                  OUR COURSES
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link href="/contact">
                <Button
                  variant="outline"
                  className="h-14 px-8 border-2 border-white bg-transparent hover:bg-white hover:text-[#0d47a1] text-white font-extrabold text-base rounded hover:scale-105 transition-transform"
                >
                  CONTACT US
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* RIGHT IMAGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative z-10 mt-8 lg:mt-0 lg:ml-10"
          >
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-white/10 p-3 backdrop-blur-sm border border-white/20">
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-white">
                <Image
                  src="/coaching.png"
                  alt="Sarkar Career Academy Building"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Optional Floating badg like original mock */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -top-4 -right-4 bg-[#cc0000] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg rotate-3"
              >
                100% SUCCESS RATE
              </motion.div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* THREE CARDS ABSOLUTE POSITIONED OR JUST BELOW */}
      <section className="relative z-20 -mt-24 md:-mt-32 container mx-auto px-4 md:px-10">
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">

          {/* Blue Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#2a75c9] rounded-2xl p-8 text-white shadow-2xl flex flex-col items-center justify-center text-center transform transition-transform hover:-translate-y-2 border border-blue-400/20"
          >
            <div className="flex items-center gap-4 mb-4">
              <Users size={40} className="opacity-90" />
            </div>
            <h3 className="text-[26px] font-extrabold mb-8 tracking-wide">PSI, STI, ASO</h3>
            <div className="flex-1"></div>
            <Link href="#programs" className="w-full">
              <Button className="w-full py-6 mt-4 bg-[#1b4e8a] hover:bg-[#113158] text-white rounded-lg text-lg font-bold shadow-inner">
                Learn More <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>

          {/* Red Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-[#d94441] rounded-2xl p-8 text-white shadow-2xl flex flex-col items-center justify-center text-center transform transition-transform hover:-translate-y-2 border border-red-400/20"
          >
            <div className="flex items-center gap-4 mb-4">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRW-NqrQHBwHzHRsDm-ZHtHzYfmGRCQqJuVHA&s" width={40} height={40} alt="Police" className="invert brightness-0 opacity-90" />
            </div>
            <h3 className="text-[24px] font-extrabold mb-1 tracking-wide">Dy.SP / ACP</h3>
            <h3 className="text-[24px] font-extrabold mb-1 tracking-wide">Dy. Collector</h3>
            <h3 className="text-[24px] font-extrabold mb-6 tracking-wide">Tahsildar</h3>
            <div className="flex-1"></div>
            <Link href="#programs" className="w-full">
              <Button className="w-full py-6 mt-2 bg-[#9c302d] hover:bg-[#6c201e] text-white rounded-lg text-lg font-bold shadow-inner">
                Learn More <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>

          {/* Green Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-[#31b46a] rounded-2xl p-8 text-white shadow-2xl flex flex-col items-center justify-center text-center transform transition-transform hover:-translate-y-2 border border-green-400/20"
          >
            <div className="flex items-center gap-4 mb-4">
              <BookOpen size={40} className="opacity-90" />
            </div>
            <h3 className="text-[26px] font-extrabold mb-2 tracking-wide">IAS, IPS</h3>
            <h3 className="text-xl font-bold mb-1 text-green-50 tracking-wide">Foundation Batch</h3>
            <h3 className="text-lg font-semibold mb-6 text-green-100/90 tracking-wide">Eng / Hindi Medium</h3>
            <div className="flex-1"></div>
            <Link href="#programs" className="w-full">
              <Button className="w-full py-6 mt-2 bg-[#217d49] hover:bg-[#165530] text-white rounded-lg text-lg font-bold shadow-inner">
                Learn More <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>

        </div>
      </section>

      {/* STATS SECTION */}
      {/* <section className="bg-white py-16 md:py-24 border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 divide-x-0 md:divide-x-2 divide-gray-100">

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center space-y-4 px-2"
            >
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                <GraduationCap size={36} className="text-[#2a75c9]" />
              </div>
              <h4 className="text-4xl lg:text-5xl font-black text-[#113264]">25+</h4>
              <p className="text-gray-500 font-bold text-sm lg:text-base tracking-wide uppercase">Years of Excellence</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center text-center space-y-4 px-2"
            >
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                <Users size={36} className="text-[#2a75c9]" />
              </div>
              <h4 className="text-4xl lg:text-5xl font-black text-[#113264]">10000+</h4>
              <p className="text-gray-500 font-bold text-sm lg:text-base tracking-wide uppercase">Students Guided</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center text-center space-y-4 px-2"
            >
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                <Trophy size={36} className="text-[#2a75c9]" />
              </div>
              <h4 className="text-4xl lg:text-5xl font-black text-[#113264]">95%</h4>
              <p className="text-gray-500 font-bold text-sm lg:text-base tracking-wide uppercase">Success Rate</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center text-center space-y-4 px-2"
            >
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                <BookOpen size={36} className="text-[#2a75c9]" />
              </div>
              <h4 className="text-3xl lg:text-4xl font-black text-[#113264] flex items-center justify-center h-[40px] lg:h-[48px]">
                Experienced
              </h4>
              <p className="text-gray-500 font-bold text-sm lg:text-base tracking-wide uppercase">Faculty</p>
            </motion.div>

          </div>
        </div>
      </section> */}
    </>
  );
}