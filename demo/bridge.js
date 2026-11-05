// Browser-only adapter. The extension's real content script registers its usual
// listener here; no extension APIs, storage, or external pages are accessed.
(() => {
  let listener;
  const runtime = {
    onMessage: {
      addListener(callback) { listener = callback; },
      removeListener(callback) { if (listener === callback) listener = undefined; }
    }
  };
  window.chrome = { runtime };
  window.addEventListener("message", (event) => {
    if (event.source !== parent || event.origin !== location.origin || event.data?.channel !== "resume-refill-demo") return;
    const { id, action, payload = {} } = event.data;
    if (!/^(PING|SCAN|FILL|APPLY_REQUIRED|CLEAR)$/.test(action)) return;
    const paced = ["FILL", "APPLY_REQUIRED"].includes(action);
    const reply = (result) => {
      if (paced) window.ResumeRefillDemoPacing?.finish(result);
      parent.postMessage({ channel: "resume-refill-result", id, result }, location.origin);
    };
    if (!listener) return reply({ ok: false, error: "Filling engine has not loaded." });
    if (paced) window.ResumeRefillDemoPacing?.start(payload.demoPlayback || {});
    try { listener({ type: `RESUME_HELPER_V2_${action}`, ...payload }, {}, reply); }
    catch (error) { reply({ ok: false, error: error.message }); }
  });
})();
