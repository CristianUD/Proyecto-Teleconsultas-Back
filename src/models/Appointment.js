const pool = require("../db");

const getAppointments = async () => {
  const query = `
    SELECT 
      c.citaid,
      c.estado,
      c.fecha,
      c.hora,
      c.linkteleconsulta,
      c.pacienteid,
      c.profesionalid,
      u.nombre AS nombre_paciente
    FROM cita c
    JOIN usuario u ON c.pacienteid = u.numerodocumento
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const updateAppointmentStatus = async (id, newStatus) => {
  const query = `
    UPDATE cita
    SET estado = $1
    WHERE citaid = $2
    RETURNING *;
  `;
  const values = [newStatus, id];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const updateAppointmentLink = async (id, linkteleconsulta) => {
  const query = `
    UPDATE cita
    SET linkteleconsulta = $1
    WHERE citaid = $2
    RETURNING *;
  `;
  const values = [linkteleconsulta, id];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

module.exports = {
  getAppointments,
  updateAppointmentStatus,
  updateAppointmentLink,
};
