const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const schema = fs.readFileSync(path.join(__dirname, "../extension/profile-schema.js"), "utf8");
const content = fs.readFileSync(path.join(__dirname, "../extension/content.js"), "utf8");

// DOM structure observed on Feishu Recruiting. Endpoints have no input/value;
// the focus input is exposed by accessibility, but never stores the selection.
function period(group, index, { start = "", end = "", required = false, withPath = true } = {}) {
  const key = `${group}[${index}].periodInput`;
  const endpoint = (suffix, value) => {
    const [year = "YYYY", month = "MM"] = value ? value.split("-") : [];
    return `<div class="atsx-date-picker-period-month-label" ${withPath ? `data-cy="${key}${suffix}"` : ""}><span class="atsx-date-picker-period-month-label-year" data-cy="year">${year}</span><span>-</span><span class="atsx-date-picker-period-month-label-month" data-cy="month">${month}</span></div>`;
  };
  return `<div class="resumeEditForm-item resumeEditForm-${group}"><div class="atsx-row atsx-form-item"><div class="atsx-form-item-label"><label class="${required ? "atsx-form-item-required" : ""}"><div class="customResumeForm-fieldName">起止时间${required ? " *" : ""}</div></label></div><span class="atsx-form-item-children"><div class="atsx-date-picker atsx-date-picker-period-month" ${withPath ? `data-cy="${key}"` : ""}>${endpoint("Begin", start)}<div class="atsx-date-picker-period-line"></div>${endpoint("End", end)}<input class="atsx-date-picker-period-hidden-input"></div></span></div></div>`;
}

function harness(html, { rerender = false, ignoreMonth = false, rollbackMonth = false, disabledMonth = 0, panelDelay = false } = {}) {
  const dom = new JSDOM(`<main>${html}</main>`, { runScripts: "outside-only", url: "https://example.test/apply" });
  const { window } = dom;
  const { document } = window;
  Object.defineProperty(window.HTMLElement.prototype, "innerText", { get() { return this.textContent; } });
  window.HTMLElement.prototype.getBoundingClientRect = function () {
    return { width: this.hidden ? 0 : 200, height: this.hidden ? 0 : 30, top: 0, left: 0 };
  };
  window.CSS = { escape: (value) => value };
  const timeout = window.setTimeout.bind(window);
  window.setTimeout = (callback, milliseconds) => timeout(callback, Math.min(milliseconds, 1));
  let listener;
  window.chrome = { runtime: { onMessage: {
    addListener: (callback) => { listener = callback; },
    removeListener: (callback) => { if (listener === callback) listener = null; }
  } } };
  const clicks = [];
  const endpoints = () => [...document.querySelectorAll(".atsx-date-picker-period-month-label")];
  const replaceForm = () => {
    if (!rerender) return;
    const main = document.querySelector("main");
    main.innerHTML = main.innerHTML;
    wire();
  };
  function open(index, chosenYear = "") {
    document.querySelectorAll(".test-date-dropdown").forEach((node) => node.remove());
    const target = endpoints()[index];
    const dropdown = document.createElement("div");
    dropdown.className = "atsx-date-picker-dropdown test-date-dropdown";
    const panel = document.createElement("div");
    panel.className = "atsx-date-picker-period-month-panel";
    if (target.dataset.cy) panel.dataset.cy = `${target.dataset.cy}Dropdown`;
    for (const values of [[2021, 2022, 2023, 2024, 2025, 2026], Array.from({ length: 12 }, (_, i) => i + 1)]) {
      const column = document.createElement("div");
      column.className = "atsx-date-picker-period-month-panel-list";
      for (const value of values) {
        const option = document.createElement("div");
        option.className = "atsx-date-picker-period-month-panel-list-item";
        option.textContent = String(value).padStart(2, "0");
        if (value === disabledMonth) option.classList.add("atsx-date-picker-period-month-panel-list-item-disabled");
        option.addEventListener("click", () => {
          clicks.push({ index, value });
          if (value > 1000) {
            replaceForm();
            open(index, String(value));
          } else {
            if (!ignoreMonth && value !== disabledMonth && chosenYear) {
              const current = endpoints()[index];
              current.querySelector("[data-cy='year']").textContent = chosenYear;
              current.querySelector("[data-cy='month']").textContent = String(value).padStart(2, "0");
              replaceForm();
              if (rollbackMonth) window.setTimeout(() => {
                endpoints()[index].querySelector("[data-cy='year']").textContent = "YYYY";
                endpoints()[index].querySelector("[data-cy='month']").textContent = "MM";
              }, 0);
            }
            dropdown.remove();
          }
        });
        column.append(option);
      }
      panel.append(column);
    }
    dropdown.append(panel);
    document.body.append(dropdown);
  }
  function wire() {
    endpoints().forEach((endpoint, index) => endpoint.addEventListener("click", () => {
      panelDelay ? window.setTimeout(() => open(index), 0) : open(index);
    }));
  }
  wire();
  window.eval(schema);
  window.eval(content);
  return {
    document, clicks,
    close: () => window.close(),
    values: () => endpoints().map((node) => `${node.querySelector("[data-cy='year']").textContent}-${node.querySelector("[data-cy='month']").textContent}`),
    async send(type, profile, rest = {}) {
      const result = await new Promise((resolve) => listener({ type: `RESUME_HELPER_V2_${type}`, profile, ...rest }, {}, resolve));
      assert.equal(result.ok, true, result.error);
      return result;
    }
  };
}

test("飞书无输入框的项目起止年月按条目识别，隐藏焦点框不参与填充", async (t) => {
  const h = harness(period("project", 0) + period("project", 1));
  t.after(h.close);
  const profile = { project: [{ startDate: "2024-09", endDate: "2025-02" }, { startDate: "2025年03月", endDate: "2026/06" }] };
  const scan = await h.send("SCAN", profile);
  assert.deepEqual(Array.from(scan.fields, (f) => [f.key, f.occurrence, f.controlType]), [
    ["project.startDate", 0, "date-picker"], ["project.endDate", 0, "date-picker"],
    ["project.startDate", 1, "date-picker"], ["project.endDate", 1, "date-picker"]
  ]);
  assert.equal(scan.fillableCount, 4);
  const result = await h.send("FILL", profile);
  assert.equal(result.failed, 0);
  assert.equal(result.filled, 4);
  assert.deepEqual(h.values(), ["2024-09", "2025-02", "2025-03", "2026-06"]);
  assert.ok([...h.document.querySelectorAll("input")].every((input) => input.value === ""));
});

test("年月选择重绘整张表单、异步加载弹层后仍能定位同一条经历", async (t) => {
  const h = harness(period("internship", 0) + period("project", 0) + period("project", 1), { rerender: true, panelDelay: true });
  t.after(h.close);
  const profile = { internship: [{ startDate: "2022-06", endDate: "2023-08" }], project: [
    { startDate: "2024-09", endDate: "2025-02" }, { startDate: "2025.03", endDate: "2026-06-30" }
  ] };
  const result = await h.send("FILL", profile);
  assert.equal(result.failed, 0);
  assert.equal(result.filled, 6);
  assert.equal(result.percent, 100);
  assert.deepEqual(h.values(), ["2022-06", "2023-08", "2024-09", "2025-02", "2025-03", "2026-06"]);
  const scan = await h.send("SCAN", profile);
  assert.ok(scan.fields.every((field) => field.hasPageValue));
  assert.equal(scan.fillableCount, 0);
  const repeat = await h.send("FILL", profile);
  assert.equal(repeat.filled, 0);
});

test("日期入口没有 data-cy 时通过条目结构绑定，其他页面弹层不会被误点", async (t) => {
  const h = harness(period("project", 0, { withPath: false }) + period("project", 1, { withPath: false }), { rerender: true });
  t.after(h.close);
  const unrelated = h.document.createElement("div");
  unrelated.className = "atsx-date-picker-dropdown";
  unrelated.innerHTML = '<div class="atsx-date-picker-period-month-panel"><div class="atsx-date-picker-period-month-panel-list-item">2025</div></div>';
  h.document.body.append(unrelated);
  let unrelatedClicks = 0;
  unrelated.addEventListener("click", () => { unrelatedClicks += 1; });
  const result = await h.send("FILL", { project: [{ startDate: "2024-09", endDate: "2025-02" }, { startDate: "2025-03", endDate: "2026-06" }] });
  assert.equal(result.failed, 0);
  assert.equal(result.filled, 4);
  assert.equal(unrelatedClicks, 0);
  assert.deepEqual(h.values(), ["2024-09", "2025-02", "2025-03", "2026-06"]);
});

test("保留已有起始年月，只补结束年月；覆盖开关生效", async (t) => {
  const h = harness(period("education", 0, { start: "2021-09" }));
  t.after(h.close);
  const profile = { education: [{ startDate: "2022-09", endDate: "2025-06" }] };
  const result = await h.send("FILL", profile);
  assert.equal(result.filled, 1);
  assert.equal(result.skippedExisting, 1);
  assert.deepEqual(h.values(), ["2021-09", "2025-06"]);
  const overwritten = await h.send("FILL", profile, { overwriteExisting: true });
  assert.equal(overwritten.failed, 0);
  assert.deepEqual(h.values(), ["2022-09", "2025-06"]);
});

test("必填起止年月分别提供对应建议，不将隐藏输入框列为遗漏", async (t) => {
  const h = harness(period("project", 0, { required: true }));
  t.after(h.close);
  const scan = await h.send("SCAN", { project: [{ startDate: "2024-09", endDate: "2025-02" }] });
  assert.deepEqual(Array.from(scan.requiredFields, (field) => [field.recognizedKey, field.suggestion]), [
    ["project.startDate", "2024-09"], ["project.endDate", "2025-02"]
  ]);
  assert.notEqual(scan.requiredFields[0].memoryKey, scan.requiredFields[1].memoryKey);
});

test("年月选项禁用或页面未提交选择时报告失败，不把点击当作成功", async (t) => {
  for (const config of [{ disabledMonth: 9 }, { ignoreMonth: true }, { rollbackMonth: true }]) {
    const h = harness(period("project", 0), config);
    t.after(h.close);
    const result = await h.send("FILL", { project: [{ startDate: "2025-09" }] });
    assert.equal(result.failed, 1);
    assert.equal(result.filled, 0);
    assert.deepEqual(h.values(), ["YYYY-MM", "YYYY-MM"]);
    assert.match(result.issues[0].reason, /日期区间/);
    if (config.disabledMonth) assert.ok(!h.clicks.some((click) => click.value === 9));
  }
});

test("日期非法或目标年份没有可选项时不随意选择其他日期", async (t) => {
  for (const date of ["2025-13", "2030-09"]) {
    const h = harness(period("project", 0));
    t.after(h.close);
    const result = await h.send("FILL", { project: [{ startDate: date }] });
    assert.equal(result.failed, 1);
    assert.equal(result.filled, 0);
    assert.deepEqual(h.clicks, []);
    assert.deepEqual(h.values(), ["YYYY-MM", "YYYY-MM"]);
  }
});
