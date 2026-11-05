const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const profiles = JSON.parse(read("examples/sample-profiles.json"));

function harness(scene = "standard", lang = "en") {
  const dom = new JSDOM('<main id="formRoot"></main>', {
    runScripts: "outside-only", url: `https://example.test/demo/form.html?scene=${scene}&lang=${lang}`
  });
  const { window } = dom;
  Object.defineProperty(window.HTMLElement.prototype, "innerText", { get() { return this.textContent; } });
  window.HTMLElement.prototype.getBoundingClientRect = function () { return { width: this.hidden ? 0 : 200, height: this.hidden ? 0 : 30, top: 0, left: 0 }; };
  window.CSS = { escape: (value) => value };
  window.ResizeObserver = class { observe() {} disconnect() {} };
  const timeout = window.setTimeout.bind(window);
  window.setTimeout = (callback, ms) => timeout(callback, Math.min(ms, 1));
  for (const script of ["demo/bridge.js", "extension/profile-schema.js", "extension/content.js", "demo/form.js"]) window.eval(read(script));
  const { document } = window;
  return {
    window, document, close: () => window.close(),
    value(label) {
      const item = [...document.querySelectorAll(".field")].find((field) => field.querySelector("label")?.textContent.replace(/\*/g, "").trim() === label);
      return item?.querySelector("input,select,textarea")?.value;
    },
    async send(action, profile = profiles.data, rest = {}) {
      const result = await new Promise((resolve) => window.__resumeHelperController.listener({ type: `RESUME_HELPER_V2_${action}`, profile, ...rest }, {}, resolve));
      assert.equal(result.ok, true, result.error);
      return result;
    }
  };
}

test("demo uses the actual engine to add and fill a second education entry", async (t) => {
  const h = harness(); t.after(h.close);
  assert.equal((await h.send("SCAN")).fields.length, 11);
  const result = await h.send("FILL");
  assert.equal(result.failed, 0);
  assert.equal(result.addedEntries, 1);
  assert.equal(result.filled, 15);
  assert.equal(result.requiredFields.length, 0);
  assert.deepEqual(Array.from(h.document.querySelectorAll('.education-entry input[id]')).filter((el) => el.closest(".field").querySelector("label").textContent.includes("School")).map((el) => el.value), ["Example University", "Sample Institute"]);
  assert.equal(h.value("Project name"), "Sample Retail Explorer");
  assert.equal(result.issues.length, 0);
});

test("custom-control demo binds both education records to the selected version", async (t) => {
  for (const lang of ["en", "zh"]) {
    const h = harness("custom", lang); t.after(h.close);
    const result = await h.send("FILL", profiles.product);
    assert.equal(result.failed, 0);
    assert.equal(result.filled, 15);
    const degrees = [...h.document.querySelectorAll('.education-entry [role="combobox"]')].map((input) => input.value);
    assert.deepEqual(degrees, lang === "en" ? ["Master's degree", "Bachelor's degree"] : ["硕士研究生", "大学本科"]);
    assert.equal(h.value(lang === "en" ? "Major" : "专业"), "Product Management");
    assert.equal(h.value(lang === "en" ? "Project name" : "项目名称"), "Sample Onboarding Lab");
  }
});

test("review demo preserves an existing email, and consent waits for explicit confirmation", async (t) => {
  const h = harness("review"); t.after(h.close);
  const result = await h.send("FILL");
  assert.equal(h.value("Email"), "already.edited@example.com");
  assert.ok(result.skippedExisting >= 1);
  assert.equal(h.document.querySelector('input[type="checkbox"]').checked, false);
  assert.equal(result.requiredFields.length, 3);
  const format = result.requiredFields.find((field) => /interview/i.test(field.label));
  const code = result.requiredFields.find((field) => /reference/i.test(field.label));
  const consent = result.requiredFields.find((field) => field.controlType === "confirmation-checkbox");
  assert.ok(format && code && consent);
  const applied = await h.send("APPLY_REQUIRED", profiles.data, { answers: { [format.id]: "Remote", [code.id]: "DEMO-ONLY" } });
  assert.equal(applied.applied, 2);
  assert.equal(h.document.querySelector('input[type="checkbox"]').checked, false);
  const remainingConsent = applied.requiredFields.find((field) => field.controlType === "confirmation-checkbox");
  const confirmed = await h.send("APPLY_REQUIRED", profiles.data, { answers: { [remainingConsent.id]: "同意" } });
  assert.equal(confirmed.applied, 1);
  assert.equal(h.document.querySelector('input[type="checkbox"]').checked, true);
  assert.equal(confirmed.requiredFields.length, 0);
  await h.send("FILL", profiles.data, { overwriteExisting: true });
  assert.equal(h.value("Email"), "alex.lin@example.com");
});

test("fictional backup is directly compatible with the extension's profile library", (t) => {
  const h = harness(); t.after(h.close);
  const backup = JSON.parse(read("examples/sample-backup.json"));
  const library = h.window.ResumeHelperSchema.normalizeProfileLibrary(backup);
  assert.equal(library.profiles.length, 2);
  assert.equal(library.activeProfile.personal.email, "alex.lin@example.com");
  assert.notEqual(library.profiles[0].profile.project[0].name, library.profiles[1].profile.project[0].name);
});
