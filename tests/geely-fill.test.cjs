const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const schemaSource = fs.readFileSync(path.join(__dirname, "../extension/profile-schema.js"), "utf8");
const contentSource = fs.readFileSync(path.join(__dirname, "../extension/content.js"), "utf8");

// Match the rendered Moka / Sugar markup observed on Geely's application page.
function field(label, control, required = false) {
  return `<div class="apply-field-example"><div class="title-example"><span>${label}</span>${required ? '<span class="required-asterisk-example"></span>' : ""}</div><div class="ctrl-example">${control}</div></div>`;
}

function selectControl(options, { value = "", event = "mousedown", invalid = false, placeholder = "请选择", readonly = false, lazySearch = false, bareMenu = false, clearPlaceholder = false } = {}) {
  return `<div class="sd-Dropdown-container-example" data-options='${JSON.stringify(options)}' data-event="${event}" data-invalid="${invalid}" data-lazy="${lazySearch}" data-bare="${bareMenu}" data-clear-placeholder="${clearPlaceholder}"><label class="sd-Input-container-example sd-Select-container-example"><span class="sd-Input-display-value-example">${value}</span><input type="text" placeholder="${placeholder}" ${readonly ? "readonly" : ""}><div class="sd-Input-message-example">${value ? "" : "必填项未填写"}</div></label><span></span></div>`;
}

function dropdown(label, options, config = {}) {
  return field(label, selectControl(options, config), config.required ?? true);
}

function entry(fields) {
  return `<div class="apply-fields-example multi-example">${fields}</div>`;
}

function section(title, entries) {
  return `<div class="apply-block-example"><div class="blockTitle-example">${title}</div>${entries}</div>`;
}

function harness(html, { rerender = false } = {}) {
  const dom = new JSDOM(`<main>${html}</main>`, { runScripts: "outside-only", url: "https://example.test/apply" });
  const { window } = dom;
  const { document } = window;
  Object.defineProperty(window.HTMLElement.prototype, "innerText", { get() { return this.textContent; } });
  window.HTMLElement.prototype.getBoundingClientRect = function () {
    return { width: this.hidden ? 0 : 200, height: this.hidden ? 0 : 30, top: 0, left: 0 };
  };
  window.CSS = { escape: (value) => value };
  const originalTimeout = window.setTimeout.bind(window);
  window.setTimeout = (callback, milliseconds) => originalTimeout(callback, Math.min(milliseconds, 1));
  let listener;
  window.chrome = { runtime: { onMessage: {
    addListener: (handler) => { listener = handler; },
    removeListener: (handler) => { if (listener === handler) listener = null; }
  } } };

  function wireDropdowns() {
    document.querySelectorAll("[data-options]").forEach((root) => {
      const input = root.querySelector("input");
      const open = () => {
        document.querySelectorAll(".sd-Dropdown-dropdown-example").forEach((menu) => menu.remove());
        if (root.dataset.lazy === "true" && !input.value) return;
        const menu = document.createElement("div");
        menu.className = "sd-Dropdown-dropdown-example sd-Select-menu-example";
        for (const text of JSON.parse(root.dataset.options)) {
          if (root.dataset.lazy === "true" && !text.includes(input.value)) continue;
          const option = document.createElement("div");
          option.className = "sd-Select-common-item-example";
          const interactive = document.createElement("div");
          interactive.className = "sd-Menu-container-example";
          interactive.innerHTML = '<span></span><div class="sd-Menu-content-example"><div class="option-label-example"></div></div>';
          interactive.querySelector(".option-label-example").textContent = text;
          option.append(interactive);
          // The real Sugar menu's handler is inside the option wrapper.
          interactive.addEventListener(root.dataset.event, (event) => {
            event.preventDefault();
            if (root.dataset.invalid !== "true") {
              root.querySelector("[class*='display-value']").textContent = text;
              root.querySelector("[class*='message']").textContent = "";
              if (root.dataset.clearPlaceholder === "true") root.querySelector("input").placeholder = "";
            }
            menu.remove();
            if (rerender) {
              const main = document.querySelector("main");
              main.innerHTML = main.innerHTML;
              wireDropdowns();
            }
          });
          menu.append(root.dataset.bare === "true" ? interactive : option);
        }
        root.append(menu);
      };
      input.addEventListener("click", open);
      input.addEventListener("input", open);
    });
  }
  wireDropdowns();
  window.eval(schemaSource);
  window.eval(contentSource);
  return {
    document,
    close: () => window.close(),
    async send(type, rest = {}) {
      const response = await new Promise((resolve) => listener({ type: type.replace("RESUME_HELPER_", "RESUME_HELPER_V2_"), ...rest }, {}, resolve));
      assert.equal(response.ok, true, response.error);
      return response;
    },
    values(label) {
      return [...document.querySelectorAll(".apply-field-example")]
        .filter((node) => node.querySelector(".title-example").textContent === label)
        .map((node) => node.querySelector("[class*='display-value']")?.textContent ?? node.querySelector("input,textarea")?.value);
    }
  };
}

test("校园职务、经历描述及独立年月控件按同一条经历填入", async (t) => {
  const dates = field("开始时间", '<input placeholder="年"><input placeholder="月">')
    + field("结束时间", '<input placeholder="年"><input placeholder="月">');
  const fields = dates + field("校内任职职务", '<input placeholder="校内任职职务">') + field("校园经历信息", "<textarea></textarea>");
  const h = harness(section("校园经历", entry(fields) + entry(fields)));
  t.after(h.close);
  const profile = { campus: [
    { role: "部长", description: "组织校园活动", startDate: "2022-09", endDate: "2023-06" },
    { role: "成员", description: "参与志愿服务", startDate: "2023-10", endDate: "2024-07" }
  ] };
  const scan = await h.send("RESUME_HELPER_SCAN", { profile });
  assert.deepEqual(Array.from(scan.fields.filter((f) => f.key === "campus.description"), (f) => f.occurrence), [0, 1]);
  const fill = await h.send("RESUME_HELPER_FILL", { profile });
  assert.equal(fill.failed, 0);
  assert.deepEqual(h.values("校内任职职务"), ["部长", "成员"]);
  assert.deepEqual(h.values("校园经历信息"), ["组织校园活动", "参与志愿服务"]);
  assert.deepEqual([...h.document.querySelectorAll('input[placeholder="年"]')].map((e) => e.value), ["2022", "2023", "2023", "2024"]);
  assert.deepEqual([...h.document.querySelectorAll('input[placeholder="月"]')].map((e) => e.value), ["9", "6", "10", "7"]);
});

test("Moka 的 mousedown 选项可提交成绩排名和全日制答案", async (t) => {
  const fields = dropdown("成绩排名", ["前5%", "前10%", "前20%"])
    + dropdown("是否全日制", ["是", "否"]);
  const h = harness(section("教育背景", entry(fields) + entry(fields)));
  t.after(h.close);
  const profile = { education: [{ ranking: "前 10%", studyMode: "全日制" }, { ranking: "前20%", studyMode: "非全日制" }] };
  const fill = await h.send("RESUME_HELPER_FILL", { profile });
  assert.equal(fill.failed, 0);
  assert.deepEqual(h.values("成绩排名"), ["前10%", "前20%"]);
  assert.deepEqual(h.values("是否全日制"), ["是", "否"]);
});

test("已识别且有资料但尚未写入的字段仍可在面板确认，建议按条目取值", async (t) => {
  const fields = dropdown("成绩排名", ["前5%", "前20%"]);
  const h = harness(section("教育背景", entry(fields) + entry(fields)));
  t.after(h.close);
  const profile = { education: [{ ranking: "前5%" }, { ranking: "前20%" }] };
  const scan = await h.send("RESUME_HELPER_SCAN", { profile });
  assert.deepEqual(Array.from(scan.requiredFields, (f) => f.suggestion), ["前5%", "前20%"]);
  const answers = Object.fromEntries(scan.requiredFields.map((f) => [f.id, f.suggestion]));
  const result = await h.send("RESUME_HELPER_APPLY_REQUIRED", { profile, answers });
  assert.equal(result.applied, 2);
  assert.equal(result.failed, 0);
  assert.equal(result.requiredFields.length, 0);
});

test("用户在面板确认的答案优先于简历中的原始排名", async (t) => {
  const fields = dropdown("成绩排名", ["前5%", "前20%"], { event: "click" });
  const h = harness(section("教育背景", entry(fields) + entry(fields)));
  t.after(h.close);
  const profile = { education: [{ ranking: "前5%" }, { ranking: "前5%" }] };
  const initial = await h.send("RESUME_HELPER_SCAN", { profile });
  const second = initial.requiredFields[1];
  const requiredAnswerMemory = { [second.memoryKey]: { value: "前20%" } };
  const scan = await h.send("RESUME_HELPER_SCAN", { profile, requiredAnswerMemory });
  assert.equal(scan.requiredFields[1].suggestion, "前20%");
  const answers = Object.fromEntries(scan.requiredFields.map((f) => [f.id, f.suggestion]));
  const result = await h.send("RESUME_HELPER_APPLY_REQUIRED", { profile, requiredAnswerMemory, answers });
  assert.equal(result.applied, 2);
  assert.deepEqual(h.values("成绩排名"), ["前5%", "前20%"]);
});

test("第一条完成后，第二条成绩排名的确认 ID 和答案不串位", async (t) => {
  const fields = dropdown("成绩排名", ["前5%", "前20%"]);
  const h = harness(section("教育背景", entry(fields) + entry(fields)));
  t.after(h.close);
  const scan = await h.send("RESUME_HELPER_SCAN");
  const [first, second] = scan.requiredFields;
  const firstResult = await h.send("RESUME_HELPER_APPLY_REQUIRED", { answers: { [first.id]: "前5%" } });
  assert.equal(firstResult.applied, 1);
  assert.equal(firstResult.requiredFields[0].id, second.id);
  const secondResult = await h.send("RESUME_HELPER_APPLY_REQUIRED", { answers: { [second.id]: "前20%" } });
  assert.equal(secondResult.applied, 1);
  assert.deepEqual(h.values("成绩排名"), ["前5%", "前20%"]);
});

test("确认多个答案时，选择后页面重绘也会重新定位后续控件", async (t) => {
  const fields = dropdown("成绩排名", ["前5%", "前20%"])
    + dropdown("是否全日制", ["是", "否"]);
  const h = harness(section("教育背景", entry(fields) + entry(fields)), { rerender: true });
  t.after(h.close);
  const scan = await h.send("RESUME_HELPER_SCAN");
  const requested = ["前5%", "是", "前20%", "否"];
  const answers = Object.fromEntries(scan.requiredFields.map((f, i) => [f.id, requested[i]]));
  const result = await h.send("RESUME_HELPER_APPLY_REQUIRED", { answers });
  assert.equal(result.applied, 4);
  assert.equal(result.failed, 0);
  assert.deepEqual(h.values("成绩排名"), ["前5%", "前20%"]);
  assert.deepEqual(h.values("是否全日制"), ["是", "否"]);
});

test("学历类型绑定学习形式，不占用学历的经历序号", async (t) => {
  const fields = dropdown("学历", ["本科", "硕士"])
    + dropdown("学历类型", ["全日制", "非全日制"]);
  const h = harness(section("教育背景", entry(fields) + entry(fields)));
  t.after(h.close);
  const scan = await h.send("RESUME_HELPER_SCAN", { profile: { education: [{ degree: "硕士" }, { degree: "本科" }] } });
  assert.deepEqual(Array.from(scan.fields.filter((f) => f.key === "education.degree"), (f) => f.occurrence), [0, 1]);
  assert.equal(scan.requiredFields.filter((f) => f.label === "学历类型" && f.recognizedKey === "education.studyMode").length, 2);
});

test("普通 click 选项兼容；校验未通过及过期答案会明确报失败", async (t) => {
  const h = harness(section("教育背景", entry(dropdown("成绩排名", ["前5%"], { event: "click", invalid: true }))));
  t.after(h.close);
  const scan = await h.send("RESUME_HELPER_SCAN");
  const result = await h.send("RESUME_HELPER_APPLY_REQUIRED", { answers: { [scan.requiredFields[0].id]: "前5%", "stale-field": "是" } });
  assert.equal(result.applied, 0);
  assert.equal(result.failed, 2);
  assert.equal(result.requiredFields.length, 1);
});

test("已有简历值但写入失败的必填字段只计为一个遗漏", async (t) => {
  const h = harness(section("教育背景", entry(dropdown("成绩排名", ["前5%"], { invalid: true }))));
  t.after(h.close);
  const result = await h.send("RESUME_HELPER_FILL", { profile: { education: [{ ranking: "前5%" }] } });
  assert.equal(result.requiredFields.length, 1);
  assert.equal(result.issues.length, 1);
  assert.equal(result.modules[0].total, 1);
  assert.equal(result.percent, 0);
});

test("文本值在页面异步校验后被回退时不报填写成功", async (t) => {
  const h = harness(section("校园经历", entry(field("校内任职职务", '<input placeholder="校内任职职务">'))));
  t.after(h.close);
  const input = h.document.querySelector("input");
  input.addEventListener("input", () => queueMicrotask(() => { input.value = ""; }));
  const result = await h.send("RESUME_HELPER_FILL", { profile: { campus: [{ role: "部长" }] } });
  assert.equal(result.filled, 0);
  assert.equal(result.failed, 1);
  assert.deepEqual(h.values("校内任职职务"), [""]);
});

test("真实 month-range-select 的独立起止控件支持只读、年后缀和零补齐月份", async (t) => {
  const date = (label) => field(label, `<div class="month-range-select date_info"><label></label><span>${
    selectControl(["2022年", "2023年", "2024年"], { placeholder: "年", readonly: true, bareMenu: true })
    + selectControl(["06月", "09月", "10月"], { placeholder: "月", readonly: true, bareMenu: true })
  }</span></div>`);
  const fields = date("开始时间") + date("结束时间");
  const h = harness(section("校园经历", entry(fields) + entry(fields)));
  t.after(h.close);
  const profile = { campus: [
    { startDate: "2022年09月", endDate: "2023-06" },
    { startDate: "2023/10", endDate: "2024.09" }
  ] };
  const scan = await h.send("RESUME_HELPER_SCAN", { profile });
  assert.equal(scan.fields.filter((f) => f.key === "campus.endDate").length, 4);
  const result = await h.send("RESUME_HELPER_FILL", { profile });
  assert.equal(result.failed, 0);
  assert.deepEqual([...h.document.querySelectorAll('[placeholder="年"]')].map((e) => e.previousElementSibling.textContent), ["2022年", "2023年", "2023年", "2024年"]);
  assert.deepEqual([...h.document.querySelectorAll('[placeholder="月"]')].map((e) => e.previousElementSibling.textContent), ["09月", "06月", "10月", "09月"]);
});

test("四个年月下拉共用一个起止时间容器时仍正确绑定起止年月", async (t) => {
  const pair = () => selectControl(["2021", "2025"], { placeholder: "年" }) + selectControl(["6", "9"], { placeholder: "月" });
  const h = harness(section("教育背景", entry(field("就读时间", `<div class="month-range-select">${pair()}-${pair()}</div>`))));
  t.after(h.close);
  const result = await h.send("RESUME_HELPER_FILL", { profile: { education: [{ startDate: "2021-09", endDate: "2025-06" }] } });
  assert.equal(result.failed, 0);
  assert.deepEqual([...h.document.querySelectorAll('[class*="display-value"]')].map((e) => e.textContent), ["2021", "9", "2025", "6"]);
});

test("学校国家按教育条目绑定，不能使用个人国家替代空资料", async (t) => {
  const schoolCountry = dropdown("学校所在 国家/地区", ["中国", "美国"]);
  const h = harness(section("个人信息", entry(dropdown("国家/地区", ["中国", "美国"])))
    + section("教育背景", entry(schoolCountry) + entry(schoolCountry)));
  t.after(h.close);
  const profile = { personal: { country: "中国大陆" }, education: [{ country: "USA" }, { country: "中国" }] };
  const scan = await h.send("RESUME_HELPER_SCAN", { profile });
  assert.deepEqual(Array.from(scan.fields.filter((f) => f.key === "education.country"), (f) => f.occurrence), [0, 1]);
  const result = await h.send("RESUME_HELPER_FILL", { profile });
  assert.equal(result.failed, 0);
  assert.deepEqual(h.values("学校所在 国家/地区"), ["美国", "中国"]);
  assert.deepEqual(h.values("国家/地区"), ["中国"]);

  const blank = harness(section("教育背景", entry(schoolCountry)));
  t.after(blank.close);
  const missing = await blank.send("RESUME_HELPER_SCAN", { profile: { personal: { country: "中国大陆" }, education: [{ school: "测试大学" }] } });
  assert.equal(missing.requiredFields[0].recognizedKey, "education.country");
  assert.equal(missing.requiredFields[0].suggestion, "");
  assert.equal(missing.requiredFields[0].safeToAutofill, false);
});

test("搜索型国家下拉会尝试同义搜索词，且不借用其他字段的弹层", async (t) => {
  const h = harness(section("个人信息", entry(dropdown("国家/地区", ["中国", "中国香港"], { lazySearch: true }))));
  t.after(h.close);
  const otherMenu = h.document.createElement("div");
  otherMenu.innerHTML = '<div class="sd-Select-common-item-example">中国大陆</div>';
  h.document.body.append(otherMenu);
  const result = await h.send("RESUME_HELPER_FILL", { profile: { personal: { country: "中国大陆" } } });
  assert.equal(result.failed, 0);
  assert.deepEqual(h.values("国家/地区"), ["中国"]);
});

test("匿名的手机区号和证件类型下拉根据组合控件区别于号码文本框", async (t) => {
  const fields = field("手机号码", selectControl(["+86"], { placeholder: "" }) + '<input placeholder="请输入手机号">')
    + field("证件号码", selectControl(["身份证"], { placeholder: "" }) + '<input placeholder="证件号码">');
  const h = harness(section("个人信息", entry(fields)));
  t.after(h.close);
  const scan = await h.send("RESUME_HELPER_SCAN");
  assert.deepEqual(Array.from(scan.fields, (f) => f.key).sort(), ["personal.idNumber", "personal.idType", "personal.phone", "personal.phoneCountryCode"].sort());
});

test("原生编码下拉使用显示文字回读，语义相反的全日制选项不会误选", async (t) => {
  const fields = field("是否全日制", '<select><option value="">请选择</option><option value="Y">是</option><option value="N">否</option></select>', true)
    + dropdown("学历类型", ["非全日制"]);
  const h = harness(section("教育背景", entry(fields)));
  t.after(h.close);
  const result = await h.send("RESUME_HELPER_FILL", { profile: { education: [{ studyMode: "全日制" }] } });
  assert.equal(h.document.querySelector("select").value, "Y");
  assert.deepEqual(h.values("学历类型"), [""]);
  assert.equal(result.failed, 1);
});

test("整个表单的 question 包装不能把其他字段必填标记传播给复选框", async (t) => {
  const h = harness(`<div class="question-page">${section("申请信息", entry(dropdown("意向工作城市", ["杭州"])))}<div><label><input type="checkbox"></label><span>我已阅读并同意隐私协议</span></div></div>`);
  t.after(h.close);
  const scan = await h.send("RESUME_HELPER_SCAN");
  assert.equal(scan.requiredFields.length, 1);
  assert.equal(scan.requiredFields[0].controlType, "custom-select");
});

test("旧版全局标记不阻止新版加载，同版本注入不会重复注册监听器", async (t) => {
  const h = harness("");
  t.after(h.close);
  const window = h.document.defaultView;
  const controller = window.__resumeHelperController;
  window.eval(contentSource);
  assert.equal(window.__resumeHelperController, controller);
  delete window.__resumeHelperController;
  window.__resumeHelperLoaded = true;
  window.eval(contentSource);
  assert.notEqual(window.__resumeHelperController, controller);
  const ping = await h.send("RESUME_HELPER_PING");
  assert.equal(ping.version, JSON.parse(fs.readFileSync(path.join(__dirname, "../extension/manifest.json"), "utf8")).version);
});

test("学校所在地的历史答案必须绑定字段含义和对应学校", async (t) => {
  const h = harness(section("教育背景", entry(dropdown("学校所在 国家/地区", ["中国", "美国"]))));
  t.after(h.close);
  const profile = { education: [{ school: "测试大学" }] };
  const scan = await h.send("RESUME_HELPER_SCAN", { profile });
  const descriptor = scan.requiredFields[0];
  const legacy = { [descriptor.memoryKey]: { value: "中国" } };
  const legacyScan = await h.send("RESUME_HELPER_SCAN", { profile, requiredAnswerMemory: legacy });
  assert.equal(legacyScan.requiredFields[0].suggestion, "");
  const memory = { [descriptor.memoryKey]: { value: "美国", recognizedKey: descriptor.recognizedKey, recordIdentity: descriptor.recordIdentity } };
  const remembered = await h.send("RESUME_HELPER_SCAN", { profile, requiredAnswerMemory: memory });
  assert.equal(remembered.requiredFields[0].suggestion, "美国");
  const otherSchool = await h.send("RESUME_HELPER_SCAN", { profile: { education: [{ school: "另一所大学" }] }, requiredAnswerMemory: memory });
  assert.equal(otherSchool.requiredFields[0].suggestion, "");
});

test("选中后替换输入框并清空占位符时仍回读当前控件，不重复填写", async (t) => {
  const fields = dropdown("成绩排名", ["前5%", "前20%"], { clearPlaceholder: true })
    + dropdown("是否全日制", ["是", "否"], { clearPlaceholder: true });
  const h = harness(section("教育背景", entry(fields) + entry(fields)), { rerender: true });
  t.after(h.close);
  const result = await h.send("RESUME_HELPER_FILL", { profile: { education: [
    { ranking: "前5%", studyMode: "全日制" }, { ranking: "前20%", studyMode: "非全日制" }
  ] } });
  assert.equal(result.failed, 0);
  assert.equal(result.filled, 4);
  assert.equal(result.percent, 100);
  assert.deepEqual(h.values("成绩排名"), ["前5%", "前20%"]);
  assert.deepEqual(h.values("是否全日制"), ["是", "否"]);
});

test("年月选中后占位符消失，重新扫描仍保留开始和结束的年月分量", async (t) => {
  const date = (label) => field(label, `<div class="month-range-select">${
    selectControl(["2022", "2023"], { placeholder: "年", bareMenu: true, clearPlaceholder: true })
    + selectControl(["6", "9"], { placeholder: "月", bareMenu: true, clearPlaceholder: true })
  }</div>`);
  const h = harness(section("校园经历", entry(date("开始时间") + date("结束时间"))), { rerender: true });
  t.after(h.close);
  const profile = { campus: [{ startDate: "2022-09", endDate: "2023-06" }] };
  const result = await h.send("RESUME_HELPER_FILL", { profile });
  assert.equal(result.failed, 0);
  assert.equal(result.filled, 4);
  assert.deepEqual([...h.document.querySelectorAll('[class*="display-value"]')].map((e) => e.textContent), ["2022", "9", "2023", "6"]);
  const scan = await h.send("RESUME_HELPER_SCAN", { profile });
  assert.deepEqual(Array.from(scan.fields, (f) => `${f.key}:${f.component}`), ["campus.startDate:year", "campus.startDate:month", "campus.endDate:year", "campus.endDate:month"]);
});
