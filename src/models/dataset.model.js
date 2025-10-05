import mongoose from "mongoose";

const datasetSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  mission: {
    type: String,
    index: true
  },
  created_at: {
    type: Date,
    default: null
  },
  url: {
    type: String,
    required: true
  },
  thumbnail_url: {
    type: String,
    default: null
  },
  center: {
    type: String,
    default: null
  },
  center_latitude: {
    type: Number,
    default: null
  },
  center_longitude: {
    type: Number,
    default: null
  },
  description_image: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model("Dataset", datasetSchema);