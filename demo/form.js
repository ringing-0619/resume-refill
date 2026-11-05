(() => {
  const params = new URLSearchParams(location.search);
  const zh = params.get("lang") === "zh";
  const scene = ["standard", "custom", "review"].includes(params.get("scene")) ? params.get("scene") : "standard";
  document.documentElement.lang = zh ? "zh-CN" : "en";
  const text = (en, cn) => zh ? cn : en;
  let counter = 0;
  const field = (label, control, { full = false, required = false, hint = "" } = {}) => {
    const id = `demo-field-${++counter}`;
    return `<div class="field${full ? " full" : ""}"><label for="${id}">${label}${required ? '<span class="required" aria-hidden="true">*</span>' : ""}</label>${control.replaceAll("__ID__", id)}${hint ? `<small class="field-hint">${hint}</small>` : ""}</div>`;
  };
  const input = (label, { type = "text", required = false, placeholder = "", value = "", ...rest } = {}) => field(label, `<input id="__ID__" type="${type}" ${required ? "required" : ""} placeholder="${placeholder}" value="${value}" ${value ? 'class="preset"' : ""}>`, { required, ...rest });
  const select = (label, choices, { custom = false, required = false } = {}) => {
    const values = choices.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
    return field(label, custom
      ? `<div class="custom-select" data-options='${JSON.stringify(choices.map((choice) => choice[1])).replaceAll("'", "&#39;")}'><input id="__ID__" type="text" role="combobox" aria-expanded="false" aria-haspopup="listbox" ${required ? 'aria-required="true"' : ""} readonly placeholder="${text("Select an option", "请选择")}"></div>`
      : `<select id="__ID__" ${required ? "required" : ""}><option value="">${text("Select an option", "请选择")}</option>${values}</select>`, { required });
  };
  const section = (title, number, body, tag = "") => `<section class="form-section"><h2><span class="section-num">${number}</span>${title}${tag ? `<span class="tag">${tag}</span>` : ""}<span class="section-rule"></span></h2>${body}</section>`;
  const degreeChoices = [["硕士研究生", text("Master's degree", "硕士研究生")], ["大学本科", text("Bachelor's degree", "大学本科")]];
  const custom = scene === "custom";
  const education = (index) => `<div class="education-entry" data-entry="education">${custom ? `<span class="entry-label">${text("Education", "教育经历")} ${index + 1}</span>` : ""}<div class="fields">${input(text("School name", "学校名称"), { required: true, placeholder: text("University or institution", "请输入学校名称") })}${input(text("Major", "专业"), { required: true, placeholder: text("Field of study", "请输入专业名称") })}${select(text("Degree", "学历"), degreeChoices, { custom, required: true })}${input(text("Start date", "开始时间"), { type: "month", required: true })}</div></div>`;
  const personal = `<div class="fields">${input(text("Full name", "姓名"), { required: true, placeholder: text("Your full name", "请输入姓名") })}${input(text("Email", "邮箱"), { type: "email", required: true, placeholder: "name@example.com", value: scene === "review" ? "already.edited@example.com" : "", hint: scene === "review" ? text("Already entered — kept unless overwrite is on", "已有内容，默认保留；开启覆盖后可修改") : "" })}${select(text("City", "城市"), [["上海", "上海"], ["北京", "北京"], ["杭州", "杭州"]], { custom })}${input(text("Professional headline", "职业标题"), { placeholder: text("Your focus or role", "请输入职业方向") })}</div>`;
  const projects = `<div class="fields">${input(text("Project name", "项目名称"), { required: true })}${input(text("Project role", "项目角色"))}${field(text("Project description", "项目描述"), '<textarea id="__ID__" placeholder="' + text("A little about the work", "简要介绍项目内容") + '"></textarea>', { full: true })}</div>`;
  const review = `<div class="fields">${select(text("Preferred interview format", "期望面试形式"), [["Remote", text("Remote", "线上面试")], ["In person", text("In person", "线下面试")]], { required: true })}${input(text("Application reference code", "申请推荐码"), { required: true, hint: text("Not present in the resume — your answer is needed", "简历中没有此信息，需要你本人补充") })}<div class="field full consent"><label><input type="checkbox" required>${text("I confirm that I have reviewed this fictional application.", "我确认已检查本次模拟申请的信息。")}</label></div></div>`;
  document.getElementById("formRoot").innerHTML = `<header class="portal-header"><div class="portal-brand"><span aria-hidden="true">◌</span> orbit<span style="font-size:12px;color:#95a287;margin:0 0 0 5px">careers</span></div><small>${text("FICTIONAL COMPANY", "虚构公司 · 模拟招聘页")}</small></header><div class="job-header"><p class="job-meta">PRODUCT & DATA / CAMPUS 2026</p><h1>${text("Let’s get to know you.", "让我们认识一下你。")}</h1><p>${text("An example application, ready for a little less typing.", "这是一份模拟网申表单，试试少一点重复输入。")}</p></div><div class="application-steps"><strong>${text("Your profile", "简历信息")}</strong><i></i><span>${text("Review", "检查信息")}</span><i></i><span>${text("Done", "完成")}</span></div>${scene === "review" ? `<p class="hint-banner">${text("This scenario includes an existing email, questions absent from the resume, and a confirmation checkbox.", "本场景包含已填邮箱、简历外问题及需要本人确认的勾选项。")}</p>` : ""}<form id="mockForm" autocomplete="off">${section(text("Personal information", "基本信息"), "01", personal)}${section(text("Education", "教育经历"), "02", education(0) + (custom ? education(1) : ""), custom ? text("2 entries · custom selects", "2 条经历 · 自定义下拉") : "")}${scene === "review" ? section(text("Application questions", "申请信息"), "03", review, text("Requires your review", "需要本人确认")) : section(text("Project experience", "项目经历"), "03", projects)}<div class="no-submit"><span aria-hidden="true">◈</span>${text("Sandbox only. This form has no submission action.", "仅供演示，本表单不会提交任何申请。")}</div></form>`;
  document.getElementById("mockForm").addEventListener("submit", (event) => event.preventDefault());
  if (!custom) {
    const educationSection = document.querySelector(".education-entry").closest("section");
    const add = document.createElement("button");
    add.type = "button";
    add.className = "add-button";
    add.textContent = text("Add education", "添加教育经历");
    add.addEventListener("click", () => {
      const count = educationSection.querySelectorAll(".education-entry").length;
      if (count < 5) add.insertAdjacentHTML("beforebegin", education(count));
      add.disabled = educationSection.querySelectorAll(".education-entry").length >= 5;
    });
    educationSection.append(add);
  }
  const reportSize = () => parent.postMessage({ channel: "resume-refill-layout", height: document.getElementById("formRoot").getBoundingClientRect().height }, location.origin);
  new ResizeObserver(reportSize).observe(document.getElementById("formRoot"));
  const closeMenus = () => {
    document.querySelectorAll(".custom-menu").forEach((menu) => menu.remove());
    document.querySelectorAll('[role="combobox"]').forEach((input) => input.setAttribute("aria-expanded", "false"));
  };
  document.querySelectorAll(".custom-select").forEach((root, index) => {
    const input = root.querySelector("input");
    const open = () => {
      closeMenus();
      input.setAttribute("aria-expanded", "true");
      const menu = document.createElement("div");
      menu.className = "custom-menu";
      menu.id = `demo-listbox-${index}`;
      menu.setAttribute("role", "listbox");
      menu.setAttribute("aria-label", input.closest(".field").querySelector("label").textContent);
      input.setAttribute("aria-controls", menu.id);
      JSON.parse(root.dataset.options).forEach((value) => {
        const option = document.createElement("div");
        option.setAttribute("role", "option");
        option.setAttribute("aria-selected", String(input.value === value));
        option.tabIndex = 0;
        option.textContent = value;
        const choose = () => { input.value = value; input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true })); closeMenus(); input.focus(); };
        option.addEventListener("click", choose);
        option.addEventListener("keydown", (event) => { if (["Enter", " "].includes(event.key)) { event.preventDefault(); choose(); } });
        menu.append(option);
      });
      root.append(menu);
    };
    input.addEventListener("click", open);
    input.addEventListener("keydown", (event) => { if (["Enter", " ", "ArrowDown"].includes(event.key)) { event.preventDefault(); open(); root.querySelector('[role="option"]').focus(); } });
  });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenus(); });
  document.addEventListener("click", (event) => { if (!event.target.closest(".custom-select")) closeMenus(); });
})();
