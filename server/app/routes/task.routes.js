const express = require("express");
const router = express.Router();
const TaskController = require("../controllers/TasksController");
const taskController = new TaskController();

router.get("/tasks", taskController.getAllTasks);

// Exportar el router para poder montarlo en el archivo principal de la aplicación.
module.exports = router;

// Extensión de la ruta
const extension = "/task";

router.get(extension + "/:taskId", async (req, res) => {
  try {
    const tasks = await taskController.getAllTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las tareas" });
  }
});

router.get(extension + "/:taskId", async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const task = await taskController.getTaskById(taskId);
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ error: "Tarea no encontrada" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al buscar la tarea" });
  }
});

// Ruta para crear una nueva tarea y agregarla a un panel
router.post("/tasks", async (req, res) => {
  const task = new Task({
    description: req.body.description,
    panel: req.body.panelId,
  });

  try {
    const newTask = await task.save();
    // Agregar la tarea al panel correspondiente
    const panel = await Panel.findById(req.body.panelId);
    panel.tasks.push(newTask._id);
    await panel.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Ruta para actualizar el estado de una tarea
router.patch("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (req.body.status) {
      task.status = req.body.status;
    }
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
