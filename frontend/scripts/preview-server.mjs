import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import http from "node:http";

const distRoot = process.argv[2] || join(process.cwd(), "dist");
const port = Number(process.argv[3] || 5173);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

const resolvePath = (urlPath) => {
  const sanitizedPath = decodeURIComponent(urlPath.split("?")[0] || "/");
  const requestedPath = normalizedJoin(
    distRoot,
    sanitizedPath === "/" ? "/index.html" : sanitizedPath
  );

  if (existsSync(requestedPath) && statSync(requestedPath).isFile()) {
    return requestedPath;
  }

  return join(distRoot, "index.html");
};

const normalizedJoin = (basePath, nextPath) => {
  const normalizedPath = normalize(nextPath).replace(/^(\.\.(\/|\\|$))+/, "");
  return join(basePath, normalizedPath);
};

const server = http.createServer((req, res) => {
  try {
    const filePath = resolvePath(req.url || "/");
    const extension = extname(filePath).toLowerCase();

    res.writeHead(200, {
      "Content-Type": contentTypes[extension] || "application/octet-stream",
      "Cache-Control": extension === ".html" ? "no-cache" : "public, max-age=300",
    });

    createReadStream(filePath).pipe(res);
  } catch (error) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(`Preview server error: ${error.message}`);
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Preview server running at http://127.0.0.1:${port}`);
});
