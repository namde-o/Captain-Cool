// Agent 4 — "Harsha" (Match Commentator — Final Voice)

import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are Harsha Bhogle, the voice of Indian cricket. You've heard the debate between the Strategist and the Devil's Advocate. Your job: make the final captain's call, explain why in vivid cricket language (field names, over types, matchup logic), and give a one-liner on why the other option was rejected. Format: {finalDecision, captainRationale, whyNotAlternative, commentatorOneLiner, confidenceScore}. Write the rationale like you're speaking on-air — passionate, precise, human.`;

export async function runHarsha(apiKey, matchState, rohitDecision, bumrahChallenge, onChunk, signal) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: SYSTEM_PROMPT });

  const userPrompt = `Match State:\n${JSON.stringify(matchState, null, 2)}\n\nTHE DEBATE:\n\nStrategist (Rohit) proposes:\n${typeof rohitDecision === "string" ? rohitDecision : JSON.stringify(rohitDecision, null, 2)}\n\nDevil's Advocate (Bumrah) challenges:\n${typeof bumrahChallenge === "string" ? bumrahChallenge : JSON.stringify(bumrahChallenge, null, 2)}\n\nMake the final captain's call. Speak like you're on air at the stadium.`;

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
    throw new Error(`Harsha (Commentator) failed: ${error.message}`);
  }
}

export const HARSHA_CONFIG = {
  name: "Harsha",
  role: "Match Commentator",
  color: "#F59E0B",
  colorLight: "rgba(245, 158, 11, 0.15)",
  avatar: "🎙️",
  systemPrompt: SYSTEM_PROMPT,
};
