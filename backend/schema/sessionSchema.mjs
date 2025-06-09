import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    description: "Username of current user."
  },
  startTime: {
    type: Date,
    required: true,
    description: "Start time"
  }
}, {
  collection: 'sessions',
  strict: true,
  validateBeforeSave: true
});

export default mongoose.model('Session', sessionSchema);
