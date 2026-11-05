(() => {
  const $ = (id) => document.getElementById(id);
  const form = $("application"), popup = $("popup"), settings = $("settings");
  let storage, initialStorage, lang = "zh", scene = "standard", requestId = 0, formReady = false, settingsLoaded = false, demoBusy = false;
  const pending = new Map();
  let playbackActive = false, playbackPaused = false, playbackTimer = null, manualPlaybackLocks = null;
  const clone = (value) => structuredClone(value);
  const originals = new Map([...document.querySelectorAll("[data-i18n]")].map((el) => [el, el.textContent]));
  const english = {
    brandSubtitle: "Original extension · interactive demo", sample: "Fictional sample data", reset: "Reset samples", title: "From your resume to the application.", description: "Try the extension’s original purple popup and profile manager, with a fictional application.", boundary: "This demo uses fictional data in this tab. It cannot read profiles from your installed extension.", fillView: "01 Fill an application", settingsView: "02 Manage resume profiles", download: "Download fictional TXT resume ↗", popupHeading: "Extension popup", original: "Original project HTML · CSS · JS", popupHelp: "Use the original workflow: choose a resume version, inspect the detected fields and click 一键填充. The gear and 管理 open the profile manager.", formHeading: "Mock application", fictional: "Fictional company · no submission", standard: "Standard form", custom: "Custom controls", review: "Keep & confirm", settingsHeading: "Original resume profile manager", settingsHint: "Edit a sample, click 保存资料, then return to the application", footer: "The UI and filling logic come directly from the extension. Browser APIs use an in-memory adapter. The original extension UI stays Chinese; the mock form supports both languages.", guide: "Demo guide ↗"
  };
  Object.assign(english, { fillView: "01 Autofill demo", runDemo: "▶ Run autofill demo", demoInstruction: "Run the demo to create a fresh mock form and fill it with the original extension. Uses the currently saved resume version." });
  Object.assign(english, { speedLabel: "Playback speed", speedSlow: "Slow · about 1 sec / field", speedSlower: "Slower · about 1.6 sec / field", speedOriginal: "Original speed", pacingNote: "Playback pauses on each field in page order for visibility. The installed extension’s speed is unchanged." });
  const outerControls = () => [...document.querySelectorAll(".header-actions button, .view-tabs button, [data-scene], #demoSpeed")];
  function showPlayback(state) {
    clearTimeout(playbackTimer);
    if (state.phase === "started") {
      playbackActive = true;
      if (!demoBusy) {
        manualPlaybackLocks = outerControls().map((control) => [control, control.disabled]);
        manualPlaybackLocks.forEach(([control]) => { control.disabled = true; });
      }
    }
    playbackPaused = Boolean(state.paused);
    $("playbackHud").hidden = false;
    $("pauseDemo").disabled = !playbackActive;
    $("pauseDemo").setAttribute("aria-pressed", playbackPaused);
    $("pauseDemo").textContent = playbackPaused ? (lang === "zh" ? "继续" : "Resume") : (lang === "zh" ? "暂停" : "Pause");
    $("playbackTitle").textContent = state.phase === "complete" ? (lang === "zh" ? "逐项填写结束" : "Playback complete") : playbackPaused ? (lang === "zh" ? "已暂停" : "Paused") : (lang === "zh" ? `正在填写第 ${state.step || 1} 项` : `Filling field ${state.step || 1}`);
    $("playbackDetail").textContent = state.label ? `${state.label}${state.phase === "verified" ? (lang === "zh" ? " · 已写入并校验" : " · Written and verified") : ""}` : (lang === "zh" ? "正在准备表单…" : "Preparing the form…");
    if (state.phase === "complete") {
      playbackActive = false;
      $("pauseDemo").disabled = true;
      $("playbackDetail").textContent = lang === "zh" ? `实际填写 ${state.filled} 项，请检查页面结果。` : `${state.filled} fields filled. Review the form.`;
      manualPlaybackLocks?.forEach(([control, disabled]) => { control.disabled = disabled; });
      manualPlaybackLocks = null;
      playbackTimer = setTimeout(() => { $("playbackHud").hidden = true; }, 1800);
    } else if (state.label) {
      $("demoStatus").textContent = lang === "zh" ? `${playbackPaused ? "已暂停" : "逐项演示"} · 第 ${state.step} 项：${state.label}` : `${playbackPaused ? "Paused" : "Playback"} · Field ${state.step}: ${state.label}`;
    }
  }
  function waitUntil(check, timeout = 15000) {
    let elapsed = 0, previous = Date.now();
    return new Promise((resolve, reject) => {
      const poll = () => {
        const now = Date.now();
        if (!playbackPaused) elapsed += now - previous;
        previous = now;
        try { if (check()) return resolve(); }
        catch (_) { /* The iframe may be replacing its previous document. */ }
        if (elapsed >= timeout) return reject(new Error(lang === "zh" ? "演示加载超时，请重试。" : "The demo took too long to load. Please try again."));
        setTimeout(poll, 40);
      };
      poll();
    });
  }
  async function runAutofillDemo() {
    if (demoBusy || playbackActive || !storage) return;
    demoBusy = true;
    const controls = outerControls();
    const previous = controls.map((control) => control.disabled);
    controls.forEach((control) => { control.disabled = true; });
    $("runDemo").textContent = lang === "zh" ? "正在自动填写…" : "Filling the form…";
    $("runDemo").setAttribute("aria-busy", "true");
    $("demoStatus").textContent = lang === "zh" ? "正在生成空白模拟表单，并扫描可填写字段…" : "Creating a fresh mock form and scanning its fields…";
    try {
      showView("fill");
      loadForm();
      const expectedForm = form.src;
      await waitUntil(() => formReady && form.contentWindow.location.href === expectedForm);
      const expectedPopup = popup.src;
      await waitUntil(() => popup.contentWindow.location.href === expectedPopup && popup.contentDocument.readyState === "complete" && popup.contentDocument.getElementById("fillButton"));
      const nativeFill = popup.contentDocument.getElementById("fillButton");
      await waitUntil(() => !nativeFill.disabled || !popup.contentDocument.getElementById("emptyProfile").hidden);
      if (nativeFill.disabled) throw new Error(lang === "zh" ? "当前简历版本还没有可填写的资料，请先在资料页保存。" : "Save some profile information before filling this version.");
      if (matchMedia("(max-width:850px)").matches) form.closest(".form-column").scrollIntoView({ behavior: "smooth", block: "start" });
      $("demoStatus").textContent = lang === "zh" ? "原插件正在填写右侧表单，并回读检查结果…" : "The original extension is filling the form and checking the result…";
      nativeFill.click();
      const nativeResult = popup.contentDocument.getElementById("resultBox");
      await waitUntil(() => !nativeResult.hidden && !nativeFill.disabled, 120000);
      $("demoStatus").textContent = (lang === "zh" ? "自动填写结果：" : "Autofill result: ") + nativeResult.textContent;
    } catch (error) {
      $("demoStatus").textContent = error.message;
    } finally {
      controls.forEach((control, index) => { control.disabled = previous[index]; });
      $("runDemo").disabled = !formReady;
      $("runDemo").removeAttribute("aria-busy");
      $("runDemo").textContent = lang === "zh" ? "▶ 再演示一次" : "▶ Run again";
      demoBusy = false;
    }
  }
  function showView(view) {
    const isSettings = view === "settings";
    $("fillWorkspace").hidden = isSettings;
    $("settingsWorkspace").hidden = !isSettings;
    for (const [id, active] of [["fillView", !isSettings], ["settingsView", isSettings]]) {
      $(id).classList.toggle("active", active);
      $(id).setAttribute("aria-pressed", active);
    }
    if (isSettings && !settingsLoaded) { settingsLoaded = true; settings.src = "options.html"; }
    if (!isSettings && formReady) loadPopup();
  }
  function loadPopup() { popup.src = `popup.html?session=${++requestId}`; }
  function loadForm() {
    formReady = false;
    form.src = `form.html?scene=${scene}&lang=${lang}&session=${++requestId}`;
  }
  function sendToForm(message) {
    if (!formReady) return Promise.reject(new Error("模拟表单尚未加载，请稍后重新扫描"));
    const action = message.type.replace(/^RESUME_HELPER_V2_/, "");
    const { type: _type, ...payload } = message;
    if (["FILL", "APPLY_REQUIRED"].includes(action)) payload.demoPlayback = { delayMs: Number($("demoSpeed").value) };
    return new Promise((resolve, reject) => {
      const id = ++requestId;
      const request = { resolve, reject, timeout: null };
      let elapsed = 0, previous = Date.now();
      const watchdog = () => {
        const now = Date.now();
        if (!playbackPaused) elapsed += now - previous;
        previous = now;
        if (elapsed >= 120000) { pending.delete(id); reject(new Error("模拟表单响应超时，请重置样例后重试")); }
        else request.timeout = setTimeout(watchdog, 1000);
      };
      request.timeout = setTimeout(watchdog, 1000);
      pending.set(id, request);
      form.contentWindow.postMessage({ channel: "resume-refill-demo", id, action, payload }, location.origin);
    });
  }
  window.ResumeRefillDemo = {
    getStorage: async (keys) => {
      if (keys == null) return clone(storage);
      const selected = typeof keys === "string" ? [keys] : Array.isArray(keys) ? keys : Object.keys(keys);
      return Object.fromEntries(selected.map((key) => [key, storage[key] == null ? (Array.isArray(keys) || typeof keys === "string" ? undefined : clone(keys[key])) : clone(storage[key])]));
    },
    setStorage: async (values) => { Object.assign(storage, clone(values)); },
    sendToForm,
    openOptions: () => showView("settings")
  };
  window.addEventListener("message", (event) => {
    if (event.origin !== location.origin) return;
    if (event.source === form.contentWindow && event.data?.channel === "resume-refill-playback") {
      showPlayback(event.data);
      return;
    }
    if (event.source === form.contentWindow && event.data?.channel === "resume-refill-layout") {
      const height = Number(event.data.height);
      if (Number.isFinite(height)) form.style.height = `${Math.min(1800, Math.max(590, height + 5))}px`;
    }
    if (event.source === popup.contentWindow && event.data?.channel === "resume-refill-popup-size") {
      const height = Number(event.data.height);
      if (Number.isFinite(height)) popup.style.height = `${Math.min(1800, Math.max(545, height + 2))}px`;
    }
    if (event.source !== form.contentWindow || event.data?.channel !== "resume-refill-result") return;
    const request = pending.get(event.data.id);
    if (!request) return;
    clearTimeout(request.timeout);
    pending.delete(event.data.id);
    const result = event.data.result;
    result?.ok ? request.resolve(result) : request.reject(new Error(result?.error || "Filling engine error"));
  });
  form.addEventListener("load", () => { if (!storage || !form.getAttribute("src")) return; formReady = true; loadPopup(); if (!demoBusy) $("runDemo").disabled = false; });
  $("runDemo").addEventListener("click", runAutofillDemo);
  $("pauseDemo").addEventListener("click", () => {
    if (playbackActive) form.contentWindow.postMessage({ channel: "resume-refill-playback-control", action: playbackPaused ? "resume" : "pause" }, location.origin);
  });
  $("fillView").addEventListener("click", () => showView("fill"));
  $("settingsView").addEventListener("click", () => showView("settings"));
  document.querySelectorAll("[data-scene]").forEach((button) => button.addEventListener("click", () => {
    scene = button.dataset.scene;
    document.querySelectorAll("[data-scene]").forEach((item) => { item.classList.toggle("active", item === button); item.setAttribute("aria-pressed", item === button); });
    loadForm();
  }));
  $("language").addEventListener("click", () => {
    lang = lang === "zh" ? "en" : "zh";
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    originals.forEach((original, element) => { element.textContent = lang === "en" ? english[element.dataset.i18n] || original : original; });
    $("language").textContent = lang === "zh" ? "English" : "中文";
    loadForm();
  });
  $("reset").addEventListener("click", () => {
    if (!initialStorage) return;
    storage = clone(initialStorage);
    settingsLoaded = false;
    settings.removeAttribute("src");
    showView("fill");
    loadForm();
    $("demoStatus").textContent = lang === "zh" ? "已恢复虚构样例，真实插件资料未受影响。" : "Fictional samples reset. Your installed extension is unaffected.";
  });
  fetch("../examples/sample-backup.json").then((response) => { if (!response.ok) throw new Error("Sample data could not load"); return response.json(); }).then((data) => {
    initialStorage = data;
    storage = clone(data);
    loadForm();
  }).catch((error) => { $("demoStatus").textContent = `${error.message}. 请在项目目录运行 npm run demo。`; });
})();
