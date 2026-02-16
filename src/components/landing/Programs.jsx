'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, GraduationCap, Laptop, Award } from 'lucide-react'
import Link from 'next/link'

export default function Programs() {
    const programs = [
        {
            title: "Diploma in Occoured Science",
            description: "Comprehensive program covering foundational to advanced concepts in Occoured Science.",
            icon: <BookOpen className="h-10 w-10 text-primary mb-4" />,
            features: ["12 Months Duration", "Practical Labs", "Industry Certification"]
        },
        {
            title: "Advanced Certification",
            description: "Specialized certification for professionals looking to upgrade their skills.",
            icon: <Award className="h-10 w-10 text-primary mb-4" />,
            features: ["6 Months Duration", "Weekend Batches", "Advanced Projects"]
        },
        {
            title: "Professional Skills",
            description: "Enhance your career prospects with our targeted skill development courses.",
            icon: <GraduationCap className="h-10 w-10 text-primary mb-4" />,
            features: ["3 Months Duration", "Soft Skills", "Interview Prep"]
        },
        {
            title: "Short-Term Training",
            description: "Quick, intensive training modules for specific industry tools and technologies.",
            icon: <Laptop className="h-10 w-10 text-primary mb-4" />,
            features: ["4-8 Weeks Duration", "Hands-on Focus", "Certificate"]
        }
    ]

    return (
        <section id="programs" className="py-20 md:py-32 bg-[#020617] relative">
            <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-blue-900/5 rounded-full blur-[100px]" />

            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Popular Programs</h2>
                        <p className="text-slate-400 text-lg font-light">
                            Discover our most sought-after courses designed to build strong careers and foster professional growth.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {programs.map((program, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card className="h-full bg-[#0f172a]/50 border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] group backdrop-blur-sm">
                                <CardHeader>
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-900/50 to-slate-900 border border-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <div className="text-blue-400 group-hover:text-blue-300 transition-colors">
                                            {program.icon}
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl text-white group-hover:text-blue-300 transition-colors">{program.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base mb-6 text-slate-400 leading-relaxed">
                                        {program.description}
                                    </CardDescription>
                                    <ul className="space-y-3">
                                        {program.features.map((feature, i) => (
                                            <li key={i} className="text-sm text-slate-500 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Link href="/register" className="w-full">
                                        <Button variant="outline" className="w-full border-blue-900/30 text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-300 bg-transparent">Learn More</Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
