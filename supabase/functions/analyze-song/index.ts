import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { songTitle, artistName } = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    // The system prompt we designed earlier
 const systemInstruction = `
You are an expert Liturgical Analyst and Worship Theologian.
Your task is to map songs onto a 2D Cartesian plane (-10 to +10).

AXIS DEFINITIONS:
- Y-AXIS (FOCUS): +10 is Divine-focused (God's nature, glory). -10 is Human-focused (our condition, repentance, the Cross/Gospel).
- X-AXIS (POSTURE): -10 is Receiving (listening, reflection). +10 is Declaring (proclaiming, celebration).

QUADRANT BOUNDARIES (STRICT):
- Q1 (FAITH): Y > 0 AND X < 0. (Divine + Receiving)
- Q2 (PRAISE): Y > 0 AND X > 0. (Divine + Declaring)
- Q3 (HOPE): Y < 0 AND X < 0. (Human + Receiving)
- Q4 (LOVE): Y < 0 AND X > 0. (Human + Declaring)

OPERATIONAL RULES:
1. BEFORE outputting JSON, perform an internal check: "Does my X and Y satisfy the quadrant math?"
2. If the song is about the Cross, the Gospel, or Sacrifice, it MUST have a negative Y-axis score.
3. If the song is about God's eternal attributes (Majesty, Holiness), it MUST have a positive Y-axis score.
4. If a song is Declarative (shouting, proclaiming), X MUST be positive.

OUTPUT FORMAT:
{
  "song_title": "${songTitle}",
  "artist": "${artistName}",
  "x_axis_score": Number,
  "y_axis_score": Number,
  "quadrant": "Q1 | Q2 | Q3 | Q4",
  "theological_reasoning": "String"
}`;

    // Call the Gemini REST API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ parts: [{ text: `Analyze this song: ${songInput}` }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json" // Forces Gemini to return clean JSON
        }
      })
    });

    const data = await response.json();
    
    // Extract the JSON string from Gemini's response and parse it
    const geminiText = data.candidates[0].content.parts[0].text;
    const parsedData = JSON.parse(geminiText);

    return new Response(JSON.stringify(parsedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});