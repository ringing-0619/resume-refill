# Resume Refill · 简历填充小助手

[English](README.md) | 简体中文

一个本地优先的 **Chrome 浏览器插件**，用于管理多版简历、自动填写网申表单，并在提交前交由用户检查。

**JavaScript · Chrome Manifest V3 · DOM 自动化 · PDF.js · Mammoth · Node.js**

## 项目概览

- **解决问题：**减少在不同招聘网站重复录入简历的操作，处理各异的字段标签、控件和经历区块。
- **资料流程：**在本地导入 **PDF、DOCX 或 TXT**，检查解析结果，再为不同岗位保存独立简历版本。
- **自动填写：**匹配中英文标签，适配已支持的下拉框和日期控件，补建重复经历区块，并在填写后回读校验。
- **用户控制：**默认保留已有答案；不确定的必填项交由本人确认，最终申请由本人手动提交。

## Demo 展示

![真实浏览器录制：原版紫色插件将虚构简历逐项填入模拟网申表单](docs/images/resume-refill-demo.gif)

**直接观看上方动图：**真实录制原版紫色弹窗及填写引擎的运行过程。演示特意放慢至约 **1 秒 / 项**，方便看清每次写入和校验；插件本体速度保持原样。候选人和公司资料均为虚构。

**亲自操作：**[演示指南与本地启动方式](docs/demo-guide.md)。支持重新演示自动填写、暂停 / 继续、调整速度、切换三种表单场景，以及在原版资料页编辑简历版本。

完整交互 demo 已准备好通过 **GitHub Pages** 托管，部署并验证后会在此加入公开入口。README 内直接播放 GIF，按钮交互则在独立演示页中运行。[动图与托管方案](docs/demo-media.md)

## 项目内容

| 内容 | 文件入口 |
|---|---|
| Chrome 插件 | [安装与使用](docs/getting-started.md) · [插件源码](extension/) · [详细中文说明](docs/user-guide.zh-CN.md) |
| 交互式演示 | [Demo 源码](demo/) · [演示指南](docs/demo-guide.md) · [虚构样例](examples/README.md) |
| 产品与工程 | [项目案例](docs/case-study.md) · [架构设计](docs/architecture.md) · [完整目录与逐文件说明](docs/repository-map.zh-CN.md) |
| 验证与发布 | [开发与测试](docs/development.md) · [GitHub 上传指南](docs/publishing.md) |

插件本体保持中文界面，demo 外层及模拟表单支持中英文。招聘网站兼容性取决于已适配的页面模式，详见[已知边界](docs/limitations.md)与[隐私设计](docs/privacy.md)。

本地预览需要 Node.js 22.14+，运行 `npm run demo` 后打开终端输出的地址。macOS 可双击 `start-demo.command` 启动，双击 `stop-demo.command` 停止。安装实际插件无需构建或 API Key，在 Chrome「加载已解压的扩展程序」中选择 **`extension/` 文件夹**即可。

[许可](LICENSE) · [项目说明](NOTICE.md) · [第三方组件声明](THIRD_PARTY_NOTICES.md)
