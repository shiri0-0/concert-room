import express from "express";
import {
  createBooking,
  getUserBookings,
  getBookingById,
  getBookedSeats,
  cancelBooking
} from "../controllers/bookingController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Get booked seats for a concert (public)
router.get("/booked-seats/:concertId", getBookedSeats);

// Create booking (protected)
router.post("/create", verifyToken, createBooking);

// Get user's bookings (protected)
router.get("/my-bookings", verifyToken, getUserBookings);

// Get single booking (protected)
router.get("/:id", verifyToken, getBookingById);

// Cancel booking (protected)
router.put("/:id/cancel", verifyToken, cancelBooking);

export default router;