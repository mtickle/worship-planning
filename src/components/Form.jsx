export default function Form({ artistInput, setArtistInput, songInput, setSongInput, handleAnalyze, selectedMovement, onClear }) {
    return (
        <div className="flex flex-col gap-4 mb-6">
            <input
                type="text"
                value={artistInput}
                onChange={(e) => setArtistInput(e.target.value)}
                placeholder="Enter Artist..."
                className="flex-1 p-3 border border-slate-300 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <input
                type="text"
                value={songInput}
                onChange={(e) => setSongInput(e.target.value)}
                placeholder="Enter Song Title..."
                className="flex-1 p-3 border border-slate-300 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />

            {/* Action Buttons Container */}
            <div className="flex gap-3 mt-2">
                <button
                    onClick={handleAnalyze}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all active:scale-95"
                >
                    Map Song
                </button>

                {/* Only render Clear button if there is a selected movement */}
                {selectedMovement && (
                    <button
                        onClick={onClear}
                        className="flex-1 bg-slate-200 text-slate-700 py-3 font-bold rounded-xl hover:bg-slate-300 transition-all active:scale-95"
                    >
                        Clear Results
                    </button>
                )}
            </div>
        </div>
    );
}