const crypto = require("crypto");
const db = require("../db");
const {
  IS_PRODUCTION,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_EXPIRES_DAYS,
} = require("./authConfig");

const connection = db.promise();

const REFRESH_TOKEN_TTL_MS =
  REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000;

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const generateRefreshToken = () => crypto.randomBytes(48).toString("hex");

const getRefreshTokenBaseCookieOptions = () => ({
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: "lax",
  path: "/api/auth",
});

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    ...getRefreshTokenBaseCookieOptions(),
    maxAge: REFRESH_TOKEN_TTL_MS,
  });
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie(
    REFRESH_TOKEN_COOKIE_NAME,
    getRefreshTokenBaseCookieOptions()
  );
};

const parseCookies = (cookieHeader = "") =>
  cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((accumulator, part) => {
      const separatorIndex = part.indexOf("=");

      if (separatorIndex < 0) {
        return accumulator;
      }

      const key = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();

      accumulator[key] = decodeURIComponent(value);
      return accumulator;
    }, {});

const getRefreshTokenFromRequest = (req) =>
  parseCookies(req.headers.cookie || "")[REFRESH_TOKEN_COOKIE_NAME] || "";

const buildRefreshTokenMetadata = (userAgent) => ({
  expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  userAgent: String(userAgent || "").trim().slice(0, 255) || null,
});

const createRefreshToken = async (userId, userAgent) => {
  const refreshToken = generateRefreshToken();
  const { expiresAt, userAgent: normalizedUserAgent } =
    buildRefreshTokenMetadata(userAgent);

  const [result] = await connection.query(
    `
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent)
      VALUES (?, ?, ?, ?)
    `,
    [userId, hashToken(refreshToken), expiresAt, normalizedUserAgent]
  );

  return {
    expiresAt,
    refreshToken,
    refreshTokenId: result.insertId,
  };
};

const getRefreshTokenRecord = async (refreshToken) => {
  if (!refreshToken) {
    return null;
  }

  const [rows] = await connection.query(
    `
      SELECT
        refresh_token_id,
        user_id,
        token_hash,
        expires_at,
        revoked_at,
        created_at,
        last_used_at,
        user_agent
      FROM refresh_tokens
      WHERE token_hash = ?
      LIMIT 1
    `,
    [hashToken(refreshToken)]
  );

  return rows[0] || null;
};

const isRefreshTokenExpired = (refreshTokenRecord) =>
  !refreshTokenRecord ||
  new Date(refreshTokenRecord.expires_at).getTime() <= Date.now();

const revokeRefreshTokenById = async (refreshTokenId) => {
  if (!refreshTokenId) {
    return;
  }

  await connection.query(
    `
      UPDATE refresh_tokens
      SET revoked_at = COALESCE(revoked_at, NOW())
      WHERE refresh_token_id = ?
    `,
    [refreshTokenId]
  );
};

const revokeRefreshToken = async (refreshToken) => {
  const refreshTokenRecord = await getRefreshTokenRecord(refreshToken);

  if (!refreshTokenRecord) {
    return null;
  }

  await revokeRefreshTokenById(refreshTokenRecord.refresh_token_id);
  return refreshTokenRecord;
};

const markRefreshTokenUsed = async (refreshTokenId) => {
  if (!refreshTokenId) {
    return;
  }

  await connection.query(
    `
      UPDATE refresh_tokens
      SET last_used_at = NOW()
      WHERE refresh_token_id = ?
    `,
    [refreshTokenId]
  );
};

const revokeUserRefreshTokens = async (userId) => {
  await connection.query(
    `
      UPDATE refresh_tokens
      SET revoked_at = COALESCE(revoked_at, NOW())
      WHERE user_id = ? AND revoked_at IS NULL
    `,
    [userId]
  );
};

module.exports = {
  clearRefreshTokenCookie,
  createRefreshToken,
  getRefreshTokenFromRequest,
  getRefreshTokenRecord,
  isRefreshTokenExpired,
  markRefreshTokenUsed,
  revokeRefreshToken,
  revokeRefreshTokenById,
  revokeUserRefreshTokens,
  setRefreshTokenCookie,
};
