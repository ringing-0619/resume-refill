const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const http = require("node:http");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const run = promisify(execFile);

test("launcher handles an occupied port, reuses its instance and stops only its own server", async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "resume-refill-launch-"));
  await fs.mkdir(path.join(root, "scripts"));
  await fs.mkdir(path.join(root, "extension"));
  await fs.mkdir(path.join(root, "demo"));
  for (const name of ["serve.mjs", "prepare-demo.mjs", "launch-demo.mjs"]) {
    await fs.copyFile(path.join(__dirname, "../scripts", name), path.join(root, "scripts", name));
  }
  for (const name of ["popup.html", "options.html"]) await fs.writeFile(path.join(root, "extension", name), "<html><head></head><body>fixture</body></html>");
  await fs.copyFile(path.join(__dirname, "../extension/content.js"), path.join(root, "extension/content.js"));
  await fs.writeFile(path.join(root, "demo/index.html"), "fictional launcher test");
  const launcher = path.join(root, "scripts/launch-demo.mjs");
  const launch = (...args) => run(process.execPath, [launcher, ...args], { timeout: 20000 });
  const blocker = http.createServer((_req, res) => res.end("unrelated service"));
  await new Promise((resolve, reject) => {
    blocker.once("error", (error) => error.code === "EADDRINUSE" ? resolve() : reject(error));
    blocker.listen(4173, "127.0.0.1", resolve);
  });
  t.after(async () => {
    await launch("--stop").catch(() => {});
    if (blocker.listening) await new Promise((resolve) => blocker.close(resolve));
    await fs.rm(root, { recursive: true, force: true });
  });
  const first = await launch("--no-open");
  assert.match(first.stdout, /Demo ready/);
  const state = JSON.parse(await fs.readFile(path.join(root, ".demo-runtime/server.json"), "utf8"));
  assert.ok(state.port > 4173);
  const base = `http://127.0.0.1:${state.port}`;
  assert.equal(await (await fetch(`${base}/demo/`)).text(), "fictional launcher test");
  const info = await (await fetch(`${base}/__resume_refill_demo`)).json();
  assert.equal(info.pid, state.pid);
  await launch("--no-open");
  const second = JSON.parse(await fs.readFile(path.join(root, ".demo-runtime/server.json"), "utf8"));
  assert.deepEqual(second, state);
  await launch("--stop");
  await assert.rejects(fs.readFile(path.join(root, ".demo-runtime/server.json")), { code: "ENOENT" });
  let stopped = false;
  for (let i = 0; i < 20; i++) {
    try { await fetch(`${base}/__resume_refill_demo`, { signal: AbortSignal.timeout(100) }); }
    catch { stopped = true; break; }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.equal(stopped, true);
  if (blocker.listening) assert.equal(await (await fetch("http://127.0.0.1:4173")).text(), "unrelated service");
});
