const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ["todo", "in_progress", "done"], // Cambio aquí para mejorar la compatibilidad
    default: "todo",
  },
  panel: { type: mongoose.Schema.Types.ObjectId, ref: "Panel", required: true },
});

module.exports = mongoose.model("Task", taskSchema);
