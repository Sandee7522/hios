import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function LegalLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-blue-500/30">
            <Navbar />
            <main className="pt-24 pb-20 relative">
                {/* Background ambient glow */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] opacity-30" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] opacity-20" />
                </div>

                <div className="container mx-auto px-4 md:px-6 max-w-4xl relative z-10">
                    <div className="bg-[#0f172a]/40 backdrop-blur-sm border border-white/5 rounded-2xl p-8 md:p-12 shadow-xl">
                        {children}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
