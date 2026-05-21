import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

// Initialize Supabase Client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export default function LiturgyMapper() {
  const [songInput, setSongInput] = useState('');
  const [plotData, setPlotData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setHistory(data);
  };

  const handleAnalyze = async () => {
    if (!songInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { data: geminiData, error: funcError } = await supabase.functions.invoke('analyze-song', {
        body: { songInput }
      });
      if (funcError) throw new Error("Failed to analyze song.");
      setPlotData(geminiData);
      fetchHistory(); // Refresh history table
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">

      {/* Loading Modal */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold text-slate-800">Analyzing Liturgy...</h2>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2">Setlist Architect</h1>
        <p className="text-slate-500 mb-8">Map your worship songs across the four pillars of liturgy.</p>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            value={songInput}
            onChange={(e) => setSongInput(e.target.value)}
            placeholder="Enter Song Title & Artist..."
            className="flex-1 p-4 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-lg"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            Map Song
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8">{error}</div>}

        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start mb-12">
          {/* Quadrant Visualizer */}
          <div className="w-full lg:w-3/5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="relative w-full aspect-square bg-slate-50 border-2 border-slate-800 rounded-lg overflow-hidden">
              {/* Background / Axes / Plotting remain the same */}
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-[0.03]">
                <div className="bg-blue-600"></div><div className="bg-yellow-600"></div>
                <div className="bg-gray-600"></div><div className="bg-red-600"></div>
              </div>
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-800 -translate-y-1/2 z-10"></div>
              <div className="absolute left-1/2 top-0 h-full w-[2px] bg-slate-800 -translate-x-1/2 z-10"></div>
              {plotData && (
                <div className="absolute w-6 h-6 bg-blue-600 rounded-full border-[3px] border-white z-20"
                  style={{
                    left: `${((plotData.x_axis_score + 10) / 20) * 100}%`,
                    bottom: `${((plotData.y_axis_score + 10) / 20) * 100}%`,
                    transform: 'translate(-50%, 50%)'
                  }}
                />
              )}
            </div>
          </div>

          {/* Narrative Result */}
          <div className="w-full lg:w-2/5 h-full">
            {plotData ? (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-2xl font-black text-slate-800">{plotData.song_title}</h3>
                <p className="text-slate-700 mt-4">{plotData.theological_reasoning}</p>
              </div>
            ) : (
              <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center p-12 h-full min-h-[300px] text-slate-400">
                Search for a song to reveal its liturgical mapping.
              </div>
            )}
          </div>
        </div>

        {/* Song History Datagrid */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 font-bold text-slate-800">Song History</div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 uppercase text-xs font-bold text-slate-500">
              <tr><th className="p-4">Song</th><th className="p-4">Quadrant</th><th className="p-4">Focus</th><th className="p-4">Posture</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 text-sm">
                  <td className="p-4 font-semibold">{s.title}</td>
                  <td className="p-4">{s.quadrant}</td>
                  <td className="p-4">{s.y_axis_score}</td>
                  <td className="p-4">{s.x_axis_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}