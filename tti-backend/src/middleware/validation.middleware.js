const { body, validationResult } = require("express-validator");

const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters long"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email"),

  body("password").notEmpty().withMessage("Password is required"),
];

const validateInvitation = (req, res, next) => {
  const { email, workspaceId, role } = req.body;

  if (!email || !workspaceId || !role) {
    return res.status(400).json({ message: "Email, workspace ID, and role are required" });
  }

  if (!["admin", "member"].includes(role)) {
    return res.status(400).json({ message: "Invalid role. Must be either admin or member" });
  }

  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  validateInvitation,
};
