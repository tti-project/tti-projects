const express = require("express");
const router = express.Router();
const Workspace = require("../models/workspace.model");
const { auth } = require("../middleware/auth.middleware");
const Project = require("../models/project.model");

// Create a new workspace
router.post("/", auth, async (req, res) => {
  try {
    const workspace = new Workspace({
      ...req.body,
      owner: req.user._id,
      members: [req.user._id, ...req.body.members],
    });
    await workspace.save();
    res.status(201).send(workspace);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all workspaces for the current user
router.get("/", auth, async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    }).populate("owner", "name email");
    // Transform _id to id in the response
    const transformedWorkspaces = workspaces.map((workspace) => {
      const workspaceObj = workspace.toObject();
      workspaceObj.id = workspaceObj._id;
      workspaceObj.owner.id = workspaceObj.owner._id;
      delete workspaceObj.owner._id;
      delete workspaceObj._id;
      return workspaceObj;
    });
    res.send(transformedWorkspaces);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get a specific workspace
router.get("/:id", auth, async (req, res) => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .populate("owner", "name email")
      .populate("members", "name email");

    if (!workspace) {
      return res.status(404).send();
    }
    res.send(workspace);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a workspace
router.put("/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "description", "members"];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!workspace) {
      return res.status(401).send("You are not authorized to update this workspace");
    }

    // If members are being updated, update all projects in this workspace
    if (updates.includes("members")) {
      const newMembers = req.body.members;

      // Update all projects in this workspace
      await Project.updateMany({ workspace: workspace._id }, { $set: { members: newMembers } });
    }

    updates.forEach((update) => (workspace[update] = req.body[update]));
    await workspace.save();
    res.send(workspace);
  } catch (error) {
    console.error("Error updating workspace:", error);
    res.status(400).send(error);
  }
});

// Delete a workspace
router.delete("/:id", auth, async (req, res) => {
  try {
    const workspace = await Workspace.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!workspace) {
      return res.status(404).send();
    }
    res.send(workspace);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
