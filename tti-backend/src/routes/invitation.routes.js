const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth.middleware");
const { validateInvitation } = require("../middleware/validation.middleware");
const Invitation = require("../models/invitation.model");
const Workspace = require("../models/workspace.model");
const Project = require("../models/project.model");
const User = require("../models/user.model");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Create invitation
router.post("/", auth, validateInvitation, async (req, res) => {
  try {
    const { email, workspaceId, projectId, role } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already a member
    const workspace = await Workspace.findById(workspaceId);
    if (workspace.members.includes(user._id)) {
      return res.status(400).json({ message: "User is already a member" });
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invitation = new Invitation({
      email,
      workspace: workspaceId,
      project: projectId,
      role,
      token,
      expiresAt,
      invitedBy: req.user._id,
    });

    await invitation.save();

    // Send invitation email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const invitationUrl = `${process.env.FRONTEND_URL}/invitation/${token}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Invitation to join workspace",
      html: `
        <h1>You've been invited to join a workspace</h1>
        <p>Click the link below to accept the invitation:</p>
        <a href="${invitationUrl}">Accept Invitation</a>
        <p>This invitation will expire in 7 days.</p>
      `,
    });

    res.status(201).json({ message: "Invitation sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept invitation
router.post("/accept/:token", auth, async (req, res) => {
  try {
    const invitation = await Invitation.findOne({
      token: req.params.token,
      status: "pending",
      expiresAt: { $gt: new Date() },
    });

    if (!invitation) {
      return res.status(404).json({ message: "Invalid or expired invitation" });
    }

    // Update workspace members
    await Workspace.findByIdAndUpdate(invitation.workspace, {
      $addToSet: { members: req.user._id },
    });

    // If project invitation, update project members
    if (invitation.project) {
      await Project.findByIdAndUpdate(invitation.project, { $addToSet: { members: req.user._id } });
    }

    // Update invitation status
    invitation.status = "accepted";
    await invitation.save();

    res.json({ message: "Invitation accepted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject invitation
router.post("/reject/:token", auth, async (req, res) => {
  try {
    const invitation = await Invitation.findOneAndUpdate(
      {
        token: req.params.token,
        status: "pending",
        expiresAt: { $gt: new Date() },
      },
      { status: "rejected" }
    );

    if (!invitation) {
      return res.status(404).json({ message: "Invalid or expired invitation" });
    }

    res.json({ message: "Invitation rejected successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's pending invitations
router.get("/pending", auth, async (req, res) => {
  try {
    const invitations = await Invitation.find({
      email: req.user.email,
      status: "pending",
      expiresAt: { $gt: new Date() },
    }).populate("workspace project invitedBy");

    res.json(invitations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all invitations
router.get("/", auth, async (req, res) => {
  try {
    const invitations = await Invitation.find()
      .populate("workspace", "name")
      .populate("project", "name")
      .populate("invitedBy", "name email");
    res.json(invitations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
