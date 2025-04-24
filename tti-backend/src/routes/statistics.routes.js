const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth.middleware");
const Task = require("../models/task.model");
const Project = require("../models/project.model");

// Get task creation statistics over time
router.get("/tasks-over-time", auth, (req, res) => {
  Task.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
        "_id.day": 1,
      },
    },
  ])
    .then((tasks) => {
      const formattedData = tasks.map((task) => ({
        date: `${task._id.year}-${task._id.month.toString().padStart(2, "0")}-${task._id.day
          .toString()
          .padStart(2, "0")}`,
        count: task.count,
      }));
      res.json(formattedData);
    })
    .catch((error) => {
      console.error("Error fetching task statistics:", error);
      res.status(500).json({ message: "Error fetching task statistics" });
    });
});

// Get project member distribution
router.get("/project-members", auth, (req, res) => {
  Project.aggregate([
    {
      $project: {
        name: 1,
        memberCount: { $size: { $ifNull: ["$members", []] } },
      },
    },
    {
      $sort: { memberCount: -1 },
    },
  ])
    .then((projects) => {
      res.json(projects);
    })
    .catch((error) => {
      console.error("Error fetching project member statistics:", error);
      res.status(500).json({ message: "Error fetching project member statistics" });
    });
});

// Get task status distribution
router.get("/task-status", auth, (req, res) => {
  Task.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ])
    .then((statusStats) => {
      res.json(statusStats);
    })
    .catch((error) => {
      console.error("Error fetching task status statistics:", error);
      res.status(500).json({ message: "Error fetching task status statistics" });
    });
});

// Get task priority distribution
router.get("/task-priority", auth, (req, res) => {
  Task.aggregate([
    {
      $group: {
        _id: "$priority",
        count: { $sum: 1 },
      },
    },
  ])
    .then((priorityStats) => {
      res.json(priorityStats);
    })
    .catch((error) => {
      console.error("Error fetching task priority statistics:", error);
      res.status(500).json({ message: "Error fetching task priority statistics" });
    });
});

// Get user activity statistics
router.get("/user-activity", auth, (req, res) => {
  Task.aggregate([
    {
      $group: {
        _id: "$assignee",
        taskCount: { $sum: 1 },
        completedTasks: {
          $sum: {
            $cond: [{ $eq: ["$status", "done"] }, 1, 0],
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        _id: 1,
        name: "$user.name",
        email: "$user.email",
        taskCount: 1,
        completedTasks: 1,
        completionRate: {
          $multiply: [{ $divide: ["$completedTasks", "$taskCount"] }, 100],
        },
      },
    },
    {
      $sort: { taskCount: -1 },
    },
  ])
    .then((userStats) => {
      res.json(userStats);
    })
    .catch((error) => {
      console.error("Error fetching user activity statistics:", error);
      res.status(500).json({ message: "Error fetching user activity statistics" });
    });
});

module.exports = router;
