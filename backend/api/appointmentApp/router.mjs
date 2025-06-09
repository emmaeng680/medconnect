import { Router } from "express";
import AppointmentCtrl from "./controller.mjs";

const router = new Router();

router
  .route("/")
  .get(AppointmentCtrl.getAppointments)
  .post(AppointmentCtrl.addAppointment);

router
  .route("/:id")
  .get(AppointmentCtrl.getAppointment)
  .put(AppointmentCtrl.updateAppointment)
  .delete(AppointmentCtrl.deleteAppointment);

router
  .route("/:appointmentId/notes")
  .get(AppointmentCtrl.getNotes)
  .post(AppointmentCtrl.addNote);

router.route("/:appointmentId/notes/:id").delete(AppointmentCtrl.deleteNote);

router
  .route("/:appointmentId/medications")
  .get(AppointmentCtrl.getMedications)
  .post(AppointmentCtrl.addMedication);

router
  .route("/:appointmentId/medications/:id")
  .delete(AppointmentCtrl.deleteMedication);


export default router;
