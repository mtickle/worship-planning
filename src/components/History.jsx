export default function History({ history, onSelectSong }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col mt-4">
            <div className="p-4 border-b border-slate-200 bg-slate-100">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                    Past Searches
                </h3>
            </div>

            <div className="overflow-y-auto max-h-96">
                {history.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 italic text-sm">
                        No songs mapped yet.
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {history.map((s) => (
                            <li
                                key={s.id}
                                onClick={() => onSelectSong && onSelectSong(s)}
                                className="p-4 hover:bg-blue-50 cursor-pointer transition-colors group flex justify-between items-center"
                            >
                                <div className="flex flex-col pr-4">
                                    <div className="flex items-center gap-2">
                                        {/* --- THEOLOGICAL FLAG ICONS --- */}
                                        {s.nar_verdict === 'Red' && <span title="Flag: Red" className="text-sm">🛑</span>}
                                        {s.nar_verdict === 'Amber' && <span title="Flag: Amber" className="text-sm">⚠️</span>}
                                        {s.nar_verdict === 'Green' && <span title="Clear" className="text-sm opacity-60 group-hover:opacity-100">✅</span>}

                                        <span className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-1">
                                            {s.song_title}
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold line-clamp-1 mt-0.5 ml-6">
                                        {s.artist}
                                    </span>
                                </div>

                                <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest whitespace-nowrap transition-colors
                                    ${s.nar_verdict === 'Red'
                                        ? 'bg-red-100 text-red-800 group-hover:bg-red-200'
                                        : 'bg-slate-100 text-slate-600 group-hover:bg-blue-200 group-hover:text-blue-800'}`
                                }>
                                    {s.liturgical_movement}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}