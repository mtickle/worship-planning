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
    const { songInput } = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    // The system prompt we designed earlier
    const systemInstruction = `You are a liturgical analyst. Analyze the song and map it to a Cartesian plane. 
    Y-Axis (-10 to +10): +10 is Divine/God-focused, -10 is Human/Condition-focused.
    X-Axis (-10 to +10): -10 is Internal/Reflective, +10 is External/Expressive.
    Quadrants: Q1(Top-Left, FAITH), Q2(Top-Right, PRAISE), Q3(Bottom-Left, HOPE), Q4(Bottom-Right, LOVE).
    Return ONLY valid JSON matching this schema: {"song_title": "string", "y_axis_score": number, "x_axis_score": number, "quadrant": "string", "theological_reasoning": "string"}`;

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