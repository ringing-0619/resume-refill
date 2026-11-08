# 简历填充小助手

[English](README.md) | 简体中文

用于管理多版简历并自动填写网申表单的本地优先 Chrome 插件。

**开发方式：Vibe Coding with Codex**

## 核心功能

- 整理简历资料：在本地导入 PDF、DOCX 或 TXT，检查提取结果，并为不同岗位保存独立版本。
- 自动填写网申：识别中英文字段标签，适配已支持的输入框、下拉框、日期及重复经历区块，填写后回读校验。
- 检查与确认：默认保留已有答案，不确定的必填项交由本人确认，最终申请由本人手动提交。

## 模拟演示

[![原版紫色插件将虚构简历逐项填入模拟网申表单](docs/images/resume-refill-demo.gif)](https://ringing-0619.github.io/resume-refill/demo/)

_候选人和公司资料均为虚构，演示放慢至约 1 秒／项，便于观看。_

无需安装插件，即可[体验在线演示](https://ringing-0619.github.io/resume-refill/demo/)。支持重播自动填写、暂停与继续、调整速度、切换三种表单场景，以及编辑样例简历。演示沿用原版紫色界面和填写流程，插件本体速度保持原样。

## 快速体验

1. 下载并解压仓库。
2. 打开 `chrome://extensions`，开启开发者模式，点击「加载已解压的扩展程序」，选择 `extension/` 文件夹。
3. 导入简历、检查并保存资料，再进入网申页面扫描和填写。

本地运行演示需要 Node.js 22.14+：

```bash
npm run demo
```

打开终端输出的地址。macOS 可双击 `start-demo.command` 启动，双击 `stop-demo.command` 停止。详细步骤见[安装指南](docs/getting-started.md)。

## 验证与边界

[![插件验证](https://github.com/ringing-0619/resume-refill/actions/workflows/ci.yml/badge.svg)](https://github.com/ringing-0619/resume-refill/actions/workflows/ci.yml)

- 37 项回归测试覆盖版本切换、多条经历、已支持的自定义控件、已有答案处理、必填确认及演示播放。
- 插件界面为中文，演示说明与模拟表单支持中英文。
- 网站兼容性取决于已适配的表单模式；提交前需检查填写结果及未解决的问题。

## 进一步阅读

[使用指南](docs/user-guide.zh-CN.md) · [演示指南](docs/demo-guide.md) · [架构](docs/architecture.md) · [隐私设计](docs/privacy.md) · [已知边界](docs/limitations.md) · [许可](LICENSE)
