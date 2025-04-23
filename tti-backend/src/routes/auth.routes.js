const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/auth.middleware");
const {
  refreshTokenAttemptsMiddleware,
  resetRefreshAttempts,
} = require("../middleware/refreshTokenAttempts.middleware");
const { validationResult } = require("express-validator");
const { loginValidation, registerValidation } = require("../middleware/validation.middleware");
const User = require("../models/user.model");

// Register
router.post("/register", registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    console.log("existingUser", existingUser);
    if (existingUser) {
      return res.status(400).send({ error: "Email already registered" });
    }

    // Create user - password will be hashed by the pre-save hook
    const user = new User({
      name,
      email,
      password,
      role: "member", // Default role
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = await user.generateAuthToken();

    res.status(201).send({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).send(error);
  }
});

// Login
router.post("/login", loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await user.generateAuthToken();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Logout
router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.accessToken !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

// Logout all devices
router.post("/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

// Refresh token
router.post("/refresh", refreshTokenAttemptsMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const oldRefreshToken = req.refreshToken;

    // Generate new tokens
    const { accessToken, refreshToken } = await user.generateAuthToken();

    // Remove old token pair
    user.tokens = user.tokens.filter((token) => token.refreshToken !== oldRefreshToken);
    await user.save();

    // Reset refresh attempts
    resetRefreshAttempts(user._id);

    res.send({ accessToken, refreshToken });
  } catch (error) {
    res.status(401).send({ error: "Invalid refresh token" });
  }
});

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    res.send({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
