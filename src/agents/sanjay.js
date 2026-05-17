// Agent 1 — "Sanjay" (Stats Analyst)
// Uses Google Search grounding for live IPL context

import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are Sanjay, a data-driven IPL Stats Analyst. Given a match state, you analyze: batter vs bowler matchups, current run rate vs required run rate, bowler economy rates remaining, powerplay/death overs context, dew factor impact, and pitch behavior. Output ONLY a structured JSON object with keys: {phase, runRateGap, pitchAssessment, keyMatchups, bowlerFatigue, threatLevel}. No prose. Pure data.`;

export async function runSanjay(apiKey, matchState, onChunk, signal) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT,
    tools: [{ googleSearch: {} }],
  });

  const userPrompt = `Here is the current match state:
${JSON.stringify(matchState, null, 2)}

Search for recent IPL 2025 stats and head-to-head records for ${matchState.battingTeam} vs ${matchState.bowlingTeam} and any pitch/venue reports for ${matchState.venue}. Use this to enrich your match analysis.

Analyze the match state and provide your structured JSON analysis.`;

  let fullText = "";

  try {
    const result = await model.generateContentStream(userPrompt, { signal });
    for await (const chunk of result.stream) {
      const text = chunk.text();
      fullText += text;
      if (onChunk) onChunk(text, fullText);
    }

    try {
      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (jsonMatch) return { parsed: JSON.parse(jsonMatch[0]), raw: fullText };
    } catch (e) { /* JSON parse failed */ }
    return { parsed: null, raw: fullText };
  } catch (error) {
    throw new Error(`Sanjay (Stats Analyst) failed: ${error.message}`);
  }
}

export const SANJAY_CONFIG = {
  name: "Sanjay",
  role: "Stats Analyst",
  color: "#3B82F6",
  colorLight: "rgba(59, 130, 246, 0.15)",
  avatar: "📊",
  systemPrompt: SYSTEM_PROMPT,
};
