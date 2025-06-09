import { ObjectId } from "mongodb";
import chatSchema from "../schema/chatSchema.mjs";

export default class ChatDAO {


  static async getChats({ filter = {}, page = 0, limit = 10 } = {}) {
    try {
      const cursor = await chatSchema
        .find(filter)
        .sort({ startTime: -1 })
        .skip(page * limit)
        .limit(limit);
      return cursor;
    } catch (err) {
      console.error(`Failed to retrieve chats from DB. ${err}`);
      return [];
    }
  }

  static async getChat(id) {
    try {
      return await chatSchema.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      console.error(`Failed to retrieve chat from DB: ${err}`);
      return {};
    }
  }

  static async addChat({
    title,
    host,
    members,
    activeMembers,
    startTime,
    appointmentId = null,
  }) {
    try {
      if (host.username) {
        members.push(host.username);
      }

      const result = await chatSchema.create({
        title: title,
        host: host,
        members: members,
        activeMembers: activeMembers ? activeMembers : [],
        startTime: new Date(startTime),
        appointmentId: appointmentId ? new ObjectId(appointmentId) : null,
      });

      return { success: true, id: result._id };
    } catch (err) {
      console.error(`Failed to add new chat to DB. ${err}`);
      return { error: err };
    }
  }

  static async deleteChat(id) {
    try {
      await chatSchema.deleteOne({ _id: new ObjectId(id) });
      return { success: true };
    } catch (err) {
      console.error(`Failed to delete chat from DB. ${err}`);
      return { error: err };
    }
  }

  static async addActiveMember({ chatId, username }) {
    try {
      const result = await chatSchema.updateOne(
        { _id: new ObjectId(chatId) },
        {
          $push: {
            activeMembers: username,
          },
        }
      );

      return { success: true };
    } catch (err) {
      console.error(`Failed to add a new active member to DB. ${err}`);
      return { error: err };
    }
  }

  static async deleteActiveMember({ chatId, username }) {
    try {
      const result = await chatSchema.updateOne(
        { _id: new ObjectId(chatId) },
        {
          $pull: {
            activeMembers: username,
          },
        }
      );

      return { success: true };
    } catch (err) {
      console.error(`Failed to delete active member from DB. ${err}`);
      return { error: err };
    }
  }
}
