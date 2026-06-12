import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import Columns from './components/Columns';
import Form from './components/Form';
import History from './components/History';

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
  }

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    const { data } = await supabase.from('songs').select('*').order('created_at', { ascending: false });
    if (data) setHistory(data);
  };

  const handleClear = () => {
    setSongInput("");           // Clears the song text box
    setArtistInput("");         // Clears the artist text box
    setPlotData(null);          // Removes the AI song card from the column
    setSelectedMovement(null);  // Removes the blue border and un-dims the columns
    setError(null);             // Clears any lingering error messages
  };

  const handleAnalyze = async () => {
    if (!songInput.trim() || !artistInput.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // --- 1. CHECK THE DATABASE FIRST ---
      // We use .ilike() so it ignores capitalization (e.g., "all my hope" == "All My Hope")
      const { data: existingSongs, error: searchError } = await supabase
        .from('songs')
        .select('*')
        .ilike('song_title', songInput.trim())
        .ilike('artist', artistInput.trim());

      if (existingSongs && existingSongs.length > 0) {
        console.log("Song found in database! Skipping AI...");
        const savedSong = existingSongs[0];

        setPlotData(savedSong);
        setSelectedMovement(savedSong.liturgical_movement);
        setLoading(false);
        return; // EXIT EARLY! We don't need to do anything else.
      }
      // -----------------------------------

      // --- 2. IF NOT FOUND, CALL GEMINI ---
      console.log("Song not found. Asking Gemini...");
      const requestPayload = {
        songTitle: songInput.trim(),
        artistName: artistInput.trim()
      };

      const { data: geminiData, error: funcError } = await supabase.functions.invoke('analyze-song', {
        body: requestPayload
      });

      if (funcError) {
        let realErrorMessage = "Failed to analyze song.";
        if (funcError.context && funcError.context.json) {
          const backendError = await funcError.context.json();
          realErrorMessage = backendError.error || realErrorMessage;
        } else if (funcError.message) {
          realErrorMessage = funcError.message;
        }
        throw new Error(`Backend Error: ${realErrorMessage}`);
      }

      // --- 3. SAVE THE NEW SONG TO THE DATABASE ---
      const { error: dbError } = await supabase
        .from('songs')
        .insert([{
          song_title: geminiData.song_title,
          artist: geminiData.artist,
          liturgical_movement: geminiData.liturgical_movement,
          theological_reasoning: geminiData.theological_reasoning,
          scripture_connection: geminiData.scripture_connection
        }]);

      if (dbError) console.error("Failed to save to history:", dbError);

      // Update UI with the fresh data
      setPlotData(geminiData);
      setSelectedMovement(geminiData.liturgical_movement);
      fetchHistory();

    } catch (err) {
      console.error("Caught in UI:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const loadPastSong = (song) => {
    setPlotData(song);
    setSelectedMovement(song.liturgical_movement);
    // Optional: Update the input boxes to match the clicked song
    setSongInput(song.song_title);
    setArtistInput(song.artist);
  };




  return (



    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold text-slate-800">Analyzing Liturgy...</h2>
          </div>
        </div>
      )}
      <div className="flex-1 p-8 overflow-y-auto">
        <Columns
          selectedMovement={selectedMovement}
          setSelectedMovement={setSelectedMovement}
          plotData={plotData}
        />
      </div>
      <div className="w-full lg:w-96 bg-white border-l border-slate-200 p-6 flex flex-col shadow-xl z-20">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Setlist Architect</h1>

        <Form
          artistInput={artistInput}
          setArtistInput={setArtistInput}
          songInput={songInput}
          setSongInput={setSongInput}
          handleAnalyze={handleAnalyze}
          selectedMovement={selectedMovement}
          onClear={handleClear}
        />

        {/* <History history={history} /> */}

        {plotData ? (
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
        ) : (
          /* 3. THE HISTORY LIST (Shows when NO song is active, or pushed below) */
          <History history={history} onSelectSong={loadPastSong} />
        )}

      </div>
    </div>




    // <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
    //   {loading && (
    //     <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
    //       <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4">
    //         <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
    //         <h2 className="text-xl font-bold text-slate-800">Analyzing Liturgy...</h2>
    //       </div>
    //     </div>
    //   )}

    //   <div className="max-w-6xl mx-auto">
    //     <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Setlist Architect</h1>

    //     <div className="flex flex-col sm:flex-row gap-4 mb-8">
    //       <input
    //         type="text"
    //         value={artistInput}
    //         onChange={(e) => setArtistInput(e.target.value)}
    //         placeholder="Enter Artist..."
    //         className="flex-1 p-2 border rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
    //       />
    //       <input
    //         type="text"
    //         value={songInput}
    //         onChange={(e) => setSongInput(e.target.value)}
    //         placeholder="Enter Song Title..."
    //         className="flex-1 p-2 border rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
    //       />
    //       <button onClick={handleAnalyze} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700">Map Song</button>
    //     </div>

    //     <div className="flex flex-col lg:flex-row gap-8 mb-12">

    //       <div className="w-full  bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
    //         <Columns selectedMovement={selectedMovement} setSelectedMovement={setSelectedMovement} />
    //       </div>
    //     </div>

    //     {/* History Table */}
    //     {/* Bottom Row: History & Explanation */}
    //     <div className="flex flex-col lg:flex-row gap-8 items-start">

    //       {/* Left Column: History Table (Aligns under Map) */}
    //       <div className="w-full lg:w-3/5 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
    //         <div className="p-6 border-b border-slate-100 flex justify-between items-center">
    //           <h3 className="text-xl font-bold text-slate-800">Song History</h3>
    //         </div>
    //         <div className="overflow-x-auto max-h-96">
    //           <table className="w-full text-left">
    //             <thead className="bg-slate-50 uppercase text-xs font-bold text-slate-500 sticky top-0">
    //               <tr>
    //                 <th className="p-4">Song</th>
    //                 <th className="p-4">Quadrant</th>
    //                 <th className="p-4 text-center">Focus (Y)</th>
    //                 <th className="p-4 text-center">Posture (X)</th>
    //               </tr>
    //             </thead>
    //             <tbody className="divide-y divide-slate-100">
    //               {history.map((s) => (
    //                 <tr key={s.id} className="hover:bg-slate-50 transition text-sm">
    //                   <td className="p-4 font-semibold text-slate-700">{s.title}</td>
    //                   <td className="p-4">
    //                     <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md font-bold text-xs">
    //                       {s.quadrant}
    //                     </span>
    //                   </td>
    //                   <td className="p-4 text-center font-mono text-slate-500">{s.y_axis_score > 0 ? `+${s.y_axis_score}` : s.y_axis_score}</td>
    //                   <td className="p-4 text-center font-mono text-slate-500">{s.x_axis_score > 0 ? `+${s.x_axis_score}` : s.x_axis_score}</td>
    //                 </tr>
    //               ))}
    //               {history.length === 0 && (
    //                 <tr>
    //                   <td colSpan="4" className="p-8 text-center text-slate-400 italic">No songs mapped yet.</td>
    //                 </tr>
    //               )}
    //             </tbody>
    //           </table>
    //         </div>
    //       </div>



    //     </div>

    //   </div>
    // </div>
  );
}