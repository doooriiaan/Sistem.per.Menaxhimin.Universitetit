const JWT_SECRET = process.env.JWT_SECRET || "change-this-jwt-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@universiteti.local";
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123!";
const DEFAULT_ADMIN_FIRST_NAME = process.env.ADMIN_FIRST_NAME || "System";
const DEFAULT_ADMIN_LAST_NAME = process.env.ADMIN_LAST_NAME || "Admin";
const DEFAULT_ADMIN_ROLE = process.env.ADMIN_ROLE || "Admin";

module.exports = {
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_FIRST_NAME,
  DEFAULT_ADMIN_LAST_NAME,
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_ADMIN_ROLE,
  JWT_EXPIRES_IN,
  JWT_SECRET,
};
