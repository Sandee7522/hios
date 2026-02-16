'use client'

import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

export default function About() {
    const highlights = [
        "Outcome-oriented learning approach",
        "Modern teaching methodologies",
        "Student-centric guidance",
        "Industry-relevant curriculum"
    ]

    return (
        <section id="about" className="py-20 md:py-32 bg-[#020617] relative overflow-hidden">
            <div className="absolute top-1/2 left-0 -z-10 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] opacity-30" />

            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                    <div className="w-full md:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="relative group"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl opacity-30 blur-lg group-hover:opacity-50 transition-opacity duration-500" />
                            <img
                                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop"
                                alt="About Hamsa Institute"
                                className="relative rounded-2xl shadow-2xl w-full h-[400px] object-cover border border-white/10"
                            />
                            <div className="absolute -bottom-6 -right-6 bg-[#0f172a] p-6 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/10">
                                <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">10+</p>
                                <p className="text-sm font-medium text-slate-400">Years Experience</p>
                            </div>
                        </motion.div>
                    </div>

                    <div className="w-full md:w-1/2 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                                About Hamsa Institute
                            </h2>
                            <p className="text-lg text-slate-400 mb-8 leading-relaxed font-light">
                                Hamsa Institute of Occoured Science is a forward-thinking educational institution dedicated to academic excellence and professional development. We focus on outcome-oriented learning that equips students with practical skills, critical thinking abilities, and industry-relevant knowledge.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {highlights.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center border border-blue-500/20">
                                            <CheckCircle2 className="text-blue-400 h-4 w-4 flex-shrink-0" />
                                        </div>
                                        <span className="text-slate-300 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}
