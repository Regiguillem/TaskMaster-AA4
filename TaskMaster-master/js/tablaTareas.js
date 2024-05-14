function getData() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const panelId = urlParams.get('panelId');
  console.log(urlParams.get('panelId'));
  
  
  fetch('http://localhost:4000/task/tasks')
    .then((response) => response.json())
    .then((res) => {
      res.forEach(item => {
        // Asignar el estado de la tarea al panel correspondiente según el estado
        let panel;
        switch(item.status) {
          case 'todo':
            panel = document.getElementById('todo');
            break;
          case 'in_progress':
            panel = document.getElementById('progress');
            break;
          case 'done':
            panel = document.getElementById('finish');
            break;
          default:
            panel = document.getElementById('todo'); // Por defecto, mostrar en la columna "Todo"
        }

        // Si el panel actual coincide con el panel de la tarea, mostrar la tarea en su columna respectiva
        if (panelId === item.panel) {
          // Generar el HTML para la tarea y agregarlo al panel correspondiente
          if (panel) {
            const taskHtml = `
              <p class="task bg-white border rounded p-2 m-1" draggable="true" id="task-${item._id}" ondragstart="drag(event)">${item.description}</p>
            `;
            panel.insertAdjacentHTML('beforeend', taskHtml);
          }
        }
      });
    });

    fetch('http://localhost:4000/panel/panels')
    .then((response) => response.json())
    .then((res) => {
      // Suponiendo que 'title' también viene de la respuesta
      const boardTitle = res.filter(item => item._id === panelId)
      document.getElementById("boardTitle").textContent = boardTitle[0].title;
      console.log(boardTitle)
    });
}

//codigo para implementar el drag&draw

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  const taskId = ev.dataTransfer.getData("text"); // Obtener el ID de la tarea arrastrada
  const columnId = ev.target.id; // Obtener el ID del contenedor

  // Mapear los IDs de las columnas a los estados correspondientes
  const statusMap = {
    todo: "todo",
    progress: "in_progress",
    finish: "done"
  };

  // Obtener el nuevo estado de la tarea basado en el ID de la columna
  const status = statusMap[columnId];

  // Mover la tarea al nuevo contenedor
  const taskIdfilter = taskId.substring(5)
  ev.target.appendChild(document.getElementById(taskId));
  // Emitir el evento de actualizar estado al servidor
  const mutationUpdateTaskStatus = {
    query: `
      mutation UpdateTaskStatus($taskId: ID!, $status: String!) {
        updateTaskStatus(taskId: $taskId, status: $status) {
          status
        }
      }
    `,
    variables: { taskId: taskIdfilter, status }
  };

  fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mutationUpdateTaskStatus),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('No se pudo actualizar el estado de la tarea');
      }
      return res.json();
    })
    .then((data) => {
      console.log('Estado de la tarea actualizado:', data);
    })
    .catch((error) => {
      console.error('Error al actualizar el estado de la tarea:', error);
      // Si ocurre un error, puedes revertir el movimiento de la tarea
      const originalColumn = document.getElementById('original-column-id'); // Obtén el contenedor original por su ID
      originalColumn.appendChild(document.getElementById(taskId)); // Mueve la tarea de vuelta al contenedor original
    });

  // Escuchar un evento
  socket.on('message', (data) => {
    console.log('Mensaje recibido:', data);
  });
}

//Añadir tarea

function addTask(event) {
  event.preventDefault();  // Prevenir el comportamiento de envío predeterminado
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const panelId = urlParams.get('panelId');
  const taskInput = document.getElementById("todo-input");
  const description = taskInput.value.trim();
  const taskValue = taskInput.value.trim();  // Obtener el valor ingresado y eliminar espacios en blanco
  const status = 'todo'

  if (taskValue) {
    // Agregar la nueva tarea al área de tareas "Todo"
    const newTask = document.createElement("p");
    newTask.textContent = taskValue;
    newTask.className = "task bg-white border rounded p-2 m-1";
    newTask.draggable = true;
    newTask.id = `task-${new Date().getTime()}`;  // Crear un identificador único
    newTask.setAttribute("ondragstart", "drag(event)");

    const todoLane = document.getElementById("todo");  // Suponiendo que el primer 'swim-lane' es el de "Todo"
    if (todoLane) {
      todoLane.appendChild(newTask);
    }
    taskInput.value = "";  // Limpiar el campo de entrada después de agregar la tarea
  } else {
    alert("Por favor, escribe el nombre de la tarea.");
  }



  const mutation = {
    query: `
        mutation AddTask($panelId: ID!, $description: String, $status: String) {
          addTask(panelId: $panelId, description: $description, status: $status) {
              _id,
              description,
              status
            }
        }
    `,
    variables: { panelId, description, status }
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
      console.log(data);
    })
    .catch((error) => {
      console.error('Error al ejecutar la mutación:', error);
    });
}



document.addEventListener('DOMContentLoaded', getData);
