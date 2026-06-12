export default function ActiveSongCard({ plotData, onClear }) {
    if (!plotData) return null;

    return (
        <div className="mb-6 p-5 bg-white border-2 border-blue-400 rounded-xl shadow-md relative overflow-hidden">

            {/* The 'Clear' Button */}
            <button
                onClick={onClear}
                className="absolute top-0 right-0 bg-slate-200 text-slate-500 hover:bg-slate-300 hover:text-slate-800 text-xs font-black px-3 py-1 rounded-bl-lg transition-colors z-10"
                title="Clear Song"
            >
                ✕
            </button>

            <h3 className="font-black text-xl text-slate-800 leading-tight mb-1 pr-6">
                {plotData.song_title.toUpperCase()}
            </h3>

            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                {plotData.artist}
            </p>

            <div className="mb-3">
                <span className="inline-block bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-1 rounded-md">
                    📖 {plotData.scripture_connection}
                </span>
            </div>

            {/* FULL text displayed here! Removed line-clamp and italic for better readability */}
            <p className="text-sm text-slate-700 leading-relaxed border-l-4 border-blue-200 pl-3">
                "{plotData.theological_reasoning}"
            </p>

        </div>
    );
}