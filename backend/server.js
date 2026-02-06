import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import concertRoutes from "./routes/concertRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

dotenv.config();
connectDB();

const app = express();

// CORS Configuration
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/concerts", concertRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/", (req, res) => {
  res.send("🎵 Live Concert API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});