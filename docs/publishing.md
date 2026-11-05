# GitHub publishing / 上传与展示

The project is published at [ringing-0619/resume-refill](https://github.com/ringing-0619/resume-refill), with English `README.md` as the default repository overview. The interactive demo is [live on GitHub Pages](https://ringing-0619.github.io/resume-refill/demo/). The steps below document initial publishing and future redeployment.

## Suggested repository presentation

- **Name:** `resume-refill`
- **Description:** `A local-first Chrome extension for resume versions and job application forms, with a bilingual interactive demo.`
- **Topics:** `chrome-extension`, `javascript`, `manifest-v3`, `resume`, `form-autofill`, `local-first`, `portfolio`, `ai-assisted-development`
- **README:** English by default, linked to `README.zh-CN.md`, organized as one-sentence summary → independent creation and capabilities → animated demo → entry points. The introduction makes clear that the idea, product design and implementation were completed independently with AI-assisted vibe coding.

Both READMEs already embed `docs/images/resume-refill-demo.gif`. Uploading the source makes the animation available on the repository page; it does not need a running localhost server. The separately interactive version uses GitHub Pages, as described in [media and hosting](demo-media.md). The [complete repository map](repository-map.zh-CN.md) explains every source file and which local outputs to exclude.

## Upload the source

Create an empty repository in your GitHub account. Do not initialize it with another README. In this folder, run:

```bash
git init -b main
git add .
git commit -m "Prepare Resume Refill extension and interactive demo"
git remote add origin https://github.com/YOUR_USERNAME/resume-refill.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub login. If Git was already initialized for you, skip `git init` and inspect `git status` before committing. The source ZIP also contains the files needed for an upload; preserve the hidden `.github/` directory so workflows are included.

## Publish the demo with GitHub Pages

1. In the repository, go to **Settings → Pages** and choose **GitHub Actions** as the source.
2. Open **Actions → Publish demo to GitHub Pages → Run workflow** on `main`.
3. Wait for the build and deploy jobs to succeed. GitHub returns the actual Pages URL in the deployment environment.
4. Open that URL and try scan/fill. Set the repository **Website** field to the confirmed URL, then add a live-demo link near the top of both READMEs.

The workflow builds `dist/site/` and uploads only static demo assets, fictional examples and documentation. It does not publish real resume files, `node_modules` or the original desktop folder. Do not present an anticipated Pages URL as already live.

The workflow uses GitHub's documented Pages deployment setup; see [GitHub's custom-workflow guide](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## 中文操作要点

先在 GitHub 新建空仓库 `resume-refill`，将本目录的文件连同 `.github/` 一起上传。仓库首页会显示英文 README，并提供中文入口。

要对外展示交互 demo，在仓库「Settings → Pages」选择「GitHub Actions」，再手动运行「Publish demo to GitHub Pages」。部署成功后使用 GitHub 返回的真实链接，更新仓库 Website 和两份 README 的演示入口。准备工作本身不等于已经上传或部署。
