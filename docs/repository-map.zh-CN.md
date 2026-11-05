# Repository map / 项目完整结构

## 先看各层的用途

- **`extension/`：实际产品。** Chrome「加载已解压的扩展程序」应选择这一层，包含原版紫色界面、解析器和真实填写逻辑。
- **`demo/`：公开交互演示。** 复用插件界面和业务代码，通过内存适配层运行虚构资料；逐项演示的等待逻辑只在这里启用。
- **`docs/`：项目文档与展示。** 动图保存在 `docs/images/`，README 引用它；安装、架构、测试、隐私和发布细节放在文档中。
- **`examples/`：虚构样例。** 包含两版岗位资料、可导入备份和 TXT 简历，不包含真实用户简历。
- **`scripts/`、`tests/`、`.github/`：工程与交付。** 分别负责本地工具、回归验证和 GitHub 自动化。

## 完整可上传源码树

以下逐项列出公开源码包中的所有文件，包括隐藏配置。排除了依赖、构建产物和本地运行状态。

```text
resume-refill/
├── .github/  # GitHub 自动化配置
│   └── workflows/  # 持续集成及网页发布工作流
│       ├── ci.yml  # 检查、测试、构建与打包
│       └── pages.yml  # 手动触发 GitHub Pages 构建和部署
├── demo/  # 可脱离插件安装运行的交互式展示
│   ├── app.js  # 双语切换、虚构资料状态、场景与重播控制
│   ├── bridge.js  # 校验同源消息并连接演示与填写引擎
│   ├── demo.css  # 紫色展示外壳、布局与播放控制样式
│   ├── extension-adapter.js  # 将原界面所需 Chrome API 适配为标签页内存与消息
│   ├── fill-engine.js  # 生成文件：原 content.js 加入演示节奏与页面顺序适配
│   ├── form.css  # 模拟招聘页和表单控件样式
│   ├── form.html  # 虚构网申表单页面入口
│   ├── form.js  # 构建标准、自定义、已有内容与必填确认三种场景
│   ├── index.html  # 演示主页面：入口、场景及 iframe 容器
│   ├── options.html  # 生成文件：原资料页 HTML 加入演示适配层和路径
│   ├── pacing.js  # 逐项等待、高亮、滚动、暂停与继续
│   ├── popup.html  # 生成文件：原弹窗 HTML 加入演示适配层和路径
│   └── surface.css  # 原界面在 demo 中的 hidden 状态兼容规则
├── docs/  # 产品、使用、开发、展示及发布文档
│   ├── images/  # README 与项目说明的展示素材
│   │   ├── resume-refill-demo.gif  # 约 21 秒真实逐项填写动图，双语 README 共用
│   │   ├── resume-refill-original-settings-v3.jpg  # 原版紫色资料管理页截图
│   │   ├── resume-refill-purple-demo-en-v3.jpg  # 英文展示外壳、原版紫色插件截图
│   │   └── resume-refill-purple-demo-v3.jpg  # 中文展示外壳、原版紫色插件截图
│   ├── architecture.md  # 实际插件数据流、控件识别及演示适配边界
│   ├── case-study.md  # 项目背景、设计选择与产品案例
│   ├── demo-guide.md  # 交互演示操作与中英文讲解脚本
│   ├── demo-media.md  # README 动图、真实录制来源及公开托管方案
│   ├── development.md  # 环境、命令、测试范围和构建产物
│   ├── getting-started.md  # 安装插件和首次填写步骤
│   ├── limitations.md  # 解析、页面和控件支持范围
│   ├── privacy.md  # 本地存储、权限与隐私设计
│   ├── publishing.md  # 上传 GitHub 及部署 Pages 的操作步骤
│   ├── repository-map.zh-CN.md  # 本文件：完整目录及逐文件用途
│   ├── user-guide.zh-CN.md  # 详细中文操作手册
│   └── vendor-manifest.json  # 第三方文件来源信息及 SHA-256 校验值
├── examples/  # 可公开分享的虚构资料
│   ├── README.md  # 样例内容与导入方式
│   ├── sample-backup.json  # 可导入的虚构多版本资料备份
│   ├── sample-profiles.json  # 虚构岗位资料示例
│   └── sample-resume.zh-CN.txt  # 用于演示本地导入的虚构 TXT 简历
├── extension/  # 实际安装到 Chrome 的插件本体
│   ├── icons/  # 扩展图标素材
│   │   ├── icon-128.png  # 128 像素扩展图标
│   │   ├── icon-16.png  # 16 像素扩展图标
│   │   ├── icon-32.png  # 32 像素扩展图标
│   │   ├── icon-48.png  # 48 像素扩展图标
│   │   └── icon.svg  # 可缩放图标源文件
│   ├── vendor/  # 随插件打包的第三方解析器，无需 CDN
│   │   ├── mammoth/  # Mammoth 本地组件
│   │   │   ├── LICENSE  # Mammoth 许可文本
│   │   │   └── mammoth.browser.min.js  # DOCX 浏览器解析库
│   │   └── pdfjs/  # PDF.js 本地组件
│   │       ├── LICENSE  # PDF.js 许可文本
│   │       ├── pdf.min.mjs  # PDF 文本提取库
│   │       └── pdf.worker.min.mjs  # PDF 解析 Worker
│   ├── background.js  # 初始化资料库与迁移旧版资料
│   ├── content.css  # 网页上的识别、成功及跳过状态样式
│   ├── content.js  # 网页字段识别、控件适配、填写、回读与进度逻辑
│   ├── manifest.json  # Manifest V3 配置、版本、权限及页面入口
│   ├── options.css  # 原版紫色资料页样式
│   ├── options.html  # 原版简历资料管理页结构
│   ├── options.js  # 导入、编辑、多版本、保存与 JSON 备份交互
│   ├── popup.css  # 原版紫色弹窗样式
│   ├── popup.html  # 原版扩展弹窗结构
│   ├── popup.js  # 版本选择、扫描、填写命令与必填答案确认
│   ├── profile-schema.js  # 11 类资料结构、默认值与版本库规范化
│   └── resume-import.js  # 本地 PDF、DOCX、TXT 提取及规则解析
├── scripts/  # 准备、启动、检查、构建与打包工具
│   ├── build-demo.mjs  # 生成 GitHub Pages 可使用的 dist/site/
│   ├── check.mjs  # 版本、权限、资源、JS 语法、生成内容及文档链接校验
│   ├── launch-demo.mjs  # 后台启动、端口选择、健康检查、复用与停止
│   ├── package.py  # 生成插件 ZIP 与可上传 GitHub 的完整源码 ZIP
│   ├── prepare-demo.mjs  # 从插件源文件生成演示页面和节奏适配引擎
│   └── serve.mjs  # 本地静态服务，提供演示资源与服务标识
├── tests/  # 以虚构 DOM 和样例验证行为
│   ├── demo-pacing.test.cjs  # 真实写入前后等待、顺序和暂停行为测试
│   ├── demo-surfaces.test.cjs  # 原版弹窗和资料页通过适配层实际运行的测试
│   ├── demo.test.cjs  # 模拟表单、版本、重复区块、覆盖与确认流程
│   ├── feishu-dates.test.cjs  # 飞书风格日期和相关控件模式回归测试
│   ├── geely-fill.test.cjs  # 已观察的招聘控件模式与填写回归测试
│   ├── launcher.test.cjs  # 后台启动、端口冲突、复用和停止行为测试
│   └── sample-resume.txt  # 解析测试所需的虚构文本夹具
├── .gitattributes  # 统一文本换行与二进制文件属性
├── .gitignore  # 排除依赖、构建产物、日志及私人备份
├── .nvmrc  # Node.js 主版本：22
├── LICENSE  # 项目 MIT 许可
├── NOTICE.md  # 作者、AI 辅助开发与项目材料说明
├── package-lock.json  # 锁定 npm 开发依赖版本
├── package.json  # 版本、Node.js 要求、开发依赖与命令入口
├── README.md  # 英文首页：一句话、概览、动态演示、文档入口
├── README.zh-CN.md  # 中文首页，与英文版保持对应
├── start-demo.command  # macOS 双击启动并打开演示，复用服务或自动换端口
├── stop-demo.command  # macOS 双击停止本项目的后台演示服务
└── THIRD_PARTY_NOTICES.md  # PDF.js、Mammoth 等第三方组件声明

```

## 源文件与生成文件

`extension/` 是界面及填写行为的来源。`demo/popup.html`、`demo/options.html` 和 `demo/fill-engine.js` 由 `scripts/prepare-demo.mjs` 生成，随源码包提供，便于直接预览。修改原页面或引擎后应运行生成脚本，避免手工维护两份逻辑。`npm run check` 会核对生成结果。

演示速度和暂停控制来自 `demo/pacing.js`；不会写回实际插件的 `extension/content.js`。完整流程与边界见[架构说明](architecture.md)。

## 本地会出现、但不应上传的内容

| 路径 | 用途与处理 |
|---|---|
| `node_modules/` | 开发测试依赖，由 `npm ci --ignore-scripts` 安装；不上传、不打包 |
| `.demo-runtime/` | 后台 demo 的进程信息和日志，由启动器生成；不上传、不打包 |
| `dist/site/` | 静态网页构建产物，由 Pages 工作流上传为网站；不提交到源码仓库 |
| `dist/resume-refill-extension-v0.12.4.zip` | 可解压后加载的插件包，可作为 GitHub Release 附件 |
| `dist/resume-refill-github.zip` | 完整公开源码包，包含本文件列出的所有文件；不会包含 dist 自身 |
| `.git/` | 本地 Git 历史与元信息，若之后初始化仓库会生成；不包含在源码 ZIP 中 |

原始录制帧与验收截图存放在项目文件夹之外，不属于公开源码。`.gitignore` 和打包脚本同时排除了日志、环境变量文件及私人简历备份。

## 从哪里开始读

1. 了解产品：双语 README → [项目案例](case-study.md) → [演示指南](demo-guide.md)。
2. 安装实际插件：[安装步骤](getting-started.md) → `extension/manifest.json` → `popup.js` / `options.js` → `content.js`。
3. 理解演示：`demo/index.html` → `app.js` → `extension-adapter.js` / `bridge.js` → `fill-engine.js` / `pacing.js`。
4. 验证与交付：[开发说明](development.md) → `scripts/check.mjs` / `tests/` → [发布步骤](publishing.md)。

README 动图与 GitHub Pages 的关系见[动图与托管方案](demo-media.md)。
