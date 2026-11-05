# Install and use / 安装与使用

## Chrome

1. Download the repository ZIP, extract it, and locate `extension/`.
2. Open `chrome://extensions`, turn on **Developer mode**, and click **Load unpacked**.
3. Select **`extension/`**, the directory containing `manifest.json`. Do not select the repository root.
4. The settings page opens on first installation. Import a text-based PDF, DOCX or TXT resume up to 15 MB, review it and save.
5. Create another version if needed. A new version starts empty and asks for its own resume file.
6. Open a normal HTTP/HTTPS job application page. Click the extension, select a version, scan, then fill. Review any errors and unresolved required fields before submitting manually.

For a fully fictional test, import `examples/sample-backup.json` using **导入备份** in the settings page. It contains two sample versions. Importing a backup can replace existing saved versions, so export a backup first if you have already saved real information.

Edge uses `edge://extensions` and the same unpacked directory. This repository does not claim a completed Edge browser test or Chrome Web Store release.

## 中文操作

1. 下载并解压仓库，找到包含 `manifest.json` 的 **`extension/` 文件夹**。
2. 在 `chrome://extensions` 开启开发者模式，选择「加载已解压的扩展程序」，加载该文件夹。
3. 首次安装打开资料页，导入不超过 15 MB 的文字版 PDF、DOCX 或 TXT，检查后保存。
4. 不同岗位方向可创建不同版本，每个新版本独立上传简历。
5. 在网申页面点击插件，选择版本，扫描后填写；检查提示，最后手动提交。

如需使用虚构资料测试，可在资料页点击「导入备份」，选择 `examples/sample-backup.json`。导入可能替换当前版本库；已有真实资料时先导出备份。完整功能见[中文使用说明](user-guide.zh-CN.md)。

## Troubleshooting

- **No fields found:** Enter the actual application form or its next step, then scan again. Hidden later steps are not scanned.
- **Protected browser page:** Chrome settings, extension store pages and PDF viewers do not allow normal script injection.
- **After a code update:** Reload the extension in `chrome://extensions`. The popup also checks the page-script version when scanning or filling.
- **Image-only PDF:** OCR is not included. Use a text PDF, DOCX or TXT.
- **File scheme testing:** Prefer the demo's local HTTP server to changing Chrome file-access settings.

The demo is separate from installation. Run `npm run demo` at the repository root and visit the printed URL; see the [walkthrough](demo-guide.md).
