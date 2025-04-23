const express = require("express");
const router = express.Router();
const { auth, checkRole } = require("../middleware/auth.middleware");
const User = require("../models/user.model");

// Get all users (admin only)
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password -tokens") // Exclude sensitive data
      .sort({ createdAt: -1 });

    // Transform the response to use id instead of _id
    const transformedUsers = users.map((user) => {
      const userObj = user.toObject();
      userObj.id = userObj._id;
      delete userObj._id;
      return userObj;
    });

    res.send(transformedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

// Get user by ID (admin or self)
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -tokens"); // Exclude sensitive data

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    // Check if user is admin or requesting their own data
    if (req.user.role !== "admin" && req.user._id.toString() !== req.params.id) {
      return res.status(403).send({ error: "Access denied" });
    }

    // Transform the response to use id instead of _id
    const userObj = user.toObject();
    userObj.id = userObj._id;
    delete userObj._id;

    res.send(userObj);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

// Update user (admin or self)
router.patch("/:id", auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "password"];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid updates" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    // Check if user is admin or updating their own data
    if (req.user.role !== "admin" && req.user._id.toString() !== req.params.id) {
      return res.status(403).send({ error: "Access denied" });
    }

    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();

    // Transform the response to use id instead of _id
    const userObj = user.toObject();
    userObj.id = userObj._id;
    delete userObj._id;
    delete userObj.password;
    delete userObj.tokens;

    res.send(userObj);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(400).send(error);
  }
});

// Delete user (admin only)
router.delete("/:id", auth, checkRole(["admin"]), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    await user.deleteOne();
    res.send({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send(error);
  }
});

module.exports = router;
