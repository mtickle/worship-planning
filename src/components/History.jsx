export default function History({ history, onSelectSong }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
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
                                    <span className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-1">
                                        {s.song_title}
                                    </span>
                                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold line-clamp-1 mt-0.5">
                                        {s.artist}
                                    </span>
                                </div>

                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-bold text-[10px] uppercase tracking-widest group-hover:bg-blue-200 group-hover:text-blue-800 transition-colors whitespace-nowrap">
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