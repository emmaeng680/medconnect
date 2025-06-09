import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema({
  fromUsername: {
    type: String,
    required: true
  },
  toUsername: {
    type: String,
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  dosage: {
    type: Number,
    required: true
  }
});

export default mongoose.model("Medication", medicationSchema);
