// Only used by generated demo pages. Original extension assets are untouched.
(() => {
  const api = parent.ResumeRefillDemo;
  if (!api || parent.location.origin !== location.origin) throw new Error("Open this page through the Resume Refill demo.");
  window.chrome = {
    storage: { local: { get: (keys) => api.getStorage(keys), set: (values) => api.setStorage(values) } },
    tabs: {
      query: async () => [{ id: 1, url: "https://careers.example.test/application" }],
      sendMessage: (_id, message) => api.sendToForm(message)
    },
    scripting: { insertCSS: async () => {}, executeScript: async () => {} },
    runtime: { openOptionsPage: () => api.openOptions() }
  };
  addEventListener("DOMContentLoaded", () => {
    if (!location.pathname.endsWith("/popup.html")) return;
    const report = () => parent.postMessage({ channel: "resume-refill-popup-size", height: document.body.scrollHeight }, location.origin);
    new ResizeObserver(report).observe(document.body);
    report();
  }, { once: true });
})();
