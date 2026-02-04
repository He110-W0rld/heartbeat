// ================= HEART + SOCKET =================
const heart = document.querySelector(".heart");

const socket = io("https://heartbeat.backend.website");

socket.on("pulse", () => {
  heart.classList.add("pulse");
  setTimeout(() => heart.classList.remove("pulse"), 800);
});

heart.addEventListener("click", (event) => {
  event.stopPropagation();

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

// ================= SECRET MESSAGE (LONG PRESS 4s) =================
const secret = document.getElementById("secretMessage");
let pressTimer = null;

function showSecretMessage() {
  if (!secret) return;
  secret.classList.add("show");

  setTimeout(() => {
    secret.classList.remove("show");
  }, 2500);
}

heart.addEventListener("pointerdown", () => {
  pressTimer = setTimeout(showSecretMessage, 4000); // 🔥 4 seconds
});

heart.addEventListener("pointerup", () => clearTimeout(pressTimer));
heart.addEventListener("pointerleave", () => clearTimeout(pressTimer));
heart.addEventListener("pointercancel", () => clearTimeout(pressTimer));
