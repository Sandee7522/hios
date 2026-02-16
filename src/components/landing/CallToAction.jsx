'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CallToAction() {
    return (
        <section id="contact" className="py-20 md:py-32 bg-[#020617]">
            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-5xl mx-auto text-center space-y-8 bg-gradient-to-br from-blue-900/20 to-[#0f172a] p-8 md:p-20 rounded-[2rem] shadow-2xl border border-white/5 relative overflow-hidden group">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] group-hover:bg-blue-500/20 transition-colors duration-700" />
                    <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] group-hover:bg-cyan-500/20 transition-colors duration-700" />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="relative z-10"
                    >
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white">
                            Start Your Learning <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">Journey Today</span>
                        </h2>
                        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                            Join Hamsa Institute of Occoured Science and take the first step toward a brighter future. Admissions are now open for upcoming batches.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link href="/register">
                                <Button size="lg" className="h-14 px-10 text-lg bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.6)] transition-all duration-300 rounded-full border-none">
                                    Enroll Now
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="mailto:info@hamsainstitute.com">
                                <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-white/10 bg-transparent hover:bg-white/5 text-white backdrop-blur-sm rounded-full">
                                    Contact Us
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
