import Booking from "../models/Booking.js";
import Concert from "../models/Concert.js";

// GET BOOKED SEATS FOR A CONCERT
export const getBookedSeats = async (req, res) => {
  try {
    const { concertId } = req.params;

    const bookings = await Booking.find({ 
      concertId,
      status: "confirmed" 
    }).select("seats");

    const bookedSeats = bookings.flatMap(booking => 
      booking.seats.map(seat => seat.seatNumber)
    );

    res.json({
      success: true,
      bookedSeats
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch booked seats",
      error: error.message
    });
  }
};

// CREATE BOOKING
export const createBooking = async (req, res) => {
  try {
    const {
      concertId,
      userName,
      userEmail,
      userPhone,
      seats,
      totalAmount
    } = req.body;

    // Check if concert exists
    const concert = await Concert.findById(concertId);
    if (!concert) {
      return res.status(404).json({ message: "Concert not found" });
    }

    // Check if seats are already booked
    const existingBookings = await Booking.find({ 
      concertId,
      status: "confirmed"
    });

    const alreadyBookedSeats = existingBookings.flatMap(booking => 
      booking.seats.map(seat => seat.seatNumber)
    );

    const requestedSeats = seats.map(s => s.seatNumber);
    const conflict = requestedSeats.some(seat => 
      alreadyBookedSeats.includes(seat)
    );

    if (conflict) {
      return res.status(400).json({ 
        message: "Some seats are already booked. Please refresh and try again." 
      });
    }

    // Create booking
    const booking = new Booking({
      concertId,
      userId: req.user.id,
      userName,
      userEmail,
      userPhone,
      seats,
      totalSeats: seats.length,
      totalAmount
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: "Booking successful",
      booking
    });
  } catch (error) {
    res.status(500).json({
      message: "Booking failed",
      error: error.message
    });
  }
};

// GET USER'S BOOKINGS
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      userId: req.user.id 
    })
    .populate("concertId")
    .sort({ bookingDate: -1 });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message
    });
  }
};

// GET SINGLE BOOKING
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("concertId")
      .populate("userId", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user owns this booking
    if (booking.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch booking",
      error: error.message
    });
  }
};

// CANCEL BOOKING
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({
      success: true,
      message: "Booking cancelled successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to cancel booking",
      error: error.message
    });
  }
};