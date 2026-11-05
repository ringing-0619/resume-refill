# Third-party components

| Component | Purpose | Bundled location | License |
|---|---|---|---|
| Mozilla PDF.js | Browser-local PDF text extraction | `extension/vendor/pdfjs/` | [Apache-2.0](extension/vendor/pdfjs/LICENSE) |
| Mammoth by Michael Williamson | Browser-local DOCX text extraction | `extension/vendor/mammoth/` | [BSD-2-Clause](extension/vendor/mammoth/LICENSE) |
| jsdom and its dependencies | Development-only DOM regression tests | Installed by `npm ci`, not bundled | See installed package licenses and `package-lock.json` |

PDF.js reports version `6.3.289` in the bundled source. The minified Mammoth bundle was retained from the original working project; it does not expose a reliably verified package version. Its exact public-edition bytes are recorded in [the vendor manifest](docs/vendor-manifest.json), along with the PDF.js bundle and license hashes.

Original license notices are retained in both source and extension packages. These components are not relicensed under the project's MIT license.

Project references: [PDF.js](https://github.com/mozilla/pdf.js) · [Mammoth](https://github.com/mwilliamson/mammoth.js) · [jsdom](https://github.com/jsdom/jsdom).
