const pool = require("../../db");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "secreto_super_seguro";

const validateUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query("SELECT * FROM usuario WHERE correo = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    const user = result.rows[0];
    console.log(user.password, password);

    if (user.password !== password) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { doc: user.numerodocumento, rol: user.rol, nombre: user.nombre },
      SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    res.json({ message: "Login extoso", token, user });
  } catch (error) {
    res.status(500).json({ error: "Error al iniciar sesion" });
  }
};

function verificarToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ error: "Acceso denegado" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token invalido" });
  }
}

module.exports = {
  validateUser,
  verificarToken,
};
