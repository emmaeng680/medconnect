import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema({
  fromUsername: {
    type: String,
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  title: {
    type: String,
    required: true,
    minLength: 1
  },
  content: {
    type: String,
    required: true,
    minLength: 1
  },
  date: {
    type: Date,
    required: true
  }
});

export default mongoose.model('Note', NoteSchema);
