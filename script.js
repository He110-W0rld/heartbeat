document.addEventListener("DOMContentLoaded", () => {
    const heart = document.querySelector(".heart");
  
   // const socket = io("http://35.176.160.64:3000");
   // const socket = io("https://35.176.160.64:3000", { secure: true });
    const socket = io('wss://heartbeat.backend.website/socket.io/', {
        transports: ['websocket']
    });


  
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
  
