importScripts("profile-schema.js");

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  const stored = await chrome.storage.local.get(["resumeProfile", "resumeProfiles", "activeResumeProfileId", "requiredAnswerMemory", "fillSettings"]);
  const library = globalThis.ResumeHelperSchema.normalizeProfileLibrary(stored);
  await chrome.storage.local.set({
    resumeProfiles: library.profiles,
    activeResumeProfileId: library.activeId,
    resumeProfile: library.activeProfile,
    requiredAnswerMemory: stored.requiredAnswerMemory || {},
    fillSettings: stored.fillSettings || { overwriteExisting: false, includeOptional: false }
  });
  if (reason === "install") chrome.runtime.openOptionsPage();
});
