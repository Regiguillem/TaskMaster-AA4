// Cliente Socket.IO
const socket = io("http://localhost:4000");

// Obtener datos al cargar la página
document.addEventListener("DOMContentLoaded", getData);

function getData() {
  socket.emit("getPanels"); // Solicitar datos al servidor

  socket.on("panelsData", (res) => {
    try {
      const data = JSON.parse(res);
      const html = data.map(item => `
        <div class="card-body d-flex flex-column board-style" id="${item._id}">
          <h2 class="card-title">${item.title}</h2>
          <h6 class="card-subtitle mb-2 text-body-secondary">${item.subtitle}</h6>
          <p class="card-text flex-grow-1 pt-3 pb-3">${item.description}</p>
          <div class="mt-auto borrado">
            <a href="./board.html" class="btn" style="background-color: #6699cc; color: aliceblue; border: 0px;">Acceder</a>
            <button class="btn btn-danger" type="button" data-id="board-Programacion" onclick="getBoard('${item._id}')" data-bs-toggle="modal" style="background-color: #ff6666; border: 0px;">Borrar</button>
          </div>
        </div>
      `).join("");
      document.querySelector("#pizarras").insertAdjacentHTML("afterbegin", html);
    } catch (error) {
      console.error("Error parsing JSON from server:", error);
    }
  });
}

// Función para borrar un panel
function getBoard(panelId) {
  socket.emit("deletePanel", panelId); // Enviar solicitud de borrado al servidor
}

// Función para crear un nuevo panel
function createPanel() {
  const title = document.getElementById("title").value;
  const subtitle = document.getElementById("subtitle").value;
  const description = document.getElementById("description").value;

  socket.emit("createPanel", { title, subtitle, description }); // Enviar datos al servidor para crear un nuevo panel
}

// Manejo de respuestas del servidor
socket.on("mutationResponse", (data) => {
  console.log("Respuesta de la mutación:", data);
  window.location.href = "./index.html"; // Redirigir a 'index.html' después de crear un nuevo panel
});
