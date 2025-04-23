const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).send({ error: "Please authenticate" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ _id: decoded.id });

      if (!user) {
        console.error("User not found for token:", token);
        return res.status(401).send({ error: "Please authenticate" });
      }

      req.token = token;
      req.user = user;
      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).send({ error: "Please authenticate" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).send({ error: "Please authenticate" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).send({ error: "Access denied" });
    }

    next();
  };
};

module.exports = { auth, checkRole };
