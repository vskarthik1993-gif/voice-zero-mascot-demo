# Snapshot: voice-demo-3x-loop-gap-jul-6-2026

**Captured:** 6 Jul 2026

Voice Concierge 3D **0** mascot demo — dock UI, PBR finishes, key light, orbit inspect, character moves.

## Features at capture

- 5 PBR surface finishes + Kelvin gradient shader
- Front key light (azimuth, Kelvin, intensity)
- Minimisable dock panels with edge tabs (320px left rail)
- Orbit inspect (default yaw 1°, pitch −4°, camera Z 36)
- Character moves: **3 full loops** per one-shot animation
- **0.7s breathe pause** between each loop before the next repeat
- Pool width + intensity sliders

## Run locally

```bash
cd sparks-and-effects-voice-zero-stable
npm install
PORT=3015 npm start
```

Open http://localhost:3015

## Restore source from this snapshot

```bash
cp -R snapshots/voice-demo-3x-loop-gap-jul-6-2026/src/* src/
```

## Live demo

https://vskarthik1993-gif.github.io/voice-zero-mascot-demo
