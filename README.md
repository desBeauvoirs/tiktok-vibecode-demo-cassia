# TikTok Vibe — Interactive Feed Prototype

A pixel-perfect TikTok vertical scroll feed prototype, shipped through AI-assisted vibe coding. Designed from real Figma specs and engineered for mobile-first performance.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-black?logo=framer) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?logo=tailwindcss) ![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)

---

## What This Is

This prototype replicates TikTok's For You feed experience — swipe gestures, video autoplay, comment panels, inline quote cards, and interactive social actions — with production-quality attention to mobile edge cases.

The entire codebase was built through iterative AI collaboration (vibe coding with Claude Code): Figma URL → asset pipeline → gesture physics → Safari bug fixes → performance audit, all in one session. This is not scaffold-and-forget generation. Every architectural decision was made in context, debugged, and validated.

**5 feeds total:** 3 video feeds + 2 quote/comment cards (Feed 2 surfaces a viral comment on Feed 3; Feed 4 is a sponsored quote card from @claude).

---

## Engineering Highlights

### Vibe Coding Workflow
Figma specs were fed directly into the development loop — node IDs, padding values, opacity tokens, and layout constraints extracted from Figma MCP and translated to code in real time. The gap between design and implementation was measured in minutes, not sprints.

### Mobile Gesture System (Framer Motion)
- Vertical swipe between feed cards with `drag="y"`, `dragConstraints`, and velocity-based snap
- Drag-click disambiguation via `isDragging` ref — prevents accidental navigation when tapping interactive elements mid-swipe
- `dragMomentum={false}` for frame-accurate snap (no rubber-band overshoot on release)
- **Safari fix:** `touchAction: 'none'` on the carousel container suppresses native scroll hijacking and eliminates bounce artifacts on iOS

### Performance Engineering
- `React.memo` on `VideoCard` — off-screen feed cards never re-render during swipe; only the newly active card updates
- `useRef` for `isDragging` and `mutedRef` — values that drive behavior but not UI stored in refs for zero re-render cost
- Video autoplay gated to browser policy: starts `muted` (autoplay allowed), unmutes on first user tap via ref — no AudioContext hacks needed
- Fixed a React StrictMode double-invocation bug: nested `setState` updaters caused like counts to increment by 2; resolved by separating into independent calls

### iPhone Safe Area Support
Coordinate system locked to Figma's 402×874 artboard with named layout constants:

```js
const STATUS_BAR_H  = 62   // Dynamic Island / notch clearance
const TOP_NAV_H     = 65
const BOTTOM_NAV_H  = 84   // Home indicator clearance
const CONTENT_TOP   = STATUS_BAR_H + TOP_NAV_H  // = 127
```

All interactive content positioned strictly within the safe zone. The entire canvas scales via `transform: scale()` with `transformOrigin: '0 0'` to fill any viewport — letterboxed in black, no layout reflow at different screen sizes.

---

## Features

| Feature | Detail |
|---|---|
| Vertical swipe feed | 5 cards, velocity-snapped, drag-click safe |
| Video playback | Autoplay on active card, tap to pause/unmute, progress bar |
| Quote cards | Embedded video thumbnail, attributed quote, vertically centered in safe area |
| Comment panel | Slide-up sheet, independent scroll, creator badge, per-comment like state |
| Social sidebar | Like (fill + count toggle), comment, bookmark, share — all interactive |
| Caption | 2-line clamp, "more / less" expand toggle |
| Ad badge | Right-aligned, `3px 2px` padding per Figma spec |

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React 18 | Hooks, StrictMode, concurrent-ready |
| Animation | Framer Motion 11 | Gesture physics, `AnimatePresence` for panel mount/unmount |
| Styling | Tailwind CSS v4 | Utility-first; inline style fallbacks where v4 arbitrary values silently failed |
| Build | Vite 8 | Sub-second HMR, Rolldown bundler |
| Assets | Local `/public/assets/` | Zero CDN dependency, no URL expiry |

---

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in Chrome DevTools mobile emulator (iPhone 14 Pro) or any iOS browser.

---

## Project Structure

```
tiktok-vibe/
├── public/
│   └── assets/        # SVG icons, PNG avatars/thumbnails, MP4 videos
├── src/
│   ├── App.jsx        # All components and feed data (single-file architecture)
│   ├── index.css      # Tailwind import + global reset
│   └── App.css
└── vite.config.js
```

---

*Built by [Cassia Tang](https://cassiatang.design) · Design Engineering · April 2026*
