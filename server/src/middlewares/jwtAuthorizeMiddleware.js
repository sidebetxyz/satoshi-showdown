const jwt = require("jsonwebtoken");
const { getUserById } = require("../services/userService");
const authorizeUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add user info to request
    next();
  } catch {
    res.status(400).json({ message: "Invalid token." });
  }
};

const authorizeAdmin = async (req, res, next) => {
  try {
    console.log(req.userId);
    const user = await getUserById(req.body.userId);
    if ((user && user.role === "Admin") || user.role === "SuperAdmin") {
      return next();
    }
    return res.status(403).json({ message: "Access denied. Not authorized." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { authorizeUser, authorizeAdmin };
