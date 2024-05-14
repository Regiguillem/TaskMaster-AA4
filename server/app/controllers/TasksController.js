const Task = require("../models/Task");

class TaskController {
  constructor(io) {
    this.io = io; // Pasamos el objeto de Socket.IO al constructor
  }
  // Get todas las tareas
  getAllTasks = async (req, res) => {
    try {
      const tasks = await Task.find();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Método para emitir un evento cuando se agregue una nueva tarea
  emitNewTaskEvent = (task) => {
    this.io.emit("newTask", task); // Emitimos un evento 'newTask' con la nueva tarea
  };

  // Método para emitir un evento cuando se actualice una tarea
  emitUpdateTaskEvent = (task) => {
    this.io.emit("updateTask", task); // Emitimos un evento 'updateTask' con la tarea actualizada
  };

  // Método para emitir un evento cuando se elimine una tarea
  emitDeleteTaskEvent = (taskId) => {
    this.io.emit("deleteTask", taskId); // Emitimos un evento 'deleteTask' con el ID de la tarea eliminada
  };

  updateTaskStatus = async (req, res) => {
    try {
      const { taskId, status } = req.body; // Se espera que taskId y status estén en el cuerpo de la solicitud
      
      // Buscar la tarea por su ID en la base de datos
      const task = await Task.findById(taskId);

      if (!task) {
        return res.status(404).json({ message: "La tarea no fue encontrada" });
      }

      // Actualizar el estado de la tarea
      task.status = status;

      // Guardar los cambios en la base de datos
      await task.save();

      // Emitir un evento de actualización de tarea
      this.emitUpdateTaskEvent(task);

      // Enviar la tarea actualizada como respuesta
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
}

module.exports = TaskController;
