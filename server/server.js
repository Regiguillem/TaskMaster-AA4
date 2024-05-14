const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("apollo-server-express");
const { createServer } = require("http");
const { execute, subscribe } = require("graphql");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
require("dotenv").config();

const { typeDefs } = require("./typeDefs");
const { resolvers } = require("./resolvers");
const panelRoutes = require("./app/routes/panel.routes");
const taskRoutes = require("./app/routes/task.routes");
const pubsub = require("./pubsub");

const app = express();
const httpServer = createServer(app);
const io = socketIo(httpServer);

app.use(cors());
app.use("/panel", panelRoutes);
app.use("/task", taskRoutes);
app.use(cors({
  origin: 'http://localhost:4000',  // Permitir solo solicitudes de este origen
  methods: ['GET', 'POST'],      // Permitir solo estos métodos
  allowedHeaders: ['Content-Type', 'Authorization'],  // Permitir solo estos headers
  credentials: true,             // Permite cookies de origen cruzado
  optionsSuccessStatus: 200      // Algunos navegadores (IE11, varios SmartTVs) necesitan esto
}));

// Crear esquema ejecutable
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const apolloServer = new ApolloServer({
  schema, // Usar el esquema construido aquí
  context: ({ req, res }) => ({ req, res, pubsub, io }),
});

const PORT = process.env.PORT || 8000;
const dbUrl = process.env.DB_URL;

mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Conexión a la base de datos exitosa");
    startApolloServer();
  })
  .catch((err) => {
    console.error("No se pudo conectar a la base de datos", err);
    process.exit(1);
  });

async function startApolloServer() {
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  // Creación del servidor de suscripciones
  SubscriptionServer.create(
    {
      schema, // Usar el mismo esquema aquí
      execute,
      subscribe,
    },
    {
      server: httpServer,
      path: "/graphql",
    }
  );

  // Configuración de Socket.IO
  const io = require('socket.io')(httpServer, {
    cors: {
        origin: "http://localhost:4000",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('Client connected');
    // Aquí va el manejo de eventos de Socket.IO
});
    
    io.on('connection', (socket) => {
        console.log('Client connected');
        
        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });

        socket.on('taskMoved', async (taskId, newStatus) => {
            try {
                const task = await Task.findByIdAndUpdate(taskId, { status: newStatus }, { new: true });
                pubsub.publish('TASK_MOVED', { taskUpdated: task });
                socket.broadcast.emit('taskMoved', task); // Enviar a todos menos al que originó
            } catch (error) {
                console.error('Error moving task:', error);
            }
        });
    });

  httpServer.listen(PORT, () => {
    console.log(
      `Servidor corriendo en http://localhost:${PORT}${apolloServer.graphqlPath}`
    );
  });
}
