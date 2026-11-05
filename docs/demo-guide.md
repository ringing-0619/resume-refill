# Demo walkthrough / 原版插件演示指南

Run `npm run demo` from the repository root and open `http://127.0.0.1:4173/demo/`. On macOS, double-click `start-demo.command` in Finder to launch the server and open Chrome. It selects another port if needed; use the URL it opens. Double-click `stop-demo.command` to stop the background server. Node.js 22.14+ is required. Opening the HTML directly is not supported.

The demo directly loads the extension's original **popup, profile manager, CSS and JavaScript**. It preserves the purple interface and original Chinese labels. Only the surrounding explanation and mock recruiting form switch languages. Browser APIs use a fictional in-memory adapter; the installed extension's real profiles are never accessed.

最直接的体验方式是点击顶部 **「▶ 演示自动填写」**：它会保留当前已保存的简历版本，重新生成所选场景的空白模拟表单，再触发原版弹窗的一键填充。默认以约 1 秒 / 项按页面顺序展示，每一项先高亮、再真实写入并校验；底部提示当前字段，可暂停 / 继续。速度选择可改为约 1.6 秒 / 项或原速。结果来自真实引擎响应；涉及未知问题和声明时仍然等待本人确认。

The top **Run autofill demo** button rebuilds the selected mock scenario and runs the original popup’s fill action with the saved resume version. It can be replayed. Playback intentionally waits about one second per field in page order, with current-field highlighting, scrolling, pause/resume and speed selection. Results are reported by the original engine; unknown answers and consent still require review.

## 中文讲解顺序

1. **看原版弹窗。** 左侧就是插件原有的紫色弹窗，包含「本次使用」、识别结果、覆盖开关和「一键填充」。虚构资料默认已经载入，打开后会自动扫描右侧模拟表单。
2. **填写与验证。** 点击「一键填充」，观察页面的姓名、专业和项目资料，以及原版进度组件。标准场景会自动增加第二条教育经历。
3. **切换控件。** 点击右侧「自定义控件」，新表单加载后弹窗会重新扫描。再次填写，检查两条教育经历和自定义下拉框。
4. **保护已有内容。** 点击「已有内容与必填确认」。保持覆盖开关关闭，填写后已有邮箱不变，资料中没有依据的问题和声明进入原版「新增必填项」面板。
5. **本人确认。** 在原版面板中主动补充虚构答案，例如推荐码 `DEMO-ONLY`，再点击「确认并填写以上答案」。核对将要确认的声明。
6. **看原版资料页。** 点击弹窗齿轮、「管理」或顶部「简历资料管理」。页面包含原有资料目录、版本管理、导入区和可编辑表单。可修改样例的职业标题并点击「保存资料」，或使用原有 Ctrl/Cmd+S 快捷键。
7. **验证资料联动。** 返回「填充演示」，切换一次场景得到空白表单，再填写，检查刚刚保存的职业标题。直接修改并保存不会更改右侧已填内容，仍需按原流程再次填写。
8. **展示不同版本。** 在弹窗「本次使用」中选择「产品岗」。默认保留已有值；要展示另一版内容，可先切换场景清空模拟表单，或主动打开覆盖开关。
9. **演示导入。** 顶部提供虚构 TXT 简历下载。可在资料页选择该文件，体验原版解析、检查与保存流程。不要将真实求职资料作为公开演示内容。
10. **恢复样例。** 「重置样例」恢复初始虚构库，不影响已安装插件的真实资料。先保存或放弃未保存的演示编辑，避免浏览器的离开页面提示。

## Short English presentation

Show the original purple popup, explain the active resume selector, then click **一键填充**. Switch between the three mock scenarios to show repeated education records, custom selects and preserved existing answers. Review unknown required answers in the original popup panel.

Open the original profile manager through the gear or **Manage resume profiles**. Edit a fictional headline, save with **保存资料**, return to the application and fill a fresh scenario. Switch resume versions to compare role-specific content. The actual extension remains Chinese; the surrounding instructions and mock form can switch to English.

## What is real and what is adapted

| Part | Implementation |
|---|---|
| Popup and profile-manager UI | Generated from the original extension HTML, loading original CSS and application JavaScript directly |
| Resume version selection, scanning and confirmation flow | Original `popup.js` |
| Profile editing, version controls and local import | Original `options.js`, `resume-import.js` and bundled parsers |
| Field recognition, writing and read-back | `demo/fill-engine.js`, generated from the unchanged `extension/content.js`, with demo-only await points around actual writes and visual page ordering; original `profile-schema.js` |
| Chrome API transport and storage | Demo adapter; data stays in parent-tab memory |
| Recruiting website | Fictional form with no submission endpoint |
| Installed extension storage and permissions | Not accessed or reproduced |

The mock domain is a visual label, not a real destination. The demo has no submission endpoint. Platform fixtures demonstrate selected observed patterns, not universal compatibility.

Both READMEs embed a [real browser GIF](images/resume-refill-demo.gif) of this original-UI demo filling the standard fictional form one field at a time. See [media and hosting](demo-media.md) for recording details and the planned GitHub Pages entry point. The profile-manager screenshot is available [here](images/resume-refill-original-settings-v3.jpg).

## Playback timing

The production extension source is unchanged. The demo build generates a copy with two reviewed adaptations: await points immediately before and after the original field-write adapter, and page-order traversal while playback is active. `demo/pacing.js` supplies the visible waits and pause gate. It does not prefill the form and reveal values later. Each highlighted field remains empty until its real write executes, then the original read-back result determines success. Original-speed playback is available; recruiting-site timing depends on each site.
