const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");
const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const profile = JSON.parse(read("examples/sample-profiles.json")).data;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function until(check) {
  for (let n = 0; n < 250; n++) { if (check()) return; await wait(4); }
  assert.fail("The paced engine did not reach the next write gate");
}

function harness() {
  const dom = new JSDOM('<main id="formRoot"></main>', { runScripts: "outside-only", url: "https://example.test/demo/form.html?scene=standard&lang=zh" });
  const w = dom.window;
  Object.defineProperty(w.HTMLElement.prototype, "innerText", { get() { return this.textContent; } });
  w.HTMLElement.prototype.getBoundingClientRect = () => ({ width: 200, height: 30, top: 0, left: 0 });
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.CSS = { escape: (value) => value };
  w.ResizeObserver = class { observe() {} disconnect() {} };
  const timeout = w.setTimeout.bind(w);
  w.setTimeout = (callback, ms) => timeout(callback, Math.min(ms, 1));
  for (const script of ["demo/bridge.js", "extension/profile-schema.js", "demo/fill-engine.js", "demo/form.js"]) w.eval(read(script));
  return dom;
}

test("pacing gates actual writes one field at a time in visual page order", async (t) => {
  const dom = harness(); t.after(() => dom.window.close());
  const w = dom.window;
  const started = [], completed = [];
  let release;
  w.ResumeRefillDemoPacing = {
    active: true,
    beforeWrite: async (context) => { started.push(context); await new Promise((resolve) => { release = resolve; }); },
    afterWrite: async (context) => { completed.push(context); }
  };
  const filling = new Promise((resolve) => w.__resumeHelperController.listener({ type: "RESUME_HELPER_V2_FILL", profile }, {}, resolve));
  await until(() => started.length === 1);
  assert.equal(started[0].key, "personal.fullName");
  for (let index = 0; index < 15; index++) {
    await until(() => started.length === index + 1);
    const field = started[index].element;
    assert.equal(field.value, "", "the current field must still be empty before its gate opens");
    release();
    await until(() => completed.length === index + 1);
    assert.ok(field.value, "the real adapter should write the value after its gate opens");
    assert.equal(completed[index].success, true);
  }
  const result = await filling;
  assert.equal(result.ok, true);
  assert.equal(result.failed, 0);
  assert.equal(result.filled, 15);
  assert.deepEqual(started.map((entry) => entry.key), [
    "personal.fullName", "personal.email", "personal.city", "personal.headline",
    "education.school", "education.major", "education.degree", "education.startDate",
    "education.school", "education.major", "education.degree", "education.startDate",
    "project.name", "project.role", "project.description"
  ]);
});

test("visible pacing waits around the write and pause blocks advancement until resumed", async (t) => {
  const dom = new JSDOM('<main id="formRoot"><div class="field"><label>姓名</label><input></div></main>', { runScripts: "outside-only", url: "https://example.test/demo/form.html?lang=zh" });
  t.after(() => dom.window.close());
  const w = dom.window;
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.eval(read("demo/pacing.js"));
  const pacing = w.ResumeRefillDemoPacing;
  const element = w.document.querySelector("input");
  pacing.start({ delayMs: 120 });
  const started = Date.now();
  await pacing.beforeWrite({ element });
  assert.equal(element.value, "");
  element.value = "Alex Lin";
  await pacing.afterWrite({ success: true });
  assert.ok(Date.now() - started >= 110);
  assert.equal(w.document.getElementById("formRoot").dataset.demoPhase, "verified");
  pacing.finish({ ok: true, filled: 1 });
  assert.equal(pacing.active, false);
  pacing.start({ delayMs: 0 });
  pacing.pause();
  let advanced = false;
  const blocked = pacing.beforeWrite({ element }).then(() => { advanced = true; });
  await wait(30);
  assert.equal(advanced, false);
  pacing.resume();
  await blocked;
  assert.equal(advanced, true);
  pacing.finish({ ok: true, filled: 1 });
});
