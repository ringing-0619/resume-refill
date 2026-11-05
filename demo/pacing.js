// Presentation timing only. The generated engine awaits these hooks around its
// real field writes; no values are prefilled, hidden, or replayed as an overlay.
(() => {
  let active = false, paused = false, delayMs = 1000, step = 0, current = null;
  const waiters = new Set();
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const zh = new URLSearchParams(location.search).get("lang") === "zh";
  function fieldName(element) {
    return (element.closest(".field")?.querySelector("label")?.textContent || element.getAttribute("aria-label") || element.getAttribute("placeholder") || "").replace(/\*/g, "").trim();
  }
  function report(phase, extra = {}) {
    const root = document.getElementById("formRoot");
    if (root) { root.dataset.demoStep = String(step); root.dataset.demoPhase = phase; }
    parent.postMessage({ channel: "resume-refill-playback", phase, step, paused, delayMs, label: current ? fieldName(current) : "", ...extra }, location.origin);
  }
  function resume() {
    paused = false;
    for (const resolve of waiters) resolve();
    waiters.clear();
    if (active) report("resumed");
  }
  async function waitVisibleTime(ms) {
    let remaining = ms;
    while (paused || remaining > 0) {
      if (paused) { await new Promise((resolve) => waiters.add(resolve)); continue; }
      const started = performance.now();
      await sleep(Math.min(50, remaining));
      if (!paused) remaining -= performance.now() - started;
    }
  }
  window.ResumeRefillDemoPacing = {
    get active() { return active; },
    start(options = {}) {
      resume();
      active = true;
      delayMs = Math.max(0, Math.min(2000, Number.isFinite(Number(options.delayMs)) ? Number(options.delayMs) : 1000));
      step = 0;
      current?.classList.remove("demo-current-control");
      current = null;
      report("started");
    },
    async beforeWrite({ element }) {
      if (!active) return;
      current?.classList.remove("demo-current-control");
      current?.closest(".field")?.classList.remove("demo-current-field");
      current = element;
      step += 1;
      element.classList.add("demo-current-control");
      element.closest(".field")?.classList.add("demo-current-field");
      if (delayMs > 0) {
        element.closest(".field")?.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus({ preventScroll: true });
      }
      report("before-write");
      await waitVisibleTime(delayMs * .45);
      report("writing");
    },
    async afterWrite({ success }) {
      if (!active) return;
      report("verified", { success: Boolean(success), hint: success ? (zh ? "已写入并校验" : "Written and verified") : (zh ? "需要检查" : "Needs review") });
      await waitVisibleTime(delayMs * .55);
    },
    pause() { if (active) { paused = true; report("paused"); } },
    resume,
    finish(result) {
      active = false;
      resume();
      current?.classList.remove("demo-current-control");
      current?.closest(".field")?.classList.remove("demo-current-field");
      report("complete", { filled: result?.filled ?? result?.applied ?? 0, ok: Boolean(result?.ok) });
      current = null;
    }
  };
  addEventListener("message", (event) => {
    if (event.source !== parent || event.origin !== location.origin || event.data?.channel !== "resume-refill-playback-control") return;
    if (event.data.action === "pause") window.ResumeRefillDemoPacing.pause();
    if (event.data.action === "resume") resume();
  });
})();
