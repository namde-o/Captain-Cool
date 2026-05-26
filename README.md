# 🏏 Captain Cool — AI IPL Match Strategist

> **4 Gemini-powered agents debate IPL tactics in real-time, like a broadcast war room.**

![Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-blue?logo=google&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎮 Interactive Intro (Try in 2 Minutes)

New here? Run one quick match simulation:

1. Launch the app with `npm run dev`.
2. Open the app in your browser.
3. Click **⚙️ API Key** and paste your Gemini key.
4. Fill a live-like match state (over, score, batters, bowlers, pitch, dew).
5. Hit **Start Debate** and watch:
   - **Sanjay** analyze data
   - **Rohit** propose a call
   - **Bumrah** challenge it
   - **Harsha** deliver the final captain's verdict
6. Repeat with a different phase (Powerplay / Middle / Death) and compare strategy shifts.

---

## 🧭 User Guides

### Guide 1 — First-Time Setup

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd captain-cool

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Then open the local URL shown in terminal and add your Gemini API key from  
https://aistudio.google.com/apikey using **⚙️ API Key**.

### Guide 2 — Run a Match Debate

1. Enter match context (teams, innings, over/ball, score, striker/non-striker).
2. Add chase pressure inputs (target, pitch type, dew factor, venue).
3. Add remaining bowlers and overs left.
4. Trigger the agent flow and review each card in order.
5. Use the final verdict as your tactical recommendation for the next over.

### Guide 3 — Interpret the Output Quickly

- **Decision quality:** Check Harsha's `confidenceScore`.
- **Risk check:** Compare Rohit's plan with Bumrah's critique.
- **Execution detail:** Validate field placements, lengths, and over timing in rationale.

---

## 🏗️ Architecture — 4-Agent Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MATCH STATE INPUT                           │
│  (Innings, Over, Score, Teams, Venue, Pitch, Dew, Bowlers, etc.)   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│  AGENT 1: SANJAY (Stats Analyst) 📊                                │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ • Uses Google Search grounding (live IPL data)                │ │
│  │ • Analyzes: matchups, run rates, pitch, dew, fatigue          │ │
│  │ • Output: {phase, runRateGap, pitchAssessment, keyMatchups,   │ │
│  │            bowlerFatigue, threatLevel}                         │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ JSON analysis
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│  AGENT 2: ROHIT (The Strategist) 🧠                                │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ • Receives Sanjay's analysis + match state                    │ │
│  │ • Proposes ONE tactical decision                              │ │
│  │ • Output: {decision, reasoning, confidence, winProbImpact}    │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ Proposed decision
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│  AGENT 3: BUMRAH (Devil's Advocate) 🔥                             │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ • Challenges Rohit's call                                     │ │
│  │ • Proposes alternative with specific reasoning                │ │
│  │ • Output: {critique, alternativeDecision,                     │ │
│  │            alternativeReasoning, urgency}                     │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ Challenge + alternative
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│  AGENT 4: HARSHA (Match Commentator) 🎙️  ★ FINAL VERDICT ★        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ • Hears both sides of the debate                              │ │
│  │ • Makes the CAPTAIN'S CALL                                    │ │
│  │ • Output: {finalDecision, captainRationale,                   │ │
│  │            whyNotAlternative, commentatorOneLiner,             │ │
│  │            confidenceScore}                                   │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Agent System Prompts

### Agent 1 — Sanjay (Stats Analyst)
> **Tool:** Google Search grounding (`tools: [{ googleSearch: {} }]`)

```
You are Sanjay, a data-driven IPL Stats Analyst. Given a match state, you 
analyze: batter vs bowler matchups, current run rate vs required run rate, 
bowler economy rates remaining, powerplay/death overs context, dew factor impact, 
and pitch behavior. Output ONLY a structured JSON object with keys: 
{phase, runRateGap, pitchAssessment, keyMatchups, bowlerFatigue, threatLevel}. 
No prose. Pure data.
```

### Agent 2 — Rohit (The Strategist)

```
You are Rohit, a calm, data-informed IPL captain-strategist. You receive a 
structured match analysis from your Stats Analyst. Your job: propose exactly ONE 
tactical decision for the next over. Decisions can be: bowling change, field 
setting, strategic timeout call, impact player activation, or batting order 
reshuffle. Format your response as JSON: {decision, reasoning, confidence (0-100), 
winProbImpact}. Use real cricket language — over types, field names, 
bowling lengths, matchup logic.
```

### Agent 3 — Bumrah (Devil's Advocate)

```
You are Bumrah, a seasoned IPL pro who questions every captain's call before 
buying in. You receive the Strategist's proposed decision. Your job: find the 
biggest flaw in it and propose an alternative. Be specific — cite dew, pitch 
behavior, batter's weakness, bowler's fatigue, historical choke patterns. 
Format: {critique, alternativeDecision, alternativeReasoning, urgency}.
```

### Agent 4 — Harsha (Match Commentator — Final Voice)

```
You are Harsha Bhogle, the voice of Indian cricket. You've heard the debate 
between the Strategist and the Devil's Advocate. Your job: make the final 
captain's call, explain why in vivid cricket language (field names, over types, 
matchup logic), and give a one-liner on why the other option was rejected. 
Format: {finalDecision, captainRationale, whyNotAlternative, commentatorOneLiner, 
confidenceScore}. Write the rationale like you're speaking on-air — passionate, 
precise, human.
```

---

## 📋 Worked Example

### Input Match State
```json
{
  "innings": "2nd",
  "over": 16,
  "ball": 3,
  "battingTeam": "Mumbai Indians",
  "bowlingTeam": "Chennai Super Kings",
  "currentScore": "142/3",
  "striker": "Suryakumar Yadav",
  "nonStriker": "Hardik Pandya",
  "target": 186,
  "pitchType": "Flat",
  "dewFactor": "Heavy",
  "venue": "Wankhede Stadium, Mumbai",
  "impactPlayerAvailable": true,
  "phase": "Death",
  "bowlers": [
    { "name": "Deepak Chahar", "oversLeft": "1" },
    { "name": "Ravindra Jadeja", "oversLeft": "2" },
    { "name": "Matheesha Pathirana", "oversLeft": "2" }
  ]
}
```

### Agent 1 — Sanjay's Analysis
```json
{
  "phase": "Death",
  "runRateGap": "+2.3 above required (RRR: 11.0, CRR: 9.3 — need 44 off 22)",
  "pitchAssessment": "Flat deck, heavy dew making grip difficult for spinners and cutters",
  "keyMatchups": "SKY averages 42 vs pace in death. Pathirana's yorkers neutralize.",
  "bowlerFatigue": "Chahar bowled 3 overs for 28 — tiring. Pathirana fresh (2 overs, 14 runs).",
  "threatLevel": "HIGH — MI batting deep with Pandya, Tim David in dugout"
}
```

### Agent 2 — Rohit's Decision
```json
{
  "decision": "Bring Pathirana for over 17. Set 4 fielders on boundary: deep mid-wicket, long-on, long-off, third man. Two slips out. Bowl wide yorkers.",
  "reasoning": "Pathirana's pace (145+) and yorker accuracy in death is elite. SKY struggles against raw pace at the stumps. Heavy dew means Jadeja's spin won't grip.",
  "confidence": 78,
  "winProbImpact": "+6% for CSK if Pathirana concedes <10"
}
```

### Agent 3 — Bumrah's Challenge
```json
{
  "critique": "Pathirana has 2 overs left — burning him at 17 leaves over 19 exposed. SKY feasts on pace to leg side. Jadeja's arm ball still works in dew — SKY has been dismissed 3 times by left-arm spin this season.",
  "alternativeDecision": "Bowl Jadeja now at over 17 with a deep square and deep mid-wicket. Save Pathirana for 19 and 20 when new batters may be at crease.",
  "alternativeReasoning": "Jadeja's economy in overs 16-18 is 7.2 this IPL. SKY's SR drops to 118 against left-arm spin. Preserving Pathirana ensures death-over insurance.",
  "urgency": "high"
}
```

### Agent 4 — Harsha's Final Verdict
```json
{
  "finalDecision": "Go with Pathirana at over 17. Set deep mid-wicket, long-on, long-off, third man on the boundary. Bowl wide yorkers targeting off-stump.",
  "captainRationale": "Ladies and gentlemen, this is where Champions League-level thinking meets IPL chaos. Pathirana at 17 is a STATEMENT — you're telling Surya, 'We're not afraid of you, we're coming at you with raw pace.' At 145 clicks with dew on the ball, that wide yorker is the most unplayable delivery in T20 cricket. Yes, you burn an over of Pathirana — but if you get SKY now, this chase collapses. Tim David walks in under pressure at Wankhede with 40 needed off 18. That's when you bring Pathirana back for the kill.",
  "whyNotAlternative": "Jadeja in dew is a coin flip — one bad ball, one lofted six over cow corner, and MI are cruising. You don't gamble with spinners when the ball is like soap.",
  "commentatorOneLiner": "When the ball is wet and the stakes are high, you don't reach for the spinner — you unleash the missile.",
  "confidenceScore": 82
}
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Gemini 2.5 Flash** | 4 distinct AI agents via `@google/generative-ai` |
| **Google Search Grounding** | Live IPL stats for Agent 1 (Sanjay) |
| **React 19** | UI framework |
| **Vite 6** | Build tool + dev server |
| **Vanilla CSS** | Dark stadium IPL broadcast theme |
| **Rajdhani + IBM Plex Mono** | Typography (Google Fonts) |

---

## 📌 AI Studio Prompt Link

> _[Add your AI Studio prompt prototype link here after testing]_

---

## 📁 Project Structure

```
captain-cool/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── agents/
│   │   ├── sanjay.js      ← Stats Analyst (Google Search tool)
│   │   ├── rohit.js       ← Strategist
│   │   ├── bumrah.js      ← Devil's Advocate
│   │   └── harsha.js      ← Commentator (Final Verdict)
│   ├── components/
│   │   ├── MatchInputForm.jsx
│   │   ├── AgentCard.jsx
│   │   ├── DebateFeed.jsx
│   │   ├── FieldDiagram.jsx
│   │   ├── ConfidenceMeter.jsx
│   │   └── SettingsModal.jsx
│   └── styles/
│       └── theme.css
├── .antigravity/
│   └── manifest.yaml
└── README.md
```

---

Built for the IPL Hackathon 🏆 — Powered by Google Gemini
