# Resume Refill: from repeated typing to a reviewable workflow

[项目中文简介](../README.zh-CN.md)

## The problem

Online applications often ask for information already present in a resume. The repetition is made harder by multiple resume versions, mixed Chinese and English labels, custom controls and repeated education or experience sections. A script that only sets `input.value` cannot reliably handle those differences.

Resume Refill is a personal Chrome extension built by Ringing Song with AI-assisted development. Its aim is to reduce repeated entry while keeping the applicant involved in checking factual answers and submitting the final application.

## The product decisions

**Start from a local, editable profile.** PDF.js, Mammoth and a TXT reader extract resume text inside the browser. Rule-based parsing maps it into a structured profile, which the user reviews before saving. No model API or resume parsing service is required at runtime.

**Keep resume versions independent.** Different roles may need different summaries and project descriptions. New versions start empty and request a new file, while the popup makes the version used for the current fill explicit.

**Separate meaning from interaction.** A city may appear as a text box, a native select or a custom picker. Field recognition determines what the question means; the control adapter determines how to enter the answer. Read-back checks help distinguish a successful value change from a click that did nothing.

**Keep uncertainty visible.** Missing answers, unsupported controls and failed writes remain in the review flow. Existing values are preserved unless overwrite is enabled. Consent, declarations and final submission stay under the applicant's control.

## Implementation

The source is a buildless Manifest V3 extension with an options page, popup, service worker and an on-demand content script. Its structured profile covers basic information, education, work, internships, projects, campus activities, awards, publications, patents, skills and additional information.

Earlier development included targeted adapters for observed Moka/Sugar, Feishu, Ant Design and Beisen/Phoenix patterns. The regression suite covers selected synthetic DOM fixtures, including date menus, repeated records, page rerenders, value rollback and explicit required-answer confirmation. This does not certify every website using those platforms.

## Public demonstration

The repository adds a bilingual interactive showcase using fictional profiles and an original mock application. It directly loads the original popup and profile-manager HTML, CSS and JavaScript, together with the original content script, through a same-origin browser API adapter. It demonstrates standard inputs, custom selects, multiple education entries, preserved answers and deliberate confirmation without using a real recruiting service.

The public edition reorganizes the working project, preserves the core engine, adds documentation, CI, packaging and the demo. It does not claim measured time savings, an installed user base, a store release or universal website compatibility.

## What I learned / 项目收获

- 表单自动化的难点不只是找到输入框，还包括识别字段语义、判断记录归属、正确操作组件以及验证结果。
- 多版本资料和已有页面答案需要明确的保护规则，避免把不同岗位方向或不同条目的信息混在一起。
- AI 辅助开发仍需要真实场景观察、失败案例复现和回归验证。能运行的代码与可解释、可维护、方便展示的项目之间还有整理工作。
- 下一步可优先把大体积内容脚本按识别、控件操作、必填项与进度展示拆分，并补充更多真实浏览器端的兼容性验证。

See [architecture](architecture.md), [limitations](limitations.md) and the [demo walkthrough](demo-guide.md).
