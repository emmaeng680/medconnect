import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
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

const appointmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minLength: 1
  },
  patient: {
    type: userSchema,
    required: true
  },
  physician: {
    type: userSchema,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Completed'],
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  },
  serviceName: {
    type: "String", 
  },
  serviceCharge: {
    type: "String", 
  },
});

export default mongoose.model("Appointment", appointmentSchema);
