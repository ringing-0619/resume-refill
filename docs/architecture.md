# Architecture

```text
PDF / DOCX / TXT
      │ browser-local extraction and rule-based parsing
      ▼
Options page ── review & edit ──► chrome.storage.local
                                     │ selected resume version
                                     ▼
Popup ── activeTab + scripting ──► Content script
                                     │
                    scan → field meaning + control type
                                     │
                          plan → write → read back
                                     │
                      progress + required-answer review
                                     │
                         applicant reviews and submits
```

| File | Responsibility |
|---|---|
| `extension/manifest.json` | Manifest V3 metadata and the `storage`, `activeTab`, `scripting` permissions |
| `background.js` | Initialize stored profile library and migrate the legacy single profile |
| `profile-schema.js` | Shared field groups, empty profiles and version-library normalization |
| `resume-import.js` | Local extraction and heuristic parsing; exposes `ResumeImport` to the settings page |
| `options.*` | Resume import, editable records, version management and JSON backups |
| `popup.*` | Active version, scan/fill commands, overwrite setting and required-answer confirmation |
| `content.js` | DOM recognition, record matching, control adapters, read-back verification and progress UI |
| `content.css` | Recognized, filled and skipped field highlights |
| `vendor/` | Bundled PDF.js and Mammoth, with their license files |

Paths without the `extension/` prefix in this table are relative to that directory. The core filling engine remains in one source file to preserve the behavior of the original working extension; modularization is a future improvement.

## On-demand access

There is no always-on content-script declaration or broad host permission. The popup uses `activeTab` and `scripting` to inject into the current page after a user gesture. Chrome documents the access duration and protected-page exceptions in its [activeTab reference](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab).

## Record identity and controls

The scanner combines labels, surrounding containers, headings, ARIA information and autocomplete hints. It assigns fields to their profile group and record occurrence. Adapters handle native inputs/selects, supported custom dropdowns, radio controls, dates and selected cascaders. Repeated sections can be expanded when a supported add control is present.

After writing, the engine reads the current control state. If a page replaces inputs during rerendering, it attempts to relocate the same logical field. Failed or reverted selections are surfaced instead of counted as successful.

## Demo boundary

`demo/index.html` places the extension's original popup beside a fictional application, with a separate tab for the original profile manager. `scripts/prepare-demo.mjs` generates `demo/popup.html` and `demo/options.html` from the extension HTML. It adjusts asset paths and adds the browser adapter; the original styles and application scripts are loaded directly from `extension/`.

`demo/extension-adapter.js` supplies the browser API methods used by the original screens. Its storage methods read and write a fictional library in the parent tab's memory, `tabs.sendMessage` forwards to the form, and `openOptionsPage` opens the original settings surface. It cannot read the installed extension's real storage. A small demo-only CSS rule keeps HTML `hidden` states effective; it does not redesign the screens.

`demo/bridge.js` forwards validated same-origin messages to the generated content script in the form iframe. `demo/fill-engine.js` is generated from the unchanged extension engine with await points around its real writes and page-order traversal during playback. `demo/pacing.js` implements the per-field waits, highlighting and pause gate; its events drive the visible current-field panel. The generation check fails if the source anchors change, so these adaptations must be reviewed after a core refactor. It also supports the original popup's version handshake. `demo/form.js` builds the fictional form. The parent initializes the sample library from `examples/sample-backup.json`.

The original popup and profile manager stay Chinese. The surrounding explanation and mock form can switch languages. Resume import and editing use the original code; saved demo edits live only in tab memory. Installing the extension, Chrome permissions and persistent `chrome.storage.local` are not reproduced by the adapter.
