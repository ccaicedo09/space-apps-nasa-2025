import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  pass: {
    type: String,
    required: true
  },
  recoveryCode: {
    type: String,
    default: null
  },
  identifiers_fav: {
    type: [String],
    default: []
  }
});

export default mongoose.model("User", userSchema)