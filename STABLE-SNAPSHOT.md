# Voice Zero Mascot — Stable Snapshot

Saved: 2026-07-05

Voice-agent mascot demo (digit **0**) with states: Idle, Listening, Thinking, Speaking, Interrupted.

## Run

```bash
cd sparks-and-effects-voice-zero-stable
npm install
PORT=3001 npm start
```

Open http://localhost:3001

## Source

Frozen copy of `sparks-and-effects-custom` at stable milestone:
- Outer silhouette edge glow (all states, per-state `edgeGlow` in `src/voiceStates.js`)
- Speaking glow ramp ~125ms
- Left-weighted pool/ambient lighting
- Scene shifted 3 units left
- Sparks on speaking, smooth state transitions

## Entry

`src/index.js` → `VoiceDemoApp`
