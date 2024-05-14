const mongoose = require("mongoose");
const Panel = require("../server/app/models/Panel");
const Task = require("../server/app/models/Task");
const { connectToDatabase } = require("./app/config/database");

async function initData() {
  try {
    // Conectarse a la base de datos
    await connectToDatabase();

    // Crear paneles
    const panel1 = new Panel({
      title: "Panel 1",
      subtitle: "Subtítulo del Panel 1",
      description: "Descripción del Panel 1",
    });

    const panel2 = new Panel({
      title: "Panel 2",
      subtitle: "Subtítulo del Panel 2",
      description: "Descripción del Panel 2",
    });

    // Guardar paneles en la base de datos
    const savedPanels = await Panel.insertMany([panel1, panel2]);

    // Crear tareas
    const task1 = new Task({
      description: "Tarea 1",
      status: "todo",
      panel: savedPanels[0]._id, // Asignar la ID del primer panel a esta tarea
    });

    const task2 = new Task({
      description: "Tarea 2",
      status: "in_progress",
      panel: savedPanels[1]._id, // Asignar la ID del segundo panel a esta tarea
    });

    // Guardar tareas en la base de datos
    await Task.insertMany([task1, task2]);

    // Obtener las tareas creadas
    const tasks = [task1, task2];

    // Actualizar los paneles con las nuevas tareas
    for (let i = 0; i < savedPanels.length; i++) {
      savedPanels[i].tasks = tasks.filter((task) =>
        task.panel.equals(savedPanels[i]._id)
      );
      await savedPanels[i].save();
    }

    console.log("Datos inicializados correctamente.");
  } catch (error) {
    console.error("Error al inicializar datos:", error);
  } finally {
    // Cerrar la conexión a la base de datos
    mongoose.disconnect();
  }
}

initData();
