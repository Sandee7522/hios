
import Link from 'next/link'
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-[#020617] pt-20 pb-10 border-t border-white/5">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all duration-300">
                                H
                            </div>
                            <span className="text-xl font-bold text-white">Hamsa Institute</span>
                        </Link>
                        <p className="text-slate-400 leading-relaxed font-light">
                            Dedicated to providing quality education and skill-based training to help students achieve academic and professional success.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <Link href="#" className="w-10 h-10 rounded-full bg-blue-900/20 flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all duration-300">
                                <Facebook size={18} />
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-blue-900/20 flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all duration-300">
                                <Twitter size={18} />
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-blue-900/20 flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all duration-300">
                                <Instagram size={18} />
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-blue-900/20 flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all duration-300">
                                <Linkedin size={18} />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-lg mb-6 text-white">Quick Links</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="#about" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="#programs" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    Our Programs
                                </Link>
                            </li>
                            <li>
                                <Link href="#why-us" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    Why Choose Us
                                </Link>
                            </li>
                            <li>
                                <Link href="#testimonials" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    Student Success
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Programs */}
                    <div>
                        <h3 className="font-semibold text-lg mb-6 text-white">Popular Programs</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Diploma in Occoured Science</Link>
                            </li>
                            <li>
                                <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Advanced Certification</Link>
                            </li>
                            <li>
                                <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Skill Development</Link>
                            </li>
                            <li>
                                <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Industry Training</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold text-lg mb-6 text-white">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-slate-400">
                                <div className="w-8 h-8 rounded-lg bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-[-4px]">
                                    <MapPin className="h-4 w-4 text-blue-400" />
                                </div>
                                <span>123 Education Lane, Knowledge City, Bangalore - 560001</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-400">
                                <div className="w-8 h-8 rounded-lg bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                                    <Phone className="h-4 w-4 text-blue-400" />
                                </div>
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-400">
                                <div className="w-8 h-8 rounded-lg bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                                    <Mail className="h-4 w-4 text-blue-400" />
                                </div>
                                <span>info@hamsainstitute.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
                    <p>© {new Date().getFullYear()} Hamsa Institute of Occoured Science. All rights reserved.</p>
                    <div className="flex items-center gap-8">
                        <Link href="/privacy-policy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
                        <Link href="/terms-of-service" className="hover:text-blue-400 transition-colors">Terms of Service</Link>
                        <Link href="/cookie-policy" className="hover:text-blue-400 transition-colors">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
