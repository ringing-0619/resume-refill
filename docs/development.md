# Development

Use Node.js **22.14+**. The extension and demo are plain JavaScript/HTML/CSS with no build step. Python 3 is required only for packaging.

```bash
npm ci --ignore-scripts
npm run check
npm test
```

`npm run check` verifies that the demo surfaces match the original extension HTML, JavaScript syntax, version consistency, the extension's permission set, referenced manifest assets and local documentation links. Tests use Node's test runner and jsdom; jsdom is a development-only dependency and is not shipped in the extension or static demo.

## What the tests cover

The original regression fixtures cover selected Moka/Sugar patterns and Feishu-style dates: nested option targets, split year/month controls, asynchronous menus, multiple records, country synonyms, full-time conversion, school-specific answer memory, rerendered inputs, retained values, disabled choices and value rollback.

Pacing tests hold each real write behind an await gate, verify top-to-bottom field order and confirm that pause blocks advancement. The demo engine is checked against its generated source; the production extension file stays unchanged.

The original-popup tests verify resume switching and filling through the actual popup code, plus saving profile edits through the demo storage adapter.

The public-edition tests also exercise the actual demo form and sample profiles through the same content-script listener. Assertions cover repeated education blocks, custom selections, version-specific values, preserving and overwriting existing answers, and explicit confirmation for unknown required answers and checkboxes.

The fixtures are synthetic. They do not contact recruiting websites or establish current third-party compatibility. File parsing, browser permission prompts and every custom widget are not covered by these DOM tests.

## Preview and build

```bash
npm run demo
```

Open the printed URL. The server binds to `127.0.0.1`; reload after source edits. The server regenerates the demo’s original-UI HTML wrappers on startup; restart after changing extension HTML. The static build regenerates them as well. Set `PORT` if needed, for example `PORT=4174 npm run demo` on macOS/Linux. Stop the foreground development server with Ctrl+C. The macOS `start-demo.command` launcher instead runs it in the background and opens Chrome; use `stop-demo.command` to stop that instance. Its temporary PID and log files are excluded from Git and source packages.

```bash
npm run build:demo
npm run package
```

- `dist/site/`: static demo bundle. Serve this directory with any static host; it works under a repository subpath.
- `dist/resume-refill-extension-v0.12.4.zip`: extension assets with `manifest.json` at the archive root. Extract before using **Load unpacked**.
- `dist/resume-refill-github.zip`: source tree with documentation, demo and tests, excluding dependencies, Git metadata and temporary files.

`.github/workflows/ci.yml` installs dependencies, checks, tests, builds and packages. `.github/workflows/pages.yml` is a separate manual publishing workflow.

## Versioning

Keep the version in `extension/manifest.json`, `extension/content.js`, `package.json` and `package-lock.json` synchronized. Update the showcase's displayed version when changing the extension version. Version `0.12.4` is retained from the original extension; repository preparation does not imply a new browser-store release.

## Contributing

For a new adapter, describe the field meaning, expected profile value, control markup and observed failure. Reproduce it with a minimal fictional DOM fixture and a read-back assertion. Do not commit a real resume, application draft, cookies, tokens or private employer data.
