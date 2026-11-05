const { FIELD_GROUPS, createEmptyProfile, createProfileVersion, normalizeProfileLibrary } = ResumeHelperSchema;
const form = document.getElementById("profileForm");
const nav = document.getElementById("sectionNav");
const saveState = document.getElementById("saveState");
const toast = document.getElementById("toast");
const storage = globalThis.chrome?.storage?.local || { get: async () => ({}), set: async () => {} };
const resumeDropzone = document.getElementById("resumeDropzone");
const resumeFile = document.getElementById("resumeFile");
const parseProgress = document.getElementById("parseProgress");
const parseResult = document.getElementById("parseResult");
let profile = createEmptyProfile();
let resumeProfiles = [];
let activeResumeProfileId = "";
let dirty = false;
let sectionObserver = null;
const repeatableGroups = new Set(FIELD_GROUPS.filter((group) => group.repeatable).map((group) => group.id));

const sectionDescriptions = {
  personal: "姓名与联系方式等最常用的信息",
  education: "可添加多段教育经历",
  experience: "仅填写正式工作经历",
  internship: "与正式工作经历分开管理",
  project: "课程项目、比赛案例和个人项目",
  campus: "社团、学生工作和校园活动",
  honor: "奖学金、竞赛奖项和荣誉称号",
  publication: "论文、期刊文章和研究成果",
  patent: "专利、软著和其他发明成果",
  skill: "语言考试、证书和专业技能",
  additional: "技能、语言和国内求职偏好"
};

function activeProfileVersion() {
  return resumeProfiles.find((item) => item.id === activeResumeProfileId) || resumeProfiles[0];
}

function renderVersionManager() {
  const select = document.getElementById("profileVersionSelect");
  select.replaceChildren();
  resumeProfiles.forEach((version) => {
    const option = document.createElement("option");
    option.value = version.id;
    option.textContent = version.name;
    option.selected = version.id === activeResumeProfileId;
    select.append(option);
  });
  const active = activeProfileVersion();
  const source = active?.sourceFileName ? `来源：${active.sourceFileName}` : "尚未导入简历，请上传该版本的文件";
  document.getElementById("activeResumeSource").textContent = `${source} · 共 ${resumeProfiles.length} 个版本`;
  document.getElementById("deleteProfileVersion").disabled = resumeProfiles.length <= 1;
}

function syncActiveVersion() {
  const active = activeProfileVersion();
  if (!active) return;
  active.profile = profile;
  active.sourceFileName = profile?.meta?.sourceFileName || active.sourceFileName || "";
  active.updatedAt = profile?.meta?.updatedAt || active.updatedAt || null;
}

async function persistProfileLibrary() {
  syncActiveVersion();
  await storage.set({ resumeProfiles, activeResumeProfileId, resumeProfile: profile });
}

function escapeValue(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function fieldTemplate(groupId, field, value, index) {
  const [id, label, type, placeholder, choices = []] = field;
  const path = `${groupId}.${index}.${id}`;
  const full = type === "textarea" || ["summary", "address", "skills", "languages"].includes(id);
  let control;
  if (type === "textarea") {
    control = `<textarea data-path="${path}" placeholder="${escapeValue(placeholder)}">${escapeValue(value)}</textarea>`;
  } else if (type === "select") {
    const normalizedValue = String(value || "").trim();
    const options = normalizedValue && !choices.includes(normalizedValue) ? [normalizedValue, ...choices] : choices;
    control = `<select data-path="${path}"><option value="">${escapeValue(placeholder || "请选择")}</option>${options.map((choice) => `<option value="${escapeValue(choice)}"${choice === normalizedValue ? " selected" : ""}>${escapeValue(choice)}</option>`).join("")}</select>`;
  } else {
    control = `<input data-path="${path}" type="${type}" value="${escapeValue(value)}" placeholder="${escapeValue(placeholder)}" />`;
  }
  return `<div class="field${full ? " full" : ""}"><label>${label}</label>${control}</div>`;
}

function entryTemplate(group, data, index) {
  const heading = group.repeatable
    ? `<div class="entry-heading"><strong>${group.title} ${index + 1}</strong><button type="button" class="remove-entry" data-remove="${group.id}" data-index="${index}">删除</button></div>`
    : "";
  return `<div class="entry${group.repeatable ? " repeatable" : ""}" data-entry="${group.id}">${heading}${group.fields.map((field) => fieldTemplate(group.id, field, data?.[field[0]] ?? "", index)).join("")}</div>`;
}

function render() {
  renderVersionManager();
  nav.innerHTML = FIELD_GROUPS.map((group, index) => `<button type="button" class="nav-link${index === 0 ? " active" : ""}" data-target="section-${group.id}"><span class="nav-index">${String(index + 1).padStart(2, "0")}</span>${group.title}</button>`).join("");
  form.innerHTML = FIELD_GROUPS.map((group, index) => {
    const entries = group.repeatable ? (profile[group.id]?.length ? profile[group.id] : [{}]) : [profile[group.id] || {}];
    return `<section id="section-${group.id}" class="form-section" data-group="${group.id}">
      <div class="section-header"><div class="section-title"><span class="section-number">${String(index + 1).padStart(2, "0")}</span><div><h2>${group.title}</h2><p>${sectionDescriptions[group.id]}</p></div></div>${group.repeatable ? `<button type="button" class="add-button" data-add="${group.id}">＋ ${group.addLabel}</button>` : ""}</div>
      <div class="entries">${entries.map((entry, entryIndex) => entryTemplate(group, entry, entryIndex)).join("")}</div>
    </section>`;
  }).join("");
  bindDynamicEvents();
  observeRenderedSections();
}

function observeRenderedSections() {
  sectionObserver?.disconnect();
  sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    nav.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.target === visible.target.id));
  }, { rootMargin: "-90px 0px -60% 0px", threshold: [0, .25, .5] });
  form.querySelectorAll(".form-section").forEach((section) => sectionObserver.observe(section));
}

function setDirty() {
  dirty = true;
  saveState.textContent = "有未保存的修改";
  saveState.classList.add("dirty");
}

function updateProfileFromForm() {
  const next = createEmptyProfile();
  form.querySelectorAll("[data-path]").forEach((input) => {
    const [group, indexText, field] = input.dataset.path.split(".");
    const index = Number(indexText);
    if (repeatableGroups.has(group)) {
      next[group][index] ||= {};
      next[group][index][field] = input.value.trim();
    } else {
      next[group][field] = input.value.trim();
    }
  });
  next.meta = profile.meta || {};
  profile = next;
}

function hasData(value) {
  if (Array.isArray(value)) return value.some(hasData);
  if (value && typeof value === "object") return Object.entries(value).some(([key, item]) => key !== "meta" && hasData(item));
  return String(value || "").trim().length > 0;
}

function nonEmptyValues(base = {}, incoming = {}) {
  const merged = { ...base };
  Object.entries(incoming).forEach(([key, value]) => {
    if (String(value || "").trim()) merged[key] = value;
  });
  return merged;
}

function mergeParsedProfile(current, parsed) {
  const merged = { ...createEmptyProfile(), ...current };
  merged.personal = nonEmptyValues(current.personal, parsed.personal);
  merged.additional = nonEmptyValues(current.additional, parsed.additional);
  repeatableGroups.forEach((group) => {
    merged[group] = hasData(parsed[group]) ? parsed[group] : [{}];
  });
  merged.meta = current.meta || {};
  return merged;
}

function waitForResumeImporter() {
  if (globalThis.ResumeImport) return Promise.resolve(globalThis.ResumeImport);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("解析组件加载失败，请刷新页面后重试")), 10000);
    globalThis.addEventListener("resume-import-ready", () => {
      clearTimeout(timer);
      resolve(globalThis.ResumeImport);
    }, { once: true });
  });
}

function setParseState(state, details = {}) {
  const isWorking = state === "working";
  resumeDropzone.hidden = isWorking || state === "result" || state === "error";
  parseProgress.hidden = !isWorking;
  parseResult.hidden = !(state === "result" || state === "error");
  parseResult.classList.toggle("error", state === "error");
  if (isWorking) {
    document.getElementById("parseProgressTitle").textContent = details.title || "正在读取简历…";
    document.getElementById("parseProgressText").textContent = details.text || "解析过程不会上传文件";
  }
}

function showParseResult(result) {
  setParseState("result");
  document.getElementById("parseResultIcon").innerHTML = '<svg viewBox="0 0 24 24"><path d="m6 12.5 4 4L18.5 8"/><circle cx="12" cy="12" r="9"/></svg>';
  const detected = Object.entries(result.detected).filter(([, count]) => count > 0);
  const total = detected.reduce((sum, [, count]) => sum + count, 0);
  document.getElementById("parseResultTitle").textContent = "解析完成，结果已写入表单";
  document.getElementById("parseResultText").textContent = `已写入“${activeProfileVersion()?.name || "当前版本"}” · ${result.fileName} · 识别到 ${total} 组资料。请向下检查并修改，再点击“保存资料”。`;
  const badges = document.getElementById("parseBadges");
  badges.replaceChildren();
  detected.forEach(([label, count]) => {
    const badge = document.createElement("span");
    badge.className = "parse-badge";
    badge.textContent = `${label} ${count}`;
    badges.append(badge);
  });
  result.warnings.forEach((warning) => {
    const badge = document.createElement("span");
    badge.className = "parse-badge warning";
    badge.textContent = warning;
    badge.title = warning;
    badges.append(badge);
  });
}

function showParseError(error) {
  setParseState("error");
  document.getElementById("parseResultIcon").innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 7.5v5M12 16v.1"/><circle cx="12" cy="12" r="9"/></svg>';
  document.getElementById("parseResultTitle").textContent = "简历解析失败";
  document.getElementById("parseResultText").textContent = error.message;
  document.getElementById("parseBadges").replaceChildren();
}

async function parseResume(file) {
  if (!file) return;
  setParseState("working", { title: `正在解析 ${file.name}`, text: "正在提取文字并识别经历模块，文件不会上传" });
  try {
    const importer = await waitForResumeImporter();
    const result = await importer.parseFile(file);
    updateProfileFromForm();
    profile = mergeParsedProfile(profile, result.profile);
    profile.meta = {
      ...(profile.meta || {}),
      importedAt: new Date().toISOString(),
      sourceFileName: file.name,
      schemaVersion: 5
    };
    const active = activeProfileVersion();
    if (active) active.sourceFileName = file.name;
    render();
    setDirty();
    showParseResult(result);
    showToast("解析结果已填入资料表，请检查后保存");
  } catch (error) {
    showParseError(error);
  } finally {
    resumeFile.value = "";
  }
}

function bindDynamicEvents() {
  form.querySelectorAll("input, textarea, select").forEach((input) => input.addEventListener("input", setDirty));
  form.querySelectorAll("[data-add]").forEach((button) => button.addEventListener("click", () => {
    updateProfileFromForm();
    profile[button.dataset.add].push({});
    render();
    setDirty();
    document.querySelector(`#section-${button.dataset.add} .entry:last-child`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }));
  form.querySelectorAll("[data-remove]").forEach((button) => button.addEventListener("click", () => {
    updateProfileFromForm();
    const group = button.dataset.remove;
    const index = Number(button.dataset.index);
    if (profile[group].length === 1) profile[group] = [{}];
    else profile[group].splice(index, 1);
    render();
    setDirty();
  }));
  nav.querySelectorAll("[data-target]").forEach((button) => button.addEventListener("click", () => document.getElementById(button.dataset.target)?.scrollIntoView()));
}

async function saveProfile({ silent = false } = {}) {
  updateProfileFromForm();
  profile.meta = { ...(profile.meta || {}), updatedAt: new Date().toISOString(), schemaVersion: 5 };
  await persistProfileLibrary();
  dirty = false;
  saveState.textContent = `已保存 · ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
  saveState.classList.remove("dirty");
  renderVersionManager();
  if (!silent) showToast(`“${activeProfileVersion()?.name || "当前简历"}”已保存在本机`);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  setTimeout(() => toast.classList.remove("visible"), 2300);
}

async function switchProfileVersion(nextId) {
  if (!nextId || nextId === activeResumeProfileId) return;
  if (dirty) await saveProfile({ silent: true });
  activeResumeProfileId = nextId;
  profile = activeProfileVersion()?.profile || createEmptyProfile();
  await persistProfileLibrary();
  dirty = false;
  setParseState("idle");
  render();
  saveState.textContent = profile.meta?.updatedAt ? `上次保存 ${new Date(profile.meta.updatedAt).toLocaleString("zh-CN")}` : "当前版本尚未保存资料";
  saveState.classList.remove("dirty");
  window.scrollTo({ top: 0, behavior: "smooth" });
  showToast(`已切换到“${activeProfileVersion()?.name}”`);
}

async function createNewProfileVersion() {
  if (dirty) await saveProfile({ silent: true });
  const defaultName = `简历版本 ${resumeProfiles.length + 1}`;
  const name = window.prompt("请为新版本命名，例如“数据分析岗”或“产品岗”", defaultName)?.trim();
  if (!name) return;
  const version = createProfileVersion({ name, profile: createEmptyProfile() });
  resumeProfiles.push(version);
  activeResumeProfileId = version.id;
  profile = version.profile;
  await persistProfileLibrary();
  dirty = false;
  setParseState("idle");
  render();
  saveState.textContent = "新版本等待导入简历";
  saveState.classList.remove("dirty");
  showToast(`已创建“${version.name}”，请选择对应简历文件`);
  resumeFile.click();
}

async function renameProfileVersion() {
  const active = activeProfileVersion();
  if (!active) return;
  const name = window.prompt("修改简历版本名称", active.name)?.trim();
  if (!name || name === active.name) return;
  active.name = name;
  await persistProfileLibrary();
  renderVersionManager();
  showToast(`已重命名为“${name}”`);
}

async function deleteProfileVersion() {
  if (resumeProfiles.length <= 1) return;
  const active = activeProfileVersion();
  if (!window.confirm(`确定删除“${active?.name}”吗？该版本的解析结果无法恢复。`)) return;
  resumeProfiles = resumeProfiles.filter((item) => item.id !== activeResumeProfileId);
  activeResumeProfileId = resumeProfiles[0].id;
  profile = resumeProfiles[0].profile;
  dirty = false;
  await persistProfileLibrary();
  setParseState("idle");
  render();
  saveState.textContent = profile.meta?.updatedAt ? `上次保存 ${new Date(profile.meta.updatedAt).toLocaleString("zh-CN")}` : "尚未保存";
  saveState.classList.remove("dirty");
  showToast("简历版本已删除");
}

function exportProfile() {
  updateProfileFromForm();
  syncActiveVersion();
  const backup = { format: "resume-helper-library", version: 1, activeResumeProfileId, resumeProfiles };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `resume-helper-library-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function importProfile(file) {
  try {
    const parsed = JSON.parse(await file.text());
    if (!parsed || typeof parsed !== "object") throw new Error("格式不正确");
    if (Array.isArray(parsed.resumeProfiles)) {
      const library = normalizeProfileLibrary(parsed);
      resumeProfiles = library.profiles;
      activeResumeProfileId = library.activeId;
      profile = library.activeProfile;
    } else {
      if (!parsed.personal) throw new Error("格式不正确");
      profile = { ...createEmptyProfile(), ...parsed };
      syncActiveVersion();
    }
    render();
    setDirty();
    showToast("简历版本备份已导入，请点击保存资料");
  } catch (error) {
    showToast(`导入失败：${error.message}`);
  }
}

async function init() {
  const stored = await storage.get(["resumeProfile", "resumeProfiles", "activeResumeProfileId"]);
  const library = normalizeProfileLibrary(stored);
  resumeProfiles = library.profiles;
  activeResumeProfileId = library.activeId;
  profile = library.activeProfile;
  await persistProfileLibrary();
  render();
  if (profile.meta?.updatedAt) saveState.textContent = `上次保存 ${new Date(profile.meta.updatedAt).toLocaleString("zh-CN")}`;

  document.getElementById("saveButton").addEventListener("click", () => saveProfile());
  document.getElementById("profileVersionSelect").addEventListener("change", (event) => switchProfileVersion(event.target.value));
  document.getElementById("newProfileVersion").addEventListener("click", createNewProfileVersion);
  document.getElementById("renameProfileVersion").addEventListener("click", renameProfileVersion);
  document.getElementById("deleteProfileVersion").addEventListener("click", deleteProfileVersion);
  document.getElementById("exportButton").addEventListener("click", exportProfile);
  document.getElementById("importButton").addEventListener("click", () => document.getElementById("importFile").click());
  document.getElementById("clearAnswerMemory").addEventListener("click", async () => {
    if (!window.confirm("确定清除小助手记住的补充必填项答案吗？简历资料不会受影响。")) return;
    await storage.set({ requiredAnswerMemory: {} });
    showToast("已清除补充必填项答案");
  });
  document.getElementById("importFile").addEventListener("change", (event) => event.target.files[0] && importProfile(event.target.files[0]));
  resumeDropzone.addEventListener("click", () => resumeFile.click());
  resumeFile.addEventListener("change", (event) => parseResume(event.target.files[0]));
  document.getElementById("chooseAnotherResume").addEventListener("click", () => {
    setParseState("idle");
    resumeFile.click();
  });
  ["dragenter", "dragover"].forEach((eventName) => resumeDropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    resumeDropzone.classList.add("dragging");
  }));
  ["dragleave", "drop"].forEach((eventName) => resumeDropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    resumeDropzone.classList.remove("dragging");
  }));
  resumeDropzone.addEventListener("drop", (event) => parseResume(event.dataTransfer.files[0]));
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      saveProfile();
    }
  });
  window.addEventListener("beforeunload", (event) => {
    if (dirty) { event.preventDefault(); event.returnValue = ""; }
  });

}

init();
