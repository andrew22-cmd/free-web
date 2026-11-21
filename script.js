const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const yesMessage = document.getElementById("yesMessage");
const character = document.getElementById("character");
const actions = document.getElementById("actions");
const heading = document.querySelector("h1");
const question = document.querySelector(".question");
const floatingHearts = document.getElementById("floatingHearts");
const mainScreen = document.getElementById("mainScreen");
const celebrationScreen = document.getElementById("celebrationScreen");
const burstLayer = document.getElementById("burstLayer");
const loveCard = document.querySelector(".love-card");

const YES_MESSAGE = "طب اتصالحي 🤨";

const burstIcons = ["💗", "🌸", "💖", "✨", "💕", "🌷", "🎉"];
let yesEscapeArmed = false;
let yesLastEscapeAt = 0;
let yesCurrentX = 0;
let yesCurrentY = 0;
const YES_ESCAPE_RADIUS = 110;
const YES_ESCAPE_COOLDOWN = 550;

const isTouchDevice = window.matchMedia("(hover: none)").matches || "ontouchstart" in window;

function buildFloatingHearts(count = 22) {
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i += 1) {
    const heart = document.createElement("span");
    heart.className = "float-heart";
    heart.textContent = Math.random() > 0.2 ? "♥" : "💗";
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${12 + Math.random() * 22}px`;
    heart.style.animationDuration = `${8 + Math.random() * 8}s`;
    heart.style.animationDelay = `${-Math.random() * 12}s`;
    heart.style.setProperty("--drift", `${Math.random() * 90 - 45}px`);
    fragment.appendChild(heart);
  }

  floatingHearts.appendChild(fragment);
}

function popYesMessage(message) {
  if (!yesMessage) return;
  yesMessage.style.opacity = "0";
  yesMessage.style.transform = "translateY(6px)";

  window.setTimeout(() => {
    yesMessage.textContent = message;
    yesMessage.style.opacity = "1";
    yesMessage.style.transform = "translateY(0)";
  }, 120);
}

let lastYesTriggerAt = 0;

function handleYesClick(event) {
  if (event && event.type === "pointerdown") {
    event.preventDefault();
  }

  const now = performance.now();
  if (now - lastYesTriggerAt < 250) {
    return;
  }
  lastYesTriggerAt = now;

  // Briefly pause escape so the click feels firm and satisfying
  yesLastEscapeAt = now + 900;

  popYesMessage(YES_MESSAGE);

  if (character) {
    character.classList.add("sad");
    character.animate(
      [
        { transform: "translateY(0) scale(1)" },
        { transform: "translateY(-6px) scale(1.05)" },
        { transform: "translateY(0) scale(1)" }
      ],
      {
        duration: 380,
        easing: "ease-out"
      }
    );
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function rectsOverlap(a, b) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

function expandRect(rect, padding) {
  return {
    left: rect.left - padding,
    right: rect.right + padding,
    top: rect.top - padding,
    bottom: rect.bottom + padding
  };
}

function getButtonRectAt(x, y, width, height) {
  return {
    left: x - width / 2,
    right: x + width / 2,
    top: y - height / 2,
    bottom: y + height / 2
  };
}

function getAllowedBounds(width, height) {
  const cardRect = loveCard.getBoundingClientRect();
  const pad = 20;

  // Keep button strictly inside love-card and visible viewport so it never exits the frame or disappears
  const leftLimit = Math.max(cardRect.left + pad, pad);
  const rightLimit = Math.min(cardRect.right - pad, window.innerWidth - pad);
  const topLimit = Math.max(cardRect.top + 95, pad); // below character heart face
  const bottomLimit = Math.min(cardRect.bottom - pad, window.innerHeight - pad);

  const minX = leftLimit + width / 2;
  const maxX = Math.max(minX, rightLimit - width / 2);
  const minY = topLimit + height / 2;
  const maxY = Math.max(minY, bottomLimit - height / 2);

  return { minX, maxX, minY, maxY };
}

function isCandidateSafe(x, y, width, height, bounds, noBtnRect) {
  if (x < bounds.minX || x > bounds.maxX || y < bounds.minY || y > bounds.maxY) {
    return false;
  }

  if (noBtnRect) {
    const candidateRect = getButtonRectAt(x, y, width, height);
    if (rectsOverlap(candidateRect, expandRect(noBtnRect, 14))) {
      return false;
    }
  }

  return true;
}

function armYesEscape() {
  if (yesEscapeArmed || isTouchDevice) {
    return;
  }

  const yesRect = yesBtn.getBoundingClientRect();
  yesCurrentX = yesRect.left + yesRect.width / 2;
  yesCurrentY = yesRect.top + yesRect.height / 2;

  // Insert transparent placeholder so noBtn never shifts from its position
  const placeholder = document.createElement("div");
  placeholder.className = "btn-placeholder";
  placeholder.style.width = `${yesRect.width}px`;
  placeholder.style.height = `${yesRect.height}px`;
  placeholder.style.visibility = "hidden";
  placeholder.style.pointerEvents = "none";
  actions.insertBefore(placeholder, yesBtn);

  yesBtn.style.setProperty("--yes-left", `${yesCurrentX.toFixed(1)}px`);
  yesBtn.style.setProperty("--yes-top", `${yesCurrentY.toFixed(1)}px`);
  yesBtn.classList.add("escape-mode");
  yesEscapeArmed = true;
}

function applyYesPosition(x, y) {
  yesCurrentX = x;
  yesCurrentY = y;
  yesBtn.style.setProperty("--yes-left", `${x.toFixed(1)}px`);
  yesBtn.style.setProperty("--yes-top", `${y.toFixed(1)}px`);
  yesLastEscapeAt = performance.now();
}

function escapeYesButton(pointerX, pointerY) {
  if (isTouchDevice || celebrationScreen.classList.contains("screen-active")) {
    return;
  }

  armYesEscape();
  const now = performance.now();

  if (now - yesLastEscapeAt < YES_ESCAPE_COOLDOWN) {
    return;
  }

  const yesRect = yesBtn.getBoundingClientRect();
  const centerX = yesRect.left + yesRect.width / 2;
  const centerY = yesRect.top + yesRect.height / 2;
  const distance = Math.hypot(pointerX - centerX, pointerY - centerY);

  if (distance > YES_ESCAPE_RADIUS) {
    return;
  }

  const width = yesRect.width;
  const height = yesRect.height;
  const bounds = getAllowedBounds(width, height);
  const noBtnRect = noBtn.getBoundingClientRect();
  const angleAway = Math.atan2(centerY - pointerY, centerX - pointerX);

  // Strategy 1: Escape directly away from pointer with a slight jitter
  for (let i = 0; i < 16; i += 1) {
    const strength = 75 + Math.random() * 65;
    const jitter = (Math.random() - 0.5) * 1.2;
    const candidateX = centerX + Math.cos(angleAway + jitter) * strength;
    const candidateY = centerY + Math.sin(angleAway + jitter) * strength;

    if (isCandidateSafe(candidateX, candidateY, width, height, bounds, noBtnRect)) {
      applyYesPosition(candidateX, candidateY);
      return;
    }
  }

  // Strategy 2: Deflect sideways along the frame if cornered
  const deflections = [
    angleAway + Math.PI / 2,
    angleAway - Math.PI / 2,
    angleAway + Math.PI * 0.75,
    angleAway - Math.PI * 0.75
  ];
  for (const angle of deflections) {
    for (let s = 65; s <= 135; s += 25) {
      const candidateX = centerX + Math.cos(angle) * s;
      const candidateY = centerY + Math.sin(angle) * s;

      if (isCandidateSafe(candidateX, candidateY, width, height, bounds, noBtnRect)) {
        applyYesPosition(candidateX, candidateY);
        return;
      }
    }
  }

  // Strategy 3: Pick the safest spot inside the frame farthest from the cursor
  let bestCandidate = null;
  let maxDistance = -1;

  for (let i = 0; i < 24; i += 1) {
    const candidateX = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
    const candidateY = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);

    if (isCandidateSafe(candidateX, candidateY, width, height, bounds, noBtnRect)) {
      const d = Math.hypot(candidateX - pointerX, candidateY - pointerY);
      if (d > maxDistance) {
        maxDistance = d;
        bestCandidate = { x: candidateX, y: candidateY };
      }
    }
  }

  if (bestCandidate) {
    applyYesPosition(bestCandidate.x, bestCandidate.y);
  }
}

function keepYesInViewport() {
  if (!yesEscapeArmed) {
    return;
  }

  const rect = yesBtn.getBoundingClientRect();
  const bounds = getAllowedBounds(rect.width, rect.height);

  yesCurrentX = clamp(yesCurrentX || rect.left + rect.width / 2, bounds.minX, bounds.maxX);
  yesCurrentY = clamp(yesCurrentY || rect.top + rect.height / 2, bounds.minY, bounds.maxY);
  yesBtn.style.setProperty("--yes-left", `${yesCurrentX.toFixed(1)}px`);
  yesBtn.style.setProperty("--yes-top", `${yesCurrentY.toFixed(1)}px`);
}

function createBurst(amount = 55) {
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < amount; i += 1) {
    const item = document.createElement("span");
    item.className = "burst-item";
    item.textContent = burstIcons[Math.floor(Math.random() * burstIcons.length)];
    item.style.left = `${Math.random() * 100}%`;
    item.style.top = `${62 + Math.random() * 28}%`;
    item.style.fontSize = `${14 + Math.random() * 22}px`;
    item.style.setProperty("--x", `${Math.random() * 320 - 160}px`);
    item.style.setProperty("--y", `${-160 - Math.random() * 300}px`);
    item.style.setProperty("--r", `${Math.random() * 340 - 170}deg`);

    item.addEventListener("animationend", () => item.remove(), { once: true });
    fragment.appendChild(item);
  }

  burstLayer.appendChild(fragment);
}

function launchCelebration() {
  mainScreen.classList.remove("screen-active");

  window.setTimeout(() => {
    celebrationScreen.classList.add("screen-active");
    celebrationScreen.classList.add("show-love");
    createBurst(85);

    // Keep the celebration alive with repeated smaller bursts.
    let rounds = 0;
    const loop = window.setInterval(() => {
      createBurst(34);
      rounds += 1;
      if (rounds > 4) {
        window.clearInterval(loop);
      }
    }, 700);
  }, 260);
}

yesBtn.addEventListener("pointerdown", handleYesClick);
yesBtn.addEventListener("click", handleYesClick);
noBtn.addEventListener("click", launchCelebration);

if (!isTouchDevice) {
  document.addEventListener("pointermove", (event) => {
    escapeYesButton(event.clientX, event.clientY);
  });

  window.addEventListener("resize", keepYesInViewport);
}

buildFloatingHearts();
