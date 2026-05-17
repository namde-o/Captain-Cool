// Agent 2 — "Rohit" (The Strategist)

import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are Rohit, a calm, data-informed IPL captain-strategist. You receive a structured match analysis from your Stats Analyst. Your job: propose exactly ONE tactical decision for the next over. Decisions can be: bowling change, field setting, strategic timeout call, impact player activation, or batting order reshuffle. Format your response as JSON: {decision, reasoning, confidence (0-100), winProbImpact}. Use real cricket language — over types, field names, bowling lengths, matchup logic.`;

export async function runRohit(apiKey, matchState, sanjayAnalysis, onChunk, signal) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: SYSTEM_PROMPT });

  const userPrompt = `Match State:\n${JSON.stringify(matchState, null, 2)}\n\nStats Analyst (Sanjay) analysis:\n${typeof sanjayAnalysis === "string" ? sanjayAnalysis : JSON.stringify(sanjayAnalysis, null, 2)}\n\nPropose your ONE tactical decision for the next over.`;

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
    throw new Error(`Rohit (Strategist) failed: ${error.message}`);
  }
}

export const ROHIT_CONFIG = {
  name: "Rohit",
  role: "The Strategist",
  color: "#14B8A6",
  colorLight: "rgba(20, 184, 166, 0.15)",
  avatar: "🧠",
  systemPrompt: SYSTEM_PROMPT,
};
