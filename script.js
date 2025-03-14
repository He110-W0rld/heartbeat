document.addEventListener("DOMContentLoaded", () => {
  const heart = document.querySelector(".heart");

  // const socket = io("http://00.00.00.00:3000");
  const socket = io("https://heartbeat.backend.website");

  socket.on("pulse", () => {
    heart.classList.add("pulse");
    setTimeout(() => heart.classList.remove("pulse"), 800);
  });

  heart.addEventListener("click", (event) => {
    event.stopPropagation();

    heart.classList.add("pulse");

    socket.emit("pulse");

    fetch("http://35.179.115.82:5000/notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "❤️" }),
    })
    .then(response => response.text())
    .then(data => console.log("Telegram sending:", data))
    .catch(error => console.error("Sending error:", error));

    setTimeout(() => heart.classList.remove("pulse"), 800);
  });
});
