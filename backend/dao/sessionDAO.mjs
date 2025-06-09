import sessionSchema from "../schema/sessionSchema.mjs";

export default class SessionDAO {


  static async getSession(id) {
    try {
      return await sessionSchema.findOne({ _id: id });
    } catch (err) {
      console.error(`Failed to retrieve session from DB. ${err}`);
      return {};
    }
  }

  static async addSession(username, startTime) {
    try {
      const response = await sessionSchema.create({
        username: username,
        startTime: new Date(startTime),
      });

      return { success: true, id: response._id };
    } catch (err) {
      console.error(`Failed to add a new session to DB. ${err}`);
      return { error: err };
    }
  }

  static async deleteSession(id) {
    try {
      await sessionSchema.deleteOne({ _id: id });
      return { success: true };
    } catch (err) {
      console.error(`Failed to delete session from DB. ${err}`);
      return { error: err };
    }
  }
}
