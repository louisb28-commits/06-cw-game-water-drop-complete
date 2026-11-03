// ---- Difficulty settings ----
const DIFFICULTY = {
  easy:   { time: 40, goal: 15, spawnMs: 1000, fallSec: 5,   badChance: 0.10 },
  normal: { time: 30, goal: 20, spawnMs: 800,  fallSec: 4,   badChance: 0.20 },
  hard:   { time: 25, goal: 30, spawnMs: 550,  fallSec: 3,   badChance: 0.30 }
};
const BAD_DROP_PENALTY = 2;

// ---- End-of-game messages ----
const WIN_MESSAGES = [
  "You did it! Clean water for everyone!",
  "Amazing! You're making a splash!",
  "Goal reached! Every drop counts!",
  "Incredible! You're a water hero!"
];
const LOSE_MESSAGES = [
  "So close! Give it another try.",
  "Not quite. Dodge those dirty drops!",
  "Keep going! Every drop counts.",
  "Almost there! Try again."
];

// ---- DOM references ----
const container = document.getElementById("game-container");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const startBtn = document.getElementById("start-btn");
const messageEl = document.getElementById("message");
const goalText = document.getElementById("goal-text");
const diffButtons = document.querySelectorAll(".diff-btn");

// ---- Game state ----
let level = "normal";
let score = 0;
let timeLeft = DIFFICULTY[level].time;
let spawnTimer = null;
let countdownTimer = null;
let playing = false;

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function updateIdleDisplay() {
  const cfg = DIFFICULTY[level];
  timeEl.textContent = cfg.time;
  goalText.textContent =
    `Goal: ${cfg.goal} points in ${cfg.time} seconds. Dirty drops cost ${BAD_DROP_PENALTY} points.`;
}

// ---- Difficulty selection ----
diffButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (playing) return;
    level = btn.dataset.level;
    diffButtons.forEach(b => b.classList.toggle("active", b === btn));
    updateIdleDisplay();
  });
});

// ---- Drops ----
function createDrop() {
  const cfg = DIFFICULTY[level];
  const drop = document.createElement("div");
  const isBad = Math.random() < cfg.badChance;
  const size = 30 + Math.random() * 40;

  drop.className = "water-drop" + (isBad ? " bad" : "");
  drop.style.width = drop.style.height = `${size}px`;
  drop.style.left = `${Math.random() * (container.clientWidth - size)}px`;
  drop.style.animationDuration = `${cfg.fallSec}s`;

  // Clicking removes the drop from the DOM and updates the score
  drop.addEventListener("pointerdown", () => {
    if (!playing) return;
    score = isBad ? Math.max(0, score - BAD_DROP_PENALTY) : score + 1;
    scoreEl.textContent = score;
    drop.classList.add("popped");
    drop.addEventListener("animationend", () => drop.remove(), { once: true });
  });

  // Drops that reach the bottom are removed too
  drop.addEventListener("animationend", e => {
    if (e.animationName === "fall") drop.remove();
  });

  container.appendChild(drop);
}

function clearDrops() {
  container.querySelectorAll(".water-drop").forEach(d => d.remove());
}

// ---- Game flow ----
function startGame() {
  if (playing) return;
  const cfg = DIFFICULTY[level];
  playing = true;
  score = 0;
  timeLeft = cfg.time;
  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;
  messageEl.classList.remove("show");
  clearDrops();

  startBtn.disabled = true;
  diffButtons.forEach(b => (b.disabled = true));

  spawnTimer = setInterval(createDrop, cfg.spawnMs);
  countdownTimer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  playing = false;
  clearInterval(spawnTimer);
  clearInterval(countdownTimer);
  clearDrops();

  const cfg = DIFFICULTY[level];
  const won = score >= cfg.goal;
  const text = randomFrom(won ? WIN_MESSAGES : LOSE_MESSAGES);
  messageEl.innerHTML = `<div>${text}<small>Final score: ${score} (goal: ${cfg.goal})</small></div>`;
  messageEl.classList.add("show");

  startBtn.disabled = false;
  startBtn.textContent = "Play Again";
  diffButtons.forEach(b => (b.disabled = false));
}

startBtn.addEventListener("click", startGame);
updateIdleDisplay();
