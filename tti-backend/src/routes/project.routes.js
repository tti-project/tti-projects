const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth.middleware");
const Project = require("../models/project.model");
const Workspace = require("../models/workspace.model");
const User = require("../models/user.model");
const Invitation = require("../models/invitation.model");
const nodemailer = require("nodemailer");

// Helper function to send invitation email
const sendInvitationEmail = async (email, projectName, workspaceName) => {
  console.log("mail:", email);

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const invitationUrl = `${process.env.FRONTEND_URL}/invitations/request`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Invitation to join project: ${projectName}`,
    html: `
      <h1>You've been invited to join a project</h1>
      <p>Project: ${projectName}</p>
      <p>Workspace: ${workspaceName}</p>
      <p>Click the link below to view your invitations:</p>
      <a href="${invitationUrl}">View Invitations</a>
    `,
  });
};

// Create project
router.post("/", auth, async (req, res) => {
  try {
    const { name, description, workspace } = req.body;

    // Find workspace and verify access
    const workspaceData = await Workspace.findOne({
      _id: workspace,
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    });

    if (!workspaceData) {
      return res.status(404).send({ error: "Workspace not found or access denied" });
    }

    // Get unique members from workspace with their details
    const workspaceMembers = await User.find({ _id: { $in: workspaceData.members } }).select(
      "_id name email"
    );

    const members = workspaceMembers.map((member) => ({
      id: member._id.toString(),
      name: member.name,
      email: member.email,
    }));

    console.log("workspace members with details:", members);

    // Create project
    const project = new Project({
      name,
      description,
      workspace: workspaceData._id,
      owner: req.user._id,
      members: members.map((m) => m.id),
      createdBy: req.user._id,
    });

    await project.save();

    // Send invitations to new members
    if (members && members.length > 0) {
      console.log("sending invitations to members:", members);
      const existingMembers = await User.find({ _id: { $in: members.map((m) => m.id) } });
      const existingMemberEmails = existingMembers.map((member) => member.email);

      for (const member of members) {
        // Generate token and set expiration (7 days from now)
        const token = require("crypto").randomBytes(32).toString("hex");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const invitation = new Invitation({
          email: member.email,
          workspace: workspaceData._id,
          project: project._id,
          role: "member",
          invitedBy: req.user._id,
          token: token,
          expiresAt: expiresAt,
        });
        await invitation.save();
        await sendInvitationEmail(member.email, name, workspaceData.name);

        // Send socket notification
        const io = req.app.get("io");
        io.to(member.id).emit("invitationReceived", {
          invitationId: invitation._id,
          projectName: name,
          workspaceName: workspaceData.name,
          invitedBy: req.user.name,
          role: "member",
        });
      }
    }

    // Populate and return the project with member details
    const populatedProject = await Project.findById(project._id)
      .populate("owner", "name email")
      .populate("members", "name email")
      .populate("createdBy", "name email");

    res.status(201).send(populatedProject);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all projects for a workspace
router.get("/workspace/:workspaceId", auth, async (req, res) => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.workspaceId,
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    });

    if (!workspace) {
      return res.status(403).send({ error: "Access denied" });
    }

    const projects = await Project.find({ workspace: req.params.workspaceId })
      .populate("owner", "name email")
      .populate("members", "name email");

    // Transform the response to use id instead of _id
    const transformedProjects = projects.map((project) => {
      const projectObj = project.toObject();
      projectObj.id = projectObj._id;
      delete projectObj._id;

      // Transform owner and members _id to id
      if (projectObj.owner) {
        projectObj.owner.id = projectObj.owner._id;
        delete projectObj.owner._id;
      }
      if (projectObj.members && Array.isArray(projectObj.members)) {
        projectObj.members = projectObj.members.map((member) => {
          if (member && member._id) {
            member.id = member._id;
            delete member._id;
          }
          return member;
        });
      }

      return projectObj;
    });

    res.send(transformedProjects);
  } catch (error) {
    console.error("Error getting projects:", error);
    res.status(500).send(error);
  }
});

// Get a specific project
router.get("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .populate("owner", "name email")
      .populate("members", "name email");

    if (!project) {
      return res.status(404).send({ error: "Project not found" });
    }

    // Transform the response to use id instead of _id
    const projectObj = project.toObject();
    projectObj.id = projectObj._id;
    delete projectObj._id;

    // Transform owner and members _id to id
    if (projectObj.owner) {
      projectObj.owner.id = projectObj.owner._id;
      delete projectObj.owner._id;
    }
    if (projectObj.members) {
      projectObj.members = projectObj.members.map((member) => {
        member.id = member._id;
        delete member._id;
        return member;
      });
    }

    res.send(projectObj);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update project
router.patch("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).send({ error: "Project not found" });
    }

    const { members } = req.body;

    // Get current members with details
    const currentMembers = await User.find({ _id: { $in: project.members } }).select(
      "_id name email"
    );

    const oldMembers = currentMembers.map((member) => ({
      id: member._id.toString(),
      name: member.name,
      email: member.email,
    }));

    // Get new members with details
    const newMembersList = members
      ? await User.find({ _id: { $in: members } }).select("_id name email")
      : [];

    const newMembers = newMembersList.map((member) => ({
      id: member._id.toString(),
      name: member.name,
      email: member.email,
    }));

    // Find new members that weren't in the old list
    const membersToInvite = newMembers.filter(
      (newMember) => !oldMembers.some((oldMember) => oldMember.id === newMember.id)
    );

    console.log("old members:", oldMembers);
    console.log("new members:", newMembers);
    console.log("members to invite:", membersToInvite);

    // Update project with member IDs
    project.members = newMembers.map((m) => m.id);
    await project.save();

    // Send invitations to new members
    if (membersToInvite.length > 0) {
      const workspace = await Workspace.findById(project.workspace);
      for (const member of membersToInvite) {
        // Generate token and set expiration (7 days from now)
        const token = require("crypto").randomBytes(32).toString("hex");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        console.log("creating invitation for:", member.email);
        const invitation = new Invitation({
          email: member.email,
          workspace: project.workspace,
          project: project._id,
          role: "member",
          invitedBy: req.user._id,
          token: token,
          expiresAt: expiresAt,
        });
        await invitation.save();
        await sendInvitationEmail(member.email, project.name, workspace.name);

        // Send socket notification
        const io = req.app.get("io");
        io.to(member.id).emit("invitationReceived", {
          invitationId: invitation._id,
          projectName: project.name,
          workspaceName: workspace.name,
          invitedBy: req.user.name,
          role: "member",
        });
      }
    }

    // Populate and return the updated project with member details
    const updatedProject = await Project.findById(project._id)
      .populate("owner", "name email")
      .populate("members", "name email");

    res.send(updatedProject);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a project
router.delete("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).send({ error: "Project not found" });
    }

    res.send({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get project members
router.get("/:id/members", auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .populate("owner", "name email")
      .populate("members", "name email");

    if (!project) {
      return res.status(404).send({ error: "Project not found" });
    }

    // Transform the response to use id instead of _id
    const projectObj = project.toObject();

    // Transform owner and members _id to id
    const owner = {
      id: projectObj.owner._id,
      name: projectObj.owner.name,
      email: projectObj.owner.email,
    };

    const members = projectObj.members.map((member) => ({
      id: member._id,
      name: member.name,
      email: member.email,
    }));

    // Add owner to members list if not already present

    res.send(members);
  } catch (error) {
    console.error("Error getting project members:", error);
    res.status(500).send(error);
  }
});

module.exports = router;
