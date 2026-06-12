import { ColumnData } from '@data/ColumnData';

// Added 'onClear' to the props
export default function Columns({ selectedMovement, setSelectedMovement, plotData, onClear }) {

    return (
        // Changed to flex-col so the clear button sits neatly above the grid
        <div className="flex flex-col gap-6 p-8 bg-slate-50">
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {ColumnData.map((q) => {
                    // Check if this specific column is the one selected OR assigned by the AI
                    const isSelected = selectedMovement === q.name;

                    // STRICTLY dimming unselected, and adding a border to the selected. No scale changes.
                    const unselectedStyles = selectedMovement && !isSelected ? "opacity-50" : "";
                    const selectedStyles = isSelected ? "ring-4 ring-blue-500 z-10" : "shadow-sm";

                    return (
                        <div
                            key={q.name}
                            onClick={() => setSelectedMovement(q.name)}
                            className={`bg-white overflow-hidden border-slate-500 rounded-2xl border-l border-r border-t-4 ${q.color} flex flex-col min-h-[500px] cursor-pointer transition-all duration-300 ease-out ${selectedStyles} ${unselectedStyles}`}
                        >

                            {/* 1. Header Section - Removed dynamic background color changes */}
                            <div className="p-4 border-b border-slate-500 bg-slate-200">
                                <h2 className="text-2xl font-black text-slate-800">{q.name}</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{q.movement}</p>
                            </div>

                            {/* 2. Middle Section (The Spring) */}
                            <div className="flex-1 flex flex-col relative">

                                {/* --- AI SONG CARD INJECTION --- */}
                                {/* {plotData && plotData.liturgical_movement === q.name && (
                                    <div className="m-4 p-5 bg-white border-2 border-blue-400 rounded-xl shadow-lg relative overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-blue-400 text-white text-[10px] font-black px-2 py-1 rounded-bl-lg">
                                            AI MAPPED
                                        </div>

                                        <h3 className="font-black text-xl text-slate-800 leading-tight mb-1">
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

                                        <p className="text-sm text-slate-700 italic border-l-4 border-blue-200 pl-3">
                                            "{plotData.theological_reasoning}"
                                        </p>
                                    </div>
                                )} */}

                                {/* Standard Column Text */}
                                <div className="pt-4 pb-2 pl-4 pr-4">
                                    <p className="text-sm font-bold text-slate-500 mb-2">{q.message}</p>
                                    <p className="text-sm text-slate-500 mb-4 leading-relaxed">{q.narrative.join(" ")}</p>
                                </div>

                                <div className="pt-2 pl-5 pr-4 mb-6">
                                    <ul className="space-y-2">
                                        {q.items && q.items.map((item, index) => (
                                            <li key={index} className="flex items-start text-sm text-slate-500">
                                                <span className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                            </div>
                            {/* End of the flex-1 spring */}

                            {/* 3. Bottom Graphic Section - Removed scale hover effects */}
                            <div className="mt-auto w-full h-48 border-t pt-4 flex justify-center bg-slate-50/30 rounded-b-2xl overflow-hidden">
                                <img
                                    src={q.imagePath}
                                    alt={`${q.movement} illustration`}
                                    className="w-full h-full object-contain object-bottom"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}