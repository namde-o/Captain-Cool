export async function fetchLiveScore(apiKey, teamNameOrMatchTitle, signal) {
  // Instead of a URL, accept a match description like "MI vs CSK IPL 2025"
  // Use Gemini with googleSearch grounding to find live score
  
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      tools: [{ google_search: {} }],
      contents: [{
        role: 'user',
        parts: [{
          text: `Search for the LIVE or most recent IPL match score for: "${teamNameOrMatchTitle}". 
          Find the current match state from Cricbuzz, ESPNCricinfo, or NDTV Sports.
          Return ONLY a JSON object (no markdown, no backticks) with these exact keys:
          {
            "battingTeam": "team name",
            "bowlingTeam": "team name", 
            "score": "runs",
            "wickets": number,
            "overs": "X.Y",
            "balls": number (0-5),
            "target": number or null,
            "rrr": "required run rate" or null,
            "crr": "current run rate",
            "phase": "Powerplay" or "Middle Overs" or "Death Overs",
            "striker": "batter name",
            "nonStriker": "batter name",
            "lastOverSummary": "dot wide 4 six 1 dot" or null,
            "venue": "stadium name",
            "matchTitle": "full match title",
            "innings": 1 or 2,
            "dataSource": "Cricbuzz/ESPNCricinfo/etc",
            "fetchedAt": "HH:MM IST"
          }
          If any field is not found, set it to null. Return ONLY the JSON object.`
        }]
      }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 1000 }
    })
  });

  if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
  
  const data = await response.json();
  
  // Extract text from response (handle grounding response format)
  const rawText = data.candidates?.[0]?.content?.parts
    ?.map(p => p.text || '')
    .join('') || '';
  
  // Clean and parse JSON
  const cleaned = rawText
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  
  try {
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch {
    // If JSON parse fails, try to extract JSON from the text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error('Could not parse live score data from Gemini response');
  }
}

