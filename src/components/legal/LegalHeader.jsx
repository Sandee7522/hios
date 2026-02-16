export default function LegalHeader({ title, lastUpdated }) {
    return (
        <div className="mb-12 border-b border-white/10 pb-8">
            <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-4">
                {title}
            </h1>
            <p className="text-slate-400 text-sm">
                Last Updated: <span className="text-blue-400">{lastUpdated}</span>
            </p>
        </div>
    );
}
