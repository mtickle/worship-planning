export default function ActiveSongCard({ plotData, onClear }) {
    if (!plotData) return null;

    // Determine the border color based on the verdict
    let borderColor = "border-blue-400"; // Default
    let bannerBg = null;
    let icon = "✅";

    if (plotData.nar_verdict === "Red") {
        borderColor = "border-red-500";
        bannerBg = "bg-red-500 text-white";
        icon = "🛑";
    } else if (plotData.nar_verdict === "Amber") {
        borderColor = "border-amber-500";
        bannerBg = "bg-amber-500 text-white";
        icon = "⚠️";
    }

    return (
        <div className={`mb-6 bg-white border-2 rounded-xl shadow-md relative overflow-hidden flex flex-col transition-colors ${borderColor}`}>

            <button
                onClick={onClear}
                className="absolute top-0 right-0 bg-slate-200/80 text-slate-600 hover:bg-slate-300 hover:text-slate-800 text-xs font-black px-3 py-1 rounded-bl-lg transition-colors z-10"
                title="Clear Song"
            >
                ✕
            </button>

            {/* --- THEOLOGICAL AUDIT BANNER (Shows only for Red/Amber) --- */}
            {(plotData.nar_verdict === "Red" || plotData.nar_verdict === "Amber") && (
                <div className={`p-3 pr-10 ${bannerBg}`}>
                    <p className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
                        {icon} Theological Flag: {plotData.nar_verdict}
                    </p>
                    <p className="text-xs mt-1 font-medium leading-tight opacity-90">
                        {plotData.nar_summary}
                    </p>
                </div>
            )}
            {/* --------------------------- */}

            <div className="p-5">
                <h3 className="font-black text-xl text-slate-800 leading-tight mb-1 pr-6">
                    {plotData.song_title.toUpperCase()}
                </h3>

                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    {plotData.artist}
                </p>

                <div className="mb-3 flex items-center gap-2">
                    <span className="inline-block bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-1 rounded-md">
                        📖 {plotData.scripture_connection}
                    </span>
                    {/* Optional: Add a little green badge if it passes the audit! */}
                    {plotData.nar_verdict === "Green" && (
                        <span className="inline-block bg-green-100 text-green-800 text-[11px] font-bold px-2 py-1 rounded-md">
                            ✅ Theologically Clear
                        </span>
                    )}
                </div>

                <p className={`text-sm text-slate-700 leading-relaxed border-l-4 pl-3 ${borderColor.replace('border-', 'border-').replace('500', '200').replace('400', '200')}`}>
                    "{plotData.theological_reasoning}"
                </p>
            </div>
        </div>
    );
}