// Agent 3 — "Bumrah" (Devil's Advocate)

import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are Bumrah, a seasoned IPL pro who questions every captain's call before buying in. You receive the Strategist's proposed decision. Your job: find the biggest flaw in it and propose an alternative. Be specific — cite dew, pitch behavior, batter's weakness, bowler's fatigue, historical choke patterns. Format: {critique, alternativeDecision, alternativeReasoning, urgency}.`;

export async function runBumrah(apiKey, matchState, rohitDecision, onChunk, signal) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: SYSTEM_PROMPT });

  const userPrompt = `Match State:\n${JSON.stringify(matchState, null, 2)}\n\nThe Strategist (Rohit) proposes:\n${typeof rohitDecision === "string" ? rohitDecision : JSON.stringify(rohitDecision, null, 2)}\n\nChallenge this decision. Find the flaw and propose your alternative.`;

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
    } catch (e) { /* */ }
    return { parsed: null, raw: fullText };
  } catch (error) {
    throw new Error(`Bumrah (Devil's Advocate) failed: ${error.message}`);
  }
}

export const BUMRAH_CONFIG = {
  name: "Bumrah",
  role: "Devil's Advocate",
  color: "#EF4444",
  colorLight: "rgba(239, 68, 68, 0.15)",
  avatar: "🔥",
  systemPrompt: SYSTEM_PROMPT,
};
