import mongoose from "mongoose";

const Schema = mongoose.Schema;

const serviceSchema = new Schema(
  {
    username: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    rate: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Services", serviceSchema);
