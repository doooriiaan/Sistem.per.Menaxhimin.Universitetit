const JWT_SECRET = process.env.JWT_SECRET || "change-this-jwt-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_DAYS = Math.max(
  1,
  Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7)
);
const REFRESH_TOKEN_COOKIE_NAME =
  process.env.REFRESH_TOKEN_COOKIE_NAME || "ums_refresh_token";
const FRONTEND_ORIGINS = (
  process.env.FRONTEND_ORIGINS ||
  process.env.FRONTEND_ORIGIN ||
  "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@universiteti.local";
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123!";
const DEFAULT_ADMIN_FIRST_NAME = process.env.ADMIN_FIRST_NAME || "Dorian";
const DEFAULT_ADMIN_LAST_NAME = process.env.ADMIN_LAST_NAME || "Rinor";
const DEFAULT_ADMIN_ROLE = process.env.ADMIN_ROLE || "Admin";

module.exports = {
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_FIRST_NAME,
  DEFAULT_ADMIN_LAST_NAME,
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_ADMIN_ROLE,
  FRONTEND_ORIGINS,
  IS_PRODUCTION,
  JWT_EXPIRES_IN,
  JWT_SECRET,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_EXPIRES_DAYS,
};
