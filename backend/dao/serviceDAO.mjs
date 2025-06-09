import { ObjectId } from "mongodb";
import serviceSchema from "../schema/serviceSchema.mjs";

export default class ServiceDAO {

  static async getServices({ filter = {}, page = 0, limit = 10 }) {
    try {
      // console.log("Service", filter);
      const cursor = await serviceSchema
        .find(filter)
        .skip(page * limit)
        .limit(limit);
      // console.log("Cursor", cursor);
      return cursor;
    } catch (err) {
      return [];
    }
  }

  static async getService(id) {
    return await serviceSchema.findOne({ _id: new ObjectId(id) });
  }

  static async addService({ username, name, rate }) {
    try {
      // console.log("Adding")
      // console.log(username, name, rate);

      const rateAsNumber = Number(rate);
      if (rateAsNumber === NaN) {
        throw new Error("Invalid input. Rate must be a number.");
      }

      const response = await serviceSchema.create({
        username: username,
        name: name,
        rate: rateAsNumber,
      });
      // console.log(response);
      return { success: true, id: response._id };
    } catch (err) {
      console.error(`Failed to add a new service to DB. ${err}`);
      return { error: err };
    }
  }

  static async deleteServices(filter) {
    try {
      if (!filter || (filter && !Object.keys(filter).length)) {
        throw Error("No filter provided. Cannot delete all documents.");
      }

      await serviceSchema.deleteMany(filter);

      return { success: true };
    } catch (err) {
      console.error(`Failed to delete services from DB. ${err}`);
      return { error: err };
    }
  }

  static async deleteService(id) {
    try {
      const response = await serviceSchema.deleteOne({ _id: new ObjectId(id) });
      return { success: true };
    } catch (err) {
      console.error(`Failed to delete service from DB. ${err}`);
      return { error: err };
    }
  }
}
