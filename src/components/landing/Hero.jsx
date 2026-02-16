'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function Hero() {
    return (
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-[#020617]">
            {/* Background Elements */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#020617] to-[#020617]" />
            <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] opacity-40" />
            <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[100px] opacity-30" />

            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-300 text-sm font-medium mb-4 backdrop-blur-sm"
                    >
                        <Sparkles size={14} className="text-blue-400" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-cyan-200">Admissions Open for 2026 Batch</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.1]"
                    >
                        Hamsa Institute of <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">Occoured Science</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light"
                    >
                        Empowering Minds Through Knowledge, Innovation, and Practical Excellence. We blend theoretical understanding with real-world application to nurture skilled professionals.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
                    >
                        <Link href="#programs">
                            <Button size="lg" className="h-14 px-10 text-lg bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.6)] transition-all duration-300 rounded-full border-none">
                                Explore Courses
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm rounded-full">
                                Apply Now
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
