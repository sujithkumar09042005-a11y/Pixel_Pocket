# Toy Box Arcade

A playroom of four quick browser games on a chunky toy console. Built with plain HTML, CSS and JavaScript, with no build step and no dependencies. It has a light (day) theme and a dark (night) theme.

## Games

| Game | Folder | What it is |
|---|---|---|
| Simon Says | `Games/Project_Memory/` | Watch the pads light up, then repeat the pattern. Three speeds. Keys G, R, Y, B also work. |
| Rock Paper Scissors | `Games/Project_RPS/` | Beat the robot in a best-of-1, 3 or 5 and build a streak. |
| Snake | `Games/Project_Snake/` | Eat snacks, avoid your tail. Arrow keys or WASD, swipe or on-screen pad on touch. |
| Block Stack | `Games/Project_Tetris/` | Spin and drop falling blocks to clear lines. |

Best scores are saved in the browser (`localStorage`) and shown on each cartridge on the hub.

## Design

- **Toy console:** every game sits inside a chunky console with a bezel, screen and squishy buttons. The hub is a shelf of cartridges that slide into the console slot.
- **Light and dark themes:** the switch in the top bar sets `data-theme` on `<html>` and is remembered. Until you choose, the site follows your system setting. Game canvases repaint with the theme.
- **Console color:** the paint button on the hub cycles tomato, sky, mint, grape and lemon.
- **Sound:** small synthesized pops and jingles through the Web Audio API, with a mute button.
- **Accessibility:** keyboard focus rings, a skip link, real buttons for every control, labelled toggles, and `prefers-reduced-motion` support.

## Project layout

```
index.html, hub.css, hub.js     Hub page
toybox.css                      Design tokens (light/dark), buttons, console, overlays
toybox.js                       Audio, records, theme and shell color (window.ToyBox)
games.css                       Pieces shared by the game pages
assets/icons.svg                Icon and cartridge art sprite
fonts/                          Self-hosted Fredoka and Nunito (woff2)
Games/Project_*/                One folder per game
dev_server.py                   Local no-cache server
```

## Run locally

```
python3 dev_server.py
```

Then open http://localhost:8000.

## Credits

Fonts: Fredoka and Nunito, licensed under the SIL Open Font License.

Copyright (c) 2026 ReLU Technologies Private Limited. All rights reserved.
