# Demo media and hosting / 动图与托管方案

## 仓库首页：直接播放 GIF

两份 README 共用 [resume-refill-demo.gif](images/resume-refill-demo.gif)，文件位于仓库的 `docs/images/`。使用相对路径引用，上传仓库后即可由 GitHub 显示，不需要访问开发者电脑或启动本地服务。

这是实际浏览器录制：从空白模拟表单开始，由原版紫色弹窗触发扫描和填写，逐项显示高亮、真实写入与回读校验，最终填充 15 项并自动新增一个教育经历区块。没有用静态图片模拟输入，也没有预填后逐步揭示。演示专用节奏约为每项 1 秒，插件本体源码及速度不变。

| 属性 | 当前素材 |
|---|---|
| 文件 | `docs/images/resume-refill-demo.gif` |
| 尺寸 | 1280 × 720 |
| 动画 | 78 帧，约 21.1 秒，循环播放 |
| 体积 | 3,020,973 字节，约 3.0 MB |
| 资料 | 虚构候选人 Alex Lin、虚构公司 orbit careers |
| 来源 | 本项目标准表单场景，原版紫色界面，慢速演示模式 |
| 编码 | 浏览器实录 JPEG 帧转 GIF，保留采集时间间隔；首尾增加短暂停留，未加速填写过程 |

GIF 可直接观看，但它本身没有暂停、切换场景等交互按钮。GitHub 的 Markdown 支持 GIF 等图片；README 的 HTML 会经过清理，不能在其中运行本项目的 JavaScript。参考 [GitHub 图片与附件说明](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/attaching-files)和 [GitHub Markup 的 HTML 处理说明](https://github.com/github/markup#github-markup)。

## 完整操作：GitHub Pages

演示网页源码保存在 `demo/`，由 `npm run build:demo` 生成可独立托管的 `dist/site/`。托管目标是这个项目仓库的 **GitHub Pages**，通过已有的 [Pages 工作流](../.github/workflows/pages.yml)发布。

如果使用账号 `ringing-0619`、仓库名 `resume-refill`，默认域名且不设置自定义域名，预计交互入口为：

```text
https://ringing-0619.github.io/resume-refill/demo/
```

**这是计划地址，尚未部署和验证，不能当作当前可访问的链接。** 最终以 GitHub 部署成功后返回的地址为准。发布后将入口加入两份 README 的 Demo 段落，并设置为仓库 Website；还可把动图包装成指向该入口的链接。

访客从 README 点击公开入口后，可在自己的浏览器中重新演示填写、暂停 / 继续、调整速度、切换三种场景、选择简历版本及编辑虚构资料，无需安装插件或连接开发者电脑。网页使用静态文件和标签页内存适配层；不会连接真实招聘平台，也不会读取已安装插件的真实简历。

GitHub Pages 可托管 HTML、CSS 和 JavaScript，参见 [GitHub Pages 官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)。发布步骤见[上传与展示](publishing.md)。

## 更新演示素材

1. 本地启动 demo，恢复虚构样例，使用标准场景和约 1 秒 / 项的演示速度。
2. 实际点击「演示自动填写」，录下空白字段逐项写入、校验和完成结果；保留足够清晰的文字与紫色插件界面。
3. 将真实录屏转换为循环 GIF，控制体积，避免加速到无法辨认逐项填写。替换 `docs/images/resume-refill-demo.gif`，同时更新上表元数据。
4. 核对两份 README 的动图、样例资料和界面版本，运行 `npm run check`、`npm run build:demo`、`npm run package`。原始采集帧留在仓库外，无需提交。

## English overview

Both READMEs embed the same real browser GIF from `docs/images/`. It shows the original purple interface filling a fictional form one field at a time. The 21.1-second loop uses the intentionally paced demo engine; production extension timing is unchanged.

The interactive HTML/CSS/JavaScript demo is prepared for GitHub Pages. It runs in the visitor's browser without installing the extension, using fictional data in tab memory. The public URL remains a plan until deployment succeeds and the returned URL has been verified. Preparing the files does not publish a repository or deploy a website.
