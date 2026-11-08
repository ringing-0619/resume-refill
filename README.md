# Resume Refill

English | [简体中文](README.zh-CN.md)

A local-first Chrome extension for managing resume versions and autofilling job application forms.

**Vibe Coding with Codex**

## What it does

- Prepare resume profiles: Import PDF, DOCX or TXT locally, review the extracted information, and save separate versions for different roles.
- Fill application forms: Match Chinese and English field labels, handle supported inputs, dropdowns, dates and repeated experience sections, and verify the values after filling.
- Review and confirm: Preserve existing answers by default, request confirmation for uncertain required fields, and leave final submission to the user.

## Demo

[![The original purple extension fills a fictional application one field at a time](docs/images/resume-refill-demo.gif)](https://ringing-0619.github.io/resume-refill/demo/)

_Fictional candidate and company data. Playback is slowed to about one second per field for clarity._

Try the [live demo](https://ringing-0619.github.io/resume-refill/demo/) without installing the extension. Replay autofill, pause/resume, change speed, switch between three form scenarios, or edit the sample resume profiles. The demo uses the original purple interface and filling flow; the extension's own timing is unchanged.

## Quick start

1. Download and extract the repository.
2. Open `chrome://extensions`, enable Developer mode, and choose Load unpacked. Select the `extension/` directory.
3. Import a resume, review and save the information, then open an application page to scan and fill.

For a local demo, use Node.js 22.14+ and run:

```bash
npm run demo
```

Open the printed URL. On macOS, double-click `start-demo.command` to launch or `stop-demo.command` to stop. See the [installation guide](docs/getting-started.md) for details.

## Quality and boundaries

[![Extension validation](https://github.com/ringing-0619/resume-refill/actions/workflows/ci.yml/badge.svg)](https://github.com/ringing-0619/resume-refill/actions/workflows/ci.yml)

- 37 regression tests cover resume switching, repeated records, supported custom controls, existing-answer handling, confirmation flows and demo playback.
- The extension interface is Chinese; the demo instructions and mock form support Chinese and English.
- Compatibility depends on supported form patterns. Review the filled information and unresolved questions before submitting.

## Further reading

[User guide](docs/getting-started.md) · [Demo walkthrough](docs/demo-guide.md) · [Architecture](docs/architecture.md) · [Privacy](docs/privacy.md) · [Limitations](docs/limitations.md) · [License](LICENSE)
