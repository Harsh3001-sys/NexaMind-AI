import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/Users.js";
import bcrypt from "bcryptjs";


dotenv.config();

const router = express.Router();

// Start Google Login
router.get(
  "/google",
  passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
})
);

router.get(
  "/google/callback",
  passport.authenticate(
    "google",
    {
      failureRedirect:
        "/login",
      session: false,
    }
  ),

  async (req, res) => {

    const token =
      jwt.sign(
        {
          id: req.user._id,
          email:
            req.user.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

    const encodedUser =
      encodeURIComponent(
        JSON.stringify(
          req.user
        )
      );

    res.redirect(
      `${process.env.FRONTEND_URL}/?token=${token}&user=${encodedUser}`
    );
  }
);

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {

      // Google account exists
      if (existingUser.googleId) {
        return res.status(400).json({
          success: false,
          message:
            "Account already exists. Please login with Google.",
        });
      }

      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "Signup successful",
      user,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});


// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } =
      req.body;

    const user =
      await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Google account check
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "Please login using Google",
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      login: true,
      token,
      user,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});


// Logout
router.post("/logout", (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

export default router;