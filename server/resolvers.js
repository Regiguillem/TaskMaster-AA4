const { isObjectIdOrHexString } = require("mongoose");
const Panel = require("../server/app/models/Panel");
const Task = require("../server/app/models/Task");
const { PubSub } = require("graphql-subscriptions"); // Asegúrate de que PubSub se importe correctamente

const pubsub = new PubSub(); // Se inicializa aquí para este ejemplo, debería ser global si se comparte entre varios resolvers

const resolvers = {
  Query: {
    getPanels: async () => {
      return await Panel.find().populate("tasks");
    },
    getPanelById: async (_, { panelId }) => {
      return await Panel.findById(panelId).populate("tasks");
    },
    getTasks: async () => {
      return await Task.find();
    },
    getTaskById: async (_, { taskId }) => {
      return await Task.findById(taskId);
    },
  },
  Panel: {
    tasks: async (parent) => {
      return await Task.find({ panel: parent._id });
    },
  },
  Task: {
    panel: async (parent) => {
      return await Panel.findById(parent.panel);
    },
  },
  Mutation: {
    
    addTask: async (_, { description, status, panelId }, { io }) => {
      // Asumiendo que el contexto se maneja externamente
      try {
        const newTask = new Task({
          description,
          status,
          panel: panelId,
        });
        await newTask.save();
        io.emit("taskCreated", newTask); // Emite el evento de tarea creada
        pubsub.publish("TASK_ADDED", { taskAdded: newTask }); // Publica la suscripción
        return newTask;
      } catch (error) {
        console.log(error); // Registro detallado del error
        throw new Error(
          "Error al procesar la solicitud de añadir tarea: " + error.message
        );
      }
    },
    updateTask: async (_, { taskId, description, status, panelId }) => {
      try {
        const updatedTask = await Task.findByIdAndUpdate(
          taskId,
          { description, status, panel: panelId },
          { new: true }
        );
        return updatedTask;
      } catch (error) {
        throw new Error("Error al actualizar la tarea: " + error.message);
      }
    },
    deleteTask: async (_, { taskId }) => {
      try {
        const deletedTask = await Task.findByIdAndDelete(taskId);
        return deletedTask;
      } catch (error) {
        throw new Error("Error al eliminar la tarea: " + error.message);
      }
    },
    createPanel: async (_, { title, subtitle, description }) => {
      try {
        const newPanel = new Panel({
          title,
          subtitle,
          description,
        });
        await newPanel.save();
        return newPanel;
      } catch (error) {
        throw new Error("Error al crear el panel: " + error.message);
      }
    },
    updatePanel: async (_, { panelId, title, subtitle, description }) => {
      try {
        const updatedPanel = await Panel.findByIdAndUpdate(
          panelId,
          { title, subtitle, description },
          { new: true }
        );
        return updatedPanel;
      } catch (error) {
        throw new Error("Error al actualizar el panel: " + error.message);
      }
    },
    deletePanel: async (_, { panelId }) => {
      try {
        const deletedPanel = await Panel.findByIdAndDelete(panelId);
        return deletedPanel;
      } catch (error) {
        throw new Error("Error al eliminar el panel: " + error.message);
      }
    },
    updateTaskStatus: async (_, { taskId, status }) => {
      try {
        // Busca la tarea por su ID en la base de datos
        const task = await Task.findById(taskId);

        if (!task) {
          throw new Error('La tarea no fue encontrada');
        }

        // Actualiza el estado de la tarea
        task.status = status;

        // Guarda los cambios en la base de datos
        await task.save();
        io.emit("taskmoved", task); // Emite el evento de tarea creada
        pubsub.publish("TASK_MOVED", { taskUpdated: task }); // Publica la suscripción
        return task; // Devuelve la tarea actualizada
      } catch (error) {
        throw new Error(`No se pudo actualizar el estado de la tarea: ${error.message}`);
      }
    },
    
  },
  Subscription: {
    taskAdded: {
      subscribe: () => pubsub.asyncIterator("TASK_ADDED"),
    },
    taskUpdated: {
      subscribe: () => pubsub.asyncIterator("TASK_MOVED"),
    },
  },
};

module.exports = { resolvers };
