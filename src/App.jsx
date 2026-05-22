import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

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

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    const { data } = await supabase.from('songs').select('*').order('created_at', { ascending: false });
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
      fetchHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold text-slate-800">Analyzing Liturgy...</h2>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Setlist Architect</h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            value={songInput}
            onChange={(e) => setSongInput(e.target.value)}
            placeholder="Enter Song Title..."
            className="flex-1 p-4 border rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={handleAnalyze} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700">Map Song</button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          {/* Magic Quadrant Grid */}

          <div className="w-full lg:w-3/5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="relative w-full aspect-square bg-slate-50 border-2 border-slate-800 rounded-lg overflow-hidden">
              <svg viewBox="0 0 400 400" className="w-full h-full">

                {/* Background Quadrants */}
                <rect x="0" y="0" width="200" height="200" fill="#f8fafc" />
                <rect x="200" y="0" width="200" height="200" fill="#fefce8" />
                <rect x="0" y="200" width="200" height="200" fill="#f1f5f9" />
                <rect x="200" y="200" width="200" height="200" fill="#fef2f2" />

                {/* Quadrant Labels */}
                <text x="100" y="100" textAnchor="middle" className="fill-slate-200 font-black text-4xl select-none">Q1</text>
                <text x="300" y="100" textAnchor="middle" className="fill-slate-200 font-black text-4xl select-none">Q2</text>
                <text x="100" y="300" textAnchor="middle" className="fill-slate-200 font-black text-4xl select-none">Q3</text>
                <text x="300" y="300" textAnchor="middle" className="fill-slate-200 font-black text-4xl select-none">Q4</text>

                {/* Axis Lines */}
                <line x1="200" y1="0" x2="200" y2="400" stroke="#334155" strokeWidth="2" />
                <line x1="0" y1="200" x2="400" y2="200" stroke="#334155" strokeWidth="2" />

                {/* Axis Labels */}
                <text x="40" y="24" textAnchor="middle" className="fill-slate-900 font-bold text-[18px]">FAITH</text>
                <text x="65" y="38" textAnchor="middle" className="fill-slate-900 font-bold text-[12px]">(The Story of God)</text>
                <text x="242" y="24" textAnchor="middle" className="fill-slate-900 font-bold text-[18px]">PRAISE</text>
                <text x="242" y="38" textAnchor="middle" className="fill-slate-900 font-bold text-[12px]">(The Awe)</text>
                <text x="40" y="224" textAnchor="middle" className="fill-slate-900 font-bold text-[18px]">HOPE</text>
                <text x="65" y="238" textAnchor="middle" className="fill-slate-900 font-bold text-[12px]">(The Confession)</text>
                <text x="238" y="224" textAnchor="middle" className="fill-slate-900 font-bold text-[18px]">LOVE</text>
                <text x="288" y="238" textAnchor="middle" className="fill-slate-900 font-bold text-[12px]">(The Gospel and Sacrifice)</text>

                {/* <text x="200" y="390" textAnchor="middle" className="fill-slate-400 font-bold text-[10px]">THE HUMAN (-10)</text>
                <text x="20" y="200" textAnchor="middle" transform="rotate(-90 20,200)" className="fill-slate-400 font-bold text-[10px]">INTERNAL (-10)</text>
                <text x="380" y="200" textAnchor="middle" transform="rotate(90 380,200)" className="fill-slate-400 font-bold text-[10px]">EXTERNAL (+10)</text> */}

                {/* Plot Point with Pulse */}
                {plotData && (
                  <g transform={`translate(${
                    // X-Axis Mapping: Scale to 370px width, then shift right by 15px
                    15 + (((plotData.x_axis_score + 10) / 20) * 370)
                    }, ${
                    // Y-Axis Mapping: Scale to 310px height, flip it, then shift down by 45px
                    45 + (310 - (((plotData.y_axis_score + 10) / 20) * 310))
                    })`}>
                    <circle cx="0" cy="0" r="6" className="fill-blue-400 stroke-white stroke-[3px]" />
                    <circle cx="0" cy="0" r="8" className="fill-blue-600 opacity-30 animate-ping" />
                  </g>
                )}
              </svg>
            </div>
          </div>

          <div className="w-full lg:w-2/5">
            {plotData && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-2xl font-black text-slate-800">{plotData.song_title}</h3>
                <p className="text-slate-700 mt-4">{plotData.theological_reasoning}</p>
                <p className="text-slate-700 mt-4">FOCUS: {plotData.x_axis_score}</p>
                <p className="text-slate-700">POSTURE: {plotData.y_axis_score}</p>
              </div>
            )}
          </div>
        </div>


        {/* History Table */}
        {/* Bottom Row: History & Explanation */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Left Column: History Table (Aligns under Map) */}
          <div className="w-full lg:w-3/5 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Song History</h3>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left">
                <thead className="bg-slate-50 uppercase text-xs font-bold text-slate-500 sticky top-0">
                  <tr>
                    <th className="p-4">Song</th>
                    <th className="p-4">Quadrant</th>
                    <th className="p-4 text-center">Focus (Y)</th>
                    <th className="p-4 text-center">Posture (X)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition text-sm">
                      <td className="p-4 font-semibold text-slate-700">{s.title}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md font-bold text-xs">
                          {s.quadrant}
                        </span>
                      </td>
                      <td className="p-4 text-center font-mono text-slate-500">{s.y_axis_score > 0 ? `+${s.y_axis_score}` : s.y_axis_score}</td>
                      <td className="p-4 text-center font-mono text-slate-500">{s.x_axis_score > 0 ? `+${s.x_axis_score}` : s.x_axis_score}</td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-slate-400 italic">No songs mapped yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: How This Works (Aligns under Narrative) */}
          <div className="w-full lg:w-2/5 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">How This Works</h3>
            <p className="text-slate-600 mb-6 leading-relaxed text-md">
              We map worship songs using two liturgical axes to visualize the <strong>emotional and theological arc</strong> of our service. This helps us ensure our setlists are balanced, biblically-rooted, and moving the congregation through the four pillars of worship.
            </p>

            <blockquote className="mb-6 border-l-4 border-slate-300 bg-slate-50 pl-4 py-3 italic text-slate-600 text-sm rounded-r-lg">
              <span className="font-semibold text-slate-500 block">Geography Reminder:</span>
              The Y axis is vertical. It goes up and down, north and south.
              The X axis is horizontal. It goes left and right, east and west.
            </blockquote>

            <div className="space-y-6">
              {/* Axes Definition */}

              <h4 className="font-bold text-slate-800 text-md uppercase tracking-wider mb-1">Focus (Y-Axis)</h4>
              <p className="text-md text-slate-600"><strong>Divine (+10)</strong> vs. <strong>Human (-10)</strong>.<br />Are we focusing on God's attributes or our condition? God's attributes land higher in the grid, while our condition lies lower.</p>



              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1">Posture (X-Axis)</h4>
              <p className="text-xs text-slate-500"><strong>External (+10)</strong> vs. <strong>Internal (-10)</strong>.<br />Is the song a public declaration or a quiet meditation?</p>



              {/* Quadrant Definitions */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-sm">The Quadrants</h4>
                <div className="space-y-2 text-xs">
                  <p><strong className="text-blue-600">Q1: FAITH</strong> – <em>The Story of God.</em> Telling the biblical narrative of who He is and what He has done.</p>
                  <p><strong className="text-yellow-600">Q2: PRAISE</strong> – <em>The Awe of God.</em> Active, external response to His majesty and holiness.</p>
                  <p><strong className="text-slate-600">Q3: HOPE</strong> – <em>The Confession.</em> Reflecting on our need, our weakness, and our dependence on Him.</p>
                  <p><strong className="text-red-600">Q4: LOVE</strong> – <em>The Gospel.</em> Pointing back to the Cross and the victory of Christ’s sacrifice.</p>
                </div>
              </div>
            </div>



          </div>

        </div>

      </div>
    </div>
  );
}