// Copyright (c) 2026 ReLU Technologies Private Limited. All rights reserved.
// TOYBOX - shared helpers: toy-style synth audio, records, light/dark theme,
// console shell color and swipe input. Exposed as window.ToyBox, and also as
// window.CyberSystem so the existing game scripts keep working unchanged.

(function (window) {
    'use strict';

    const KEYS = { muted: 'cyber_audio_muted', theme: 'toybox_theme', shell: 'toybox_shell' };
    const SHELLS = ['tomato', 'sky', 'mint', 'grape', 'lemon'];
    const root = document.documentElement;

    function read(key) {
        try { return window.localStorage.getItem(key); } catch (e) { return null; }
    }

    function write(key, value) {
        try { window.localStorage.setItem(key, value); } catch (e) { }
    }

    // -- 1. Toy synth audio --
    let audioCtx = null;
    let unlocked = false; // browsers only allow sound after a user gesture

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) audioCtx = new AudioContextClass();
        }
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    }

    function tone(freq, endFreq, dur, type, vol, delay) {
        const ctx = getAudioContext();
        if (!ctx) return;
        const t = ctx.currentTime + (delay || 0);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);

        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + dur + 0.02);
    }

    const ToyAudio = {
        isMuted() {
            return read(KEYS.muted) === 'true';
        },

        setMuted(muted) {
            write(KEYS.muted, muted ? 'true' : 'false');
            this.updateToggles();
        },

        toggleMute() {
            const muted = !this.isMuted();
            this.setMuted(muted);
            return muted;
        },

        updateToggles() {
            const muted = this.isMuted();
            document.querySelectorAll('.hud-audio-toggle').forEach((btn) => {
                btn.classList.toggle('off', muted);
                btn.setAttribute('aria-pressed', String(!muted));
            });
        },

        play(fn) {
            if (this.isMuted() || !unlocked) return;
            try { fn(); } catch (e) { }
        },

        // Soft tick when hovering something pressable
        playHover() { this.play(() => tone(700, 900, 0.05, 'sine', 0.03)); },

        // Bouncy "pop" for presses
        playClick() { this.play(() => tone(520, 240, 0.09, 'triangle', 0.09)); },

        // Rising four-note jingle
        playSuccess() {
            this.play(() => {
                [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, null, 0.16, 'triangle', 0.07, i * 0.07));
            });
        },

        // Gentle two-note "aww"
        playAlert() {
            this.play(() => {
                tone(330, 180, 0.22, 'triangle', 0.1);
                tone(247, 120, 0.28, 'triangle', 0.08, 0.12);
            });
        }
    };

    // -- 2. Personal records (same storage keys as before) --
    const ToyScores = {
        KEYS: {
            memory: 'cyber_memory_best_level',
            rps: 'cyber_rps_best_streak',
            snake: 'cyber_snake_max_bytes',
            tetris: 'cyber_tetris_high_score'
        },

        get(gameKey) {
            const val = read(this.KEYS[gameKey] || gameKey);
            return val ? parseInt(val, 10) || 0 : 0;
        },

        set(gameKey, val) {
            const numVal = parseInt(val, 10) || 0;
            if (numVal > this.get(gameKey)) {
                write(this.KEYS[gameKey] || gameKey, numVal.toString());
                ToyAudio.playSuccess();
                return true; // new record
            }
            return false;
        },

        getAll() {
            return {
                memory: this.get('memory'),
                rps: this.get('rps'),
                snake: this.get('snake'),
                tetris: this.get('tetris')
            };
        }
    };

    // -- 3. Light / dark theme --
    let paletteCache = null;

    const Theme = {
        get() {
            const stored = read(KEYS.theme);
            if (stored === 'light' || stored === 'dark') return stored;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        },

        apply(theme) {
            root.dataset.theme = theme;
            paletteCache = null;
            const meta = document.querySelector('meta[name="theme-color"]');
            if (meta) meta.setAttribute('content', theme === 'dark' ? '#1c1832' : '#fff1d6');
            document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
                btn.setAttribute('aria-checked', String(theme === 'dark'));
            });
            window.dispatchEvent(new CustomEvent('toybox:themechange', { detail: theme }));
        },

        set(theme) {
            write(KEYS.theme, theme);
            this.apply(theme);
        },

        toggle() {
            const next = this.get() === 'dark' ? 'light' : 'dark';
            this.set(next);
            return next;
        }
    };

    // Canvas colors that follow the theme (read from the CSS variables)
    function palette() {
        if (!paletteCache) {
            const cs = window.getComputedStyle(root);
            const get = (name) => cs.getPropertyValue(name).trim();
            paletteCache = {
                bg: get('--screen-bg'),
                grid: get('--screen-grid'),
                ink: get('--screen-ink'),
                soft: get('--screen-soft'),
                green: get('--c-green'),
                red: get('--c-red'),
                yellow: get('--c-yellow'),
                blue: get('--c-blue'),
                purple: get('--c-purple'),
                orange: get('--c-orange'),
                pink: get('--c-pink')
            };
        }
        return paletteCache;
    }

    // -- 4. Console shell color --
    const Shell = {
        get() {
            const stored = read(KEYS.shell);
            return SHELLS.indexOf(stored) >= 0 ? stored : SHELLS[0];
        },

        apply(name) {
            root.dataset.shell = name;
        },

        next() {
            const name = SHELLS[(SHELLS.indexOf(this.get()) + 1) % SHELLS.length];
            write(KEYS.shell, name);
            this.apply(name);
            return name;
        }
    };

    // -- 5. Mobile swipe helper --
    function attachSwipeListener(element, onSwipe) {
        let startX = 0;
        let startY = 0;
        const MIN_DISTANCE = 30;

        element.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches.length > 0) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }
        }, { passive: true });

        element.addEventListener('touchend', (e) => {
            if (!e.changedTouches || e.changedTouches.length === 0) return;
            const dx = e.changedTouches[0].clientX - startX;
            const dy = e.changedTouches[0].clientY - startY;

            if (Math.abs(dx) > Math.abs(dy)) {
                if (Math.abs(dx) >= MIN_DISTANCE) onSwipe(dx > 0 ? 'Right' : 'Left');
            } else if (Math.abs(dy) >= MIN_DISTANCE) {
                onSwipe(dy > 0 ? 'Down' : 'Up');
            }
        }, { passive: true });
    }

    // -- 6. Auto-initialise --
    Shell.apply(Shell.get());

    document.addEventListener('DOMContentLoaded', () => {
        Theme.apply(Theme.get());
        ToyAudio.updateToggles();

        document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
            btn.addEventListener('click', () => Theme.toggle());
        });
        document.querySelectorAll('.hud-audio-toggle').forEach((btn) => {
            btn.addEventListener('click', () => ToyAudio.toggleMute());
        });

        // Follow the system theme until the player picks one explicitly
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (!read(KEYS.theme)) Theme.apply(Theme.get());
        });

        // Hover ticks and press pops on everything pressable (including dynamic UI)
        function bindSounds() {
            document.querySelectorAll('a, button').forEach((el) => {
                if (el.dataset.toySound) return;
                el.dataset.toySound = '1';
                el.addEventListener('mouseenter', () => ToyAudio.playHover());
                el.addEventListener('click', () => ToyAudio.playClick());
            });
        }
        bindSounds();
        new MutationObserver(bindSounds).observe(document.body, { childList: true, subtree: true });

        // Sound is allowed only after the first gesture
        const unlock = () => {
            unlocked = true;
            getAudioContext();
            ['pointerdown', 'keydown', 'touchstart'].forEach((evt) => document.removeEventListener(evt, unlock));
        };
        ['pointerdown', 'keydown', 'touchstart'].forEach((evt) => document.addEventListener(evt, unlock));
    });

    const ToyBox = {
        Audio: ToyAudio,
        Scores: ToyScores,
        Theme,
        Shell,
        palette,
        attachSwipeListener
    };

    window.ToyBox = ToyBox;
    window.CyberSystem = ToyBox;
})(window);
