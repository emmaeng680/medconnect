import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  isPhysician: {
    type: Boolean,
    required: true
  },
});

const chatSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      minLength: 1,
      description: "Title of chat.",
    },
    host: {
      type: userSchema,
      required: true,
      description: "host of chat.",
    },
    startTime: {
      type: Date,
      required: true,
      description: "Start time of chat.",
    },
    members: {
      type: [String],
      required: true,
      minLength: 1,
      description: "List of usernames of members within chat.",
    },
    activeMembers: {
      type: [String],
      required: true,
      minLength: 1,
      description: "List of usernames of members active within chat.",
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      description: "Associated appointment Id for chat.",
    },
  },
  {
    strict: "throw",
    collection: "chats",
  }
);

export default mongoose.model("Chat", chatSchema);


