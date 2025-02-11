const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const taskRoutes = require("./routes/tasks.routes"); 
const appointmentsRoutes = require("./routes/appointmentsRoutes"); // Importar las rutas de citas
const recetaRoutes = require("./routes/recetaRoutes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(express.json());

// Montar las rutas
app.use(taskRoutes);
app.use("/api", appointmentsRoutes); // Montar las rutas de citas bajo /api
app.use("/api", recetaRoutes);

app.listen(4000);
console.log("Server on port 4000");