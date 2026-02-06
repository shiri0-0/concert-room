import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  concertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Concert",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userPhone: {
    type: String,
    required: true
  },
  seats: [{
    seatNumber: String,
    row: String,
    price: Number
  }],
  totalSeats: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending"
  },
  paymentMode: {
    type: String,
    enum: ["offline", "cash"],
    default: "offline"
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["confirmed", "cancelled"],
    default: "confirmed"
  }
});

export default mongoose.model("Booking", bookingSchema);