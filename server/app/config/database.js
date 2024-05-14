const mongoose = require('mongoose');

async function connectToDatabase() {
  try {
    const dbUrl = "mongodb+srv://Taskmaster:GsjfTaYMFYOPh0mS@cluster0.clqgvp5.mongodb.net/ToDoApp?retryWrites=true&w=majority&appName=Cluster0";
    await mongoose.connect(dbUrl);
    console.info("Connected to MongoDB Atlas");
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
  }
}

module.exports = { connectToDatabase };