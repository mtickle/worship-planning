import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import ActiveSongCard from './components/ActiveSongCard';
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

  //--- Grab the song history when the page loads
  useEffect(() => { fetchHistory(); }, []);
  const fetchHistory = async () => {
    const { data } = await supabase.from('songs').select('*').order('created_at', { ascending: false });
    if (data) setHistory(data);
  };

  //--- Clear button goodies
  const handleClear = () => {
    setSongInput("");           // Clears the song text box
    setArtistInput("");         // Clears the artist text box
    setPlotData(null);          // Removes the AI song card from the column
    setSelectedMovement(null);  // Removes the blue border and un-dims the columns
    setError(null);             // Clears any lingering error messages
  };

  //--- This is the main analyze function.
  const handleAnalyze = async () => {
    if (!songInput.trim() || !artistInput.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // --- 1. SMART CACHE: Check database first ---
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
        return; // EXIT EARLY
      }

      // --- 2. API CALLS: Fire both functions concurrently ---
      console.log("Song not found. Asking Gemini for Liturgy and Audit...");
      const requestPayload = {
        songTitle: songInput.trim(),
        artistName: artistInput.trim()
      };

      // Promise A: Primary Project (Liturgy Mapping)
      const liturgyPromise = supabase.functions.invoke('analyze-song', { body: requestPayload });

      // Promise B: Secondary Project (NAR Audit) via standard fetch
      const auditPromise = fetch('https://onfxhkahjmormykrxram.supabase.co/functions/v1/naras-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      }).then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        return { data: await res.json(), error: null };
      }).catch(error => ({ data: null, error }));

      // Wait for both to finish
      const [liturgyResponse, auditResponse] = await Promise.all([liturgyPromise, auditPromise]);

      // Error Handling
      if (liturgyResponse.error) throw new Error(`Liturgy Error: ${liturgyResponse.error.message}`);
      if (auditResponse.error) throw new Error(`Audit Error: ${auditResponse.error.message}`);

      const geminiData = liturgyResponse.data;
      const auditData = auditResponse.data;

      // --- 3. DATABASE SAVE ---
      const newSongRecord = {
        song_title: geminiData.song_title,
        artist: geminiData.artist,
        liturgical_movement: geminiData.liturgical_movement,
        theological_reasoning: geminiData.theological_reasoning,
        scripture_connection: geminiData.scripture_connection,
        nar_verdict: auditData.verdict,
        nar_summary: auditData.summary
      };

      const { error: dbError } = await supabase.from('songs').insert([newSongRecord]);
      if (dbError) console.error("Failed to save to history:", dbError);

      // --- 4. UPDATE UI ---
      setPlotData(newSongRecord);
      setSelectedMovement(newSongRecord.liturgical_movement);
      fetchHistory();

    } catch (err) {
      console.error("Caught in UI:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  //--- Use this to get a past song from the database.
  const loadPastSong = (song) => {
    setPlotData(song);
    setSelectedMovement(song.liturgical_movement);
    setSongInput(song.song_title);
    setArtistInput(song.artist);
  };

  return (

    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">

      {/* Loading modal */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold text-slate-800">Analyzing Liturgy...</h2>
            <p className="text-sm text-slate-500">Processing AI request for both a liturgical response and NAR audit. This may take a moment.</p>
          </div>
        </div>
      )}

      {/* This is the main dashboard bucket. */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Columns displayed here */}
        <Columns
          selectedMovement={selectedMovement}
          setSelectedMovement={setSelectedMovement}
          plotData={plotData}
        />
      </div>
      <div className="w-full lg:w-96 bg-white border-l border-slate-200 p-6 flex flex-col shadow-xl z-20">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Setlist Architect</h1>

        {/* Form control here. */}
        <Form
          artistInput={artistInput}
          setArtistInput={setArtistInput}
          songInput={songInput}
          setSongInput={setSongInput}
          handleAnalyze={handleAnalyze}
          selectedMovement={selectedMovement}
          onClear={handleClear}
        />

        {/* Now, if we look at the plot data, we can see the analyzed song information.
        If not, show us the history. */}
        {plotData ? (
          <ActiveSongCard
            plotData={plotData}
            onClear={handleClear}
          />
        ) : (
          <History
            history={history}
            onSelectSong={loadPastSong}
          />
        )}
      </div>
    </div>
  );
}