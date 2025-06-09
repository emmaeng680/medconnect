import { ObjectId } from "mongodb";
// import ChatDAO from "./chatDAO"
import appointmentSchema from "../schema/appointmentSchema.mjs";

export default class AppointmentDAO {


  static async getAppointments({ filter = null, page = 0, limit = 10 } = {}) {
    try {
      const cursor = await appointmentSchema
        .find(filter)
        .sort({ startTime: -1 })
        .skip(page * limit)
        .limit(limit);
      return cursor;
    } catch (err) {
      console.error(`Failed to retrieve appointments from DB. ${err}`);
      return [];
    }
  }

  static async searchAppointments({
    filter = null,
    searchQuery = null,
    page = 0,
    limit = 10,
  } = {}) {
    try {
      const cursor = await appointmentSchema
        .aggregate([
          {
            $match: filter,
          },
          {
            $addFields: {
              patientFullName: {
                $concat: ["$patient.firstName", " ", "$patient.lastName"],
              },
              physicianFullName: {
                $concat: ["$physician.firstName", " ", "$physician.lastName"],
              },
            },
          },
        ])
        .match(searchQuery)
        .project({ patientFullName: 0, physicianFullName: 0 })
        .sort({ startTime: -1 })
        .skip(page * limit)
        .limit(limit);

      return cursor;
    } catch (err) {
      console.error(
        `Failed to search and retrieve appointments from DB. ${err}`
      );
      return [];
    }
  }

  static async getAppointment(id) {
    try {
      return await appointmentSchema.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      console.error(`Failed to retrieve appointment in DB: ${err}`);
      return {};
    }
  }

  static async addAppointment({
    title,
    patient,
    physician,
    status,
    startTime,
    endTime,
    description,
    serviceName,
    serviceCharge,
  }) {
    try {
      const response = await appointmentSchema.create({
        title: title,
        patient: patient,
        physician: physician,
        status: status,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        description: description,
        serviceName: serviceName,
        serviceCharge: serviceCharge,
      });
      console.log("Came back from DB.");
      return { success: true, id: response._id };
    } catch (err) {
      console.error(`Failed to add a new appointment to DB. ${err}`);
      return { error: err };
    }
  }

  static async deleteAppointment(id) {
    try {
      await appointmentSchema.deleteOne({ _id: new ObjectId(id) });
      return { success: true };
    } catch (err) {
      console.error(`Failed to delete appointment from DB. ${err}`);
      return { error: err };
    }
  }

  static async updateAppointment(id, updateQuery) {
    try {
      const response = await appointmentSchema.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: { ...updateQuery },
        }
      );

      if (response.matchedCount === 0) {
        throw new Error("No appointment found with that ID.");
      }

      return { success: true };
    } catch (err) {
      console.error(`Failed to update appointment in DB. ${err}`);
      return { error: err };
    }
  }
}
