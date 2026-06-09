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
    // FIX 1: Extract the variables we actually sent from the frontend
    const { songTitle, artistName } = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!songTitle || !artistName) {
      throw new Error("Missing songTitle or artistName");
    }

 const systemInstruction = `You are an expert Liturgical Analyst. I will provide a song title and artist. 
Your goal is to categorize it into one of four liturgical movements and explain its theological fit.

CATEGORIES (The Four-Fold Model):
1. PRAISE (Gathering): Focus on awe, glory, and thanks. Posture is gathering the congregation.
2. FAITH (Word): Focus on the story of God, His attributes, and His Word. Posture is learning/grounding.
3. LOVE (Table): Focus on the Gospel, the Cross, and sacrifice. Posture is reflection/communion.
4. HOPE (Sending): Focus on the future, confession, repentance, and commissioning. Posture is being sent out.

OUTPUT FORMAT (JSON ONLY):
{
  "song_title": "String",
  "artist": "String",
  "liturgical_movement": "Praise | Faith | Love | Hope",
  "theological_reasoning": "A 2-3 sentence explanation of why this song fits this specific movement.",
  "scripture_connection": "A brief reference to a relevant verse if applicable."
}`;
// FIX 2: Gemini 2.5 API structure
    // Ensure you are passing the inputs into the text prompt
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        // FIX 3: Use the variables extracted from req.json()
        contents: [{ parts: [{ text: `Analyze this song: "${songTitle}" by ${artistName}` }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json" 
        }
      })
    });

    const data = await response.json();
    
    // FIX 4: Safety check on response
    if (!data.candidates || !data.candidates[0].content.parts[0].text) {
       throw new Error("Gemini returned an invalid response structure");
    }

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