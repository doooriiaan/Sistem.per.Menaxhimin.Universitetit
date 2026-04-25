const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/authConfig");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Duhet te identifikoheni per te vazhduar.",
    });
  }

  const token = authHeader.slice(7);

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const normalizedRole = String(
      decodedToken.roli || decodedToken.role || ""
    ).toLowerCase();

    req.user = {
      ...decodedToken,
      roli: normalizedRole,
    };
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Sesioni ka skaduar ose tokeni nuk eshte valid.",
    });
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.roli)) {
    return res.status(403).json({
      message: "Nuk keni leje per kete veprim.",
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  authorizeRoles,
};
