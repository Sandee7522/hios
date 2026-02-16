export default function LegalSection({ title, children }) {
    return (
        <section className="mb-10">
            {title && (
                <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                    <span className="w-1.5 h-6 rounded-full bg-blue-500 block" />
                    {title}
                </h2>
            )}
            <div className="text-slate-400 leading-relaxed space-y-4">
                {children}
            </div>
        </section>
    );
}
