import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import Columns from './components/Columns';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export default function LiturgyMapper() {

  const [selectedMovement, setSelectedMovement] = useState(null);
  const [artistInput, setArtistInput] = useState('');
  const [songInput, setSongInput] = useState('');
  const [plotData, setPlotData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  if (plotData) {
    console.log(plotData)
    //   // FORCE NUMBER CONVERSION to prevent JavaScript string bugs!
    //   const xScore = Number(plotData.x_axis_score);
    //   const yScore = Number(plotData.y_axis_score);

    //   // 2. Calculate the raw map positions
    //   finalX = ((xScore + 10) / 20) * 400;
    //   finalY = 400 - ((yScore + 10) / 20) * 400;

    //   // 3. NO-FLY ZONE INTERCEPTION LOGIC

    //   // Protect Top Labels (FAITH & PRAISE) from top-edge clipping
    //   if (finalY < 52) finalY = 52;

    //   // Protect Middle Labels (HOPE & LOVE text boxes sitting right below crosshair)
    //   if (finalY > 200 && finalY < 246) finalY = 246;

    //   // NEW: Protect Bottom Edge from clipping
    //   if (finalY > 380) finalY = 380;

    //   // Protect Left and Right Outer Edges
    //   if (finalX < 20) finalX = 20;
    //   if (finalX > 380) finalX = 380;
  }

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    const { data } = await supabase.from('songs').select('*').order('created_at', { ascending: false });
    if (data) setHistory(data);
  };

  const handleAnalyze = async () => {
    if (!songInput.trim() || !artistInput.trim()) return; // Make sure both exist
    setLoading(true);
    setError(null);

    try {
      // 1. Define the payload first
      const requestPayload = {
        songTitle: songInput,
        artistName: artistInput
      };

      // 2. Log it safely
      //console.log("Sending payload:", JSON.stringify(requestPayload));

      // 3. Send it to your Edge Function
      const { data: geminiData, error: funcError } = await supabase.functions.invoke('analyze-song', {
        body: requestPayload
      });

      if (funcError) {
        console.error("Raw Supabase Error:", funcError);

        // Supabase sometimes buries the custom JSON error we sent from the backend
        // Let's dig it out so we can display it in the UI!
        let realErrorMessage = "Failed to analyze song.";

        // Try to read the error we sent from our catch block in Deno
        if (funcError.context && funcError.context.json) {
          const backendError = await funcError.context.json();
          realErrorMessage = backendError.error || realErrorMessage;
        } else if (funcError.message) {
          realErrorMessage = funcError.message;
        }

        throw new Error(`Backend Error: ${realErrorMessage}`);
      }

      // 4. Log the response to make sure Gemini sent back the JSON correctly
      console.log("Gemini Response:", geminiData);

      setPlotData(geminiData);
      setSelectedMovement(geminiData.liturgical_movement);
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
            value={artistInput}
            onChange={(e) => setArtistInput(e.target.value)}
            placeholder="Enter Artist..."
            className="flex-1 p-2 border rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={songInput}
            onChange={(e) => setSongInput(e.target.value)}
            placeholder="Enter Song Title..."
            className="flex-1 p-2 border rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={handleAnalyze} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700">Map Song</button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mb-12">

          <div className="w-full  bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <Columns selectedMovement={selectedMovement} setSelectedMovement={setSelectedMovement} />
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



        </div>

      </div>
    </div>
  );
}