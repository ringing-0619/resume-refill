import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { open, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const sourceId = createHash("sha256").update(root).digest("hex").slice(0, 16);
const stateDir = path.join(root, ".demo-runtime");
const stateFile = path.join(stateDir, "server.json");
const logFile = path.join(stateDir, "server.log");
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 22 || (major === 22 && minor < 14)) throw new Error("需要 Node.js 22.14 或更新版本 / Node.js 22.14+ is required.");

async function health(port) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/__resume_refill_demo`, { signal: AbortSignal.timeout(500) });
    const info = await response.json();
    return response.ok && info.service === "resume-refill-demo" && info.sourceId === sourceId ? info : null;
  } catch { return null; }
}

async function savedServer() {
  try {
    const saved = JSON.parse(await readFile(stateFile, "utf8"));
    const info = await health(saved.port);
    return info && info.pid === saved.pid ? saved : null;
  } catch { return null; }
}

async function freePort() {
  for (let port = 4173; port <= 4193; port++) {
    const available = await new Promise((resolve) => {
      const probe = createServer();
      probe.once("error", () => resolve(false));
      probe.listen(port, "127.0.0.1", () => probe.close(() => resolve(true)));
    });
    if (available) return port;
  }
  throw new Error("本地端口暂不可用，请关闭其他演示服务后重试。");
}

async function start() {
  let saved = await savedServer();
  if (!saved) {
    await mkdir(stateDir, { recursive: true });
    const port = await freePort();
    const log = await open(logFile, "w");
    const child = spawn(process.execPath, [path.join(root, "scripts/serve.mjs")], {
      cwd: root,
      env: { ...process.env, PORT: String(port) },
      detached: true,
      stdio: ["ignore", log.fd, log.fd]
    });
    let spawnError;
    child.on("error", (error) => { spawnError = error; });
    child.unref();
    await log.close();
    console.log("正在启动演示 / Starting demo…");
    for (let attempt = 0; attempt < 100; attempt++) {
      if (spawnError) throw spawnError;
      const info = await health(port);
      if (info && info.pid === child.pid) {
        saved = { pid: child.pid, port, sourceId };
        await writeFile(stateFile, JSON.stringify(saved, null, 2) + "\n");
        break;
      }
      await pause(100);
    }
    if (!saved) {
      try { child.kill(); } catch {}
      throw new Error(`演示未能启动。详细信息：\n${await readFile(logFile, "utf8")}`);
    }
  }
  const url = `http://127.0.0.1:${saved.port}/demo/?ui=original-purple`;
  console.log(`\n演示已就绪 / Demo ready:\n${url}\n\n主界面：原插件紫色界面\n服务在后台运行，可关闭此终端窗口。\n停止演示：双击 stop-demo.command\n`);
  if (process.platform === "darwin" && !process.argv.includes("--no-open")) {
    const opener = spawn("/usr/bin/open", ["-a", "Google Chrome", url], { detached: true, stdio: "ignore" });
    opener.on("error", () => console.log("请手动打开上面的演示地址。"));
    opener.unref();
  }
}

async function stop() {
  const saved = await savedServer();
  if (saved) process.kill(saved.pid, "SIGTERM");
  await rm(stateFile, { force: true });
  console.log(saved ? "演示已停止 / Demo stopped." : "演示当前未运行 / Demo is not running.");
}

try { await (process.argv.includes("--stop") ? stop() : start()); }
catch (error) { console.error(`\n启动失败 / Launch failed: ${error.message}`); process.exitCode = 1; }
