import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 1,
    description: "Username of user for sign in. Must be unique.",
  },
  password: {
    type: String,
    required: true,
    minlength: 1,
    description: "Password of user for sign in.",
  },
  firstName: {
    type: String,
    required: true,
    minlength: 1,
    description: "First name of the user.",
  },
  lastName: {
    type: String,
    required: true,
    minlength: 1,
    description: "Last name of the user.",
  },
  description: {
    type: String,
    description: "About me.",
  },
  dob: {
    type: Date,
    description: "Date of Birth.",
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    description: "Gender of user.",
  },
  emailId: {
    type: String,
    description: "Email ID of user.",
  },
  phoneNumber: {
    type: String,
    description: "Phone Number of user.",
  },
  isPhysician: {
    type: Boolean,
    required: true,
    description: "Is user a physician?",
  },
  qualification: {
    type: String,
    required: function () {
      return this.isPhysician;
    },
    description: "Qualification if user is a physician.",
  },
  specialization: {
    type: String,
    required: function () {
      return this.isPhysician;
    },
    description: "Specialization if user is a physician.",
  },
});

export default mongoose.model("User", UserSchema);
