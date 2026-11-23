# Pixel Pocket

A pocket-sized arcade of ten quick browser games with a retro handheld pixel look. Plain HTML, CSS and JavaScript. No build step, no dependencies.

## Games

| Game | Folder | Controls |
|---|---|---|
| Snake | `Games/snake/` | Arrows or WASD, swipe, on-screen pad. P pauses. |
| Block Stack | `Games/blocks/` | Arrows, Space to hard drop, on-screen buttons. P pauses. |
| 2048 | `Games/2048/` | Arrows or WASD, swipe. |
| Breakout | `Games/breakout/` | Mouse, touch or Left/Right. Space or tap to launch. |
| Minesweeper | `Games/mines/` | Click to dig, right-click or F (flag mode) to flag, long-press on touch. |
| Flappy Hop | `Games/flappy/` | Tap, click, Space or Up. |
| Space Invaders | `Games/invaders/` | Left/Right + Space; drag to move on touch (auto-fire). |
| Pixel Runner | `Games/runner/` | Space/Up/tap to jump (hold = higher), Down to duck. |
| Memory Match | `Games/memory/` | Click or tap cards. |
| Whack-a-Mole | `Games/whack/` | Click or tap moles; avoid bombs. |

Best scores are kept in `localStorage` and shown on the hub cartridges.

## Design

- Lively: bevelled pixel blocks, particle bursts, screen shake, floating score pops, drifting pixel background, CRT scanlines and bouncing cartridges.
- Pixel Pocket: chunky outlines, hard offset shadows, stepped animation, monospace type and a bright arcade palette.
- Night (default dark) and Day themes, remembered between visits; canvases repaint on switch.
- Synthesized sound effects via Web Audio, with a mute button.
- Keyboard focus rings, skip links, `prefers-reduced-motion` support.

## Layout

```
index.html        Hub
pixel.css         Shared design system
pixel.js          Theme, sound, best scores (window.PP)
art.js          Hub cartridge thumbnails (same characters as the games)
Games/<game>/     index.html + game.js per game
dev_server.py     Local no-cache server on port 8000
```

Run locally: `python3 dev_server.py`, then open http://localhost:8000.
