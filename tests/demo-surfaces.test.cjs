const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const backup = JSON.parse(read('examples/sample-backup.json'));

function dom(html, url) {
  const instance = new JSDOM(html, { runScripts: 'outside-only', url });
  const w = instance.window;
  Object.defineProperty(w.HTMLElement.prototype, 'innerText', { get() { return this.textContent; } });
  w.HTMLElement.prototype.getBoundingClientRect = function () { return { width: this.hidden ? 0 : 200, height: this.hidden ? 0 : 30, top: 0, left: 0 }; };
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.scrollTo = () => {};
  w.CSS = { escape: (value) => value };
  w.ResizeObserver = class { observe() {} disconnect() {} };
  w.IntersectionObserver = class { observe() {} disconnect() {} };
  const timer = w.setTimeout.bind(w);
  w.setTimeout = (callback, ms) => timer(callback, Math.min(ms, 1));
  return instance;
}

async function until(check) {
  for (let i = 0; i < 200; i++) {
    if (check()) return;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  assert.fail('Original UI did not reach the expected state');
}

function surface(name, store, sendToForm) {
  const instance = dom(read(`demo/${name}.html`), `https://example.test/demo/${name}.html`);
  const w = instance.window;
  w.ResumeRefillDemo = {
    getStorage: async (keys) => Object.fromEntries(keys.map((key) => [key, structuredClone(store[key])])),
    setStorage: async (values) => Object.assign(store, structuredClone(values)),
    sendToForm,
    openOptions() {}
  };
  for (const script of ['demo/extension-adapter.js', 'extension/profile-schema.js', `extension/${name}.js`]) w.eval(read(script));
  return instance;
}

test('the original popup switches resume versions and fills the actual demo form', async (t) => {
  const form = dom('<main id="formRoot"></main>', 'https://example.test/demo/form.html?scene=standard&lang=zh');
  t.after(() => form.window.close());
  for (const script of ['demo/bridge.js', 'extension/profile-schema.js', 'extension/content.js', 'demo/form.js']) form.window.eval(read(script));
  const store = structuredClone(backup);
  const popup = surface('popup', store, (message) => new Promise((resolve) => form.window.__resumeHelperController.listener(message, {}, resolve)));
  t.after(() => popup.window.close());
  const d = popup.window.document;
  await until(() => !d.getElementById('fillButton').disabled);
  const versions = d.getElementById('profileVersionSelect');
  versions.value = 'demo-product';
  versions.dispatchEvent(new popup.window.Event('change'));
  await until(() => store.activeResumeProfileId === 'demo-product' && !d.getElementById('fillButton').disabled);
  d.getElementById('fillButton').click();
  await until(() => d.getElementById('resultBox').textContent.includes('已填充 15 项'));
  assert.equal(form.window.document.getElementById('demo-field-4').value, 'Product Associate');
  assert.equal(form.window.document.getElementById('demo-field-5').value, 'Sample Onboarding Lab');
  assert.equal(d.getElementById('statusTitle').textContent, '填充完成');
});

test('the original profile manager saves edits through the memory storage adapter', async (t) => {
  const store = structuredClone(backup);
  const settings = surface('options', store, async () => ({ ok: true }));
  t.after(() => settings.window.close());
  const d = settings.window.document;
  await until(() => d.querySelector('[data-path="personal.0.headline"]'));
  const headline = d.querySelector('[data-path="personal.0.headline"]');
  headline.value = 'Demo reviewed title';
  headline.dispatchEvent(new settings.window.Event('input'));
  d.getElementById('saveButton').click();
  await until(() => d.getElementById('saveState').textContent.includes('已保存'));
  assert.equal(store.resumeProfile.personal.headline, 'Demo reviewed title');
  assert.equal(store.resumeProfiles.find((version) => version.id === store.activeResumeProfileId).profile.personal.headline, 'Demo reviewed title');
  assert.equal(backup.resumeProfile.personal.headline, 'Data Analyst');
});
