const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth.middleware");
const Project = require("../models/project.model");
const Workspace = require("../models/workspace.model");
const User = require("../models/user.model");

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

    // Get workspace owner and members
    const owner = await User.findById(workspaceData.owner);
    const members = await User.find({ _id: { $in: workspaceData.members } });

    // Create project with owner and members
    const project = new Project({
      name,
      description,
      workspace: workspaceData._id,
      owner: owner._id,
      members: [owner._id, ...members.map((member) => member._id)], // Include owner in members
      createdBy: req.user._id,
    });

    await project.save();

    // Populate the response
    const populatedProject = await Project.findById(project._id)
      .populate("owner", "name email")
      .populate("members", "name email")
      .populate("createdBy", "name email");

    // Transform the response
    const projectObj = populatedProject.toObject();
    projectObj.id = projectObj._id;
    delete projectObj._id;

    if (projectObj.owner) {
      projectObj.owner.id = projectObj.owner._id;
      delete projectObj.owner._id;
    }

    if (projectObj.members) {
      projectObj.members = projectObj.members.map((member) => {
        if (member && member._id) {
          member.id = member._id;
          delete member._id;
        }
        return member;
      });
    }

    if (projectObj.createdBy) {
      projectObj.createdBy.id = projectObj.createdBy._id;
      delete projectObj.createdBy._id;
    }

    res.status(201).send(projectObj);
  } catch (error) {
    console.error("Error creating project:", error);
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

// Update a project
router.patch("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).send({ error: "Project not found" });
    }

    const updates = Object.keys(req.body);
    updates.forEach((update) => (project[update] = req.body[update]));
    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate("owner", "name email")
      .populate("members", "name email");

    // Transform the response to use id instead of _id
    const projectObj = updatedProject.toObject();
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
