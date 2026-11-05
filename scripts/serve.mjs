import { createServer } from "node:http";
import { readFile, stat, realpath } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createHash } from "node:crypto";
import { prepareDemo } from "./prepare-demo.mjs";

await prepareDemo();

const root = fileURLToPath(new URL("../", import.meta.url));
const sourceId = createHash("sha256").update(root).digest("hex").slice(0, 16);
const port = Number(process.env.PORT || 4173);
const allowed = new Set(["demo", "extension", "examples", "docs"]);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".gif": "image/gif", ".txt": "text/plain; charset=utf-8", ".md": "text/plain; charset=utf-8" };
const server = createServer(async (req, res) => {
  try {
    if (!["GET", "HEAD"].includes(req.method)) { res.writeHead(405, { Allow: "GET, HEAD" }); res.end(); return; }
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (pathname === "/__resume_refill_demo") {
      res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
      res.end(req.method === "HEAD" ? undefined : JSON.stringify({ service: "resume-refill-demo", sourceId, pid: process.pid }));
      return;
    }
    if (pathname === "/") { res.writeHead(302, { Location: "/demo/" }); res.end(); return; }
    const parts = pathname.split("/").filter(Boolean);
    if (!allowed.has(parts[0]) || parts.some((part) => part.startsWith("."))) throw new Error("Not found");
    let filename = path.resolve(root, `.${pathname}`);
    if ((await stat(filename)).isDirectory()) filename = path.join(filename, "index.html");
    filename = await realpath(filename);
    if (!filename.startsWith(root)) throw new Error("Not found");
    const bytes = await readFile(filename);
    res.writeHead(200, { "Content-Type": types[path.extname(filename)] || "application/octet-stream", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
    res.end(req.method === "HEAD" ? undefined : bytes);
  } catch { res.writeHead(404, { "Content-Type": "text/plain" }); res.end("Not found"); }
});
server.on("error", (error) => { console.error(error.code === "EADDRINUSE" ? `Port ${port} is in use. Try PORT=4174 npm run demo.` : error.message); process.exitCode = 1; });
server.listen(port, "127.0.0.1", () => console.log(`Resume Refill demo: http://127.0.0.1:${port}/demo/`));
