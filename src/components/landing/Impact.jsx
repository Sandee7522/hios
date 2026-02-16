'use client'

import { motion } from 'framer-motion'

export default function Impact() {
    const stats = [
        { value: "5,000+", label: "Students Trained" },
        { value: "50+", label: "Expert Faculty" },
        { value: "100+", label: "Courses Offered" },
        { value: "95%", label: "Student Satisfaction" }
    ]

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-[#020617] to-[#020617]">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center divide-x divide-white/10">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="px-4"
                        >
                            <div className="text-4xl md:text-6xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-blue-200">{stat.value}</div>
                            <div className="text-blue-200/70 font-medium text-sm md:text-base tracking-wide uppercase">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
