import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/Users.js";

dotenv.config(); // Load environment variables

const router = express.Router();

// Start Google Login
router.get(
  "/google",
  passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
})
);

// Google Callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),

  async (req, res) => {
    const token = jwt.sign(
      {
        id: req.user._id,
        email: req.user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      message: "Google Login Successful",
      user: req.user,
      token,
    });
  }
);

export default router;