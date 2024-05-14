const mongoose = require("mongoose");

const panelSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
});



module.exports = mongoose.model("Panel", panelSchema);
