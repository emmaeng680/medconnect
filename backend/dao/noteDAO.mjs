import { ObjectId } from "mongodb";
import noteSchema from "../schema/noteSchema.mjs";

export default class NoteDAO {

  static async getNotes({
    filter = {},
    page = 0,
    limit = 10,
    reverse = false,
  }) {
    try {
      const cursor = await noteSchema
        .find(filter)
        .sort({ _id: reverse ? -1 : 1 })
        .skip(page * limit)
        .limit(limit);
      return cursor;
    } catch (err) {
      return [];
    }
  }

  static async getNote(id) {
    return await noteSchema.findOne({ _id: new ObjectId(id) });
  }

  static async addNote({ fromUsername, appointmentId, title, content, date }) {
    try {
      const response = await noteSchema.create({
        fromUsername: fromUsername,
        appointmentId: new ObjectId(appointmentId),
        title: title,
        content: content,
        date: new Date(date),
      });

      return { success: true, id: response._id };
    } catch (err) {
      console.error(`Failed to add a new degree to DB. ${err}`);
      return { error: err };
    }
  }

  static async deleteNotes(filter) {
    try {
      if (!filter || (filter && !Object.keys(filter).length)) {
        throw Error("No filter provided. Cannot delete all documents.");
      }

      await noteSchema.deleteMany(filter);

      return { success: true };
    } catch (err) {
      console.error(`Failed to delete notes from DB. ${err}`);
      return { error: err };
    }
  }

  static async deleteNote(id) {
    try {
      const response = await noteSchema.deleteOne({ _id: new ObjectId(id) });
      return { success: true };
    } catch (err) {
      console.error(`Failed to delete note from DB. ${err}`);
      return { error: err };
    }
  }
}
