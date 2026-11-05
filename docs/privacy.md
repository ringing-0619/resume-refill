# Privacy and data handling / 隐私与资料处理

## Extension

- Resume files are processed in the browser using bundled PDF.js, Mammoth or the browser's TXT reader. There is no application backend, remote model API, analytics integration or telemetry code in this project.
- Structured profile fields, version metadata, fill settings and confirmed supplementary answers are kept in `chrome.storage.local` in the current browser profile. The original imported file bytes are not retained by the extension. Metadata can include the source filename and timestamps.
- The extension accesses the current application page when invoked and reads its form structure to create a filling plan. It has no broad `host_permissions` or background content-script declaration.
- Existing page content is preserved by default. Password fields and manual-only verification controls are not automatically filled. Consent and declarations require an explicit answer.
- JSON exports contain personal profile information. Keep backups private. Clear saved profiles and answer memory from the settings page when no longer needed.

Local storage is not an encrypted vault and can be accessible to other people with access to your browser profile. Uninstalling the extension removes its browser storage; exported backups and the source resume files remain wherever you saved them.

Filling a **real recruiting website** places the chosen information into that website's page. The website may observe input events or save a draft before final submission. The extension's lack of a backend does not change the receiving website's data practices.

## Public demo

The demo includes only fictional profiles and an original mock recruiting form. The original popup and settings page use a browser API adapter that cannot access the installed extension’s real storage. Data is held in tab memory; it does not connect to an employer, persist profiles after the tab closes or submit an application. The original import controls are available; use the supplied fictional TXT example when demonstrating import. Any file selected there is processed locally by the original parser. Its JavaScript and JSON assets are loaded from the same origin. If hosted on GitHub Pages or another host, the hosting provider can receive ordinary requests for static files.

## 中文说明

简历文件在浏览器本地提取与解析；保存的是用户确认后的结构化字段及文件名等元数据，不保存原文件内容。项目没有应用后端或远程模型调用。备份 JSON 含完整资料，需自行妥善保管；浏览器本地存储也不等于加密保险箱。

在真实招聘网页填写资料时，目标网站可能监听输入或自动保存草稿。因此“插件不上传到自己的服务器”不代表目标网站在手动提交前一定收不到信息。演示页只使用虚构数据，表单没有提交接口。
