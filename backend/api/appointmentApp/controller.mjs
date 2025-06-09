import { ObjectId, Binary } from "mongodb";

import {
  UnauthorizedError,
  HttpBadRequestError,
  HttpUnauthorizedError,
  HttpInternalServerError,
} from "../errors.mjs";

import {
  User,
  Appointment,
  Service,
  Note,
  Medication,
} from "../models.mjs";

import UserDAO from "../../dao/userDAO.mjs";
import AppointmentDAO from "../../dao/appointmentDAO.mjs";
import ServiceDAO from "../../dao/serviceDAO.mjs";
import ChatDAO from "../../dao/chatDAO.mjs";
import NoteDAO from "../../dao/noteDAO.mjs";
import MedicationDAO from "../../dao/medicationDAO.mjs";
import { ChatApi } from "../chatApp/chatController.mjs";

// This class defines all APIs that are not directly called by Appointment router.
// It is done to factor out shared code that can be called by multiple router APIs.
export class AppointmentApi {
  static async deleteAppointments(filter) {
    try {
      const appointments = await AppointmentDAO.getAppointments({
        filter: filter,
        page: 0,
        limit: 0,
      });

      for (const appointment of appointments) {
        await AppointmentApi.deleteAppointment(
          appointment._id,
          appointment.chatId
        );
      }
    } catch (err) {
      throw err;
    }
  }

  static async deleteAppointment(appointmentId, chatId) {
    try {
      const chatResponse = await ChatApi.deleteChat(chatId);

      const noteResponse = await NoteDAO.deleteNotes({
        appointmentId: new ObjectId(appointmentId),
      });
      if (!noteResponse.success) {
        throw new HttpInternalServerError(noteResponse.error);
      }

      const medicationResponse = await MedicationDAO.deleteMedications({
        appointmentId: new ObjectId(appointmentId),
      });
      if (!medicationResponse.success) {
        throw new HttpInternalServerError(medicationResponse.error);
      }

      const labReportResponse = await LabReportDAO.deleteLabReports({
        appointmentId: new ObjectId(appointmentId),
      });
      if (!labReportResponse.success) {
        throw new HttpInternalServerError(labReportResponse.error);
      }

      const appointmentResponse = await AppointmentDAO.deleteAppointment(
        appointmentId
      );
      if (!appointmentResponse.success) {
        throw new HttpInternalServerError(appointmentResponse.error);
      }
    } catch (err) {
      throw err;
    }
  }
}

// This class defines all middleware APIs that are directly called by Appointment router.
export default class AppointmentController {
  static async getAppointments(req, res, next) {
    try {
      const session = req.session;
      const search = req.query.search ? req.query.search : "";
      const view = req.query.view ? req.query.view : "";
      const page = req.query.page ? parseInt(req.query.page, 10) : 0;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;

      let filter;
      if (view === "waiting") {
        const currentTime = new Date();
        filter = {
          $and: [
            {
              $or: [
                { "patient.username": session.username },
                { "physician.username": session.username },
              ],
            },
            { startTime: { $lte: currentTime } },
            { endTime: { $gt: currentTime } },
            { status: { $ne: "Done" } },
          ],
        };
      } else if (view === "payments") {
        filter = {
          $and: [
            {
              $or: [
                { "patient.username": session.username },
                { "physician.username": session.username },
              ],
            },
            { status: "Done" },
          ],
        };
      } else {
        filter = {
          $or: [
            { "patient.username": session.username },
            { "physician.username": session.username },
          ],
        };
      }

      let result;
      if (search !== "") {
        // If request has search query, search filtered appointments based on query.
        const queryRegex = new RegExp(search, "i");
        const searchQuery = {
          $or: [
            { title: queryRegex },
            { description: queryRegex },
            { patientFullName: queryRegex },
            { physicianFullName: queryRegex },
          ],
        };

        result = await AppointmentDAO.searchAppointments({
          filter,
          searchQuery,
          page,
          limit,
        });
      } else {
        // Else, filter appointments based on chosen filter.
        result = await AppointmentDAO.getAppointments({ filter, page, limit });
      }

      res.json(
        result.map((item) => {
          const appointment = new Appointment(item);
          return appointment.toShortJson();
        })
      );
    } catch (err) {
      console.error(`Failed to get appointments. ${err}`);
      res.status(500).json({ message: err.message });
    }
  }

  static async getAppointment(req, res, next) {
    try {
      const session = req.session;
      const appointmentId = req.params.id;
      const result = await AppointmentDAO.getAppointment(appointmentId);

      if (result && Object.keys(result).length === 0) {
        res.json({});
      }

      if (
        result.patient.username !== session.username &&
        result.physician.username !== session.username
      ) {
        res.json({});
      }

      res.json(result);
    } catch (err) {
      console.error(`Failed to get appointment. ${err}`);
      res.status(500).json({ message: err.message });
    }
  }

  static async addAppointment(req, res, next) {
    try {
      console.log("addAppointment");
      const appointmentInfo = req.body;
      console.log(appointmentInfo);

      if (!appointmentInfo) {
        throw new HttpBadRequestError("Invalid request. Bad input parameters.");
      }

      const patientUser = await UserDAO.getUser(appointmentInfo.patient);
      console.log("Came back from patientUser");

      if (!patientUser || (patientUser && !Object.keys(patientUser).length)) {
        throw new HttpBadRequestError("Invalid request. Bad input parameters.");
      }

      const physicianUser = await UserDAO.getUser(appointmentInfo.physician);
      console.log("Came back from doctorgetUser");
      if (
        !physicianUser ||
        (physicianUser && !Object.keys(physicianUser).length)
      ) {
        throw new HttpBadRequestError("Invalid request. Bad input parameters.");
      }

      const service = await ServiceDAO.getService(appointmentInfo.serviceId);
      if (!service || (service && !Object.keys(service).length)) {
        throw new HttpBadRequestError("Invalid request. Bad input parameters.");
      }
      console.log("Came back from service");

      let appointmentResponse, chatResponse;

      try {
        appointmentResponse = await AppointmentDAO.addAppointment({
          title: appointmentInfo.title,
          patient: new User(patientUser).toShortJson(),
          physician: new User(physicianUser).toShortJson(),
          status: "Pending",
          startTime: appointmentInfo.startTime,
          endTime: appointmentInfo.endTime,
          description: appointmentInfo.description,
          serviceName: service.name,
          serviceCharge: service.rate,
        });

        if (!appointmentResponse.success) {
          throw appointmentResponse.error;
        }

        chatResponse = await ChatDAO.addChat({
          title: appointmentInfo.title,
          host: new User(patientUser).toShortJson(),
          members: [appointmentInfo.physician],
          activeMembers: [],
          startTime: appointmentInfo.startTime,
          appointmentId: appointmentResponse.id,
        });

        if (!chatResponse.success) {
          throw chatResponse.error;
        }

        await AppointmentDAO.updateAppointment(appointmentResponse.id, {
          chatId: new ObjectId(chatResponse.id),
        });

        res.status(200).json({ success: true, id: appointmentResponse.id });
      } catch (err) {
        if (appointmentResponse) {
          await AppointmentDAO.deleteAppointment(appointmentResponse.id);
        }

        if (chatResponse && chatResponse.success) {
          await ChatDAO.deleteChat(chatResponse.id);
        }

        throw new HttpInternalServerError(err);
      }
    } catch (err) {
      console.error(`Failed to add a new appointment. ${err}`);
      res.status(500).json({ message: err.message });
    }
  }

  static async deleteAppointment(req, res, next) {
    try {
      const appointmentId = req.params.id;

      const appointment = await AppointmentDAO.getAppointment(appointmentId);
      if (!appointment || (appointment && !Object.keys(appointment).length)) {
        throw new HttpInternalServerError(
          "Invalid request. Bad input parameters."
        );
      }

      await AppointmentApi.deleteAppointment(
        appointment._id,
        appointment.chatId
      );

      res.json({ success: true });
    } catch (err) {
      console.error(`Failed to delete appointment. ${err}`);
      res.status(err.statusCode).json({ message: err.message });
    }
  }

  static async updateAppointment(req, res, next) {
    try {
      const appointmentId = req.params.id;

      const updateInfo = req.body;
      if (
        !updateInfo ||
        (updateInfo && !Object.keys(updateInfo).length) ||
        typeof updateInfo !== "object"
      ) {
        throw new HttpBadRequestError("Invalid request. Bad input parameters.");
      }

      const notUpdatableFields = [
        "_id",
        "id",
        "title",
        "patient",
        "physician",
        "chatId",
      ];

      for (const field of notUpdatableFields) {
        if (updateInfo.hasOwnProperty(field)) {
          throw new HttpBadRequestError(
            `Invalid request. Cannot update field: '${field}'.`
          );
        }
      }

      const result = await AppointmentDAO.updateAppointment(
        appointmentId,
        updateInfo
      );
      if (!result.success) {
        throw new HttpInternalServerError(result.error);
      }

      res.json({ success: true });
    } catch (err) {
      console.error(`Failed to update appointment. ${err}`);
      res.status(err.statusCode).json({ message: err.message });
    }
  }

  static async getNotes(req, res, next) {
    try {
      const appointmentId = req.params.appointmentId;
      const page = req.query.page ? parseInt(req.query.page, 10) : 0;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;

      const filter = {
        appointmentId: appointmentId,
      };
      const notes = await NoteDAO.getNotes({
        filter: filter,
        page: page,
        limit: limit,
        reverse: true,
      });

      res.json(notes);
    } catch (err) {
      console.error(`Failed to get notes. ${err}`);
      res.status(err.statusCode).json({ message: err.message });
    }
  }

  static async addNote(req, res, next) {
    try {
      const noteInfo = req.body;
      const appointmentId = req.params.appointmentId;

      const appointment = await AppointmentDAO.getAppointment(appointmentId);
      if (!appointment || (appointment && !Object.keys(appointment).length)) {
        throw new HttpBadRequestError("Invalid request. Bad input parameters.");
      }

      const response = await NoteDAO.addNote({
        fromUsername: noteInfo.fromUsername,
        appointmentId: appointment._id,
        title: noteInfo.title,
        content: noteInfo.content,
        date: new Date(noteInfo.date),
      });
      if (!response.success) {
        throw new Error(response.error);
      }

      res.status(200).json({ success: true, id: response.id });
    } catch (err) {
      console.error(`Failed to add a new note. ${err}`);
      res.status(err.statusCode).json({ message: err.message });
    }
  }

  static async deleteNote(req, res, next) {
    try {
      const appointmentId = req.params.appointmentId;
      const appointment = await AppointmentDAO.getAppointment(appointmentId);
      if (!appointment || (appointment && !Object.keys(appointment).length)) {
        throw new HttpBadRequestError("Invalid request. Bad input parameters.");
      }

      const noteId = req.params.id;
      const note = await NoteDAO.getNote(noteId);
      if (!note || (note && !Object.keys(note).length)) {
        throw new HttpBadRequestError("Invalid request. Bad input parameters.");
      }

      const response = await NoteDAO.deleteNote(noteId);
      if (!response.success) {
        throw new Error(response.error);
      }

      res.json({ success: true });
    } catch (err) {
      console.error(`Failed to delete note. ${err}`);
      res.status(err.statusCode).json({ message: err.message });
    }
  }


  static async getMedications(req, res, next) {
    try {
      console.log("Medications");
      const appointmentId = req.params.appointmentId;
      const page = req.query.page ? parseInt(req.query.page, 10) : 0;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
      console.log("input", req.params);

      const filter = {
        appointmentId: appointmentId,
      };

      const medications = await MedicationDAO.getMedications({
        filter: filter,
        page: page,
        limit: limit,
        reverse: true,
      });
      console.log("Med results", medications);
      res.json(medications);
    } catch (err) {
      console.error(`Failed to get medications. ${err}`);
      res.status(err.statusCode).json({ message: err.message });
    }
  }

  static async addMedication(req, res, next) {
    try {
      console.log("Add med", req.body);
      const medicationInfo = req.body;
      if (
        !medicationInfo ||
        (medicationInfo && !Object.keys(medicationInfo).length)
      ) {
        throw new HttpBadRequestError("Invalid request. Bad input parameters.");
      }

      const appointmentId = req.params.appointmentId;
      const appointment = await AppointmentDAO.getAppointment(appointmentId);
      if (!appointment || (appointment && !Object.keys(appointment).length)) {
        throw new HttpBadRequestError("Invalid request. Bad input parameters.");
      }
      console.log("Medication appointmnet exists", appointment._id);
      const response = await MedicationDAO.addMedication({
        fromUsername: medicationInfo.fromUsername,
        toUsername: medicationInfo.toUsername,
        appointmentId: appointment._id,
        name: medicationInfo.name,
        dosage: medicationInfo.dosage,
      });
      if (!response.success) {
        throw new Error(response.error);
      }

      res.status(200).json({ success: true, id: response.id });
    } catch (err) {
      console.error(`Failed to add a new medication. ${err}`);
      res.status(err.statusCode).json({ message: err.message });
    }
  }

  static async deleteMedication(req, res, next) {
    try {
      const appointmentId = req.params.appointmentId;
      const appointment = await AppointmentDAO.getAppointment(appointmentId);
      if (!appointment || (appointment && !Object.keys(appointment).length)) {
        throw new HttpBadRequestError("Invalid request. Bad input parameters.");
      }

      const medicationId = req.params.id;
      const medication = await MedicationDAO.getMedication(medicationId);
      if (!medication || (medication && !Object.keys(medication).length)) {
        throw new HttpBadRequestError("Invalid request. Bad input parameters.");
      }

      const response = await MedicationDAO.deleteMedication(medicationId);
      if (!response.success) {
        throw new Error(response.error);
      }

      res.json({ success: true });
    } catch (err) {
      console.error(`Failed to delete medication. ${err}`);
      res.status(err.statusCode).json({ message: err.message });
    }
  }

  static async getReports(req, res, next) {
    try {
      const appointmentId = req.params.appointmentId;
      const page = req.query.page ? parseInt(req.query.page, 10) : 0;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;

      const appointment = await AppointmentDAO.getAppointment(appointmentId);
      if (!appointment || (appointment && !Object.keys(appointment).length)) {
        throw new HttpBadRequestError("Invalid request. Bad input parameters.");
      }

      const filter = {
        appointmentId: new ObjectId(appointment._id),
      };

      const labReports = await LabReportDAO.getLabReports({
        filter: filter,
        page: page,
        limit: limit,
        reverse: true,
      });
      res.json(
        labReports.map((item) => {
          const labReport = new LabReport(item);
          return labReport;
        })
      );
    } catch (err) {
      console.error(`Failed to get reports. ${err}`);
      res.status(err.statusCode).json({ message: err.message });
    }
  }

  static async addReport(req, res, next) {
    try {
      const labReportInfo = req.body;
      if (
        !labReportInfo ||
        (labReportInfo && !Object.keys(labReportInfo).length)
      ) {
        throw new HttpBadRequestError("Invalid request. Bad input parameters.");
      }

      const appointmentId = req.params.appointmentId;
      const appointment = await AppointmentDAO.getAppointment(appointmentId);
      if (!appointment || (appointment && !Object.keys(appointment).length)) {
        throw new HttpBadRequestError("Invalid request. Bad input parameters.");
      }

      const response = await LabReportDAO.addLabReport({
        fromUsername: labReportInfo.fromUsername,
        appointmentId: new ObjectId(appointment._id),
        name: labReportInfo.name,
        date: labReportInfo.date,
      });
      if (!response.success) {
        throw new Error(response.error);
      }

      res.status(200).json({ success: true, id: response.id });
    } catch (err) {
      console.error(`Failed to add a new lab report. ${err}`);
      res.status(err.statusCode).json({ message: err.message });
    }
  }

  static async deleteReport(req, res, next) {
    try {
      const appointmentId = req.params.appointmentId;
      const appointment = await AppointmentDAO.getAppointment(appointmentId);
      if (!appointment || (appointment && !Object.keys(appointment).length)) {
        throw new HttpBadRequestError("Invalid request. Bad input parameters.");
      }

      const labReportId = req.params.id;
      const labReport = await LabReportDAO.getLabReport(labReportId);
      if (!labReport || (labReport && !Object.keys(labReport).length)) {
        throw new HttpBadRequestError("Invalid request. Bad input parameters.");
      }

      const response = await LabReportDAO.deleteLabReport(labReportId);
      if (!response.success) {
        throw new Error(response.error);
      }

      res.json({ success: true });
    } catch (err) {
      console.error(`Failed to delete lab report. ${err}`);
      res.status(err.statusCode).json({ message: err.message });
    }
  }
}
