import express from "express";
import Concert from "../models/Concert.js";
import { verifyAdmin, verifyToken } from "../middleware/auth.js";

const router = express.Router();

// GET ALL CONCERTS (Public or authenticated users)
router.get("/", async (req, res) => {
  try {
    const concerts = await Concert.find()
      .populate("createdBy", "name email")
      .sort({ date: 1 });

    res.json({
      success: true,
      count: concerts.length,
      concerts
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch concerts",
      error: error.message
    });
  }
});

// GET SINGLE CONCERT
router.get("/:id", async (req, res) => {
  try {
    const concert = await Concert.findById(req.params.id)
      .populate("createdBy", "name email");

    if (!concert) {
      return res.status(404).json({ message: "Concert not found" });
    }

    res.json({
      success: true,
      concert
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch concert",
      error: error.message
    });
  }
});

// ADMIN: ADD CONCERT
router.post("/add", verifyAdmin, async (req, res) => {
  try {
    const concert = new Concert({
      ...req.body,
      createdBy: req.user.id
    });

    await concert.save();

    res.status(201).json({
      success: true,
      message: "Concert added successfully",
      concert
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add concert",
      error: error.message
    });
  }
});

// ADMIN: UPDATE CONCERT
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    const concert = await Concert.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!concert) {
      return res.status(404).json({ message: "Concert not found" });
    }

    res.json({
      success: true,
      message: "Concert updated successfully",
      concert
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update concert",
      error: error.message
    });
  }
});

// ADMIN: DELETE CONCERT
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const concert = await Concert.findByIdAndDelete(req.params.id);

    if (!concert) {
      return res.status(404).json({ message: "Concert not found" });
    }

    res.json({
      success: true,
      message: "Concert deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete concert",
      error: error.message
    });
  }
});

export default router;