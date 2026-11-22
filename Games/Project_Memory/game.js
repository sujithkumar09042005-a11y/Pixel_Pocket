// Copyright (c) 2026 ReLU Technologies Private Limited. All rights reserved.
// Simon Says. Plain JavaScript (no jQuery).

(function () {
  'use strict';

  const buttonColours = ['red', 'blue', 'green', 'yellow'];
  const speeds = { easy: 1000, medium: 600, hard: 300 };

  const levelTitle = document.getElementById('level-title');
  const bestBadge = document.getElementById('memory-best-badge');
  const selector = document.getElementById('difficulty-selector');

  let gamePattern = [];
  let userClickedPattern = [];
  let started = false;
  let accepting = false; // false while the pattern is being shown
  let level = 0;
  let gameSpeed = speeds.easy;

  function toy() {
    return window.ToyBox;
  }

  function updateBestRecordDisplay() {
    bestBadge.textContent = 'Best: level ' + toy().Scores.get('memory');
  }

  function playSound(name) {
    if (toy().Audio.isMuted()) return;
    const audio = new Audio('sounds/' + name + '.mp3');
    audio.play().catch(() => {});
  }

  function flash(colour, ms) {
    const pad = document.getElementById(colour);
    pad.classList.add('pressed');
    setTimeout(() => pad.classList.remove('pressed'), ms);
  }

  function nextSequence() {
    userClickedPattern = [];
    accepting = false;
    level++;
    levelTitle.textContent = 'Level ' + level;

    const colour = buttonColours[Math.floor(Math.random() * 4)];
    gamePattern.push(colour);

    // Replay the whole pattern, one pad at a time
    gamePattern.forEach((c, i) => {
      setTimeout(() => {
        flash(c, Math.max(gameSpeed / 2, 150));
        playSound(c);
        if (i === gamePattern.length - 1) {
          setTimeout(() => { accepting = true; levelTitle.textContent = 'Your turn! Level ' + level; }, gameSpeed / 2);
        }
      }, 500 + i * gameSpeed);
    });
  }

  function startOver() {
    level = 0;
    gamePattern = [];
    started = false;
    accepting = false;
    selector.hidden = false;
  }

  function checkAnswer(index) {
    if (gamePattern[index] === userClickedPattern[index]) {
      if (userClickedPattern.length === gamePattern.length) {
        accepting = false;
        toy().Scores.set('memory', level);
        updateBestRecordDisplay();
        levelTitle.textContent = 'Nice one!';
        setTimeout(nextSequence, 1000);
      }
    } else {
      playSound('Game_Over_SFX');
      toy().Audio.playAlert();
      document.body.classList.add('game-over');
      levelTitle.textContent = 'Oops! You reached level ' + level + '. Pick a speed to retry.';
      setTimeout(() => document.body.classList.remove('game-over'), 250);
      startOver();
    }
  }

  function onPad(colour) {
    if (!started || !accepting) return;

    userClickedPattern.push(colour);
    playSound(colour);
    flash(colour, 150);
    checkAnswer(userClickedPattern.length - 1);
  }

  function onSpeed(id) {
    if (started) return;
    gameSpeed = speeds[id] || speeds.easy;
    selector.hidden = true;
    started = true;
    levelTitle.textContent = 'Get ready...';
    nextSequence();
  }

  Object.keys(speeds).forEach((id) => {
    document.getElementById(id).addEventListener('click', () => onSpeed(id));
  });

  buttonColours.forEach((colour) => {
    document.getElementById(colour).addEventListener('click', () => onPad(colour));
  });

  // Keyboard: G, R, Y, B light the matching pad
  document.addEventListener('keydown', (e) => {
    const map = { g: 'green', r: 'red', y: 'yellow', b: 'blue' };
    const colour = map[e.key.toLowerCase()];
    if (colour && !e.ctrlKey && !e.metaKey && !e.altKey) onPad(colour);
  });

  updateBestRecordDisplay();
})();
