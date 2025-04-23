const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth.middleware");
const Task = require("../models/task.model");
const Project = require("../models/project.model");
const taskController = require("../controllers/task.controller");

// Get all tasks for a project
router.get("/project/:projectId", auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    });

    if (!project) {
      return res.status(403).send({ error: "Access denied" });
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .sort({ order: 1 });

    // Transform the response to use id instead of _id
    const transformedTasks = tasks.map((task) => {
      const taskObj = task.toObject();
      taskObj.id = taskObj._id;
      delete taskObj._id;

      if (taskObj.assignee) {
        taskObj.assignee.id = taskObj.assignee._id;
        delete taskObj.assignee._id;
      }

      if (taskObj.createdBy) {
        taskObj.createdBy.id = taskObj.createdBy._id;
        delete taskObj.createdBy._id;
      }

      return taskObj;
    });

    res.send(transformedTasks);
  } catch (error) {
    console.error("Error getting tasks:", error);
    res.status(500).send(error);
  }
});

// Create a new task
router.post("/", auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.body.project,
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    });

    if (!project) {
      return res.status(403).send({ error: "Access denied" });
    }

    const task = new Task({
      ...req.body,
      createdBy: req.user._id,
    });

    await task.save();
    const populatedTask = await Task.findById(task._id)
      .populate("assignee", "name email")
      .populate("createdBy", "name email");

    // Transform the response to use id instead of _id
    const taskObj = populatedTask.toObject();
    taskObj.id = taskObj._id;
    delete taskObj._id;

    if (taskObj.assignee) {
      taskObj.assignee.id = taskObj.assignee._id;
      delete taskObj.assignee._id;
    }

    if (taskObj.createdBy) {
      taskObj.createdBy.id = taskObj.createdBy._id;
      delete taskObj.createdBy._id;
    }

    // Emit notification if task has an assignee
    if (req.body.assignee) {
      const io = req.app.get("io");
      io.to(req.body.assignee).emit("taskAssigned", {
        taskId: taskObj.id,
        taskTitle: taskObj.title,
        projectName: project.name,
        assignedBy: req.user.name,
      });
    }

    res.status(201).send(taskObj);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(400).send(error);
  }
});

// Update a task
router.patch("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      project: { $exists: true },
    });

    if (!task) {
      return res.status(404).send({ error: "Task not found" });
    }

    const project = await Project.findOne({
      _id: task.project,
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    });

    if (!project) {
      return res.status(403).send({ error: "Access denied" });
    }

    // Check if assignee is being updated
    const oldAssignee = task.assignee?.toString();
    const newAssignee = req.body.assignee;

    const updates = Object.keys(req.body);
    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("assignee", "name email")
      .populate("createdBy", "name email");

    // Transform the response to use id instead of _id
    const taskObj = updatedTask.toObject();
    taskObj.id = taskObj._id;
    delete taskObj._id;

    if (taskObj.assignee) {
      taskObj.assignee.id = taskObj.assignee._id;
      delete taskObj.assignee._id;
    }

    if (taskObj.createdBy) {
      taskObj.createdBy.id = taskObj.createdBy._id;
      delete taskObj.createdBy._id;
    }

    // Emit notification if assignee is being set or changed
    if (req.body.assignee && (!oldAssignee || oldAssignee !== req.body.assignee)) {
      const io = req.app.get("io");
      io.to(req.body.assignee).emit("taskAssigned", {
        taskId: taskObj.id,
        taskTitle: taskObj.title,
        projectName: project.name,
        assignedBy: req.user.name,
      });
    }

    res.send(taskObj);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(400).send(error);
  }
});

// Delete a task
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      project: { $exists: true },
    });

    if (!task) {
      return res.status(404).send({ error: "Task not found" });
    }

    const project = await Project.findOne({
      _id: task.project,
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    });

    if (!project) {
      return res.status(403).send({ error: "Access denied" });
    }

    await task.deleteOne();
    res.send({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).send(error);
  }
});

// Update task order and status
router.patch("/:id/reorder", auth, taskController.updateTaskOrder);
router.patch("/batch/order", auth, taskController.updateTaskOrders);

module.exports = router;
