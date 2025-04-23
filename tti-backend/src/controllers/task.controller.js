const Task = require("../models/task.model");
const Project = require("../models/project.model");
const mongoose = require("mongoose");

const taskController = {
  updateTaskOrder: async (req, res) => {
    try {
      const { order, status } = req.body;
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

      if (order !== undefined) task.order = order;
      if (status) task.status = status;
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

      res.send(taskObj);
    } catch (error) {
      console.error("Error reordering task:", error);
      res.status(400).send(error);
    }
  },

  updateTaskOrders: async (req, res) => {
    try {
      const { updates } = req.body;

      // Validate updates array
      if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).send({ error: "Invalid updates array" });
      }

      // Get all task IDs from the updates and convert to ObjectId
      const taskIds = updates.map((update) => new mongoose.Types.ObjectId(update.id));

      // Find all tasks and their associated projects
      const tasks = await Task.find({
        _id: { $in: taskIds },
        project: { $exists: true },
      });

      // Get unique project IDs
      const projectIds = [...new Set(tasks.map((task) => task.project.toString()))];

      // Check if user has access to all projects
      const projects = await Project.find({
        _id: { $in: projectIds },
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      });

      if (projects.length !== projectIds.length) {
        return res.status(403).send({ error: "Access denied to one or more projects" });
      }

      // Update all tasks in a single operation
      const bulkOps = updates.map((update) => ({
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(update.id) },
          update: {
            $set: {
              order: update.order,
              status: update.status,
            },
          },
        },
      }));

      await Task.bulkWrite(bulkOps);

      // Fetch updated tasks with populated fields
      const updatedTasks = await Task.find({ _id: { $in: taskIds } })
        .populate("assignee", "name email")
        .populate("createdBy", "name email");

      // Transform the response to use id instead of _id
      const transformedTasks = updatedTasks.map((task) => {
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
      console.error("Error updating task orders:", error);
      res.status(400).send(error);
    }
  },

  updateTask: async (req, res) => {
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
  },
};

module.exports = taskController;
