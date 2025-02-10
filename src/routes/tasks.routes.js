const { Router } = require("express");
const {validateUser, verificarToken} = require("../controllers/token/token")

const {
  getAllUsers,
  getUserId,
  getUsersRol,
  createUser,
  delateTask,
  updateTask,
} = require("../controllers/tasks.controller");

const pool = require("../db");

const router = Router();

router.get("/Users", verificarToken, getAllUsers);
router.get("/Users/:rol", getUsersRol);

router.get("/User/:id", getUserId);

router.post("/register", createUser);
router.post("/auth", validateUser);

router.delete("/tasks", delateTask);

router.put("/tasks", updateTask);

module.exports = router;
