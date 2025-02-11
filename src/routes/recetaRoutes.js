const express = require("express");
const router = express.Router();
const pool = require("../db");

// Obtener usuarios
router.get("/usuarios", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT nombre, numerodocumento FROM usuario WHERE rol = 'Paciente'");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener medicamentos
router.get("/medicamentos", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM medicamento");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Guardar receta
router.post("/recetas", async (req, res) => {
    const { consultaid, fechaEmision, indicaciones, medicamentos } = req.body;
    try {
      // Insertar receta
      const recetaQuery = `
        INSERT INTO receta (consultaid, fechaemision, indicaciones)
        VALUES ($1, $2, $3)
        RETURNING recetaid;
      `;
      const recetaValues = [consultaid, fechaEmision, indicaciones];
      const { rows } = await pool.query(recetaQuery, recetaValues);
      const recetaId = rows[0].recetaid;
  
      // Insertar medicamentos asociados
      for (const medicamentoId of medicamentos) {
        await pool.query(
          "INSERT INTO recetamedicamento (recetaid, medicamentoid) VALUES ($1, $2)",
          [recetaId, medicamentoId]
        );
      }
  
      res.json({ success: true, recetaId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

router.get("/consultas", async (req, res) => {
    const { usuarioId } = req.query;
    try {
      const query = `
        SELECT C.consultaid, C.notasmedicas
        FROM consulta C
        JOIN cita I ON C.citaid = I.citaid
        JOIN usuario U ON I.pacienteid = U.numerodocumento
        WHERE U.numerodocumento = $1;
      `;
      const { rows } = await pool.query(query, [usuarioId]);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

router.get("/citas", async (req, res) => {
    const { numerodocumento } = req.query; // Obtener numerodocumento de la query string

    try {
        const query = `
            SELECT CITAID, FECHA
            FROM CITA
            WHERE ESTADO = 'Confirmada' AND PACIENTEID = $1`; // Usar $1 para parámetros

        const { rows } = await pool.query(query, [numerodocumento]); // Pasar numerodocumento como parámetro

        res.json(rows); // Enviar las citas encontradas
    } catch (error) {
        console.error("Error al obtener las citas:", error); // Loguear el error
        res.status(500).json({ error: error.message }); // Enviar error 500 con mensaje
    }
});

router.post("/historia", async (req, res) => {
    const { citaid, notasmedicas } = req.body;

    try {
        // Verificar si la cita existe y está confirmada (opcional, pero recomendado)
        const citaQuery = "SELECT 1 FROM CITA WHERE CITAID = $1 AND ESTADO = 'Confirmada'";
        const { rowCount: citaExists } = await pool.query(citaQuery, [citaid]);

        if (!citaExists) {
            return res.status(400).json({ error: "La cita no existe o no está confirmada." });
        }

        // Insertar o actualizar la consulta
        const consultaQuery = `
            INSERT INTO consulta (citaid, notasmedicas)
            VALUES ($1, $2)
            ON CONFLICT (citaid) DO UPDATE SET notasmedicas = $2`; // Actualiza si ya existe

        const { rows } = await pool.query(consultaQuery, [citaid, notasmedicas]);

        res.status(201).json({ message: "Historia/Consulta guardada exitosamente", consulta: rows[0] }); // 201 Created
    } catch (error) {
        console.error("Error al guardar la historia/consulta:", error);
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;