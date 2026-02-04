// ================= HEART + SOCKET =================
const heart = document.querySelector(".heart");
const secret = document.getElementById("secretMessage");

let longPressFired = false;
let pressTimer = null;

const socket = io("https://heartbeat.backend.website");

socket.on("pulse", () => {
  heart.classList.add("pulse");
  setTimeout(() => heart.classList.remove("pulse"), 800);
});

heart.addEventListener("click", (event) => {
  event.stopPropagation();

  if (longPressFired) {
    longPressFired = false;
    return;
  }

  heart.classList.add("pulse");
  socket.emit("pulse");

  fetch("https://telegram.backend.website/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "❤️" })
  }).catch(() => {});

  setTimeout(() => heart.classList.remove("pulse"), 800);
});

// ================= KYIV TIME COUNTER =================
const TZ = "Europe/Kyiv";

const dtf = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
});

function getKyivParts() {
  const parts = dtf.formatToParts(new Date());
  const get = (t) => +parts.find(p => p.type === t).value;
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute")
  };
}

// Start date: February 15, 2025 00:00 (Kyiv)
const start = { year: 2025, month: 2, day: 15, hour: 0, minute: 0 };

function updateKyivCounter() {
  const now = getKyivParts();

  let years = now.year - start.year;
  let months = now.month - start.month;
  let days = now.day - start.day;
  let hours = now.hour - start.hour;
  let minutes = now.minute - start.minute;

  if (minutes < 0) { minutes += 60; hours--; }
  if (hours < 0) { hours += 24; days--; }
  if (days < 0) {
    const daysInPrevMonth = new Date(now.year, now.month - 1, 0).getDate();
    days += daysInPrevMonth;
    months--;
  }
  if (months < 0) { months += 12; years--; }

  const el = document.getElementById("kyivCounter");
  if (!el) return;

  el.textContent =
    `${years} year${years !== 1 ? "s" : ""} ` +
    `${months} month${months !== 1 ? "s" : ""} ` +
    `${days} day${days !== 1 ? "s" : ""} ` +
    `${hours} hour${hours !== 1 ? "s" : ""} ` +
    `${minutes} minute${minutes !== 1 ? "s" : ""}`;

  el.classList.add("fade-in");
}

updateKyivCounter();
setInterval(updateKyivCounter, 60000);

// ================= PHRASE OF THE DAY (Kyiv, random order, no repeats) =================
const PHRASES = [
  "Forever",
  "My favorite person",
  "You feel like home",
  "You are my calm",
  "I’d choose you again",
  "This smile again",
  "In every lifetime",
  "You are my safe place",
  "With you, it’s easy",
  "I feel right with you",
  "Home is you",
  "You’re my little monkey",
  "You’re my medicine",
  "You make even bad days lighter"
];

const KEY_ORDER = "hb_phrase_order_v1";
const KEY_START_DAY = "hb_phrase_start_day_v1";
const KEY_CYCLE = "hb_phrase_cycle_v1";

const dtfDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

function getKyivDayNumber() {
  const parts = dtfDate.formatToParts(new Date());
  const get = (t) => +parts.find(p => p.type === t).value;
  const y = get("year");
  const m = get("month");
  const d = get("day");
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function loadOrderState() {
  const len = PHRASES.length;
  const today = getKyivDayNumber();

  let order = null;
  let startDay = null;
  let cycle = null;

  try { order = JSON.parse(localStorage.getItem(KEY_ORDER)); } catch { order = null; }
  startDay = Number(localStorage.getItem(KEY_START_DAY));
  cycle = Number(localStorage.getItem(KEY_CYCLE));

  const orderValid =
    Array.isArray(order) &&
    order.length === len &&
    order.every(n => Number.isInteger(n) && n >= 0 && n < len);

  const startValid = Number.isFinite(startDay) && startDay > 0;
  const cycleValid = Number.isFinite(cycle) && cycle >= 0;

  if (!orderValid || !startValid || !cycleValid || today < startDay) {
    const freshOrder = shuffleArray([...Array(len).keys()]);
    localStorage.setItem(KEY_ORDER, JSON.stringify(freshOrder));
    localStorage.setItem(KEY_START_DAY, String(today));
    localStorage.setItem(KEY_CYCLE, "0");
    return { order: freshOrder, startDay: today, cycle: 0 };
  }

  const offsetDays = today - startDay;
  const cycleNow = Math.floor(offsetDays / len);

  if (cycleNow > cycle) {
    const newOrder = shuffleArray([...Array(len).keys()]);
    localStorage.setItem(KEY_ORDER, JSON.stringify(newOrder));
    localStorage.setItem(KEY_CYCLE, String(cycleNow));
    return { order: newOrder, startDay, cycle: cycleNow };
  }

  return { order, startDay, cycle };
}

function getPhraseOfToday() {
  const { order, startDay } = loadOrderState();
  const len = PHRASES.length;
  const today = getKyivDayNumber();
  const offsetDays = Math.max(0, today - startDay);
  const idx = offsetDays % len;
  return PHRASES[order[idx]];
}

// ================= SECRET MESSAGE (LONG PRESS 4s) =================
function showSecretMessage() {
  if (!secret) return;

  longPressFired = true;
  secret.textContent = getPhraseOfToday();
  secret.classList.add("show");

  setTimeout(() => {
    secret.classList.remove("show");
  }, 2500);
}

heart.addEventListener("pointerdown", () => {
  longPressFired = false;
  pressTimer = setTimeout(showSecretMessage, 4000);
});

function cancelLongPress() {
  clearTimeout(pressTimer);
}

heart.addEventListener("pointerup", cancelLongPress);
heart.addEventListener("pointerleave", cancelLongPress);
heart.addEventListener("pointercancel", cancelLongPress);

// ================= SOFT NIGHT MODE (Kyiv) =================
function updateNightMode() {
  const kyivHour = getKyivParts().hour;

  // Night: 21:00 – 06:59
  if (kyivHour >= 21 || kyivHour < 7) {
    document.body.classList.add("night");
  } else {
    document.body.classList.remove("night");
  }
}

updateNightMode();
setInterval(updateNightMode, 60000);
