import { readFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import path from "node:path";
import assert from "node:assert/strict";
import { renderSurface, renderDemoEngine } from "./prepare-demo.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (name) => readFile(path.join(root, name), "utf8");
const manifest = JSON.parse(await read("extension/manifest.json"));
const pkg = JSON.parse(await read("package.json"));
const lock = JSON.parse(await read("package-lock.json"));
assert.equal(pkg.version, manifest.version);
assert.equal(lock.version, pkg.version);
assert.deepEqual([...manifest.permissions].sort(), ["activeTab", "scripting", "storage"]);
assert.ok(!manifest.host_permissions);
assert.ok((await read("extension/content.js")).includes(`CONTENT_VERSION = "${manifest.version}"`));
for (const surface of ["popup", "options"]) {
  assert.equal(await read(`demo/${surface}.html`), renderSurface(await read(`extension/${surface}.html`)), `${surface} demo must use the original extension markup and assets`);
}
assert.equal(await read("demo/fill-engine.js"), renderDemoEngine(await read("extension/content.js")), "The demo engine must be generated from the original extension with reviewed pacing await points");
const assets = [manifest.action.default_popup, manifest.options_page, manifest.background.service_worker, ...Object.values(manifest.icons)];
for (const file of assets) assert.ok((await stat(path.join(root, "extension", file))).isFile(), file);
for (const folder of ["extension", "demo", "scripts"]) {
  for (const file of await readdir(path.join(root, folder))) {
    if (!/\.(?:m?js)$/.test(file)) continue;
    const result = spawnSync(process.execPath, ["--check", path.join(root, folder, file)], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
  }
}
for (const file of ["README.md", "README.zh-CN.md", ...((await readdir(path.join(root, "docs"))).filter((f) => f.endsWith(".md")).map((f) => `docs/${f}`))]) {
  const content = await read(file);
  for (const [, raw] of content.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    if (/^(?:https?:|#|mailto:)/.test(raw)) continue;
    const target = decodeURIComponent(raw.split("#")[0]);
    assert.ok(await stat(path.resolve(root, path.dirname(file), target)), `${file}: missing ${target}`);
  }
}
console.log("Checks passed: versions, permissions, extension assets, JavaScript syntax and documentation links.");
