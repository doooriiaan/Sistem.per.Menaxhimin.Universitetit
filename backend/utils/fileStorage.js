const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");
const DEFAULT_MAX_FILE_SIZE = 6 * 1024 * 1024;

const MIME_EXTENSION_MAP = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const ensureDirectory = (targetDirectory) => {
  fs.mkdirSync(targetDirectory, { recursive: true });
};

const sanitizeSegment = (value, fallback) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || fallback;
};

const parseDataUrl = (dataUrl) => {
  const match = /^data:([^;]+);base64,(.+)$/u.exec(dataUrl || "");

  if (!match) {
    return null;
  }

  return {
    mimeType: match[1],
    base64Content: match[2],
  };
};

const saveBase64Upload = (
  file,
  {
    directory = "general",
    allowedMimeTypes = Object.keys(MIME_EXTENSION_MAP),
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
  } = {}
) => {
  const parsed = parseDataUrl(file?.dataUrl);

  if (!parsed) {
    throw new Error("Skedari i ngarkuar nuk eshte ne format valid.");
  }

  if (!allowedMimeTypes.includes(parsed.mimeType)) {
    throw new Error("Lloji i skedarit nuk lejohet.");
  }

  const buffer = Buffer.from(parsed.base64Content, "base64");

  if (!buffer.length) {
    throw new Error("Skedari i ngarkuar eshte bosh.");
  }

  if (buffer.length > maxFileSize) {
    throw new Error("Skedari e tejkalon madhesine maksimale te lejuar.");
  }

  ensureDirectory(UPLOADS_ROOT);

  const safeDirectory = sanitizeSegment(directory, "general");
  const targetDirectory = path.join(UPLOADS_ROOT, safeDirectory);
  ensureDirectory(targetDirectory);

  const originalName = String(file?.originalName || "dokument")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "_");
  const extension =
    path.extname(originalName) || MIME_EXTENSION_MAP[parsed.mimeType] || ".bin";
  const baseName = sanitizeSegment(path.basename(originalName, extension), "file");
  const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const storedName = `${baseName}-${uniqueSuffix}${extension}`;
  const absolutePath = path.join(targetDirectory, storedName);

  fs.writeFileSync(absolutePath, buffer);

  return {
    fileName: storedName,
    filePath: `${safeDirectory}/${storedName}`.replace(/\\/g, "/"),
    fileSize: buffer.length,
    mimeType: parsed.mimeType,
    originalName,
  };
};

const buildFileUrl = (req, filePath) => {
  if (!filePath) {
    return null;
  }

  const publicPath = `/uploads/${String(filePath).replace(/\\/g, "/")}`;

  if (!req) {
    return publicPath;
  }

  return `${req.protocol}://${req.get("host")}${publicPath}`;
};

module.exports = {
  UPLOADS_ROOT,
  buildFileUrl,
  ensureDirectory,
  saveBase64Upload,
};
