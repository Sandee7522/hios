'use client'

import { motion } from 'framer-motion'
import { Users, BookOpen, Settings, Layout, Briefcase, Clock } from 'lucide-react'

export default function WhyChooseUs() {
    const features = [
        {
            title: "Expert Faculty",
            description: "Learn from experienced professionals and industry experts.",
            icon: <Users className="h-6 w-6" />
        },
        {
            title: "Industry Focus",
            description: "Curriculum designed to meet current industry demands.",
            icon: <Briefcase className="h-6 w-6" />
        },
        {
            title: "Practical Training",
            description: "Hands-on approach with real-world projects and labs.",
            icon: <Settings className="h-6 w-6" />
        },
        {
            title: "Modern Environment",
            description: "State-of-the-art facilities for an optimal learning experience.",
            icon: <Layout className="h-6 w-6" />
        },
        {
            title: "Career Support",
            description: "Dedicated guidance for placements and career growth.",
            icon: <BookOpen className="h-6 w-6" />
        },
        {
            title: "Flexible Learning",
            description: "Weekend and evening batches for working professionals.",
            icon: <Clock className="h-6 w-6" />
        }
    ]

    return (
        <section id="why-us" className="py-20 md:py-32 bg-[#020617] relative">
            <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[100px]" />

            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Why Choose Us</h2>
                        <p className="text-slate-400 text-lg font-light">
                            We provide a comprehensive learning ecosystem designed to help you succeed.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-[#0f172a]/40 p-8 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:shadow-[0_0_25px_rgba(59,130,246,0.1)] group backdrop-blur-sm"
                        >
                            <div className="w-14 h-14 rounded-xl bg-blue-900/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300 border border-blue-500/10">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-blue-300 transition-colors">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
