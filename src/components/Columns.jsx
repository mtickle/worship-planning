
export default function Columns() {
    const quadrants = [
        {
            name: "Praise",
            movement: "Gathering",
            message: "The Awe",
            color: "border-t-blue-300",
            icon: (
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            ),
            illustration: (
                <svg viewBox="0 0 100 40" className="w-full h-auto mt-auto opacity-80" preserveAspectRatio="xMidYMax meet">
                    {/* People gathering / standing together */}
                    <circle cx="30" cy="15" r="4" className="fill-slate-200" />
                    <path d="M20 40 Q 30 20 40 40" className="fill-slate-200" />
                    <circle cx="50" cy="12" r="5" className="fill-slate-300" />
                    <path d="M35 40 Q 50 15 65 40" className="fill-slate-300" />
                    <circle cx="70" cy="18" r="4" className="fill-slate-200" />
                    <path d="M60 40 Q 70 25 80 40" className="fill-slate-200" />
                </svg>
            )
        },
        {
            name: "Faith",
            movement: "Word",
            message: "The Story of God",
            color: "border-t-blue-500",
            icon: (
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
            ),
            illustration: (
                <svg viewBox="0 0 100 40" className="w-full h-auto mt-auto opacity-80" preserveAspectRatio="xMidYMax meet">
                    {/* One person teaching, others sitting/listening */}
                    <circle cx="20" cy="10" r="4" className="fill-slate-300" />
                    <path d="M12 40 Q 20 18 28 40" className="fill-slate-300" />
                    <circle cx="60" cy="22" r="3.5" className="fill-slate-200" />
                    <path d="M52 40 Q 60 28 68 40" className="fill-slate-200" />
                    <circle cx="80" cy="22" r="3.5" className="fill-slate-200" />
                    <path d="M72 40 Q 80 28 88 40" className="fill-slate-200" />
                </svg>
            )
        },
        {
            name: "Love",
            movement: "Table",
            message: "The Gospel & Sacrifice",
            color: "border-t-blue-700",
            icon: (
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
                    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path>
                    <line x1="6" y1="2" x2="6" y2="4"></line>
                    <line x1="10" y1="2" x2="10" y2="4"></line>
                    <line x1="14" y1="2" x2="14" y2="4"></line>
                </svg>
            ),
            illustration: (
                <svg viewBox="0 0 100 40" className="w-full h-auto mt-auto opacity-80" preserveAspectRatio="xMidYMax meet">
                    {/* People sitting around a table */}
                    <circle cx="25" cy="18" r="4" className="fill-slate-200" />
                    <path d="M15 40 Q 25 25 35 40" className="fill-slate-200" />
                    <circle cx="75" cy="18" r="4" className="fill-slate-200" />
                    <path d="M65 40 Q 75 25 85 40" className="fill-slate-200" />
                    <rect x="30" y="30" width="40" height="10" className="fill-slate-300" />
                </svg>
            )
        },
        {
            name: "Hope",
            movement: "Sending",
            message: "The Confession",
            color: "border-t-blue-900",
            icon: (
                <svg className="w-8 h-8 text-blue-800" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
            ),
            illustration: (
                <svg viewBox="0 0 100 40" className="w-full h-auto mt-auto opacity-80" preserveAspectRatio="xMidYMax meet">
                    {/* People walking outward (to the right) */}
                    <circle cx="25" cy="16" r="4" className="fill-slate-200" />
                    <path d="M12 40 L 22 22 L 28 22 L 30 40 Z" className="fill-slate-200" />
                    <circle cx="50" cy="12" r="4.5" className="fill-slate-300" />
                    <path d="M35 40 L 47 18 L 53 18 L 57 40 Z" className="fill-slate-300" />
                    <circle cx="75" cy="18" r="3.5" className="fill-slate-200" />
                    <path d="M63 40 L 73 24 L 77 24 L 83 40 Z" className="fill-slate-200" />
                </svg>
            )
        },
    ];

    return (
        <div className="flex gap-6 p-4 lg:p-8 bg-slate-50 min-h-screen">
            {/* 4-Column Workbench */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-6">
                {quadrants.map((q) => (
                    <div
                        key={q.name}
                        className={`bg-white rounded-2xl shadow-sm border-t-4 ${q.color} flex flex-col min-h-[400px] overflow-hidden`}
                    >
                        {/* Header Area with Icon */}
                        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                            <div className="p-3 bg-slate-50 rounded-xl">
                                {q.icon}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{q.name}</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{q.movement}</p>
                            </div>
                        </div>

                        {/* Middle Content Area */}
                        <div className="p-6 flex-1 flex flex-col">
                            <p className="text-sm font-bold text-slate-500 mb-4">{q.message}</p>

                            {/* Empty Drop Zone Placeholder */}
                            <div className="border-2 border-dashed border-slate-200 rounded-xl flex-1 flex items-center justify-center bg-slate-50/50">
                                <span className="text-slate-400 text-sm font-medium">Drop songs here</span>
                            </div>
                        </div>

                        {/* Bottom Illustration Area */}
                        <div className="w-full mt-auto px-4 pt-4">
                            {q.illustration}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}