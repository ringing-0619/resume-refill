# Known limitations / 已知边界

- **Prototype scope:** Focused on Chinese recruiting workflows, with Chinese and English label matching. It has not been certified for every platform, employer or browser. The extension UI is primarily Chinese.
- **Loaded page only:** Scan the current visible/interactable form. Enter later steps and rescan; hidden tabs, unloaded sections and cross-origin iframes may need manual work or separate support.
- **Custom controls:** Canvas UIs, closed Shadow DOM, highly customized widgets, remote-search-only controls or major DOM changes may require new adapters.
- **Resume parsing:** Heuristic text extraction is imperfect, especially with unusual layouts. Image-only PDFs have no OCR support. Old `.doc` files are not supported. File limit: 15 MB.
- **Attachments:** Certificates, portfolios and other application attachments must be selected manually.
- **Required questions:** Unknown questions are surfaced for review. Suggestions are not a factual guarantee. Sensitive declarations and consent must be checked by the applicant.
- **Repeated records:** The engine can add supported missing sections. It also contains a narrow correction rule that may remove an internship record whose name exactly matches a saved project and does not match a saved internship company, then recreate it in the project section. Review the result carefully.
- **Source structure:** The content script is intentionally preserved as a large file in this public edition. Separate modules and broader real-browser coverage remain future work.
- **Playback timing:** The demo intentionally slows actual writes and uses page order for visibility. This presentation timing is separate from the unchanged production extension; it is not a performance benchmark.
- **Demo scope:** The demo covers selected mock controls and fictional data. It includes the original popup and profile-manager screens and their local import controls. It does not reproduce Chrome installation, persistent storage, all platform adapters or a production hiring flow. The demo wrapper and mock form are bilingual; the original extension UI remains Chinese.
- **Validation scope:** DOM regression tests and local browser demo checks do not substitute for end-to-end checks on current third-party recruiting sites.

中文：这是个人开发原型。网站结构、招聘流程和控件版本变化后，可能需要重新适配。解析结果、重复经历、已有答案、声明和附件均需要本人检查，最后手动提交。
