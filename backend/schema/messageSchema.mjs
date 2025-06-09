import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
    description: 'Associated Chat Id of message.',
  },
  type: {
    type: String,
    enum: ['user', 'system', 'info'],
    required: true,
    description: 'Type of message.',
  },
  sender: {
    type: String,
    required: true,
    minLength: 1,
    description: 'Username of sender of message.',
  },
  timestamp: {
    type: Date,
    required: true,
    description: 'Sent time of message.',
  },
  content: {
    type: String,
    required: true,
    minLength: 1,
    description: 'Content of message.',
  },
}, {
  collection: 'messages',
  strict: 'throw',
});

export default mongoose.model("Message", messageSchema);
