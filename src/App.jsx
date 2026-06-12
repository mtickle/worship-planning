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

      //--- First , make sure we haven't already processed this song.
      //--- We use .ilike() so it ignores capitalization (e.g., "all my hope" == "All My Hope")
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
        return; //--- EXIT EARLY! We don't need to do anything else.
      }


      //--- If the song is not found, do the AI thing.
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

      //--- Save the song to the database.
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

      //--- Update UI with the fresh data
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