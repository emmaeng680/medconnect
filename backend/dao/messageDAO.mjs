import { ObjectId } from "mongodb";
import messageSchema from "../schema/messageSchema.mjs";

export default class MessageDAO {

  static async getMessages({ filter = {}, page = 0, limit = 10 } = {}) {
    try {
      const cursor = await messageSchema
        .find(filter)
        .sort({ timestamp: -1 })
        .skip(page * limit)
        .limit(limit);
      return cursor;
    } catch (err) {
      console.error(`Failed to retrieve chat messages from DB. ${err}`);
      return [];
    }
  }

  static async getMessage(id) {
    try {
      return await messageSchema.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      console.error(`Failed to retrieve chat message from DB: ${err}`);
      return {};
    }
  }

  static async addMessage({ chatId, type, sender, timestamp, content }) {
    try {
      const result = await messageSchema.create({
        chatId: new ObjectId(chatId),
        type: type,
        sender: sender,
        timestamp: new Date(timestamp),
        content: content,
      });

      return { success: true, id: result._id };
    } catch (err) {
      console.error(`Failed to add chat message to DB: ${chatId}. ${err}`);
      return { error: err };
    }
  }

  static async deleteMessages(filter) {
    try {
      if (!filter || (filter && !Object.keys(filter).length)) {
        throw Error("No filter provided. Cannot delete all documents.");
      }

      await messageSchema.deleteMany(filter);

      return { success: true };
    } catch (err) {
      console.error(`Failed to delete chat messages from DB. ${err}`);
      return { error: err };
    }
  }

  static async deleteMessage(id) {
    try {
      await messageSchema.deleteOne({
        _id: new ObjectId(id),
      });

      return { success: true };
    } catch (err) {
      console.error(`Failed to delete chat message from DB. ${err}`);
      return { error: err };
    }
  }
}
