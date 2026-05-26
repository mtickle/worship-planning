import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import Columns from './components/Columns';

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

  // 1. Default center coordinates for the inner 400x400 grid
  let finalX = 200;
  let finalY = 200;

  if (plotData) {
    // FORCE NUMBER CONVERSION to prevent JavaScript string bugs!
    const xScore = Number(plotData.x_axis_score);
    const yScore = Number(plotData.y_axis_score);

    // 2. Calculate the raw map positions
    finalX = ((xScore + 10) / 20) * 400;
    finalY = 400 - ((yScore + 10) / 20) * 400;

    // 3. NO-FLY ZONE INTERCEPTION LOGIC

    // Protect Top Labels (FAITH & PRAISE) from top-edge clipping
    if (finalY < 52) finalY = 52;

    // Protect Middle Labels (HOPE & LOVE text boxes sitting right below crosshair)
    if (finalY > 200 && finalY < 246) finalY = 246;

    // NEW: Protect Bottom Edge from clipping
    if (finalY > 380) finalY = 380;

    // Protect Left and Right Outer Edges
    if (finalX < 20) finalX = 20;
    if (finalX > 380) finalX = 380;
  }

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

          <div className="w-full  bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <Columns />
          </div>

          {/* <div className="w-full lg:w-2/5">
            {plotData && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-2xl font-black text-slate-800">{plotData.song_title}</h3>
                <p className="text-slate-700 mt-4">{plotData.theological_reasoning}</p>
                <p className="text-slate-700 mt-4">FOCUS: {plotData.x_axis_score}</p>
                <p className="text-slate-700">POSTURE: {plotData.y_axis_score}</p>
              </div>
            )}
          </div> */}
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
              <p className="text-md text-slate-600"><strong>Divine</strong> vs. <strong>Human</strong>:<br />
                Are we focusing on God's attributes or our condition?
                God's attributes land higher in the grid, while our human condition lies lower.</p>



              <h4 className="font-bold text-slate-800 text-md uppercase tracking-wider mb-1">Posture (X-Axis)</h4>
              <p className="text-md text-slate-500"><strong>External</strong> vs. <strong>Internal</strong>:<br />
                Is the song a public declaration or a quiet meditation?</p>



              {/* Quadrant Definitions */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-md">The Quadrants</h4>
                <div className="space-y-2 text-md">
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