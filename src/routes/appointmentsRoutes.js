const express = require("express");
const router = express.Router();
const appointmentsController = require("../controllers/appointmentsController");

// Obtener todas las citas
router.get("/appointments", appointmentsController.getAppointments);

// Actualizar el estado de una cita
router.put("/appointments/:id/status", appointmentsController.updateAppointmentStatus);

router.put("/appointments/:id/link", appointmentsController.updateAppointmentLinks);

module.exports = router;