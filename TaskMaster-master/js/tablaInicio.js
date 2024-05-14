var data = []

function getData() {
    fetch('http://localhost:4000/panel/panels')
      .then((response) => {
        return response.json();
      })
      .then((res) => {
        data = res
        const response = res;
        const html = data.map(function(item) {
          return `
            <div class="card-body d-flex flex-column board-style" id="${item._id}">
              <h2 class="card-title">${item.title}</h2>
              <h6 class="card-subtitle mb-2 text-body-secondary">${item.subtitle}</h6>
              <p class="card-text flex-grow-1 pt-3 pb-3">${item.description}</p>      
              <div class="mt-auto borrado">
                <button class="btn" type="button" data-id="board-Programacion" onclick="getBoardTest('${item._id}')" data-bs-toggle="modal" style="background-color: #6699cc; color: aliceblue; border: 0px;">Acceder</button>
                <button class="btn btn-danger" type="button" data-id="board-Programacion" onclick="getBoard('${item._id}')" data-bs-toggle="modal"  style="background-color: #ff6666; border: 0px;">Borrar</button>
              </div>
            </div>`;
        }).join("");
        document.querySelector("#pizarras").insertAdjacentHTML("afterbegin", html); 
        console.log(response);
      });
  }
  function getBoardTest (panelId) {
    window.location = "./board.html?panelId=" + panelId;    
   }

  function getBoard (panelId) {  
    console.log('getBoard',panelId);  
    const mutation = {
      query: `
          mutation deletePanel($panelId: ID) {
              deletePanel(panelId: $panelId) {
                _id
              }
          }
      `,
      variables: { panelId }
  };
  fetch('http://localhost:4000/graphql', {
  method: 'POST', // POST para mutaciones
  headers: {
    'Content-Type': 'application/json', 
  },
  body: JSON.stringify(mutation), // Convertir en una cadena JSON
})
  .then((res) => res.json())
  .then((data) => {
    const board = document.getElementById(panelId)
    board.remove()
    console.log('Respuesta de la mutación:', data);
  })
  .catch((error) => {
    console.error('Error al ejecutar la mutación:', error);
  });
  }

//  Crear nuevo panel
function createPanel() {
  const title = document.getElementById('title').value;
  const subtitle = document.getElementById('subtitle').value;
  const description = document.getElementById('description').value;

  const createPanelQuery = {
    query: `
      mutation createPanel($title: String, $subtitle: String, $description: String) {
        createPanel(title: $title, subtitle: $subtitle, description: $description) {
          title
          subtitle
          description
        }
      }
    `,
    variables: { title, subtitle, description }
  };

  fetch('http://localhost:4000/graphql', {
    method: 'POST',  // Usar el método POST para mutaciones
    headers: {
      'Content-Type': 'application/json',  
    },
    body: JSON.stringify(createPanelQuery),  // Convertir el objeto en una cadena JSON
  })
  .then((res) => res.json())
  .then((data) => {
    console.log('Respuesta de la mutación:', data);
    window.location.href = './index.html';  //derigir a 'index.html'
  })
  .catch((error) => {
    console.error('Error al ejecutar la mutación:', error);
  });
}

  
  document.addEventListener('DOMContentLoaded', getData);
  