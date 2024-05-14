// Importar el modelo 'Panel' para poder interactuar con la base de datos.
const Panel = require("../models/Panel");

class PanelController {
  // Método para obtener todos los paneles.
  getAllPanels = async (req, res) => {
    try {
      const panels = await Panel.find().populate('tasks');
      res.json(panels); // Devolverá los documentos en un formato JSON estándar.
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

}

module.exports = PanelController;
