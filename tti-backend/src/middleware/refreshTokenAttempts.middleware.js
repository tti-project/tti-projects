const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// Store refresh token attempts in memory
const refreshTokenAttempts = new Map();

const refreshTokenAttemptsMiddleware = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).send({ error: "Refresh token is required" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findOne({ _id: decoded.id });

    if (!user) {
      return res.status(401).send({ error: "Invalid refresh token" });
    }

    // Check if the refresh token exists in user's tokens
    const tokenExists = user.tokens.some((token) => token.refreshToken === refreshToken);
    if (!tokenExists) {
      return res.status(401).send({ error: "Invalid refresh token" });
    }

    // Check refresh token attempts
    const attempts = refreshTokenAttempts.get(user._id) || 0;
    if (attempts >= 3) {
      return res.status(401).send({ error: "Too many refresh attempts" });
    }

    refreshTokenAttempts.set(user._id, attempts + 1);
    req.user = user;
    req.refreshToken = refreshToken;
    next();
  } catch (error) {
    res.status(401).send({ error: "Invalid refresh token" });
  }
};

// Reset attempts after successful token refresh
const resetRefreshAttempts = (userId) => {
  refreshTokenAttempts.delete(userId);
};

module.exports = { refreshTokenAttemptsMiddleware, resetRefreshAttempts };
