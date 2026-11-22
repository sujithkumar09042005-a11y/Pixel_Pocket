// Copyright (c) 2026 ReLU Technologies Private Limited. All rights reserved.
// Hub page: live records on cartridges, screen preview, insert animation.

document.addEventListener('DOMContentLoaded', () => {
    const toy = window.ToyBox;
    const screen = document.getElementById('hub-screen');
    const title = document.getElementById('hub-title');
    const desc = document.getElementById('hub-desc');
    const record = document.getElementById('hub-record');
    const carts = Array.from(document.querySelectorAll('.cart'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const defaults = { title: title.textContent, desc: desc.textContent };

    // -- Records on each cartridge --
    const labels = {
        memory: (n) => `Best: <b>level ${n}</b>`,
        rps: (n) => `Best streak: <b>${n}</b>`,
        snake: (n) => `Best: <b>${n}</b>`,
        tetris: (n) => `Best: <b>${n}</b>`
    };
    const scores = toy.Scores.getAll();
    Object.keys(labels).forEach((game) => {
        const chip = document.getElementById(`record-${game}`);
        if (chip) chip.innerHTML = labels[game](scores[game]);
    });

    // -- Screen preview on hover / focus --
    function preview(cart) {
        const color = getComputedStyle(cart).getPropertyValue('--cart').trim();
        screen.style.setProperty('--accent', color);
        title.textContent = cart.dataset.title;
        desc.textContent = cart.dataset.desc;
        record.innerHTML = cart.querySelector('.chip').innerHTML;
        record.hidden = false;
        screen.classList.remove('swap');
        void screen.offsetWidth; // restart the animation
        screen.classList.add('swap');
    }

    function clearPreview() {
        screen.style.removeProperty('--accent');
        title.textContent = defaults.title;
        desc.textContent = defaults.desc;
        record.hidden = true;
    }

    carts.forEach((cart) => {
        cart.addEventListener('mouseenter', () => preview(cart));
        cart.addEventListener('focus', () => preview(cart));
        cart.addEventListener('mouseleave', clearPreview);
        cart.addEventListener('blur', clearPreview);

        // Push the cartridge into the slot, then go
        cart.addEventListener('click', (e) => {
            if (reduceMotion.matches || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
            e.preventDefault();
            cart.classList.add('inserting');
            setTimeout(() => { window.location.href = cart.href; }, 480);
        });
    });

    // Back/forward cache: undo the insert animation when coming back
    window.addEventListener('pageshow', () => {
        carts.forEach((cart) => cart.classList.remove('inserting'));
    });

    // -- Console color button --
    document.getElementById('shell-btn').addEventListener('click', () => toy.Shell.next());

    // -- Keyboard shortcuts 1-4 --
    document.addEventListener('keydown', (e) => {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        const cart = carts[parseInt(e.key, 10) - 1];
        if (cart) cart.focus();
    });
});
