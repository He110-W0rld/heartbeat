document.addEventListener("DOMContentLoaded", () => {
    const heart = document.querySelector(".heart");
  
    const socket = io("http://00.00.00.00:3000");
  
    socket.on('pulse', () => {
      heart.classList.add("pulse");
  
      setTimeout(() => heart.classList.remove("pulse"), 800);
    });
  
    heart.addEventListener("click", (event) => {
      event.stopPropagation();
  
      heart.classList.add("pulse");
  
      socket.emit('pulse');
  
      setTimeout(() => heart.classList.remove("pulse"), 800);
    });
  });
