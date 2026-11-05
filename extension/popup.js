const CONTENT_VERSION = "0.12.4";

const elements = {
  siteName: document.getElementById("siteName"),
  profileVersionSelect: document.getElementById("profileVersionSelect"),
  activeVersionSource: document.getElementById("activeVersionSource"),
  manageProfiles: document.getElementById("manageProfiles"),
  statusVisual: document.getElementById("statusVisual"),
  statusTitle: document.getElementById("statusTitle"),
  statusDescription: document.getElementById("statusDescription"),
  fieldCount: document.getElementById("fieldCount"),
  fieldPreview: document.getElementById("fieldPreview"),
  fieldChips: document.getElementById("fieldChips"),
  moreFields: document.getElementById("moreFields"),
  confidenceText: document.getElementById("confidenceText"),
  resultBox: document.getElementById("resultBox"),
  requiredSuggestions: document.getElementById("requiredSuggestions"),
  requiredCount: document.getElementById("requiredCount"),
  requiredSuggestionList: document.getElementById("requiredSuggestionList"),
  applySuggestions: document.getElementById("applySuggestions"),
  emptyProfile: document.getElementById("emptyProfile"),
  overwriteExisting: document.getElementById("overwriteExisting"),
  fillButton: document.getElementById("fillButton"),
  scanButton: document.getElementById("scanButton")
};

let activeTab = null;
let profile = null;
let resumeProfiles = [];
let activeResumeProfileId = "";
let lastScan = null;
let requiredAnswerMemory = {};
let currentRequiredFields = [];

function profileHasData(value) {
  if (!value || typeof value !== "object") return false;
  return Object.entries(value).some(([key, item]) => key !== "meta" && (typeof item === "string" ? item.trim() : profileHasData(item)));
}

function setStatus(kind, title, description) {
  elements.statusVisual.className = `status-visual ${kind}`;
  elements.statusVisual.innerHTML = kind === "success"
    ? '<svg viewBox="0 0 24 24"><path d="m6 12.5 4 4L18.5 8"/><circle cx="12" cy="12" r="9"/></svg>'
    : kind === "warning"
      ? '<svg viewBox="0 0 24 24"><path d="M12 8v5M12 16.5v.1"/><circle cx="12" cy="12" r="9"/></svg>'
    : kind === "error"
      ? '<svg viewBox="0 0 24 24"><path d="M12 8v5M12 16.5v.1"/><circle cx="12" cy="12" r="9"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3M7 12h10"/></svg>';
  elements.statusTitle.textContent = title;
  elements.statusDescription.textContent = description;
}

function openOptions() {
  chrome.runtime.openOptionsPage();
}

function activeProfileVersion() {
  return resumeProfiles.find((item) => item.id === activeResumeProfileId) || resumeProfiles[0];
}

function renderProfileVersions() {
  elements.profileVersionSelect.replaceChildren();
  resumeProfiles.forEach((version) => {
    const option = document.createElement("option");
    option.value = version.id;
    option.textContent = version.name;
    option.selected = version.id === activeResumeProfileId;
    elements.profileVersionSelect.append(option);
  });
  const active = activeProfileVersion();
  elements.activeVersionSource.textContent = active?.sourceFileName || "尚未导入文件";
  elements.activeVersionSource.title = active?.sourceFileName || "尚未导入文件";
}

async function switchProfileVersion(nextId) {
  if (!nextId || nextId === activeResumeProfileId) return;
  const next = resumeProfiles.find((item) => item.id === nextId);
  if (!next) return;
  activeResumeProfileId = nextId;
  profile = next.profile || ResumeHelperSchema.createEmptyProfile();
  await chrome.storage.local.set({ activeResumeProfileId, resumeProfile: profile });
  renderProfileVersions();
  elements.emptyProfile.hidden = profileHasData(profile);
  lastScan = null;
  currentRequiredFields = [];
  await scanPage();
}

async function sendToPage(message) {
  if (!activeTab?.id) throw new Error("没有可用的网页标签页");
  const request = { ...message, type: message.type.replace("RESUME_HELPER_", "RESUME_HELPER_V2_") };
  try {
    const ready = await chrome.tabs.sendMessage(activeTab.id, { type: "RESUME_HELPER_V2_PING" });
    if (ready?.version === CONTENT_VERSION) return await chrome.tabs.sendMessage(activeTab.id, request);
  } catch (_) {
    // Old content scripts do not handle the versioned handshake.
  }
  try {
    await chrome.scripting.insertCSS({ target: { tabId: activeTab.id }, files: ["content.css"] });
    await chrome.scripting.executeScript({ target: { tabId: activeTab.id }, files: ["profile-schema.js", "content.js"] });
    return await chrome.tabs.sendMessage(activeTab.id, request);
  } catch (_) {
    throw new Error("这个页面不允许扩展运行，请打开公司的网申页面后重试");
  }
}

async function scanPage() {
  elements.fillButton.disabled = true;
  elements.resultBox.hidden = true;
  elements.fieldPreview.hidden = true;
  elements.fieldCount.hidden = true;
  setStatus("scanning", "正在扫描表单结构", "识别字段含义，以及文本框、下拉、级联、单选和日期控件");

  try {
    const result = await sendToPage({ type: "RESUME_HELPER_SCAN", profile, requiredAnswerMemory });
    lastScan = result;
    renderRequiredSuggestions(result?.requiredFields || []);
    if (!result?.fields?.length && !result?.requiredFields?.length) {
      setStatus("error", "暂未识别到字段", "请确认已进入申请表单，或滚动页面加载完整表单");
      elements.fillButton.disabled = true;
      return;
    }

    const controlTypeText = result.controlTypes?.length ? `、${result.controlTypes.length} 类控件` : "";
    const requiredCount = result.requiredFields?.length || 0;
    const externalRequiredCount = (result.requiredFields || []).filter((item) => !item.recognizedKey).length;
    const requiredText = requiredCount
      ? `，另有 ${requiredCount} 个必填项需要补充或确认${externalRequiredCount ? `（其中 ${externalRequiredCount} 个超出资料模型）` : ""}`
      : "";
    setStatus("success", "已生成本页填充方案", `识别到 ${result.fields.length} 个资料字段${controlTypeText}${requiredText}`);
    elements.fieldCount.hidden = false;
    elements.fieldCount.querySelector("strong").textContent = result.fields.length + externalRequiredCount;
    renderFields(result.fields);
    elements.fillButton.disabled = result.fields.every((item) => !item.hasProfileValue) && !(result.requiredFields || []).some((item) => item.safeToAutofill && item.suggestion);
  } catch (error) {
    setStatus("error", "无法读取当前页面", error.message);
  }
}

function updateSuggestionButton() {
  elements.applySuggestions.disabled = ![...elements.requiredSuggestionList.querySelectorAll(".required-answer")].some((control) => control.value.trim());
}

function renderRequiredSuggestions(fields) {
  currentRequiredFields = fields || [];
  elements.requiredSuggestions.hidden = !currentRequiredFields.length;
  elements.requiredCount.textContent = `${currentRequiredFields.length} 项`;
  elements.requiredSuggestionList.replaceChildren();
  currentRequiredFields.forEach((field) => {
    const card = document.createElement("article");
    card.className = "required-item";

    const head = document.createElement("div");
    head.className = "required-item-head";
    const title = document.createElement("strong");
    title.textContent = field.label;
    const badge = document.createElement("span");
    badge.className = `required-badge${field.safeToAutofill ? "" : " confirm"}`;
    badge.textContent = field.manualOnly ? "需手动" : field.safeToAutofill ? "可自动填写" : "待确认";
    head.append(title, badge);

    const meta = document.createElement("p");
    meta.className = "required-meta";
    meta.textContent = `${field.module || "其他必填信息"}${field.recordOccurrence != null ? ` · 第 ${field.recordOccurrence + 1} 条` : ""} · ${field.controlLabel || "页面控件"}`;

    let control;
    if (field.manualOnly) {
      control = document.createElement("div");
      control.className = "manual-answer";
      control.textContent = field.controlType === "file-upload" ? "请回到网页选择并上传文件" : "请直接在网页中填写";
    } else if (field.options?.length) {
      control = document.createElement("select");
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "请选择确认答案";
      control.append(placeholder);
      field.options.forEach((optionText) => {
        const option = document.createElement("option");
        option.value = optionText;
        option.textContent = optionText;
        control.append(option);
      });
      if (field.suggestion) {
        const desired = field.suggestion.toLowerCase().replace(/\s+/g, "");
        const matched = [...control.options].find((option) => {
          const candidate = option.value.toLowerCase().replace(/\s+/g, "");
          return candidate && (candidate === desired || candidate.includes(desired) || desired.includes(candidate));
        });
        if (matched) control.value = matched.value;
      }
    } else {
      control = document.createElement("input");
      control.type = "text";
      control.placeholder = "请输入最合适的答案";
      control.value = field.suggestion || "";
    }
    if (!field.manualOnly) {
      control.className = "required-answer";
      control.dataset.requiredId = field.id;
      control.dataset.memoryKey = field.memoryKey;
      control.addEventListener("input", updateSuggestionButton);
      control.addEventListener("change", updateSuggestionButton);
    }

    const source = document.createElement("p");
    source.className = "required-source";
    source.textContent = field.source || "确认后仅保存在本机";
    card.append(head, meta, control, source);
    elements.requiredSuggestionList.append(card);
  });
  updateSuggestionButton();
}

async function applyRequiredAnswers() {
  const answers = {};
  const memoryUpdates = {};
  [...elements.requiredSuggestionList.querySelectorAll(".required-answer")].forEach((control) => {
    const value = control.value.trim();
    if (!value) return;
    answers[control.dataset.requiredId] = value;
    const field = currentRequiredFields.find((item) => item.id === control.dataset.requiredId);
    memoryUpdates[control.dataset.memoryKey] = {
      value,
      label: field?.label || "",
      module: field?.module || "",
      controlType: field?.controlType || "",
      recognizedKey: field?.recognizedKey || "",
      recordIdentity: field?.recordIdentity || "",
      updatedAt: new Date().toISOString()
    };
  });
  if (!Object.keys(answers).length) return;

  elements.applySuggestions.disabled = true;
  elements.applySuggestions.textContent = "正在填写并校验…";
  try {
    const nextMemory = { ...requiredAnswerMemory, ...memoryUpdates };
    const result = await sendToPage({
      type: "RESUME_HELPER_APPLY_REQUIRED",
      profile,
      answers,
      requiredAnswerMemory: nextMemory
    });
    if (!result?.ok) throw new Error(result?.error || "必填项写入失败");
    requiredAnswerMemory = nextMemory;
    await chrome.storage.local.set({ requiredAnswerMemory });
    renderRequiredSuggestions(result.requiredFields || []);
    elements.resultBox.className = `result-box${result.requiredFields?.length ? " warning" : ""}`;
    elements.resultBox.textContent = `已确认并填写 ${result.applied} 项${result.failed ? `，${result.failed} 项未能写入` : ""}${result.requiredFields?.length ? `，仍有 ${result.requiredFields.length} 项需要回答` : "，当前已加载页面的必填项已完成"}。`;
    elements.resultBox.hidden = false;
    setStatus(result.requiredFields?.length ? "warning" : "success", result.requiredFields?.length ? "还有必填项待确认" : "必填项已补齐", result.requiredFields?.length ? "补充下面的答案后再次确认填写" : "请检查页面内容并由你手动提交");
  } catch (error) {
    elements.resultBox.className = "result-box error";
    elements.resultBox.textContent = error.message;
    elements.resultBox.hidden = false;
  } finally {
    elements.applySuggestions.textContent = "确认并填写以上答案";
    updateSuggestionButton();
  }
}

function renderFields(fields) {
  elements.fieldPreview.hidden = false;
  elements.fieldChips.replaceChildren();
  const unique = [];
  const seen = new Set();
  fields.forEach((field) => {
    const identity = `${field.key}:${field.occurrence}`;
    if (!seen.has(identity)) {
      seen.add(identity);
      unique.push(field);
    }
  });
  unique.slice(0, 10).forEach((field) => {
    const chip = document.createElement("span");
    chip.className = `field-chip${field.hasProfileValue ? "" : " missing"}`;
    chip.textContent = field.label;
    chip.title = field.hasProfileValue
      ? `${field.controlLabel || "页面控件"} · 识别置信度 ${field.confidence}%`
      : `${field.controlLabel || "页面控件"} · 简历资料中尚未填写此项`;
    elements.fieldChips.append(chip);
  });
  elements.moreFields.hidden = unique.length <= 10;
  elements.moreFields.textContent = unique.length > 10 ? `另有 ${unique.length - 10} 个字段已识别` : "";
  const missing = unique.filter((field) => !field.hasProfileValue).length;
  elements.confidenceText.textContent = missing ? `${missing} 项资料尚未设置` : "资料已准备好";
}

async function fillPage() {
  elements.fillButton.disabled = true;
  elements.fillButton.querySelector("span").textContent = "正在填充…";
  elements.resultBox.hidden = true;
  try {
    const result = await sendToPage({
      type: "RESUME_HELPER_FILL",
      profile,
      requiredAnswerMemory,
      overwriteExisting: elements.overwriteExisting.checked
    });
    if (!result?.ok) throw new Error(result?.error || "填充失败，请刷新页面后重试");
    const issueCount = result.issues?.length || 0;
    const incompleteModules = (result.modules || []).filter((module) => module.complete < module.total).map((module) => module.label);
    renderRequiredSuggestions(result.requiredFields || []);
    elements.resultBox.className = `result-box${issueCount ? " warning" : ""}`;
    elements.resultBox.textContent = `${result.relocatedEntries ? `已迁回 ${result.relocatedEntries} 条错位项目，` : ""}${result.addedEntries ? `已自动新增 ${result.addedEntries} 个填写区块，` : ""}已填充 ${result.filled} 项${result.skippedExisting ? `，保留 ${result.skippedExisting} 项已有内容` : ""}${issueCount ? `，仍有 ${issueCount} 项需要检查${incompleteModules.length ? `（${incompleteModules.join("、")}）` : ""}` : ""}。`;
    elements.resultBox.hidden = false;
    if (result.requiredFields?.length) setStatus("warning", "发现新的必填项", "请检查下方智能建议，确认后可继续写入网页");
    else if (issueCount) setStatus("warning", "填充完成，但仍有遗漏", "网页右下角的进度组件列出了未完成字段");
    else setStatus("success", "填充完成", "网页右下角会显示各模块的完成情况");
  } catch (error) {
    elements.resultBox.className = "result-box error";
    elements.resultBox.textContent = error.message;
    elements.resultBox.hidden = false;
  } finally {
    elements.fillButton.disabled = !lastScan?.fields?.some((item) => item.hasProfileValue)
      && !currentRequiredFields.some((item) => item.safeToAutofill && item.suggestion);
    elements.fillButton.querySelector("span").textContent = "一键填充";
  }
}

async function init() {
  [document.getElementById("openOptions"), document.getElementById("editProfile"), document.getElementById("setupProfile")].forEach((button) => button.addEventListener("click", openOptions));
  elements.manageProfiles.addEventListener("click", openOptions);
  elements.profileVersionSelect.addEventListener("change", (event) => switchProfileVersion(event.target.value));
  elements.scanButton.addEventListener("click", scanPage);
  elements.fillButton.addEventListener("click", fillPage);
  elements.applySuggestions.addEventListener("click", applyRequiredAnswers);
  elements.overwriteExisting.addEventListener("change", () => chrome.storage.local.set({ fillSettings: { overwriteExisting: elements.overwriteExisting.checked } }));

  [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try { elements.siteName.textContent = `${activeTab?.url ? new URL(activeTab.url).hostname : "当前页面"} · v${CONTENT_VERSION}`; }
  catch (_) { elements.siteName.textContent = "当前页面"; }

  const stored = await chrome.storage.local.get(["resumeProfile", "resumeProfiles", "activeResumeProfileId", "fillSettings", "requiredAnswerMemory"]);
  const library = ResumeHelperSchema.normalizeProfileLibrary(stored);
  resumeProfiles = library.profiles;
  activeResumeProfileId = library.activeId;
  profile = library.activeProfile;
  await chrome.storage.local.set({ resumeProfiles, activeResumeProfileId, resumeProfile: profile });
  renderProfileVersions();
  requiredAnswerMemory = stored.requiredAnswerMemory || {};
  elements.overwriteExisting.checked = Boolean(stored.fillSettings?.overwriteExisting);
  elements.emptyProfile.hidden = profileHasData(profile);
  await scanPage();
}

init();
