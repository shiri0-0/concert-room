import mongoose from "mongoose";

const concertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  artist: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  city: String,
  description: String,

  totalSeats: {
    type: Number,
    required: true
  },

  seatLayout: {
    type: String,
    required: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Concert", concertSchema);
