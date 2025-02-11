const Appointment = require("../models/Appointment");

// Obtener todas las citas
const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.getAppointments();
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar el estado de una cita
const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { newStatus } = req.body;

  try {
    const updatedAppointment = await Appointment.updateAppointmentStatus(id, newStatus);
    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateAppointmentLinks = async (req, res) => {
  const { id } = req.params;
  const { linkteleconsulta } = req.body;

  try {
    const updatedAppointmentLink = await Appointment.updateAppointmentLink(id, linkteleconsulta);
    res.json(updatedAppointmentLink);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Exportar las funciones
module.exports = {
  getAppointments,
  updateAppointmentStatus,
  updateAppointmentLinks,
};