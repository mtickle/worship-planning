import { ColumnData } from '@data/ColumnData';

export default function Columns({ selectedMovement, setSelectedMovement }) {

    return (
        <div className="flex gap-6 p-8 bg-slate-50 ">
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {ColumnData.map((q) => (
                    <div key={q.name} className={`bg-white overflow-hidden border-slate-500 rounded-2xl shadow-sm border-l border-r border-t-4 ${q.color} flex flex-col min-h-[500px]`}>

                        {/* 1. Header Section (Stays at the top) */}
                        <div className="p-4 border-b border-slate-500 bg-slate-200">
                            <h2 className="text-2xl font-black text-slate-800 ">{q.name}</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{q.movement}</p>
                        </div>

                        {/* 2. THE FIX: Wrap ALL the middle text inside one flex-1 div! */}
                        {/* This div acts as a spring, expanding to fill the empty space */}
                        <div className="flex-1 flex flex-col">

                            <div className="pt-2 pb-2 pl-3 pr-3">
                                <p className="text-sm font-bold text-slate-500">{q.message}</p>
                                <p className="text-sm text-slate-500 mb-4">{q.narrative.join(" ")}</p>
                            </div>

                            <div className="pt-2 pl-4">
                                <ul className="space-y-2 mb-4">
                                    {q.items && q.items.map((item, index) => (
                                        <li key={index} className="flex items-start text-sm text-slate-500">
                                            <span className="mr-2 mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                        </div>
                        {/* End of the flex-1 spring */}

                        {/* 3. Bottom Graphic Section (Pushed to bottom) */}
                        {/* Added mt-auto to ensure it firmly anchors to the bottom */}
                        <div className="mt-auto w-full h-48 border-t pt-4 flex justify-center bg-slate-50/30 rounded-b-2xl overflow-hidden">
                            <img
                                src={q.imagePath}
                                alt={`${q.movement} illustration`}
                                className="w-full h-full object-contain object-bottom"
                            />
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}