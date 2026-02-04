document.addEventListener("DOMContentLoaded", () => {
  const heart = document.querySelector(".heart");

  // Socket.io
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
    })
      .then(r => r.text())
      .then(d => console.log("Telegram sending:", d))
      .catch(e => console.error("Sending error:", e));

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
  const start = {
    year: 2025,
    month: 2,
    day: 15,
    hour: 0,
    minute: 0
  };

  function updateKyivCounter() {
    const now = getKyivParts();

    let y = now.year - start.year;
    let m = now.month - start.month;
    let d = now.day - start.day;
    let h = now.hour - start.hour;
    let min = now.minute - start.minute;

    if (min < 0) { min += 60; h--; }
    if (h < 0) { h += 24; d--; }
    if (d < 0) {
      const daysInPrevMonth = new Date(now.year, now.month - 1, 0).getDate();
      d += daysInPrevMonth;
      m--;
    }
    if (m < 0) { m += 12; y--; }

    const el = document.getElementById("kyivCounter");
    if (!el) return;

    el.textContent =
      `${y} year${y !== 1 ? "s" : ""} ` +
      `${m} month${m !== 1 ? "s" : ""} ` +
      `${d} day${d !== 1 ? "s" : ""} ` +
      `${h} hour${h !== 1 ? "s" : ""} ` +
      `${min} minute${min !== 1 ? "s" : ""}`;
  }

  updateKyivCounter();
  setInterval(updateKyivCounter, 60000);
});
