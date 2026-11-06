# Resume Refill · 简历填充小助手

English | [简体中文](README.zh-CN.md)

A local-first **Chrome extension** that manages resume versions and fills job application forms for review before submission.

This extension was built entirely through vibe coding.

**JavaScript · Chrome Manifest V3 · DOM automation · PDF.js · Mammoth · Node.js**

## Key features

- Multiple resume versions: Save role-specific profiles and choose which version to use for each application.
- Local resume import: Parse PDF, DOCX and TXT files in the browser, then review and edit the extracted information before saving.
- Form autofill: Recognize Chinese and English field labels, fill supported inputs, dropdowns, dates and repeated experience sections, and verify the results after writing.
- Review controls: Preserve existing answers by default, request confirmation for uncertain required fields, and leave final submission to the user.

## Demo

[![Real browser recording: the original purple extension fills a fictional application one field at a time](docs/images/resume-refill-demo.gif)](https://ringing-0619.github.io/resume-refill/demo/)

**Watch directly above:** a real browser recording of the original purple popup and filling engine. The demo intentionally pauses about **one second per field** so each write and verification is visible; the extension's own timing is unchanged. All candidate and company data is fictional.

**Try it interactively:** [Open the live demo](https://ringing-0619.github.io/resume-refill/demo/) · [Demo walkthrough](docs/demo-guide.md). Replay autofill, pause/resume, change speed, switch three form scenarios, or edit a resume version in the original profile manager.

The interactive version is hosted on **GitHub Pages** and runs in the visitor's browser without installing the extension. Click the GIF above to open it. The animation plays inside the README; interactive controls run on the demo page. [Demo media and hosting](docs/demo-media.md)

## Documentation

| Content | Entry points |
|---|---|
| Chrome extension | [Install and use](docs/getting-started.md) · [Extension source](extension/) · [中文使用说明](docs/user-guide.zh-CN.md) |
| Interactive demo | [Demo source](demo/) · [Walkthrough](docs/demo-guide.md) · [Fictional profiles](examples/README.md) |
| Product and engineering | [Case study](docs/case-study.md) · [Architecture](docs/architecture.md) · [Complete repository map](docs/repository-map.zh-CN.md) |
| Validation and publishing | [Development and tests](docs/development.md) · [GitHub publishing](docs/publishing.md) |

The extension interface is Chinese; the demo wrapper and mock form support Chinese and English. Website compatibility is limited to supported patterns. See [limitations](docs/limitations.md) and [privacy](docs/privacy.md).

For a local preview, run `npm run demo` with Node.js 22.14+, then open the printed URL. On macOS, double-click `start-demo.command` to launch, or `stop-demo.command` to stop. Loading the actual extension requires no build step or API key; select the **`extension/` directory** in Chrome's **Load unpacked** dialog.

[License](LICENSE) · [Attribution](NOTICE.md) · [Third-party notices](THIRD_PARTY_NOTICES.md)
