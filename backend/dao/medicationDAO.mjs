import { ObjectId } from "mongodb";
import medication from "../schema/medication.mjs";

export default class MedicationDAO {


  static async getMedications({
    filter = {},
    page = 0,
    limit = 10,
    reverse = false,
  }) {
    console.log("Medication service", filter);
    try {
      const cursor = await medication
        .find(filter)
        .sort({ _id: reverse ? -1 : 1 })
        .skip(page * limit)
        .limit(limit);

      return cursor;
    } catch (err) {
      return [];
    }
  }

  static async getMedication(id) {
    console.log("getting a med");
    return await medication.findOne({ _id: new ObjectId(id) });
  }

  static async addMedication({
    fromUsername,
    toUsername,
    appointmentId,
    name,
    dosage,
  }) {
    try {
      console.log("adding a med");
      const response = await medication.create({
        fromUsername: fromUsername,
        toUsername: toUsername,
        appointmentId: appointmentId,
        name: name,
        dosage: dosage,
      });
      console.log(response);
      return { success: true, id: response._id };
    } catch (err) {
      console.error(`Failed to add a new medication to DB. ${err}`);
      return { error: err };
    }
  }

  static async deleteMedications(filter) {
    try {
      if (!filter || (filter && !Object.keys(filter).length)) {
        throw Error("No filter provided. Cannot delete all documents.");
      }

      await medication.deleteMany(filter);

      return { success: true };
    } catch (err) {
      console.error(`Failed to delete medications from DB. ${err}`);
      return { error: err };
    }
  }

  static async deleteMedication(id) {
    try {
      const response = await medication.deleteOne({ _id: new ObjectId(id) });
      return { success: true };
    } catch (err) {
      console.error(`Failed to delete medication from DB. ${err}`);
      return { error: err };
    }
  }
}
