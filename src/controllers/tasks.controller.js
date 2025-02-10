const e = require("express");
const pool = require("../db");

const getAllUsers = async (req, res) => {
  try {
    const allUsers = await pool.query("SELECT * FROM usuario");
    res.json(allUsers.rows);
  } catch (error) {
    console.log(error.message);
  }
};

const getUsersRol = async (req, res) => {
  try {
    const { rol } = req.params;

    const result = await pool.query("SELECT * FROM usuario WHERE rol = $1", [
      rol,
    ]);

    if (result.rows.length === 0)
      return res.status(404).json({
        message: "User no found",
      });

    return res.json(result.rows[0]);
  } catch (error) {
    console.log(error.message);
  }
};

const getUserId = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM usuario WHERE numerodocumento = $1",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({
        message: "User no found",
      });

    return res.json(result.rows[0]);
  } catch (error) {
    console.log(error.message);
  }
};

const createUser = async (req, res) => {
  const { numDoc, tDoc, email, name, password, rol, celphone, address } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO usuario (numerodocumento, tipodocumento, correo, nombre, password, rol, telefono, direccion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [numDoc, tDoc, email, name, password, rol, celphone, address]
    );

    if (result.rows.length > 0) {
      return res.status(201).json({ message: "Usuario registrado", user: result.rows[0] });
    } else {
      return res.status(400).json({ error: "No se pudo registrar el usuario" });
    }
  } catch (error) {
    console.error("Error en createUser:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};


const delateTask = (req, res) => {
  res.send("Eliminando una tarea");
};

const updateTask = (req, res) => {
  res.send("Actualizando una tarea");
};

module.exports = {
  getAllUsers,
  getUserId,
  getUsersRol,
  createUser,
  delateTask,
  updateTask,
};
