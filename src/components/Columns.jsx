export default function Columns() {
    const columns = [
        { name: "Praise", movement: "Gathering", message: "The Awe", color: "border-t-blue-300", imagePath: "/quadrants/images/praise_pro.png" },
        { name: "Faith", movement: "Word", message: "The Story of God", color: "border-t-blue-500", imagePath: "/quadrants/images/word.png" },
        { name: "Love", movement: "Table", message: "The Gospel & Sacrifice", color: "border-t-blue-700", imagePath: "/quadrants/images/love_pro.png" },
        { name: "Hope", movement: "Sending", message: "The Confession", color: "border-t-blue-900", imagePath: "/quadrants/images/hope_pro.png" },
    ];

    return (
        <div className="flex gap-6 p-8 bg-slate-50 min-h-screen">
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {columns.map((q) => (
                    <div key={q.name} className={`bg-white rounded-2xl shadow-sm border-t-4 ${q.color} flex flex-col min-h-[500px]`}>

                        {/* Header Section */}
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{q.name}</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{q.movement}</p>
                        </div>

                        {/* Middle Content: Where the service building happens */}
                        <div className="p-6 flex-1 flex flex-col">
                            <p className="text-sm font-bold text-slate-500 mb-4">{q.message}</p>

                            {/* The "Service Slot" - This will hold your future song components */}
                            {/* <div className="border-2 border-dashed border-slate-200 rounded-xl flex-1 flex items-center justify-center bg-slate-50/30 hover:bg-slate-50 transition-colors">
                                <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Add Content</span>
                            </div> */}
                        </div>

                        {/* Bottom Graphic Section */}
                        <div className="w-full pt-4 flex justify-center bg-slate-50/30 rounded-b-2xl overflow-hidden">
                            <img
                                src={q.imagePath}
                                alt={`${q.movement} illustration`}
                                className="w-full h-32 object-contain object-bottom transition-transform duration-500"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}