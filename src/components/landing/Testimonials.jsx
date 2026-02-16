'use client'

import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function Testimonials() {
    return (
        <section className="py-20 md:py-32 bg-[#020617] relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px] opacity-40" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Student Success</h2>
                        <p className="text-slate-400 text-lg font-light">
                            Hear from our students about their learning journey with us.
                        </p>
                    </motion.div>
                </div>

                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="bg-[#0f172a]/40 border-white/5 backdrop-blur-md shadow-2xl">
                            <CardContent className="p-8 md:p-16 text-center">
                                <Quote className="h-16 w-16 text-blue-500/20 mx-auto mb-8" />
                                <blockquote className="text-xl md:text-3xl font-light leading-relaxed mb-10 text-slate-200">
                                    "Hamsa Institute transformed my learning experience. The practical approach and supportive faculty helped me gain real confidence in my skills. I felt ready for the industry from day one."
                                </blockquote>
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 mb-4 p-1">
                                        <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center text-xl font-bold text-white">PS</div>
                                    </div>
                                    <div className="font-semibold text-xl text-white">Priya Sharma</div>
                                    <div className="text-sm text-blue-400">Software Engineer</div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
