(() => {
  const CONTENT_VERSION = "0.12.4";
  const previous = globalThis.__resumeHelperController;
  if (previous?.version === CONTENT_VERSION) return;
  if (previous?.listener) chrome.runtime.onMessage.removeListener(previous.listener);
  globalThis.__resumeHelperLoaded = true;

  const FIELD_RULES = [
    rule("personal.email", ["email", "e-mail", "电子邮箱", "邮箱", "邮件地址"], ["confirm", "确认"]),
    rule("personal.phoneCountryCode", ["phone country code", "country calling code", "dialing code", "area code", "国际区号", "国家区号", "手机区号"]),
    rule("personal.phone", ["phone number", "mobile number", "telephone", "phone", "mobile", "手机号", "手机号码", "联系电话", "电话"]),
    rule("personal.gender", ["gender", "sex", "性别"]),
    rule("personal.firstName", ["first name", "given name", "forename", "名（", "名字", "名"], ["last", "family", "姓"]),
    rule("personal.lastName", ["last name", "family name", "surname", "姓氏", "姓"], ["first", "given", "名（"]),
    rule("personal.fullName", ["full name", "legal name", "candidate name", "your name", "姓名", "中文名"], ["first", "last", "preferred", "school", "company"]),
    rule("personal.preferredName", ["preferred name", "chosen name", "nickname", "常用名", "英文名"]),
    rule("personal.linkedin", ["linkedin profile", "linkedin url", "linkedin"]),
    rule("personal.github", ["github profile", "github url", "github"]),
    rule("personal.website", ["portfolio url", "portfolio", "personal website", "website", "个人网站", "作品集"], ["company"]),
    rule("personal.address", ["street address", "address line 1", "home address", "mailing address", "详细地址", "街道地址", "地址"], ["email", "web", "company"]),
    rule("personal.postalCode", ["postal code", "zip code", "postcode", "zip", "邮政编码", "邮编"]),
    rule("personal.city", ["city/town", "city", "城市", "所在城市", "现居住地", "现居城市", "常住城市", "市"], ["citizenship"]),
    rule("personal.state", ["state/province", "state or province", "province", "region", "省份", "省/州", "州"]),
    rule("personal.country", ["country/region", "country or region", "country", "国家/地区", "国家或地区", "国家"]),
    rule("personal.nativePlace", ["native place", "place of origin", "籍贯"]),
    rule("personal.ethnicity", ["ethnicity", "ethnic group", "民族"]),
    rule("personal.idType", ["identity document type", "id type", "证件类型"]),
    rule("personal.idNumber", ["identity document number", "id number", "id no", "证件号码", "身份证号"]),
    rule("personal.birthDate", ["date of birth", "birth date", "birthday", "出生日期", "出生年月"]),
    rule("personal.wechat", ["wechat id", "wechat", "微信号", "微信"]),
    rule("personal.hobbies", ["interests and hobbies", "hobbies", "interests", "兴趣爱好", "爱好"]),
    rule("personal.headline", ["professional headline", "headline", "current title", "职业标题", "个人标题"]),
    rule("personal.summary", ["professional summary", "personal statement", "about you", "summary", "个人简介", "自我介绍", "个人总结", "自我评价"]),

    rule("education.school", ["school name", "university name", "college name", "institution name", "school", "university", "college", "学校名称", "毕业院校", "院校", "学校"], ["company"]),
    rule("education.college", ["faculty name", "department name", "college department", "学院名称", "院系名称", "学院", "院系"]),
    rule("education.majorCategory", ["major category", "discipline category", "专业类别", "学科类别"]),
    rule("education.degree", ["degree type", "degree", "qualification", "学历", "学位"], ["学历类型"]),
    rule("education.major", ["field of study", "area of study", "major", "discipline", "专业名称", "所学专业", "专业"]),
    rule("education.gpa", ["cumulative gpa", "grade point average", "gpa", "成绩点", "平均成绩"]),
    rule("education.studyMode", ["study mode", "study format", "is full time", "学习形式", "培养方式", "学历类型", "是否全日制", "是否为全日制"]),
    rule("education.isHighest", ["highest education", "highest degree", "是否最高学历", "最高学历"]),
    rule("education.isDualDegree", ["dual degree", "double degree", "是否双学位", "双学位"]),
    rule("education.ranking", ["major ranking", "academic ranking", "class rank", "专业成绩排名", "成绩排名"]),
    rule("education.laboratory", ["laboratory", "research lab", "实验室"]),
    rule("education.advisor", ["academic advisor", "supervisor", "导师"]),
    rule("education.researchDirection", ["research direction", "research area", "研究方向"]),

    rule("experience.company", ["company name", "employer name", "organization name", "employer", "company", "公司名称", "雇主", "单位名称", "实习单位", "工作单位", "公司", "单位"]),
    rule("experience.title", ["job title", "position title", "role title", "position", "职位名称", "工作职位", "实习岗位", "岗位名称", "职位", "职务", "岗位"]),
    rule("experience.location", ["work location", "job location", "office location", "工作地点", "工作城市", "实习地点", "活动地点", "location", "地点"]),
    rule("experience.description", ["internship responsibilities", "internship content", "job responsibilities", "role responsibilities", "job description", "responsibilities", "main duties", "duties", "工作内容", "工作职责", "工作描述", "实习内容", "活动内容", "主要职责", "职责内容", "职责描述", "经历描述"]),

    rule("campus.name", ["activity name", "club name", "society name", "活动名称", "社团名称", "组织名称", "经历名称"]),
    rule("campus.role", ["role in activity", "position held", "担任角色", "担任职务", "组织职务", "社团职务", "校内职务", "校内任职职务"]),
    rule("campus.description", ["campus experience description", "校园经历信息", "校园经历描述", "校内职务描述"]),
    rule("project.name", ["project name", "case name", "项目名称", "案例名称"]),
    rule("project.role", ["project role", "role in project", "项目角色", "项目职务", "项目组员"]),
    rule("project.responsibilities", ["project responsibilities", "responsibilities in project", "项目中职责", "项目职责", "项目分工"]),
    rule("project.description", ["project description", "project content", "项目内容", "项目描述", "项目简介"]),

    rule("honor.type", ["award type", "honor type", "奖项类型", "荣誉类型"]),
    rule("honor.name", ["award name", "honor name", "award item", "奖项名称", "荣誉名称", "获奖项"]),
    rule("honor.description", ["award description", "award details", "honor description", "获奖情况", "奖项说明"]),

    rule("publication.title", ["paper title", "publication title", "论文名称", "论文题目"]),
    rule("publication.authorOrder", ["author order", "author position", "作者顺序", "作者排名"]),
    rule("publication.journal", ["journal", "publication venue", "刊物/机构", "刊物机构", "期刊名称", "发表机构"]),
    rule("publication.description", ["paper details", "publication details", "论文详情", "论文描述"]),

    rule("patent.type", ["patent type", "achievement type", "成果类型", "专利类型"]),
    rule("patent.name", ["patent name", "achievement name", "成果名称", "专利名称"]),
    rule("patent.registrationNumber", ["registration number", "patent number", "application number", "登记号", "专利号", "申请号", "授权号"]),
    rule("patent.inventorRank", ["inventor rank", "inventor order", "发明人排名", "发明人顺序"]),
    rule("patent.description", ["patent description", "core introduction", "核心简介", "成果简介"]),

    rule("skill.type", ["skill type", "certificate type", "技能类型", "证书类型"]),
    rule("skill.name", ["foreign language", "language name", "language type", "certificate name", "programming language", "development language", "other skill", "skill name", "外语语种", "语言名称", "语言类型", "证书名称", "开发语言", "编程语言", "其他技能", "技能名称"]),
    rule("skill.proficiency", ["language proficiency", "mastery", "掌握程度", "语言熟练程度"]),
    rule("skill.speaking", ["listening and speaking", "speaking", "听说能力", "听说"]),
    rule("skill.readingWriting", ["reading and writing", "读写能力", "读写"]),
    rule("skill.score", ["language test score", "exam score", "proficiency", "语言考试成绩", "考试成绩", "熟练程度", "证书等级"]),
    rule("skill.description", ["skill description", "certificate description", "技能说明", "证书说明"]),

    rule("additional.skills", ["skills", "skill set", "technical skills", "技能", "专业技能"]),
    rule("additional.languages", ["languages", "language skills", "语言能力", "语言"]),
    rule("additional.salary", ["salary expectation", "expected salary", "desired salary", "compensation expectation", "期望薪资", "薪资要求"]),
    rule("additional.availableDate", ["available start date", "earliest start date", "availability date", "date available", "可入职日期", "到岗时间"])
  ];

  const DATE_RULES = [
    rule("education.startDate", ["education start date", "school start date", "入学时间", "入学日期"]),
    rule("education.endDate", ["graduation date", "education end date", "school end date", "毕业时间", "毕业日期"]),
    rule("experience.startDate", ["employment start date", "work start date", "任职开始", "工作开始", "入职时间"]),
    rule("experience.endDate", ["employment end date", "work end date", "任职结束", "工作结束", "离职时间"]),
    rule("internship.startDate", ["internship start date", "intern start date", "实习开始时间", "实习开始日期"]),
    rule("internship.endDate", ["internship end date", "intern end date", "实习结束时间", "实习结束日期"]),
    rule("campus.startDate", ["activity start date", "campus start date", "活动开始时间", "校园经历开始时间"]),
    rule("campus.endDate", ["activity end date", "campus end date", "活动结束时间", "校园经历结束时间"]),
    rule("project.startDate", ["project start date", "项目开始时间", "项目开始日期"]),
    rule("project.endDate", ["project end date", "项目结束时间", "项目结束日期"]),
    rule("honor.date", ["award date", "date received", "获奖时间", "获奖日期"]),
    rule("publication.publicationDate", ["publication date", "published date", "发表时间", "发表日期"]),
    rule("patent.registrationDate", ["registration date", "patent date", "登记日期", "授权日期"])
  ];

  const REPEATABLE_GROUPS = new Set(
    ResumeHelperSchema.FIELD_GROUPS.filter((group) => group.repeatable).map((group) => group.id)
  );

  const REPEATABLE_ENTRY_SELECTOR = [
    "[data-entry]",
    "[class*='formGroupItem']",
    "[class*='form-group-item']",
    "[class*='resumeEditForm-item']",
    "[class*='multi-']",
    "[id*='_Recruitment_']:not([id$='_addButton'])"
  ].join(", ");

  const SECTION_ID_GROUPS = {
    basic: "personal",
    base: "personal",
    info: "personal",
    personal: "personal",
    edu: "education",
    education: "education",
    campus: "campus",
    program: "project",
    project: "project",
    honor: "honor",
    honors: "honor",
    award: "honor",
    thesis: "publication",
    publication: "publication",
    publications: "publication",
    patent: "patent",
    patents: "patent",
    skill: "skill",
    skills: "skill"
  };

  // Some range pickers render both endpoints as clickable labels. Their input
  // only captures focus and never contains either date.
  const MONTH_PERIOD_ENDPOINT_SELECTOR = "[class*='date-picker-period-month'] > [class*='date-picker-period-month-label']";

  const CONTROL_SELECTOR = [
    "input",
    "textarea",
    "select",
    "[role='combobox']",
    "[role='radio']",
    "[contenteditable='true']",
    ".phoenix-radio",
    MONTH_PERIOD_ENDPOINT_SELECTOR
  ].join(", ");

  const FIELD_CONTAINER_SELECTOR = [
    "[class*='apply-field-']",
    "[class*='fieldItem']",
    "[class*='filedItem']",
    ".ant-form-item",
    ".atsx-form-item",
    ".form-item",
    ".form-group",
    ".field",
    "[class*='question']"
  ].join(", ");

  const CUSTOM_SELECT_ROOT_SELECTOR = [
    ".ant-select",
    ".phoenix-select",
    "[class*='selectControl']",
    "[class*='select-control']",
    "[class*='sd-Select-container']",
    "[class*='sd-Dropdown-container']"
  ].join(", ");

  const CHOICE_ALIAS_FAMILIES = {
    "personal.country": [
      ["中国", "中国大陆", "大陆", "中华人民共和国", "china", "mainland china", "prc"],
      ["中国香港", "香港", "香港特别行政区", "hong kong", "hong kong sar"],
      ["中国澳门", "澳门", "澳门特别行政区", "macao", "macau", "macao sar"],
      ["中国台湾", "台湾", "台湾地区", "taiwan"],
      ["外籍", "外国", "其他国家", "foreign", "foreigner"],
      ["美国", "美利坚合众国", "united states", "united states of america", "usa", "us"],
      ["英国", "united kingdom", "uk"],
      ["加拿大", "canada"],
      ["澳大利亚", "澳洲", "australia"],
      ["新加坡", "singapore"]
    ],
    "personal.idType": [
      ["身份证", "居民身份证", "中国居民身份证", "中华人民共和国居民身份证", "二代身份证", "national id", "identity card"],
      ["港澳居民来往内地通行证", "回乡证"],
      ["台湾居民来往大陆通行证", "台胞证"],
      ["护照", "passport"]
    ],
    "education.degree": [
      ["博士", "博士研究生", "博士学位", "phd", "doctor", "doctorate"],
      ["硕士", "硕士研究生", "硕士学位", "master", "masters"],
      ["本科", "大学本科", "学士", "学士学位", "bachelor", "undergraduate"],
      ["大专", "专科", "大学专科", "associate"],
      ["高中", "普通高中"],
      ["中专", "中等专科"]
    ],
    "education.studyMode": [
      ["全日制", "统招", "full time", "full-time"],
      ["非全日制", "在职", "part time", "part-time"]
    ],
    "education.isHighest": [["是", "yes", "true", "1"], ["否", "no", "false", "0"]],
    "education.isDualDegree": [["是", "yes", "true", "1"], ["否", "no", "false", "0"]],
    "skill.type": [
      ["外语语种", "外语", "语言", "foreign language"],
      ["证书", "资格证书", "certificate", "certification"],
      ["开发语言", "编程语言", "programming language", "development language"],
      ["其他技能", "软件工具", "工具", "other skill"]
    ],
    "skill.name": [
      ["英语", "英文", "english"],
      ["日语", "日本语", "japanese"],
      ["韩语", "朝鲜语", "korean"],
      ["德语", "german"],
      ["法语", "french"],
      ["西班牙语", "spanish"],
      ["阿拉伯语", "arabic"],
      ["马来西亚语", "马来语", "malay"],
      ["javascript", "js"],
      ["typescript", "ts"],
      ["python", "python3"],
      ["sql", "mysql sql", "postgresql sql"]
    ]
  };

  const LOCATION_KEYS = new Set(["personal.country", "personal.nativePlace", "personal.city", "personal.state", "education.country", "education.state", "education.city", "experience.location", "internship.location", "campus.location"]);
  const FILL_PRIORITY = {
    "personal.country": 10,
    "personal.state": 20,
    "personal.city": 30,
    "personal.nativePlace": 30,
    "personal.idType": 40,
    "personal.idNumber": 50,
    "education.school": 10,
    "education.country": 5,
    "education.state": 6,
    "education.city": 7,
    "education.degree": 20,
    "education.majorCategory": 30,
    "education.major": 40,
    "skill.type": 10,
    "honor.type": 10,
    "patent.type": 10
  };

  function rule(key, positives, negatives = []) {
    return { key, positives: positives.map(normalize), negatives: negatives.map(normalize) };
  }

  function normalize(value) {
    return String(value || "")
      .normalize("NFKC")
      .replace(/[⻓⻜⻔⻚⻆戶]/g, (character) => ({ "⻓": "长", "⻜": "飞", "⻔": "门", "⻚": "页", "⻆": "角", "戶": "户" })[character])
      .replace(/[\uE000-\uF8FF]/g, " ")
      .toLowerCase()
      .replace(/[_\-–—/\\]+/g, " ")
      .replace(/[()（）*：:？?]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function elementText(element) {
    const parts = [];
    const id = element.id;
    if (id) {
      try {
        const label = document.querySelector(`label[for="${CSS.escape(id)}"]`);
        if (label) parts.push(label.innerText);
      } catch (_) {}
    }
    const wrappingLabel = element.closest("label");
    if (wrappingLabel && !element.closest(CUSTOM_SELECT_ROOT_SELECTOR)) parts.push(wrappingLabel.innerText);

    const labelledBy = element.getAttribute("aria-labelledby");
    if (labelledBy) {
      labelledBy.split(/\s+/).forEach((labelId) => {
        const label = document.getElementById(labelId);
        if (label) parts.push(label.innerText);
      });
    }

    ["aria-label", "placeholder", "name", "id", "data-automation-id", "data-testid"].forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (value) parts.push(value);
    });

    const structuredContainer = element.closest("[class*='fieldItem'], [class*='filedItem']");
    const container = structuredContainer || fieldContainer(element)
      || element.closest("fieldset, [role='group'], [class*='formItem'], [class*='FormItem'], [class*='field'], [class*='filed']");
    if (container) {
      const nearby = container.querySelector("legend, .form-item__text, [class*='filedName'], [class*='fieldName'], [class*='question-title'], [class*='field-label'], [class*='form-label'], label, [class*='label'], [class*='title']");
      if (nearby) parts.push(nearby.textContent);
    }
    return normalize(parts.join(" "));
  }

  function isPageSearchControl(element) {
    if (!(element instanceof HTMLInputElement) || fieldContainer(element)) return false;
    const descriptor = normalize([
      element.type,
      element.getAttribute("role"),
      element.getAttribute("placeholder"),
      element.getAttribute("aria-label"),
      element.getAttribute("name")
    ].filter(Boolean).join(" "));
    return element.type === "search"
      || /(?:^|\s)(?:search|搜索|检索)(?:\s|$)/.test(descriptor)
      || /关键词|关键字|keyword/.test(descriptor)
      || Boolean(element.closest("header, nav, [role='search']"));
  }

  function isFillable(element) {
    if (element.matches?.("[class*='date-picker-period-hidden-input']")) return false;
    const nativeControl = element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement;
    const customControl = element instanceof HTMLElement && (
      ["combobox", "radio"].includes(element.getAttribute("role"))
      || element.isContentEditable
      || element.classList.contains("phoenix-radio")
      || Boolean(monthPeriodEndpoint(element))
    );
    if (!nativeControl && !customControl) return false;
    if (isPageSearchControl(element)) return false;
    const interactiveReadonly = element instanceof HTMLInputElement && (
      isCustomSelectControl(element)
      ||
      /cascader|calendar-picker|date-picker|select-search/i.test(String(element.className))
      || Boolean(element.closest(".ant-cascader-picker, .ant-calendar-picker, .ant-select, [class*='datePicker'], [class*='date-picker']"))
    );
    if (element.disabled || (element.readOnly && !interactiveReadonly) || element.getAttribute("aria-disabled") === "true") return false;
    if (element instanceof HTMLInputElement && ["hidden", "password", "file", "submit", "button", "image", "reset", "checkbox"].includes(element.type)) return false;
    const style = getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") return false;
    const box = element.getBoundingClientRect();
    return box.width > 0 && box.height > 0;
  }

  function autocompleteMatch(element) {
    const value = normalize(element.getAttribute("autocomplete"));
    const map = {
      name: "personal.fullName",
      "given name": "personal.firstName",
      "family name": "personal.lastName",
      email: "personal.email",
      tel: "personal.phone",
      "street address": "personal.address",
      "address line1": "personal.address",
      "address level2": "personal.city",
      "address level1": "personal.state",
      "postal code": "personal.postalCode",
      country: "personal.country",
      "country name": "personal.country"
    };
    return map[value] || null;
  }

  function structuredPathMatch(element) {
    const raw = [
      element.id,
      element.getAttribute?.("name"),
      element.getAttribute?.("data-field"),
      element.getAttribute?.("data-key"),
      element.getAttribute?.("data-path"),
      element.getAttribute?.("data-automation-id"),
      element.getAttribute?.("data-testid"),
      element.getAttribute?.("data-cy")
    ].filter(Boolean).join(" ").toLowerCase();
    if (!raw) return null;
    const compact = raw.replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ");
    const groupRules = [
      ["internship", /\bintern(?:ship)?\b|实习/],
      ["project", /\bproject\b|项目/],
      ["campus", /\bcampus\b|student activity|校园|社团/],
      ["education", /\beducation\b|\bedu\b|school history|教育/],
      ["experience", /work experience|employment|\bexperience\b|工作经历/],
      ["honor", /\bhonou?r\b|\baward\b|荣誉|奖项/],
      ["skill", /\bskill\b|language ability|语言能力/],
      ["personal", /\bpersonal\b|basic info|base info|个人信息/]
    ];
    const group = groupRules.find(([, pattern]) => pattern.test(compact))?.[0];
    if (!group) return null;
    const aliases = {
      personal: [
        ["fullName", /full name|candidate name/], ["email", /\bemail\b/], ["phone", /\bphone\b|\bmobile\b/],
        ["gender", /\bgender\b|\bsex\b/], ["nativePlace", /native place|place of origin/], ["idNumber", /id number|identity number/]
      ],
      education: [
        ["startDate", /start date|start time|from date/], ["endDate", /end date|end time|graduation date|to date/],
        ["school", /school name|university name|institution/], ["major", /major name|field of study|\bmajor\b/],
        ["degree", /degree|qualification/], ["college", /college name|department name|faculty/], ["gpa", /\bgpa\b/]
      ],
      experience: [
        ["startDate", /start date|start time|from date/], ["endDate", /end date|end time|to date/],
        ["company", /company name|employer|organization/], ["title", /job title|position title|\bposition\b/],
        ["location", /location|city/], ["description", /description|responsibilit|duties|\bdesc\b/]
      ],
      internship: [
        ["startDate", /start date|start time|from date/], ["endDate", /end date|end time|to date/],
        ["company", /company name|employer|organization/], ["title", /job title|position title|\bposition\b/],
        ["location", /location|city/], ["description", /description|responsibilit|duties|\bdesc\b/]
      ],
      project: [
        ["startDate", /start date|start time|from date/], ["endDate", /end date|end time|to date/],
        ["name", /project name|\bname\b/], ["role", /project role|\brole\b|\bposition\b/],
        ["responsibilities", /responsibilit|duties/], ["description", /description|content|\bdesc\b/]
      ],
      campus: [
        ["startDate", /start date|start time|from date/], ["endDate", /end date|end time|to date/],
        ["name", /activity name|organization name|\bname\b/], ["role", /\brole\b|\bposition\b/],
        ["location", /location|city/], ["description", /description|responsibilit|duties|\bdesc\b/]
      ],
      honor: [["date", /award date|honor date|received date/], ["name", /award name|honor name|\bname\b/], ["description", /description|details/]],
      skill: [["type", /skill type|category/], ["name", /skill name|language name|\bname\b/], ["score", /score|level/], ["description", /description|\bdesc\b/]]
    };
    const field = aliases[group]?.find(([, pattern]) => pattern.test(compact))?.[0];
    return field ? { key: `${group}.${field}`, confidence: 98 } : null;
  }

  function semanticGroup(value) {
    const context = normalize(value);
    if (/honou?r|award|荣誉|奖项|获奖/.test(context)) return "honor";
    if (/publication|paper|journal|thesis|论文|期刊/.test(context)) return "publication";
    if (/patent|invention|copyright|专利|发明成果|软件著作权|软著/.test(context)) return "patent";
    if (/certificate|certification|language skill|语言\/证书\/技能|语言证书技能|证书技能|语言能力/.test(context)) return "skill";
    if (/\bproject(s)?\b|project experience|项目经历|项目经验|项目实践/.test(context)) return "project";
    if (/\bintern(ship)?\b|实习/.test(context)) return "internship";
    if (/\bcampus\b|student activ|extracurricular|\bclub\b|\bsociety\b|校园|校内|社团|学生会|学生工作|学生组织|校园活动|社团活动|活动经历|活动内容/.test(context)) return "campus";
    if (/educat|school|university|college|学历|教育背景|教育经历|院校|学校/.test(context)) return "education";
    if (/employ|work experience|professional experience|工作经历|任职经历|职业经历/.test(context)) return "experience";
    if (/personal info|basic info|candidate info|个人信息|基本信息|基础信息|个人资料/.test(context)) return "personal";
    return null;
  }

  function structuralSectionContext(element) {
    let node = element;
    let depth = 0;
    while (node && node !== document.body && depth < 20) {
      const structure = [
        node.id,
        node.getAttribute?.("class"),
        node.getAttribute?.("data-section"),
        node.getAttribute?.("aria-label"),
        node.getAttribute?.("data-automation-id"),
        node.getAttribute?.("data-testid")
      ].filter(Boolean).join(" ");
      const structureGroup = semanticGroup(structure);
      if (structureGroup) return { group: structureGroup, node };

      const directHeading = [...(node.children || [])].find((child) => child.matches?.(
        "legend, h1, h2, h3, h4, [class*='blockTitle'], [class*='section-title'], [class*='sectionTitle'], [class*='heading']"
      ));
      const directText = cleanControlText(directHeading?.textContent || "");
      if (directText && directText.length <= 80) {
        const directGroup = semanticGroup(directText);
        if (directGroup) return { group: directGroup, node };
      }

      let sibling = node.previousElementSibling;
      for (let offset = 0; sibling && offset < 2; offset += 1, sibling = sibling.previousElementSibling) {
        if (sibling.querySelector(CONTROL_SELECTOR)) continue;
        const siblingText = cleanControlText(sibling.textContent || "");
        if (!siblingText || siblingText.length > 80) continue;
        const siblingGroup = semanticGroup(siblingText);
        if (siblingGroup) return { group: siblingGroup, node };
      }
      node = node.parentElement;
      depth += 1;
    }
    return null;
  }

  function moduleBoundaryForElement(element, expectedGroup = "") {
    const block = element.closest?.("[class*='apply-block-'], [class*='form-section'], [data-section]");
    const blockHeading = [...(block?.children || [])].find((child) => child.matches?.(
      "legend, h1, h2, h3, h4, [class*='blockTitle'], [class*='section-title'], [class*='sectionTitle'], [class*='heading']"
    ));
    const blockGroup = semanticGroup(blockHeading?.textContent || "");
    if (blockGroup && (!expectedGroup || blockGroup === expectedGroup)) return block;
    let node = element;
    let depth = 0;
    while (node && node !== document.body && depth < 22) {
      const heading = [...(node.children || [])].find((child) => child.matches?.(
        "legend, h1, h2, h3, h4, [class*='blockTitle'], [class*='section-title'], [class*='sectionTitle'], [class*='heading']"
      ));
      const headingGroup = semanticGroup(heading?.textContent || "");
      if (headingGroup && (!expectedGroup || headingGroup === expectedGroup)) return node;
      let sibling = node.previousElementSibling;
      for (let offset = 0; sibling && offset < 2; offset += 1, sibling = sibling.previousElementSibling) {
        if (sibling.querySelector(CONTROL_SELECTOR)) continue;
        const text = cleanControlText(sibling.textContent || "");
        if (!text || text.length > 80) continue;
        const group = semanticGroup(text);
        if (group && (!expectedGroup || group === expectedGroup)) return node;
      }
      node = node.parentElement;
      depth += 1;
    }
    return null;
  }

  function contextGroup(element, directText) {
    const ownStructure = [
      element?.id,
      element?.getAttribute?.("class"),
      element?.getAttribute?.("data-section"),
      element?.getAttribute?.("data-automation-id"),
      element?.getAttribute?.("data-testid"),
      element?.getAttribute?.("data-cy")
    ].filter(Boolean).join(" ");
    const ownGroup = semanticGroup(ownStructure);
    if (ownGroup) return ownGroup;

    const structuralContext = structuralSectionContext(element);
    if (structuralContext?.group) return structuralContext.group;

    let sectionNode = element;
    while (sectionNode && sectionNode !== document.body) {
      const id = normalize(sectionNode.id).replace(/\s/g, "");
      if (["experience", "work", "employment", "internship", "internships"].includes(id)) {
        const headingText = normalize(sectionNode.querySelector("h1,h2,h3,h4,legend,[class*='title'],[class*='heading']")?.textContent || sectionNode.textContent?.slice(0, 100));
        return /intern|实习/.test(headingText) || /^internship/.test(id) ? "internship" : "experience";
      }
      if (SECTION_ID_GROUPS[id]) return SECTION_ID_GROUPS[id];
      sectionNode = sectionNode.parentElement;
    }

    const structuredBlock = element.closest?.("[class*='apply-block-'], [class*='form-section'], [data-section]");
    if (structuredBlock) {
      const heading = [...structuredBlock.children].find((child) =>
        child.matches?.("h1, h2, h3, h4, legend, [class*='blockTitle'], [class*='section-title'], [class*='sectionTitle']")
      );
      const blockGroup = semanticGroup(heading?.textContent || "");
      if (blockGroup) return blockGroup;
    }

    const parts = [directText];
    let ancestor = element.parentElement;
    let depth = 0;
    while (ancestor && ancestor !== document.body && depth < 18) {
      ["id", "class", "aria-label", "data-automation-id", "data-testid"].forEach((attribute) => {
        const value = ancestor.getAttribute?.(attribute);
        if (value) parts.push(value);
      });
      if (ancestor.matches("fieldset, section, article, [role='group']")) {
        const heading = ancestor.querySelector("legend, h1, h2, h3, h4, [class*='heading'], [class*='section-title']");
        if (heading) parts.push(heading.textContent);
      }
      ancestor = ancestor.parentElement;
      depth += 1;
    }

    return semanticGroup(parts.join(" "));
  }

  function contextualizeKey(key, group) {
    if (!group) return key;
    if (group === "project" && key.startsWith("campus.")) return `project.${key.split(".")[1]}`;
    if (group === "campus" && key.startsWith("project.")) return `campus.${key.split(".")[1]}`;
    if (!key.startsWith("experience.")) return key;
    const field = key.split(".")[1];
    if (group === "internship") return `internship.${field}`;
    if (group === "campus") {
      const fieldMap = { company: "name", title: "role", location: "location", description: "description" };
      return fieldMap[field] ? `campus.${fieldMap[field]}` : key;
    }
    if (group === "project") {
      const fieldMap = { company: "name", title: "role", description: "description" };
      return fieldMap[field] ? `project.${fieldMap[field]}` : key;
    }
    return key;
  }

  function fieldContainer(element) {
    const container = element.closest?.(FIELD_CONTAINER_SELECTOR);
    if (!container) return null;
    // A class such as "question" may wrap the entire application. Its first
    // label and required marker do not belong to every descendant control.
    if ([...container.querySelectorAll(FIELD_CONTAINER_SELECTOR)].some((nested) => nested.querySelector(CONTROL_SELECTOR))) return null;
    return container;
  }

  function isPhoneCountryCodeControl(element, text = elementText(element)) {
    if (!(element instanceof HTMLInputElement) || !/(?:手机|phone|mobile|电话)/.test(text)) return false;
    const container = fieldContainer(element);
    if (!container || !isCustomSelectControl(element)) return false;
    return [...container.querySelectorAll("input")].some((candidate) =>
      candidate !== element && /手机号|手机号码|phone|mobile/i.test(candidate.getAttribute("placeholder") || "")
    );
  }

  function monthPeriodEndpoint(element) {
    if (!element.matches?.(MONTH_PERIOD_ENDPOINT_SELECTOR)) return null;
    const isEndpoint = (node) => Boolean(node.querySelector("[class*='label-year']") && node.querySelector("[class*='label-month']"));
    if (!isEndpoint(element)) return null;
    const endpoints = [...element.parentElement.children].filter((child) => child.matches(MONTH_PERIOD_ENDPOINT_SELECTOR) && isEndpoint(child));
    if (endpoints.length !== 2) return null;
    return { root: element.parentElement, field: endpoints.indexOf(element) === 0 ? "startDate" : "endDate" };
  }

  function splitMonthRangeField(element, group) {
    const range = element.closest?.("[class*='month-range-select'], [class*='monthRange'], [class*='month-range']");
    if (!group || !REPEATABLE_GROUPS.has(group)) return null;
    const container = range || fieldContainer(element);
    if (!container) return null;
    const inputs = [...container.querySelectorAll("input")].filter((input) => !["checkbox", "hidden"].includes(input.type));
    const index = inputs.indexOf(element);
    if (index < 0 || index > 3) return null;
    const label = normalize(humanFieldLabel(element));
    const component = /^(?:年|year)$/i.test(element.getAttribute("placeholder") || "") ? "year"
      : /^(?:月|month)$/i.test(element.getAttribute("placeholder") || "") ? "month"
      : inputs.length === 2 ? (index === 0 ? "year" : "month") : "";
    if (inputs.length === 2 && component) {
      const field = group === "honor" && /获奖|award/.test(label) ? "date"
        : /结束|毕业|离职|end|graduat/.test(label) ? "endDate"
        : /开始|入学|入职|start/.test(label) ? "startDate" : "";
      return field ? { key: `${group}.${field}`, component, confidence: 98 } : null;
    }
    if (inputs.length !== 4 || !range) return null;
    return {
      key: `${group}.${index < 2 ? "startDate" : "endDate"}`,
      component: index % 2 === 0 ? "year" : "month",
      confidence: 96
    };
  }

  function inferField(element) {
    const autocomplete = autocompleteMatch(element);
    if (autocomplete) return { key: autocomplete, confidence: 100 };
    const structured = structuredPathMatch(element);
    if (structured) return structured;
    const label = normalize(humanFieldLabel(element));
    const text = label && label !== normalize("未命名必填字段") ? label : elementText(element);
    if (!text) return null;
    const groupFromContext = contextGroup(element, text);
    const periodEndpoint = monthPeriodEndpoint(element);
    if (periodEndpoint && REPEATABLE_GROUPS.has(groupFromContext)) {
      return { key: `${groupFromContext}.${periodEndpoint.field}`, confidence: 98 };
    }
    if (isPhoneCountryCodeControl(element, text)) return { key: "personal.phoneCountryCode", confidence: 99 };
    if (isCustomSelectControl(element) && /证件号码|身份证号|identity.*number|id number/.test(text)
      && [...(fieldContainer(element)?.querySelectorAll("input") || [])].some((input) => input !== element && !isCustomSelectControl(input))) {
      return { key: "personal.idType", confidence: 99 };
    }
    const splitMonthField = splitMonthRangeField(element, groupFromContext);
    if (splitMonthField) return splitMonthField;
    if (groupFromContext === "education" || /学校所在|院校所在|school.*(?:country|region|city|province)/.test(text)) {
      const geographicField = /国家|country/.test(text) ? "country" : /省|州|province|state/.test(text) ? "state"
        : /城市|地区|city|region/.test(text) ? "city" : "";
      if (geographicField) return { key: `education.${geographicField}`, confidence: 98 };
    }

    let best = null;
    for (const candidate of FIELD_RULES) {
      const matched = candidate.positives.filter((phrase) => phrase && (text === phrase || text.includes(phrase))).sort((a, b) => b.length - a.length)[0];
      if (!matched || candidate.negatives.some((phrase) => text.includes(phrase))) continue;
      const exact = text === matched;
      const score = (exact ? 94 : 76) + Math.min(12, matched.length / 3);
      if (!best || score > best.confidence) best = { key: candidate.key, confidence: Math.min(99, Math.round(score)) };
    }

    if (best) return { ...best, key: contextualizeKey(best.key, groupFromContext) };

    const directDate = DATE_RULES.map((candidate) => {
      const phrase = candidate.positives.find((positive) => text.includes(positive));
      return phrase && !candidate.negatives.some((negative) => text.includes(negative))
        ? { key: candidate.key, confidence: Math.min(96, 82 + Math.round(phrase.length / 2)) }
        : null;
    }).filter(Boolean).sort((a, b) => b.confidence - a.confidence)[0];
    if (directDate) {
      const [dateGroup, dateField] = directDate.key.split(".");
      const contextualGroup = groupFromContext && REPEATABLE_GROUPS.has(groupFromContext) ? groupFromContext : dateGroup;
      return { ...directDate, key: `${contextualGroup}.${dateField}` };
    }

    const dateLike = element.type === "date" || element.type === "month" || /date|month|year|时间|日期/.test(text);
    if (!dateLike) return null;
    const group = groupFromContext;
    const boundary = /end|graduat|to date|结束|毕业|离职/.test(text) ? "endDate" : /start|from date|开始|入学|入职/.test(text) ? "startDate" : null;
    return group && boundary ? { key: `${group}.${boundary}`, confidence: 72 } : null;
  }

  function profileValue(profile, key, occurrence = 0) {
    const [group, field] = key.split(".");
    if (REPEATABLE_GROUPS.has(group)) return profileRecordsForGroup(profile, group)?.[occurrence]?.[field] ?? "";
    if (group === "personal" && field === "phoneCountryCode") return profile?.personal?.phoneCountryCode || "+86";
    return profile?.[group]?.[field] ?? "";
  }

  function phoneFieldHasSeparateCountryCode(element) {
    const container = fieldContainer(element);
    return Boolean(container && (
      [...container.querySelectorAll("input")].some((candidate) => candidate !== element && isPhoneCountryCodeControl(candidate))
      || /国家区号|手机区号|国际区号|中国大陆|\+\s*86/.test(container.innerText || "")
    ));
  }

  function profileValueForMatch(profile, match) {
    let value = profileValue(profile, match.key, match.occurrence);
    if (match.key === "education.studyMode" && /是否(?:为)?全日制|is full time/.test(normalize(humanFieldLabel(match.element)))) {
      const mode = normalize(value);
      const families = CHOICE_ALIAS_FAMILIES["education.studyMode"];
      if (families[0].some((alias) => normalize(alias) === mode)) value = "是";
      else if (families[1].some((alias) => normalize(alias) === mode)) value = "否";
    }
    if (match.component && String(value).trim()) {
      const parts = String(value).normalize("NFKC").match(/^(\d{4})\s*(?:[-/.年]\s*(\d{1,2}))?/);
      value = match.component === "year" ? parts?.[1] || "" : parts?.[2] ? String(Number(parts[2])) : "";
    }
    if (match.key === "personal.phone" && (
      phoneFieldHasSeparateCountryCode(match.element)
      || /11\s*位|手机号/.test(`${match.element.getAttribute?.("placeholder") || ""} ${elementText(match.element)}`)
    )) {
      const digits = String(value || "").replace(/\D/g, "");
      value = digits.replace(/^86(?=1[3-9]\d{9}$)/, "");
    }
    if (match.key === "project.responsibilities" && !String(value || "").trim()) {
      value = profileValue(profile, "project.description", match.occurrence);
    }
    if (match.key === "honor.name" && !String(value || "").trim()) {
      value = profileValue(profile, "honor.description", match.occurrence);
    }
    if (["skill.proficiency", "skill.speaking", "skill.readingWriting"].includes(match.key) && !String(value || "").trim()) {
      value = profileValue(profile, "skill.score", match.occurrence);
    }
    return value;
  }

  function repeatableEntryOccurrence(element, groupId) {
    const explicitPath = [element, monthPeriodEndpoint(element)?.root].filter(Boolean).map((node) =>
      ["id", "name", "data-path", "data-field", "data-testid", "data-cy"].map((attribute) => node.getAttribute(attribute) || "").join(" ")
    ).join(" ");
    const escapedGroup = groupId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const explicitIndex = explicitPath.match(new RegExp(`${escapedGroup}\\[(\\d+)\\]`, "i"));
    if (explicitIndex) return Number(explicitIndex[1]);

    const entry = element.closest?.(REPEATABLE_ENTRY_SELECTOR);
    if (!entry?.parentElement) return null;
    const boundary = moduleBoundaryForElement(element, groupId);
    const scope = boundary || entry.parentElement;
    const entries = [
      ...(scope.matches?.(REPEATABLE_ENTRY_SELECTOR) ? [scope] : []),
      ...scope.querySelectorAll(REPEATABLE_ENTRY_SELECTOR)
    ].filter((candidate, index, list) =>
      list.indexOf(candidate) === index
      && candidate.querySelector("input, textarea, select, [role='combobox'], .phoenix-radio")
      && contextGroup(candidate, "") === groupId
    );
    const index = entries.indexOf(entry);
    return index >= 0 ? index : null;
  }

  function orderMatchesForFill(matches) {
    return matches.map((match, index) => ({ match, index }))
      .sort((a, b) => (FILL_PRIORITY[a.match.key] || 100) - (FILL_PRIORITY[b.match.key] || 100) || a.index - b.index)
      .map(({ match }) => match);
  }

  function displayLabel(key) {
    const [groupId, fieldId] = key.split(".");
    const group = ResumeHelperSchema.FIELD_GROUPS.find((item) => item.id === groupId);
    return group?.fields.find((field) => field[0] === fieldId)?.[1] || key;
  }

  function choiceTokens(value) {
    const token = normalize(value);
    const aliases = {
      yes: ["yes", "true", "1", "是", "有"],
      no: ["no", "false", "0", "否", "无"],
      male: ["male", "man", "m", "男"],
      female: ["female", "woman", "f", "女"]
    };
    const family = Object.values(aliases).find((items) => items.includes(token));
    return new Set(family || [token]);
  }

  function isRadioControl(element) {
    return (element instanceof HTMLInputElement && element.type === "radio")
      || element.getAttribute?.("role") === "radio"
      || element.classList?.contains("phoenix-radio");
  }

  function radioOptionText(element) {
    const wrapping = element.closest("label, .ant-radio-wrapper, .phoenix-radio, [role='radio']");
    return [element.value, element.getAttribute("aria-label"), wrapping?.innerText, element.nextElementSibling?.textContent].filter(Boolean).join(" ");
  }

  function radioOptionLabel(element) {
    const wrapping = element.closest("label, .ant-radio-wrapper, .phoenix-radio, [role='radio']");
    return cleanControlText(wrapping?.innerText || element.getAttribute("aria-label") || element.value || element.textContent);
  }

  function choiceMatches(element, value) {
    if (!String(value || "").trim()) return false;
    const desired = choiceTokens(value);
    const option = choiceTokens(radioOptionText(element));
    return [...desired].some((token) => option.has(token) || normalize(radioOptionText(element)).includes(token));
  }

  function radioContainer(element) {
    return element.closest("[role='radiogroup'], .ant-radio-group, .phoenix-radio-group, .ant-form-item, .form-item, [class*='formItem'], [class*='FormItem'], fieldset") || element.parentElement;
  }

  function currentControlValue(element) {
    if (monthPeriodEndpoint(element)) {
      const year = cleanControlText(element.querySelector("[class*='label-year']")?.textContent);
      const month = cleanControlText(element.querySelector("[class*='label-month']")?.textContent);
      return periodMonthValue(`${year}-${month}`);
    }
    if (isRadioControl(element)) {
      const selected = radioContainer(element)?.querySelector("input[type='radio']:checked, [role='radio'][aria-checked='true'], .phoenix-radio--checked");
      return selected ? cleanControlText(radioOptionText(selected)) : "";
    }
    if (element instanceof HTMLInputElement && element.type === "file") {
      const uploader = element.closest("[class*='uploader'], [class*='upload']") || fieldContainer(element);
      const listText = cleanControlText(uploader?.querySelector?.("[class*='list-view'], [class*='file-list'], [class*='upload-list']")?.textContent || "");
      return String(element.value || "") || listText;
    }
    if (element instanceof HTMLInputElement && element.type === "checkbox") return element.checked ? (element.value || "已勾选") : "";
    if (element instanceof HTMLSelectElement) {
      const text = cleanControlText(element.selectedOptions[0]?.textContent || "");
      return element.value && !/^(?:请选择|please select|select\b)/i.test(text) ? text : "";
    }
    if (isCustomSelectControl(element)) {
      const selectRoot = element.closest?.(CUSTOM_SELECT_ROOT_SELECTOR) || element;
      const displayNode = selectRoot.querySelector?.(".ant-select-selection-item, [class*='display-value'], [class*='phoenix-select__selected'], [class*='phoenix-select__value']");
      if (displayNode) {
        const displayed = cleanControlText(displayNode.textContent || "");
        return displayed && !/^(?:请选择|please select|select\b)/i.test(displayed) ? displayed : "";
      }
      const rootText = cleanControlText(selectRoot.innerText || "");
      if (rootText && !/^(?:请选择|please select|select\b)/i.test(rootText)) return rootText;
    }
    if (element.isContentEditable) return cleanControlText(element.textContent);
    if ("value" in element) return String(element.value || "");
    const text = cleanControlText(element.textContent);
    return /^(?:请选择|please select|select\b)/i.test(text) ? "" : text;
  }

  function cleanControlText(value) {
    return String(value || "").replace(/图标\s*[：:]?\s*down/gi, "").replace(/\s+/g, " ").trim();
  }

  const CONTROL_TYPE_LABELS = {
    "text-input": "文本输入",
    "multiline-text": "多行文本",
    "native-select": "原生下拉",
    "custom-select": "自定义下拉",
    cascader: "省市级联",
    "radio-group": "单选项",
    "native-date": "日期输入",
    "date-picker": "日期选择器",
    "confirmation-checkbox": "确认勾选",
    "file-upload": "文件上传",
    "sensitive-input": "敏感输入"
  };

  function isCustomSelectControl(element) {
    return element.getAttribute?.("role") === "combobox"
      || Boolean(element.closest?.(CUSTOM_SELECT_ROOT_SELECTOR));
  }

  function isPhoenixDatePickerControl(element) {
    return Boolean(element.closest?.(".phoenix-select"))
      && /date|month|year|开始时间|结束时间|获奖时间|日期|年月/.test(elementText(element));
  }

  function controlType(element) {
    if (element instanceof HTMLInputElement && element.type === "file") return "file-upload";
    if (element instanceof HTMLInputElement && element.type === "password") return "sensitive-input";
    if (isRadioControl(element)) return "radio-group";
    if (element instanceof HTMLInputElement && element.type === "checkbox") return "confirmation-checkbox";
    if (monthPeriodEndpoint(element) || isCalendarPickerControl(element) || isPhoenixDatePickerControl(element)) return "date-picker";
    if (isCascaderControl(element)) return "cascader";
    if (element instanceof HTMLSelectElement) return "native-select";
    if (isCustomSelectControl(element)) return "custom-select";
    if (element instanceof HTMLInputElement && ["date", "month"].includes(element.type)) return "native-date";
    if (element instanceof HTMLTextAreaElement || element.isContentEditable) return "multiline-text";
    return "text-input";
  }

  function scan(profile) {
    const counters = new Map();
    const radioContainers = new Map();
    const found = [];
    document.querySelectorAll(CONTROL_SELECTOR).forEach((element) => {
      if (!isFillable(element)) return;
      const match = inferField(element);
      if (!match) return;
      const repeatable = REPEATABLE_GROUPS.has(match.key.split(".")[0]);
      let occurrence;
      if (isRadioControl(element)) {
        const container = radioContainer(element);
        const groups = radioContainers.get(match.key) || [];
        let groupIndex = groups.indexOf(container);
        if (groupIndex < 0) {
          groups.push(container);
          radioContainers.set(match.key, groups);
          groupIndex = groups.length - 1;
        }
        occurrence = repeatable ? groupIndex : 0;
        const options = [...container.querySelectorAll("input[type='radio'], [role='radio'], .phoenix-radio")].filter(isFillable);
        const desired = profileValue(profile, match.key, occurrence);
        const preferred = options.find((option) => choiceMatches(option, desired)) || options[0];
        if (element !== preferred) return;
      } else {
        const entryOccurrence = repeatable ? repeatableEntryOccurrence(element, match.key.split(".")[0]) : null;
        occurrence = repeatable ? entryOccurrence ?? counters.get(match.key) ?? 0 : 0;
        if (entryOccurrence === null) counters.set(match.key, occurrence + 1);
      }
      const plannedMatch = { ...match, element, occurrence };
      const value = profileValueForMatch(profile, plannedMatch);
      const detectedControlType = controlType(element);
      const repairExisting = shouldRepairPartialEntry(plannedMatch, profile);
      found.push({
        element,
        key: match.key,
        label: displayLabel(match.key),
        confidence: match.confidence,
        occurrence,
        component: match.component || "",
        controlType: detectedControlType,
        controlLabel: CONTROL_TYPE_LABELS[detectedControlType] || detectedControlType,
        required: isRequiredControl(element),
        repairExisting,
        hasProfileValue: String(value).trim().length > 0,
        hasPageValue: currentControlValue(element).trim().length > 0
      });
    });
    return found;
  }

  function buildFillPlan(profile) {
    return orderMatchesForFill(scan(profile)).map((match) => ({
      ...match,
      adapter: match.controlType || controlType(match.element)
    }));
  }

  function delay(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  function visibleElement(element) {
    if (!(element instanceof HTMLElement)) return false;
    if (!element.isConnected) return false;
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && box.width > 0 && box.height > 0;
  }

  function choiceCandidateValues(value, key) {
    const candidates = new Set([String(value || "").trim()]);
    const token = normalize(value);
    const families = CHOICE_ALIAS_FAMILIES[key] || (key.endsWith(".country") ? CHOICE_ALIAS_FAMILIES["personal.country"] : []);
    const family = families.find((items) => items.some((item) => normalize(item) === token));
    family?.forEach((item) => candidates.add(item));
    if (!/date$/i.test(key)) choiceTokens(value).forEach((item) => candidates.add(item));
    if (key === "personal.ethnicity" && token) {
      candidates.add(token.endsWith("族") ? token.slice(0, -1) : `${token}族`);
    }
    return [...candidates].filter(Boolean);
  }

  function compactAdministrativeChoice(value, key) {
    let token = normalize(value).replace(/\s+/g, "");
    if (key === "personal.ethnicity") return token.replace(/族$/, "");
    if (!LOCATION_KEYS.has(key)) return token;
    return token.replace(/(?:特别行政区|壮族自治区|回族自治区|维吾尔自治区|自治区|自治州|省|市|地区|盟)/g, "");
  }

  function choiceScore(candidate, desired, key, allowContained = false) {
    const option = normalize(cleanControlText(candidate));
    if (!option) return 0;
    const target = normalize(desired);
    if (/date$/i.test(key)) {
      const numericOption = option.match(/^(\d{1,4})\s*[年月]?$/);
      const numericTarget = target.match(/^(\d{1,4})\s*[年月]?$/);
      if (numericOption && numericTarget) return Number(numericOption[1]) === Number(numericTarget[1]) ? 100 : 0;
    }
    if (key === "education.studyMode" && /全日制/.test(option) && /全日制/.test(target)
      && /非全日制/.test(option) !== /非全日制/.test(target)) return 0;
    let best = 0;
    choiceCandidateValues(desired, key).forEach((value) => {
      const needle = normalize(value);
      if (!needle) return;
      if (option === needle) {
        best = Math.max(best, 100);
        return;
      }
      const compactOption = compactAdministrativeChoice(option, key);
      const compactNeedle = compactAdministrativeChoice(needle, key);
      if (compactOption && compactOption === compactNeedle) {
        best = Math.max(best, 94);
        return;
      }
      const minimumLength = allowContained || LOCATION_KEYS.has(key) ? 2 : 3;
      if (Math.min(compactOption.length, compactNeedle.length) >= minimumLength && (compactOption.includes(compactNeedle) || compactNeedle.includes(compactOption))) {
        best = Math.max(best, allowContained || LOCATION_KEYS.has(key) ? 82 : 72);
      }
    });
    return best;
  }

  function choiceTextMatches(candidate, desired, key = "") {
    return choiceScore(candidate, desired, key) >= 72;
  }

  function bestPopupOption(options, value, key, allowContained = false) {
    const ranked = options.map((option) => ({ option, score: choiceScore(option.textContent, value, key, allowContained) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);
    if (!ranked.length || ranked[0].score < 72) return null;
    if (ranked[1] && ranked[1].score === ranked[0].score && normalize(ranked[1].option.textContent) !== normalize(ranked[0].option.textContent)) return null;
    return ranked[0];
  }

  const POPUP_OPTION_SELECTORS = [
    "[role='option']",
    ".ant-select-dropdown-menu-item",
    ".ant-select-item-option",
    ".phoenix-selectList__listItem",
    "[class*='sd-Select-common-item']",
    "[class*='sd-Select-menu'] [class*='sd-Menu-container']",
    "[role='menuitem']",
    "li[class*='select']"
  ].join(",");

  function popupScope(element) {
    const localRoot = element.closest?.("[class*='sd-Dropdown-container']");
    if (localRoot) return localRoot.querySelector("[class*='sd-Dropdown-dropdown']") || localRoot;
    const controlledId = element.getAttribute("aria-controls");
    if (!controlledId) return document;
    const controlled = document.getElementById(controlledId);
    return controlled?.closest("[role='listbox'], .ant-select-dropdown, .ant-select-dropdown-menu") || controlled || document;
  }

  function visiblePopupOptions(element, selectors = POPUP_OPTION_SELECTORS) {
    const scope = popupScope(element);
    const options = [...scope.querySelectorAll(selectors)];
    return options.filter((option) => visibleElement(option) && option.getAttribute("aria-disabled") !== "true" && !/disabled/i.test(String(option.className)));
  }

  function clickControlTarget(element) {
    element.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    for (const type of ["pointerdown", "mousedown", "pointerup", "mouseup"]) {
      const EventType = type.startsWith("pointer") && typeof PointerEvent !== "undefined" ? PointerEvent : MouseEvent;
      element.dispatchEvent(new EventType(type, {
        bubbles: true, cancelable: true, view: window, button: 0,
        buttons: type.endsWith("down") ? 1 : 0, pointerId: 1, pointerType: "mouse", isPrimary: true
      }));
    }
    element.click();
  }

  function popupOptionTarget(option) {
    // Option wrappers can have no handler. Dispatch on the visible label inside
    // them so the event bubbles through the actual interactive child as well.
    const label = cleanControlText(option.textContent);
    return [...option.querySelectorAll("*")].reverse().find((node) =>
      visibleElement(node) && cleanControlText(node.textContent) === label && !node.matches("svg, path, input, button")
    ) || option;
  }

  async function waitForPopupOptions(element, selectors = POPUP_OPTION_SELECTORS) {
    for (let attempt = 0; attempt < 18; attempt += 1) {
      const options = visiblePopupOptions(element, selectors);
      if (options.length) return options;
      await delay(40);
    }
    return visiblePopupOptions(element, selectors);
  }

  function closePopup(element) {
    const areaRoot = visiblePhoenixAreaSelector();
    const cancel = [...(areaRoot?.querySelectorAll(".button-container, button, [role='button']") || [])]
      .find((button) => cleanControlText(button.textContent) === "取消" && visibleElement(button));
    if (cancel) {
      cancel.click();
      return;
    }
    const target = document.activeElement instanceof HTMLElement ? document.activeElement : element;
    target.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true }));
    target.dispatchEvent(new KeyboardEvent("keyup", { key: "Escape", code: "Escape", bubbles: true }));
    target.blur?.();
    clickControlTarget(document.body);
  }

  function setSearchValue(input, value) {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setter ? setter.call(input, value) : (input.value = value);
    input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function popupSearchInput(element) {
    if (element instanceof HTMLInputElement && !/cascader/i.test(element.className)) return element;
    return element.querySelector?.("input:not([type='hidden'])")
      || element.closest(CUSTOM_SELECT_ROOT_SELECTOR)?.querySelector("input:not([type='hidden'])")
      || null;
  }

  function controlHasValidationError(element) {
    if (element.getAttribute("aria-invalid") === "true") return true;
    const field = fieldContainer(element);
    const container = field && field.querySelectorAll("input, textarea, select, [role='combobox']").length <= 1
      ? field : element.closest(CUSTOM_SELECT_ROOT_SELECTOR) || element.parentElement;
    return /(?:^|\s)(?:error|invalid)(?:\s|$)/i.test(`${element.className} ${element.parentElement?.className || ""}`)
      || /必填项未填写|请选择有效|不能为空/.test(container?.innerText || "");
  }

  function controlResolver(element) {
    const label = humanFieldLabel(element);
    const group = contextGroup(element, label);
    const candidates = () => [...document.querySelectorAll(CONTROL_SELECTOR)].filter((control) =>
      humanFieldLabel(control) === label && contextGroup(control, label) === group
      && control.tagName === element.tagName && control.getAttribute("role") === element.getAttribute("role")
    );
    const index = candidates().indexOf(element);
    return () => element.isConnected ? element : candidates()[index] || null;
  }

  async function controlReflectsChoice(element, value, key, minimumScore = 72, requireValid = false, resolve = () => element) {
    await delay(35);
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const current = resolve();
      if (current && choiceScore(currentControlValue(current), value, key, true) >= minimumScore && (!requireValid || !controlHasValidationError(current))) return true;
      await delay(35);
    }
    return false;
  }

  function isCascaderControl(element) {
    return /cascader/i.test(String(element.className)) || Boolean(element.closest(".ant-cascader-picker, [class*='cascader']"));
  }

  function cascaderSegments(value) {
    const parts = String(value || "").split(/\s*(?:\/|>|→|,|，|;|；|\|)\s*/).map((item) => item.trim()).filter(Boolean);
    return parts.length > 1 ? parts : [];
  }

  function visibleCascaderMenus() {
    return [...document.querySelectorAll(".ant-cascader-menu, [role='menu'][class*='cascader']")].filter(visibleElement);
  }

  async function waitForCascaderMenus() {
    for (let attempt = 0; attempt < 18; attempt += 1) {
      const menus = visibleCascaderMenus();
      if (menus.length) return menus;
      await delay(40);
    }
    return visibleCascaderMenus();
  }

  async function setCascaderChoice(element, value, key) {
    if (choiceScore(currentControlValue(element), value, key, true) >= 82) return true;
    element.click();
    let menus = await waitForCascaderMenus();
    const segments = cascaderSegments(value);
    for (let level = 0; level < 5 && menus.length; level += 1) {
      const menu = menus[Math.min(level, menus.length - 1)];
      const options = [...menu.querySelectorAll(".ant-cascader-menu-item, [class*='cascader-menu-item']")]
        .filter((option) => visibleElement(option) && option.getAttribute("aria-disabled") !== "true" && !/disabled/i.test(String(option.className)));
      const desiredPart = segments[level] || value;
      const match = bestPopupOption(options, desiredPart, key, true);
      if (!match) {
        closePopup(element);
        return false;
      }
      const previousMenuCount = menus.length;
      match.option.click();
      await delay(90);
      menus = visibleCascaderMenus();
      if (!menus.length) return controlReflectsChoice(element, value, key, 72);
      if (menus.length <= previousMenuCount && !/expand|submenu/i.test(`${match.option.className} ${match.option.getAttribute("aria-haspopup") || ""}`)) {
        return controlReflectsChoice(element, value, key, 72);
      }
    }
    closePopup(element);
    return false;
  }

  function visiblePhoenixAreaSelector() {
    return [...document.querySelectorAll(".area-selector-container")].find(visibleElement) || null;
  }

  async function waitForPhoenixAreaSelector() {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const root = visiblePhoenixAreaSelector();
      if (root) return root;
      await delay(35);
    }
    return visiblePhoenixAreaSelector();
  }

  function administrativeSegments(value) {
    const explicit = cascaderSegments(value);
    if (explicit.length) return explicit;
    const matches = String(value || "").match(/.+?(?:特别行政区|维吾尔自治区|壮族自治区|回族自治区|自治区|自治州|地区|省|市|区|县|盟)/g);
    return matches?.map((item) => item.trim()).filter(Boolean) || [String(value || "").trim()].filter(Boolean);
  }

  async function setPhoenixAreaChoice(element, value, key, initialRoot = null) {
    let root = initialRoot || await waitForPhoenixAreaSelector();
    if (!root) return false;
    const segments = administrativeSegments(value);
    for (let level = 0; level < Math.max(segments.length, 1) + 2; level += 1) {
      root = visiblePhoenixAreaSelector() || root;
      const selectedText = cleanControlText(root.querySelector(".select-data-container")?.textContent || "");
      if (choiceScore(selectedText, value, key, true) >= 82) break;
      const options = [...root.querySelectorAll(".area-item-container")]
        .filter((option) => visibleElement(option) && !/disabled/i.test(String(option.className)));
      const desiredPart = segments[Math.min(level, segments.length - 1)] || value;
      const match = bestPopupOption(options, desiredPart, key, true);
      if (!match) {
        closePopup(element);
        return false;
      }
      match.option.click();
      await delay(90);
    }
    root = visiblePhoenixAreaSelector() || root;
    const selectedText = cleanControlText(root.querySelector(".select-data-container")?.textContent || "");
    if (choiceScore(selectedText, value, key, true) < 72) {
      closePopup(element);
      return false;
    }
    const confirm = [...root.querySelectorAll(".button-container, button, [role='button']")]
      .find((button) => cleanControlText(button.textContent) === "确定" && visibleElement(button));
    if (!confirm) {
      closePopup(element);
      return false;
    }
    confirm.click();
    return controlReflectsChoice(element, value, key, 72, true);
  }

  async function setPopupChoice(element, value, key) {
    if (isCascaderControl(element)) return setCascaderChoice(element, value, key);
    if (choiceScore(currentControlValue(element), value, key) >= 94 && !controlHasValidationError(element)) return true;
    const resolve = controlResolver(element);
    closePopup(element);
    clickControlTarget(element);
    element = resolve() || element;
    const areaSelector = await waitForPhoenixAreaSelector();
    if (areaSelector) return setPhoenixAreaChoice(element, value, key, areaSelector);
    let options = await waitForPopupOptions(element);
    let match = bestPopupOption(options, value, key);
    const searchInput = popupSearchInput(element);
    const previousQuery = searchInput?.value || "";
    if (!match) {
      if (searchInput) {
        for (const query of choiceCandidateValues(value, key).slice(0, 8)) {
          setSearchValue(popupSearchInput(resolve() || element) || searchInput, query);
          await delay(120);
          element = resolve() || element;
          options = await waitForPopupOptions(element);
          match = bestPopupOption(options, value, key);
          if (match) break;
        }
      }
    }
    if (!match) {
      if (searchInput) setSearchValue(popupSearchInput(resolve() || element) || searchInput, previousQuery);
      closePopup(element);
      return false;
    }
    const selectedText = cleanControlText(match.option.textContent);
    clickControlTarget(popupOptionTarget(match.option));
    const committed = await controlReflectsChoice(element, selectedText, key, 94, true, resolve);
    if (!committed) closePopup(resolve() || element);
    return committed;
  }

  function normalizedDateValue(value, key, element) {
    let result = String(value || "").trim();
    if (/^(?:年|月|year|month)$/i.test(element.getAttribute("placeholder") || "")) return result;
    if (element instanceof HTMLInputElement && element.type === "month") return /^\d{4}-\d{2}-\d{2}$/.test(result) ? result.slice(0, 7) : result;
    const field = key.split(".")[1] || "";
    const dateLike = /date|startdate|enddate/i.test(field) || /日期|时间|date/i.test(element.getAttribute("placeholder") || "") || (element instanceof HTMLInputElement && element.type === "date");
    if (!dateLike) return result;
    if (/^\d{4}$/.test(result)) result += "-01-01";
    if (/^\d{4}-\d{2}$/.test(result)) {
      const [year, month] = result.split("-").map(Number);
      const day = /enddate/i.test(field) ? new Date(year, month, 0).getDate() : 1;
      result += `-${String(day).padStart(2, "0")}`;
    }
    return result;
  }

  function isCalendarPickerControl(element) {
    return element instanceof HTMLInputElement && (
      /calendar-picker|date-picker/i.test(String(element.className))
      || Boolean(element.closest(".ant-calendar-picker, [class*='datePicker'], [class*='date-picker']"))
    );
  }

  function visibleCalendarContainer() {
    return [...document.querySelectorAll(".ant-calendar-picker-container")].find(visibleElement) || null;
  }

  async function waitForCalendarElement(selector) {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const root = visibleCalendarContainer();
      const target = root?.querySelector(selector);
      if (target && visibleElement(target)) return target;
      await delay(40);
    }
    const root = visibleCalendarContainer();
    return root?.querySelector(selector) || null;
  }

  function comparableDate(value) {
    const match = String(value || "").match(/((?:19|20)\d{2})\D+(\d{1,2})\D+(\d{1,2})/);
    return match ? `${match[1]}-${String(Number(match[2])).padStart(2, "0")}-${String(Number(match[3])).padStart(2, "0")}` : "";
  }

  function comparableMonth(value) {
    const match = String(value || "").match(/((?:19|20)\d{2})\D*(\d{1,2})/);
    return match ? `${match[1]}-${String(Number(match[2])).padStart(2, "0")}` : "";
  }

  function periodMonthValue(value) {
    const parts = String(value || "").normalize("NFKC").trim().match(/^(\d{4})\s*[-/.年]\s*(\d{1,2})(?:\s*月)?(?:\s*[-/.]\s*\d{1,2}(?:日)?)?$/);
    return parts && Number(parts[2]) >= 1 && Number(parts[2]) <= 12
      ? `${parts[1]}-${parts[2].padStart(2, "0")}` : "";
  }

  async function setMonthPeriodChoice(element, value) {
    const desired = periodMonthValue(value);
    if (!desired) return false;
    const resolve = controlResolver(element);
    if (currentControlValue(element) === desired) return true;
    const panels = () => [...document.querySelectorAll("[class*='date-picker-dropdown'] > [class*='date-picker-period-month-panel']")].filter(visibleElement);
    const previousPanels = new Set(panels());
    const panelKey = element.getAttribute("data-cy");
    const panelId = element.getAttribute("aria-controls");
    const activePanel = () => {
      const visible = panels();
      if (panelKey || panelId) return visible.find((panel) =>
        (panelKey && panel.getAttribute("data-cy") === `${panelKey}Dropdown`)
        || (panelId && panel.id === panelId)
      ) || null;
      const opened = visible.filter((panel) => !previousPanels.has(panel));
      return opened.length === 1 ? opened[0] : null;
    };
    const waitForPanel = async () => {
      for (let attempt = 0; attempt < 16; attempt += 1) {
        const panel = activePanel();
        if (panel) return panel;
        await delay(35);
      }
      return null;
    };
    const chooseNumber = (panel, number) => {
      const option = [...panel.querySelectorAll("[class*='date-picker-period-month-panel-list-item']")].find((item) => {
        const text = cleanControlText(item.textContent);
        return /^\d{1,4}\s*[年月]?$/.test(text) && Number(text.replace(/[年月\s]/g, "")) === number
          && !item.disabled && item.getAttribute("aria-disabled") !== "true" && !/disabled/i.test(String(item.className))
          && visibleElement(item);
      });
      if (!option) return false;
      option.scrollIntoView?.({ block: "nearest" });
      clickControlTarget(option);
      return true;
    };
    const target = resolve();
    if (!target) return false;
    clickControlTarget(target);
    let panel = await waitForPanel();
    const [year, month] = desired.split("-").map(Number);
    if (!panel || !chooseNumber(panel, year)) {
      closePopup(resolve());
      return false;
    }
    await delay(50);
    // Selecting a year may replace the endpoint and its portaled panel.
    if (!activePanel()) {
      const current = resolve();
      if (!current) return false;
      clickControlTarget(current);
    }
    panel = await waitForPanel();
    if (!panel || !chooseNumber(panel, month)) {
      closePopup(resolve());
      return false;
    }
    await delay(50);
    for (let attempt = 0; attempt < 14; attempt += 1) {
      const current = resolve();
      if (current && currentControlValue(current) === desired) {
        closePopup(current);
        await delay(50);
        const settled = resolve();
        return Boolean(settled && currentControlValue(settled) === desired);
      }
      await delay(40);
    }
    closePopup(resolve());
    return false;
  }

  async function dateControlReflectsChoice(element, desired) {
    for (let attempt = 0; attempt < 14; attempt += 1) {
      if (comparableDate(element.value) === desired) return true;
      await delay(40);
    }
    return comparableDate(element.value) === desired;
  }

  function visiblePhoenixDatePicker() {
    return [...document.querySelectorAll(".phoenix-date-picker")].find(visibleElement) || null;
  }

  async function waitForPhoenixDateElement(selector) {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const root = visiblePhoenixDatePicker();
      const target = root?.querySelector(selector);
      if (target && visibleElement(target)) return target;
      await delay(40);
    }
    return visiblePhoenixDatePicker()?.querySelector(selector) || null;
  }

  async function phoenixMonthReflectsChoice(element, desiredMonth) {
    for (let attempt = 0; attempt < 14; attempt += 1) {
      if (comparableMonth(currentControlValue(element)) === desiredMonth) return true;
      await delay(40);
    }
    return comparableMonth(currentControlValue(element)) === desiredMonth;
  }

  async function selectPhoenixCalendarYear(year) {
    const selector = await waitForPhoenixDateElement(".phoenix-calendar-year-select");
    if (!selector) return false;
    selector.click();
    for (let attempt = 0; attempt < 24; attempt += 1) {
      await delay(45);
      const root = visiblePhoenixDatePicker();
      const cells = [...(root?.querySelectorAll(".phoenix-calendar-year-panel-cell") || [])]
        .filter((cell) => visibleElement(cell) && !/disabled/i.test(String(cell.className)));
      const match = cells.find((cell) => Number(cleanControlText(cell.textContent)) === year);
      if (match) {
        (match.querySelector(".phoenix-calendar-year-panel-year") || match).click();
        return true;
      }
      const rangeText = cleanControlText(root?.querySelector("[class*='decade-select']")?.textContent || root?.textContent || "");
      const bounds = rangeText.match(/((?:19|20)\d{2})\D+((?:19|20)\d{2})/);
      const direction = bounds && year < Number(bounds[1]) ? "prev" : "next";
      const button = root?.querySelector(`[class*='${direction}-decade'], [class*='${direction}-year']`);
      if (!button) return false;
      button.click();
    }
    return false;
  }

  async function setPhoenixCalendarChoice(element, value, key) {
    const desired = normalizedDateValue(value, key, element);
    const parts = desired.match(/^((?:19|20)\d{2})-(\d{2})(?:-(\d{2}))?$/);
    if (!parts) return false;
    const desiredMonth = `${parts[1]}-${parts[2]}`;
    if (comparableMonth(currentControlValue(element)) === desiredMonth) return true;
    element.click();
    if (!await waitForPhoenixDateElement(".phoenix-calendar-year-select")) return false;
    if (!await selectPhoenixCalendarYear(Number(parts[1]))) {
      closePopup(element);
      return false;
    }
    const firstMonth = await waitForPhoenixDateElement(".phoenix-calendar-month-panel-cell, [role='gridcell']");
    if (!firstMonth) {
      closePopup(element);
      return false;
    }
    const root = visiblePhoenixDatePicker();
    const monthText = `${Number(parts[2])}月`;
    const monthCell = [...(root?.querySelectorAll(".phoenix-calendar-month-panel-cell, [role='gridcell']") || [])]
      .find((cell) => cleanControlText(cell.textContent) === monthText && !/disabled/i.test(String(cell.className)));
    if (!monthCell) {
      closePopup(element);
      return false;
    }
    (monthCell.querySelector(".phoenix-calendar-month-panel-month") || monthCell).click();
    return phoenixMonthReflectsChoice(element, desiredMonth);
  }

  async function selectCalendarYear(year) {
    const yearSelect = await waitForCalendarElement(".ant-calendar-year-select");
    if (!yearSelect) return false;
    yearSelect.click();
    for (let attempt = 0; attempt < 24; attempt += 1) {
      await delay(45);
      const root = visibleCalendarContainer();
      const panel = root?.querySelector(".ant-calendar-year-panel");
      if (!panel || !visibleElement(panel)) continue;
      const cell = [...panel.querySelectorAll(".ant-calendar-year-panel-cell")].find((item) => item.getAttribute("title") === String(year) && !/disabled/i.test(String(item.className)));
      if (cell) {
        (cell.querySelector(".ant-calendar-year-panel-year") || cell).click();
        return true;
      }
      const decadeText = panel.querySelector(".ant-calendar-year-panel-decade-select")?.textContent || "";
      const bounds = decadeText.match(/((?:19|20)\d{2})\D+((?:19|20)\d{2})/);
      const direction = bounds && year < Number(bounds[1]) ? "prev" : "next";
      const button = panel.querySelector(`.ant-calendar-year-panel-${direction}-decade-btn`);
      if (!button) return false;
      button.click();
    }
    return false;
  }

  async function selectCalendarMonth(month) {
    const monthSelect = await waitForCalendarElement(".ant-calendar-month-select");
    if (!monthSelect) return false;
    monthSelect.click();
    const firstCell = await waitForCalendarElement(".ant-calendar-month-panel-cell");
    if (!firstCell) return false;
    const root = visibleCalendarContainer();
    const cells = [...root.querySelectorAll(".ant-calendar-month-panel-cell")].filter((item) => !/disabled/i.test(String(item.className)));
    const cell = cells[month - 1];
    if (!cell) return false;
    (cell.querySelector(".ant-calendar-month-panel-month") || cell).click();
    return true;
  }

  async function setCalendarChoice(element, value, key) {
    if (monthPeriodEndpoint(element)) return setMonthPeriodChoice(element, value);
    if (isPhoenixDatePickerControl(element)) return setPhoenixCalendarChoice(element, value, key);
    const desired = normalizedDateValue(value, key, element);
    if (comparableDate(element.value) === desired) return true;
    const parts = desired.match(/^((?:19|20)\d{2})-(\d{2})-(\d{2})$/);
    if (!parts) return false;
    const year = Number(parts[1]);
    const month = Number(parts[2]);
    const day = Number(parts[3]);
    element.click();
    if (!await waitForCalendarElement(".ant-calendar-year-select")) return false;
    if (!await selectCalendarYear(year) || !await selectCalendarMonth(month)) {
      closePopup(element);
      return false;
    }
    await delay(60);
    const root = visibleCalendarContainer();
    const title = `${year}年${month}月${day}日`;
    const dayCell = [...(root?.querySelectorAll(".ant-calendar-cell") || [])].find((item) => item.getAttribute("title") === title && !/disabled/i.test(String(item.className)));
    if (!dayCell) {
      closePopup(element);
      return false;
    }
    (dayCell.querySelector(".ant-calendar-date") || dayCell).click();
    return dateControlReflectsChoice(element, desired);
  }

  async function setRadioChoice(element, value) {
    if (!choiceMatches(element, value)) return false;
    const selected = element instanceof HTMLInputElement
      ? element.checked
      : element.getAttribute("aria-checked") === "true" || element.classList.contains("phoenix-radio--checked");
    if (!selected) element.click();
    await delay(40);
    return element instanceof HTMLInputElement
      ? element.checked
      : element.getAttribute("aria-checked") === "true" || element.classList.contains("phoenix-radio--checked");
  }

  async function setNativeSelectChoice(element, value, key) {
    const candidates = [...element.options].map((option) => ({
      option,
      score: Math.max(choiceScore(option.value, value, key), choiceScore(option.textContent, value, key))
    })).filter((item) => item.score >= 72).sort((a, b) => b.score - a.score);
    if (!candidates.length || (candidates[1] && candidates[1].score === candidates[0].score && candidates[1].option.value !== candidates[0].option.value)) return false;
    element.value = candidates[0].option.value;
    element.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: String(value) }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    element.dispatchEvent(new Event("blur", { bubbles: true }));
    await delay(0);
    return choiceScore(currentControlValue(element), value, key, true) >= 72;
  }

  function textValueMatches(actual, desired) {
    const current = String(actual || "").trim();
    const target = String(desired || "").trim();
    if (current === target || normalize(current) === normalize(target)) return true;
    const currentDigits = current.replace(/\D/g, "");
    const targetDigits = target.replace(/\D/g, "");
    return targetDigits.length >= 7 && currentDigits.endsWith(targetDigits);
  }

  async function textControlReflectsValue(element, desired) {
    await delay(20);
    for (let attempt = 0; attempt < 10; attempt += 1) {
      if (textValueMatches(currentControlValue(element), desired)) return true;
      await delay(20);
    }
    return textValueMatches(currentControlValue(element), desired);
  }

  async function setTextControlValue(element, value, key) {
    const normalizedValue = normalizedDateValue(value, key, element);
    if (element.isContentEditable) {
      element.focus();
      element.textContent = normalizedValue;
      element.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: normalizedValue }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
      element.dispatchEvent(new Event("blur", { bubbles: true }));
      return textControlReflectsValue(element, normalizedValue);
    }
    const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
    setter ? setter.call(element, normalizedValue) : (element.value = normalizedValue);
    element.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: normalizedValue }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    element.dispatchEvent(new Event("blur", { bubbles: true }));
    return textControlReflectsValue(element, normalizedValue);
  }

  async function setNativeValue(element, value, key, adapter = controlType(element)) {
    const stringValue = String(value);
    const adapters = {
      "radio-group": () => setRadioChoice(element, stringValue),
      "date-picker": () => setCalendarChoice(element, stringValue, key),
      cascader: () => setCascaderChoice(element, stringValue, key),
      "native-select": () => setNativeSelectChoice(element, stringValue, key),
      "custom-select": () => setPopupChoice(element, stringValue, key),
      "native-date": () => setTextControlValue(element, stringValue, key),
      "multiline-text": () => setTextControlValue(element, stringValue, key),
      "text-input": () => setTextControlValue(element, stringValue, key)
    };
    return (adapters[adapter] || adapters["text-input"])();
  }

  function recordHasData(record) {
    return record && typeof record === "object" && Object.values(record).some((value) => String(value || "").trim());
  }

  function profileRecordsForGroup(profile, groupId) {
    const records = (profile?.[groupId] || []).filter(recordHasData);
    if (groupId !== "skill") return records;
    const section = sectionForGroup("skill");
    const directHeading = [...section?.children || []].find((child) =>
      child.matches?.("h1, h2, h3, h4, legend, [class*='blockTitle'], [class*='section-title'], [class*='sectionTitle']")
    )?.textContent || "";
    const nearbyHeading = cleanControlText(section?.previousElementSibling?.textContent || "");
    const heading = normalize(directHeading || (nearbyHeading.length <= 80 ? nearbyHeading : ""));
    if (/语言能力|外语能力/.test(heading) && !/证书|技能/.test(heading)) {
      return records.filter((record) => record.type === "外语语种");
    }
    return records;
  }

  function desiredEntryCount(profile, groupId) {
    return profileRecordsForGroup(profile, groupId).length;
  }

  function shouldRepairPartialEntry(match, profile) {
    const [groupId, fieldId] = match.key.split(".");
    if (!REPEATABLE_GROUPS.has(groupId) || fieldId !== "description") return false;
    const entry = match.element.closest?.(REPEATABLE_ENTRY_SELECTOR);
    const record = profile?.[groupId]?.[match.occurrence];
    if (!entry || !record) return false;
    const anchorFields = new Set(["company", "title", "name", "role"]);
    return [...entry.querySelectorAll("input, textarea, select, [role='combobox']")].some((control) => {
      if (control === match.element) return false;
      const inferred = inferField(control);
      if (!inferred || !inferred.key.startsWith(`${groupId}.`)) return false;
      const anchorField = inferred.key.split(".")[1];
      return anchorFields.has(anchorField) && String(record[anchorField] || "").trim() && !currentControlValue(control).trim();
    });
  }

  function sectionForGroup(groupId) {
    const siteSpecific = [...document.querySelectorAll(`[class*='resumeEditForm-${groupId}']`)].find((section) =>
      !String(section.className || "").includes("resumeEditForm-item")
      && /createFormSection/.test(String(section.className || ""))
    );
    if (siteSpecific) return siteSpecific;

    const explicitId = Object.entries(SECTION_ID_GROUPS).find(([, group]) => group === groupId)?.[0];
    if (explicitId && document.getElementById(explicitId)) return document.getElementById(explicitId);
    const explicitSection = [...document.querySelectorAll("section, fieldset, article, [role='group'], [id], [class*='apply-block-'], [class*='createFormSection'], [class*='resumeEditForm-']")].find((section) => contextGroup(section, section.id || section.querySelector("h1,h2,h3,h4,legend,[class*='blockTitle'],[class*='section-title'],[class*='createFormSection-title']")?.textContent || "") === groupId);
    if (explicitSection) return moduleBoundaryForElement(explicitSection, groupId) || explicitSection;
    const representative = [...document.querySelectorAll(CONTROL_SELECTOR)].find((control) => isFillable(control) && contextGroup(control, elementText(control)) === groupId);
    return representative ? moduleBoundaryForElement(representative, groupId) : null;
  }

  function currentEntryCount(groupId, profile) {
    const matches = scan(profile).filter((match) => match.key.startsWith(`${groupId}.`));
    const inferred = matches.length ? Math.max(...matches.map((match) => match.occurrence)) + 1 : 0;
    const section = sectionForGroup(groupId);
    const entryContainers = section ? [...section.querySelectorAll(REPEATABLE_ENTRY_SELECTOR)].filter((entry) =>
      entry.querySelector("input, textarea, select, [role='combobox']")
      && ![...entry.querySelectorAll(REPEATABLE_ENTRY_SELECTOR)].some((nested) =>
        nested !== entry
        && nested.querySelector("input, textarea, select, [role='combobox']")
        && contextGroup(nested, "") === groupId
      )
    ) : [];
    return Math.max(inferred, entryContainers.length);
  }

  function addButtonForGroup(groupId) {
    const candidates = [...document.querySelectorAll("button, a, [role='button'], [id$='_addButton'], [class*='addBtn'], [class*='addMore'], [class*='add-button']")].filter((button) => {
      const text = normalize(button.textContent);
      return visibleElement(button) && /(?:添加|新增|增加|add another|^add\b)/i.test(text) && !/上传|upload|保存|submit/.test(text);
    });
    const matches = candidates.filter((button) => contextGroup(button, button.textContent || "") === groupId);
    return matches.find((button) => /addMore-add/.test(String(button.className || ""))) || matches[0] || null;
  }

  function recordIdentity(value) {
    return normalize(value).replace(/[^\p{L}\p{N}]+/gu, "");
  }

  function entryContainersForGroup(groupId, profile) {
    const entries = new Set();
    scan(profile).forEach((match) => {
      if (!match.key.startsWith(`${groupId}.`)) return;
      const entry = match.element.closest?.(REPEATABLE_ENTRY_SELECTOR);
      if (entry) entries.add(entry);
    });
    return [...entries];
  }

  function entryControlValues(entry) {
    return [...entry.querySelectorAll("input, textarea, select, [role='combobox']")]
      .map((control) => currentControlValue(control))
      .map((value) => String(value || "").trim())
      .filter(Boolean);
  }

  function removalControlForEntry(entry) {
    const candidates = [...entry.querySelectorAll("button, a, [role='button'], [class*='removeBtn'], [class*='remove-btn'], [class*='delete']")];
    return candidates.find((control) => /removeBtn(?!-container)/.test(String(control.className || "")))
      || candidates.find((control) => visibleElement(control) && /删除|移除|delete|remove/i.test(`${control.textContent || ""} ${control.getAttribute?.("aria-label") || ""} ${control.getAttribute?.("title") || ""}`))
      || null;
  }

  async function removeEntry(entry) {
    const control = removalControlForEntry(entry);
    if (!control) return false;
    control.click();
    for (let attempt = 0; attempt < 16; attempt += 1) {
      await delay(60);
      if (!entry.isConnected) return true;
    }
    return !entry.isConnected;
  }

  async function repairMisplacedProjectEntries(profile) {
    const projectRecords = profileRecordsForGroup(profile, "project").filter((record) => recordIdentity(record.name));
    const internshipNames = new Set(profileRecordsForGroup(profile, "internship").map((record) => recordIdentity(record.company)).filter(Boolean));
    const issues = [];
    let relocated = 0;
    if (!projectRecords.length) return { relocated, issues };

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const matchingEntry = entryContainersForGroup("internship", profile).reverse().find((entry) => {
        const identities = new Set(entryControlValues(entry).map(recordIdentity).filter(Boolean));
        const matchingProject = projectRecords.some((record) => identities.has(recordIdentity(record.name)));
        const matchingInternship = [...internshipNames].some((name) => identities.has(name));
        return matchingProject && !matchingInternship;
      });
      if (!matchingEntry) break;
      if (!await removeEntry(matchingEntry)) {
        issues.push({ groupId: "internship", reason: "发现项目条目停留在实习模块，但网页未提供可操作的删除入口；项目会在正确模块补填，请手动删除重复项" });
        break;
      }
      relocated += 1;
    }
    return { relocated, issues };
  }

  async function waitForEntryIncrease(groupId, profile, previousCount) {
    for (let attempt = 0; attempt < 16; attempt += 1) {
      await delay(60);
      const count = currentEntryCount(groupId, profile);
      if (count > previousCount) return count;
    }
    return currentEntryCount(groupId, profile);
  }

  async function expandRepeatableSections(profile) {
    const addedByGroup = {};
    const issues = [];
    for (const groupId of REPEATABLE_GROUPS) {
      const desired = Math.min(desiredEntryCount(profile, groupId), 20);
      let current = currentEntryCount(groupId, profile);
      if (!current && !sectionForGroup(groupId) && !addButtonForGroup(groupId)) continue;
      let attempts = 0;
      while (current < desired && attempts < 20) {
        const button = addButtonForGroup(groupId);
        if (!button) {
          issues.push({ groupId, reason: "找不到该模块的“添加”按钮" });
          break;
        }
        const before = current;
        button.click();
        current = await waitForEntryIncrease(groupId, profile, before);
        if (current <= before) {
          issues.push({ groupId, reason: "点击“添加”后网页没有生成新的填写区块" });
          break;
        }
        addedByGroup[groupId] = (addedByGroup[groupId] || 0) + (current - before);
        attempts += 1;
      }
    }
    return { addedByGroup, totalAdded: Object.values(addedByGroup).reduce((sum, count) => sum + count, 0), issues };
  }

  function clearHighlights() {
    document.querySelectorAll(".resume-helper-match, .resume-helper-filled, .resume-helper-skipped").forEach((element) => {
      element.classList.remove("resume-helper-match", "resume-helper-filled", "resume-helper-skipped");
    });
  }

  function clearProgressWidget() {
    document.getElementById("resume-helper-progress-host")?.remove();
  }

  function moduleLabel(groupId) {
    return ResumeHelperSchema.FIELD_GROUPS.find((group) => group.id === groupId)?.title || groupId;
  }

  function outcomeLabel(match) {
    const groupId = match.key.split(".")[0];
    const repeatable = REPEATABLE_GROUPS.has(groupId);
    return repeatable ? `${match.label} ${match.occurrence + 1}` : match.label;
  }

  function requiredOutcomeMatch(descriptor) {
    return {
      key: descriptor.recognizedKey || "additional.smartRequired",
      label: descriptor.label,
      occurrence: descriptor.recordOccurrence ?? descriptor.occurrence,
      component: descriptor.component || "",
      requiredId: descriptor.id
    };
  }

  function sameOutcomeField(match, required) {
    return match.requiredId === required.id || Boolean(required.recognizedKey
      && match.key === required.recognizedKey
      && match.occurrence === (required.recordOccurrence ?? required.occurrence)
      && (match.component || "") === (required.component || ""));
  }

  const SMART_REQUIRED_RULES = [
    { key: "personal.fullName", phrases: ["申请人姓名", "应聘者姓名", "候选人姓名", "真实姓名"] },
    { key: "personal.email", phrases: ["联系邮箱", "常用邮箱", "接收通知邮箱"] },
    { key: "personal.phone", phrases: ["联系手机", "移动电话", "本人电话"] },
    { key: "personal.nativePlace", phrases: ["户籍所在地", "户口所在地", "籍贯所在地", "生源地"] },
    { key: "personal.city", phrases: ["当前居住城市", "现居城市", "常住城市", "工作生活城市"] },
    { key: "personal.address", phrases: ["当前居住地址", "现居住址", "常住地址", "通讯地址"] },
    { key: "personal.birthDate", phrases: ["出生年月日", "个人出生日期"] },
    { key: "education.degree", phrases: ["最高教育程度", "最高学历层次", "当前最高学历"] },
    { key: "education.school", phrases: ["最高学历院校", "毕业学校", "就读院校"] },
    { key: "education.major", phrases: ["最高学历专业", "毕业专业", "所学方向"] },
    { key: "education.endDate", phrases: ["预计毕业年份", "预计毕业年月", "毕业年份", "毕业年月"] },
    { key: "internship.company", phrases: ["最近实习公司", "实习单位名称"] },
    { key: "internship.title", phrases: ["最近实习岗位", "实习职能"] },
    { key: "experience.company", phrases: ["最近任职公司", "现任公司", "最近雇主"] },
    { key: "experience.title", phrases: ["最近职位", "现任职位", "当前岗位"] },
    { key: "additional.salary", phrases: ["期望月薪", "薪资预期", "期望工资", "预期薪酬"] },
    { key: "additional.availableDate", phrases: ["最早到岗日期", "预计到岗时间", "最快入职时间", "期望入职日期"] }
  ].map((item) => ({ ...item, phrases: item.phrases.map(normalize) }));

  function humanFieldLabel(element) {
    const container = isRadioControl(element) ? radioContainer(element) : fieldContainer(element);
    const candidates = [];
    const id = element.id;
    if (id) {
      try {
        const explicit = document.querySelector(`label[for="${CSS.escape(id)}"]`);
        if (explicit) candidates.push(explicit.textContent);
      } catch (_) {}
    }
    const labelledBy = element.getAttribute("aria-labelledby");
    if (labelledBy) labelledBy.split(/\s+/).forEach((labelId) => candidates.push(document.getElementById(labelId)?.textContent));
    if (container) {
      const label = container.querySelector("legend, .form-item__text, [class*='filedName'], [class*='fieldName'], [class*='question-title'], [class*='field-label'], [class*='form-label'], label, [class*='label'], [class*='title']");
      if (label) candidates.push(label.textContent);
    }
    candidates.push(element.getAttribute("aria-label"), element.getAttribute("placeholder"), element.getAttribute("name"));
    for (const candidate of candidates.filter(Boolean)) {
      const cleaned = cleanControlText(candidate)
        .replace(/[＊*]+/g, "")
        .replace(/(?:必填|required)/gi, "")
        .replace(/\s*[：:]\s*$/, "")
        .trim();
      if (cleaned && !/^(?:请选择|请输入|select|please select)$/i.test(cleaned)) {
        const endpoint = monthPeriodEndpoint(element);
        return endpoint ? `${cleaned.slice(0, 64)}（${endpoint.field === "startDate" ? "开始时间" : "结束时间"}）` : cleaned.slice(0, 80);
      }
    }
    return "未命名必填字段";
  }

  function fieldModule(element) {
    const groupId = contextGroup(element, elementText(element));
    return groupId ? moduleLabel(groupId) : "其他必填信息";
  }

  function shortHash(value) {
    let hash = 2166136261;
    for (const character of String(value || "")) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function staticControlOptions(element) {
    if (element instanceof HTMLSelectElement) {
      return [...element.options].map((option) => cleanControlText(option.textContent)).filter((option) => option && !/^(?:请选择|select)$/i.test(option));
    }
    if (isRadioControl(element)) {
      return [...radioContainer(element).querySelectorAll("input[type='radio'], [role='radio'], .phoenix-radio")].map(radioOptionLabel).filter(Boolean);
    }
    return [];
  }

  function smartProfileValue(profile, key, label) {
    const [groupId, fieldId] = key.split(".");
    let value = "";
    if (REPEATABLE_GROUPS.has(groupId)) {
      const records = profileRecordsForGroup(profile, groupId);
      const record = groupId === "education" ? (records.find((item) => choiceTokens(item.isHighest).has("yes")) || records[0]) : records[0];
      value = record?.[fieldId] || "";
    } else {
      value = profile?.[groupId]?.[fieldId] || "";
    }
    if (/年份|year/i.test(label) && /^\d{4}/.test(String(value))) return String(value).slice(0, 4);
    if (/年月|year.*month/i.test(label) && /^\d{4}-\d{1,2}/.test(String(value))) return String(value).slice(0, 7);
    return String(value || "").trim();
  }

  function semanticTextScore(left, right) {
    const a = normalize(left).replace(/\s/g, "");
    const b = normalize(right).replace(/\s/g, "");
    if (!a || !b) return 0;
    if (a === b) return 1;
    if (Math.min(a.length, b.length) >= 2 && (a.includes(b) || b.includes(a))) return 0.72;
    const grams = (value) => new Set([...value].slice(0, -1).map((character, index) => character + value[index + 1]));
    const aGrams = grams(a);
    const bGrams = grams(b);
    if (!aGrams.size || !bGrams.size) return 0;
    const overlap = [...aGrams].filter((gram) => bGrams.has(gram)).length;
    return (2 * overlap) / (aGrams.size + bGrams.size);
  }

  function fuzzyProfileSuggestion(element, label, profile) {
    const context = contextGroup(element, elementText(element));
    const token = normalize(label);
    const candidates = [];
    ResumeHelperSchema.FIELD_GROUPS.forEach((group) => {
      if (context && ![context, "personal", "additional"].includes(group.id)) return;
      const records = group.repeatable ? profileRecordsForGroup(profile, group.id).slice(0, 1) : [profile?.[group.id] || {}];
      records.forEach((record) => group.fields.forEach(([fieldId, fieldLabel]) => {
        const value = String(record?.[fieldId] || "").trim();
        if (!value) return;
        let score = semanticTextScore(token, fieldLabel);
        if (/联系人|父亲|母亲|配偶|亲属|推荐人|导师/.test(token) && group.id === "personal") score = 0;
        candidates.push({ key: `${group.id}.${fieldId}`, value, fieldLabel, score });
      }));
    });
    candidates.sort((a, b) => b.score - a.score);
    if (!candidates[0] || candidates[0].score < 0.55 || (candidates[1] && candidates[0].score === candidates[1].score)) return null;
    return candidates[0];
  }

  function suggestedRequiredAnswer(element, label, profile, answerMemory, memoryKey) {
    const memoryItem = answerMemory?.[memoryKey];
    const remembered = typeof memoryItem === "string" ? memoryItem : memoryItem?.value;
    const adapter = controlType(element);
    if (["file-upload", "sensitive-input"].includes(adapter) || /验证码|短信码|动态码|captcha|verification code/i.test(label)) {
      return { suggestion: "", confidence: 0, source: adapter === "file-upload" ? "浏览器不允许扩展代选本机文件，请手动上传" : "敏感或动态验证信息必须手动填写", safeToAutofill: false, manualOnly: true, profileKey: "" };
    }
    const confirmationOnly = adapter === "confirmation-checkbox" || /声明|承诺|协议|隐私|授权|确认.*真实|本人确认|阅读并同意/.test(label);
    if (String(remembered || "").trim()) {
      return { suggestion: String(remembered).trim(), confidence: 100, source: "你之前确认过的答案", safeToAutofill: !confirmationOnly, profileKey: "" };
    }

    const token = normalize(label);
    const ranked = SMART_REQUIRED_RULES.map((candidate) => {
      const phrase = candidate.phrases.find((item) => token === item || token.includes(item) || item.includes(token));
      return phrase ? { ...candidate, score: token === phrase ? 98 : Math.min(96, 84 + phrase.length) } : null;
    }).filter(Boolean).sort((a, b) => b.score - a.score);
    if (ranked.length) {
      const value = smartProfileValue(profile, ranked[0].key, label);
      if (value) return { suggestion: value, confidence: ranked[0].score, source: "根据已保存简历资料", safeToAutofill: true, profileKey: ranked[0].key };
    }

    if (/是否.*外语|有无.*外语|外语能力/.test(token)) {
      const hasLanguage = profileRecordsForGroup(profile, "skill").some((item) => item.type === "外语语种" && String(item.name || "").trim());
      if (hasLanguage) return { suggestion: "是", confidence: 92, source: "根据语言技能资料", safeToAutofill: true, profileKey: "skill.name" };
    }
    if (/招聘|职位|岗位|校招/.test(token) && /来源|渠道|获知/.test(token)) {
      return { suggestion: "其他", confidence: 45, source: "常见兜底选项，需要你确认", safeToAutofill: false, profileKey: "" };
    }
    if (confirmationOnly) return { suggestion: "同意", confidence: 0, source: "必须由你本人确认", safeToAutofill: false, profileKey: "" };
    const fuzzy = fuzzyProfileSuggestion(element, label, profile);
    if (fuzzy) return { suggestion: fuzzy.value, confidence: Math.round(fuzzy.score * 100), source: `可能对应资料中的“${fuzzy.fieldLabel}”，请确认`, safeToAutofill: false, profileKey: fuzzy.key };
    return { suggestion: "", confidence: 0, source: "资料中没有可靠依据，请补充答案", safeToAutofill: false, profileKey: "" };
  }

  function canonicalControl(element) {
    if (isRadioControl(element)) return radioContainer(element);
    if (isCustomSelectControl(element)) return element.closest(CUSTOM_SELECT_ROOT_SELECTOR) || element;
    return element;
  }

  function requiredUnknownFields(matches, profile = {}, answerMemory = {}) {
    const recognizedByControl = new Map(matches.map((match) => [canonicalControl(match.element), match]));
    const seenControls = new Set();
    const occurrenceByFingerprint = new Map();
    const unknown = [];
    document.querySelectorAll(CONTROL_SELECTOR).forEach((element) => {
      const isCheckbox = element instanceof HTMLInputElement && element.type === "checkbox";
      const isManualInput = element instanceof HTMLInputElement && ["file", "password"].includes(element.type);
      const isRadio = isRadioControl(element);
      const canonical = canonicalControl(element);
      if (seenControls.has(canonical)) return;
      seenControls.add(canonical);
      const recognizedMatch = recognizedByControl.get(canonical);
      const visible = isFillable(element) || ((isCheckbox || isRadio || isManualInput) && (
        visibleElement(element)
        || visibleElement(fieldContainer(element))
        || visibleElement(element.closest("label") || element.parentElement)
      ));
      if (!visible || !isRequiredControl(element)) return;

      const label = humanFieldLabel(element);
      const module = fieldModule(element);
      const adapter = controlType(element);
      const baseFingerprint = shortHash(`${normalize(module)}|${normalize(label)}|${adapter}`);
      const occurrence = occurrenceByFingerprint.get(baseFingerprint) || 0;
      occurrenceByFingerprint.set(baseFingerprint, occurrence + 1);
      // Count completed fields too, so filling the first education record does
      // not change the ID (or remembered answer) of the second record.
      if (currentControlValue(element).trim()) return;
      const memoryKey = `required:${baseFingerprint}:${occurrence}`;
      const id = `required-${baseFingerprint}-${occurrence}`;
      const missingKnownValue = Boolean(recognizedMatch?.key);
      const record = recognizedMatch && REPEATABLE_GROUPS.has(recognizedMatch.key.split(".")[0])
        ? profileRecordsForGroup(profile, recognizedMatch.key.split(".")[0])[recognizedMatch.occurrence] : null;
      const recordIdentity = normalize(record?.school || record?.name || record?.company || "");
      const storedMemory = answerMemory?.[memoryKey];
      const isSchoolLocation = /^education\.(?:country|state|city)$/.test(recognizedMatch?.key || "");
      const memoryItem = !isSchoolLocation || (storedMemory?.recognizedKey === recognizedMatch.key
        && storedMemory?.recordIdentity === recordIdentity) ? storedMemory : null;
      const suggestion = suggestedRequiredAnswer(element, label, profile, { ...answerMemory, [memoryKey]: memoryItem }, memoryKey);
      const remembered = typeof memoryItem === "string" ? memoryItem : memoryItem?.value;
      if (recognizedMatch && !recognizedMatch.hasProfileValue && !String(remembered || "").trim() && !suggestion.manualOnly) {
        Object.assign(suggestion, { suggestion: "", safeToAutofill: false, profileKey: recognizedMatch.key });
      }
      if (recognizedMatch?.hasProfileValue && !String(remembered || "").trim() && !suggestion.manualOnly) {
        Object.assign(suggestion, {
          suggestion: String(profileValueForMatch(profile, recognizedMatch)),
          confidence: recognizedMatch.confidence,
          source: "根据已保存简历资料",
          safeToAutofill: true,
          profileKey: recognizedMatch.key
        });
      }
      if (missingKnownValue && !suggestion.profileKey) suggestion.profileKey = recognizedMatch.key;
      if (missingKnownValue && !suggestion.suggestion) {
        suggestion.source = `当前简历版本中的“${displayLabel(recognizedMatch.key)}”为空，请确认本次答案`;
      }
      unknown.push({
        id,
        memoryKey,
        element,
        label,
        module,
        occurrence,
        recordOccurrence: recognizedMatch && REPEATABLE_GROUPS.has(recognizedMatch.key.split(".")[0]) ? recognizedMatch.occurrence : null,
        recordIdentity,
        recognizedKey: recognizedMatch?.key || "",
        component: recognizedMatch?.component || "",
        controlType: adapter,
        controlLabel: CONTROL_TYPE_LABELS[adapter] || adapter,
        options: staticControlOptions(element),
        ...suggestion,
        reason: suggestion.safeToAutofill ? `可${suggestion.source}自动填写` : suggestion.source,
        type: "unknown-required"
      });
    });
    return unknown;
  }

  function publicRequiredFields(fields) {
    return fields.map(({ element: _element, ...field }) => field);
  }

  async function enrichRequiredOptions(fields) {
    let inspected = 0;
    for (const field of fields) {
      if (field.controlType !== "custom-select" || field.options.length || inspected >= 16) continue;
      inspected += 1;
      try {
        clickControlTarget(field.element);
        const options = await waitForPopupOptions(field.element);
        field.options = [...new Set(options.map((option) => cleanControlText(option.textContent)).filter((text) => text && !/^(?:请选择|select)$/i.test(text)))].slice(0, 80);
        closePopup(field.element);
        await delay(20);
      } catch (_) {
        closePopup(field.element);
      }
    }
    return fields;
  }

  async function setRequiredDescriptorValue(descriptor, value) {
    const answer = String(value || "").trim();
    if (!answer) return false;
    const element = descriptor.element;
    if (descriptor.controlType === "confirmation-checkbox") {
      if (!/(?:同意|确认|是|已阅读|yes|true|1)/i.test(answer)) return false;
      if (!element.checked) element.click();
      return element.checked;
    }
    if (descriptor.controlType === "radio-group") {
      const option = [...radioContainer(element).querySelectorAll("input[type='radio'], [role='radio'], .phoenix-radio")].find((candidate) => choiceMatches(candidate, answer));
      return option ? setRadioChoice(option, answer) : false;
    }
    return setNativeValue(element, answer, descriptor.profileKey || "", descriptor.controlType);
  }

  async function fillSmartRequiredFields(matches, profile, answerMemory) {
    const descriptors = requiredUnknownFields(matches, profile, answerMemory);
    let filled = 0;
    const outcomes = [];
    for (const descriptor of descriptors) {
      if (!descriptor.safeToAutofill || !descriptor.suggestion) continue;
      if (await setRequiredDescriptorValue(descriptor, descriptor.suggestion)) {
        filled += 1;
        descriptor.element.classList.add("resume-helper-filled");
        outcomes.push({ match: requiredOutcomeMatch(descriptor), status: "filled" });
      }
    }
    if (filled) await delay(80);
    return { filled, outcomes, remaining: requiredUnknownFields(buildFillPlan(profile), profile, answerMemory) };
  }

  function failedControlReason(element) {
    if (monthPeriodEndpoint(element)) return "日期区间未能选中并确认目标年月，请手动检查";
    if (isCalendarPickerControl(element)) return "日期选择器未能匹配目标年月日，请手动确认";
    if (isCascaderControl(element)) return "级联选项未能完整匹配，请手动确认省 / 市";
    if (element instanceof HTMLSelectElement || element.getAttribute("role") === "combobox" || isCustomSelectControl(element)) return "下拉列表中没有找到可靠匹配项，请手动选择";
    return "网页控件未能自动写入";
  }

  function isRequiredControl(element) {
    if (element.required || element.getAttribute("aria-required") === "true") return true;
    if (isRadioControl(element) && radioContainer(element)?.getAttribute("aria-required") === "true") return true;
    const container = fieldContainer(element)
      || element.closest("[class*='form-item'], [class*='formItem'], [class*='FormItem'], fieldset");
    if (container?.getAttribute("aria-required") === "true" || /(?:^|\s)required(?:\s|$)/i.test(String(container?.className || ""))) return true;
    const label = container?.querySelector(".form-item__text, [class*='filedName'], [class*='fieldName'], [class*='title'], label, [class*='label']");
    return Boolean(
      container?.querySelector(".form-item__required, [class*='required-asterisk']")
      || (label && (/\*/.test(label.textContent || "") || /required/i.test(label.className)))
    );
  }

  function summarizeOutcomes(outcomes, unknownRequired) {
    const modules = new Map();
    outcomes.forEach((outcome) => {
      const groupId = outcome.match.key.split(".")[0];
      if (!modules.has(groupId)) modules.set(groupId, { id: groupId, label: moduleLabel(groupId), total: 0, complete: 0, issues: 0 });
      const summary = modules.get(groupId);
      summary.total += 1;
      if (outcome.status === "filled" || outcome.status === "preserved") summary.complete += 1;
      else summary.issues += 1;
    });
    const issues = outcomes.filter((outcome) => (outcome.status === "missing-profile" || outcome.status === "failed")
      && !unknownRequired.some((field) => sameOutcomeField(outcome.match, field))).map((outcome) => ({
      label: outcomeLabel(outcome.match),
      module: moduleLabel(outcome.match.key.split(".")[0]),
      reason: outcome.status === "missing-profile" ? "简历资料中没有内容" : (outcome.reason || "网页控件未能自动写入"),
      type: outcome.status
    }));
    issues.push(...unknownRequired);
    const moduleList = [...modules.values()];
    const complete = moduleList.reduce((sum, module) => sum + module.complete, 0);
    const uncountedRequired = unknownRequired.filter((field) => !outcomes.some((outcome) => sameOutcomeField(outcome.match, field)));
    const total = moduleList.reduce((sum, module) => sum + module.total, 0) + uncountedRequired.length;
    return { modules: moduleList, issues, complete, total, percent: total ? Math.round((complete / total) * 100) : 0 };
  }

  function progressWidgetStyles() {
    return `
      :host { all: initial; position: fixed; right: 20px; bottom: 20px; z-index: 2147483647; color: #242733; font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      * { box-sizing: border-box; }
      button { font: inherit; cursor: pointer; }
      .card { width: 310px; overflow: hidden; border: 1px solid rgba(74,61,129,.16); border-radius: 17px; background: rgba(255,255,255,.98); box-shadow: 0 18px 48px rgba(30,24,60,.2); backdrop-filter: blur(16px); }
      .header { display: grid; grid-template-columns: 42px 1fr auto; align-items: center; gap: 10px; padding: 13px 13px 11px; background: linear-gradient(135deg, #f6f3ff, #fff); }
      .mascot { position: relative; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 14px; background: #7155e6; box-shadow: 0 5px 12px rgba(108,80,232,.2); }
      .ear { position: absolute; top: -3px; width: 13px; height: 13px; background: #7155e6; transform: rotate(45deg); border-radius: 3px; }
      .ear.left { left: 5px; } .ear.right { right: 5px; }
      .face { position: relative; z-index: 1; width: 25px; height: 21px; border-radius: 10px 10px 12px 12px; background: #fff; }
      .eye { position: absolute; top: 7px; width: 3px; height: 4px; border-radius: 50%; background: #463788; }
      .eye.left { left: 6px; } .eye.right { right: 6px; }
      .mouth { position: absolute; left: 9px; bottom: 4px; width: 7px; height: 4px; border-bottom: 1.5px solid #463788; border-radius: 50%; }
      .has-issues .mascot { background: #d89235; } .has-issues .ear { background: #d89235; }
      .has-issues .mouth { border-bottom: 0; border-top: 1.5px solid #6c4920; bottom: 2px; }
      .title strong { display: block; font-size: 12.5px; line-height: 1.3; }
      .title span { display: block; margin-top: 2px; color: #767b87; font-size: 10px; }
      .controls { display: flex; gap: 3px; }
      .icon-button { display: grid; place-items: center; width: 26px; height: 26px; border: 0; border-radius: 7px; color: #838792; background: transparent; font-size: 16px; }
      .icon-button:hover { color: #6247d4; background: #eeeafd; }
      .body { padding: 0 13px 13px; }
      .progress-line { height: 6px; overflow: hidden; border-radius: 99px; background: #e9e7ef; }
      .progress-line span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #6f51e4, #8e76f2); transition: width .3s ease; }
      .has-issues .progress-line span { background: linear-gradient(90deg, #cf8630, #eba84c); }
      .modules { display: grid; gap: 6px; margin-top: 10px; }
      .module { display: grid; grid-template-columns: 1fr auto; align-items: center; min-height: 26px; padding: 5px 7px; border-radius: 7px; background: #f7f7fa; }
      .module-name { font-size: 10.5px; font-weight: 600; }
      .module-count { color: #198161; font-size: 10px; font-weight: 700; }
      .module.incomplete .module-count { color: #b36e17; }
      .issues { margin-top: 10px; padding-top: 9px; border-top: 1px solid #eeeeF2; }
      .issues-title { display: flex; justify-content: space-between; color: #8b5c1e; font-size: 10px; font-weight: 700; }
      .issue-list { display: grid; gap: 5px; margin-top: 7px; padding: 0; list-style: none; }
      .issue { display: grid; grid-template-columns: 6px 1fr; gap: 6px; align-items: start; color: #555a65; font-size: 9.5px; line-height: 1.4; }
      .dot { width: 6px; height: 6px; margin-top: 4px; border-radius: 50%; background: #d9953d; }
      .issue strong { color: #3e424c; font-weight: 650; }
      .more { margin-top: 5px; color: #8f939d; font-size: 9px; }
      .added-note { margin-top: 9px; color: #5d48bc; font-size: 9.5px; }
      .success-note { margin-top: 9px; color: #28775f; font-size: 9.5px; }
      .collapsed { width: 188px; }
      .collapsed .body { display: none; }
      .collapsed .header { padding: 8px; grid-template-columns: 35px 1fr auto; }
      .collapsed .mascot { width: 34px; height: 34px; border-radius: 11px; }
      .collapsed .title span { display: none; }
      .collapsed .close { display: none; }
    `;
  }

  function showProgressWidget(summary) {
    clearProgressWidget();
    const host = document.createElement("div");
    host.id = "resume-helper-progress-host";
    const shadow = host.attachShadow({ mode: "open" });
    if (globalThis.CSSStyleSheet && "adoptedStyleSheets" in shadow) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(progressWidgetStyles());
      shadow.adoptedStyleSheets = [sheet];
    } else {
      const style = document.createElement("style");
      style.textContent = progressWidgetStyles();
      shadow.append(style);
    }

    const card = document.createElement("section");
    card.className = `card${summary.issues.length ? " has-issues" : ""}`;
    const modulesHtml = summary.modules.map((module) => `<div class="module${module.complete === module.total ? "" : " incomplete"}"><span class="module-name">${escapeHtml(module.label)}</span><span class="module-count">${module.complete}/${module.total}</span></div>`).join("");
    const visibleIssues = summary.issues.slice(0, 5);
    const issuesHtml = visibleIssues.map((issue) => `<li class="issue"><span class="dot"></span><span><strong>${escapeHtml(issue.module ? `${issue.module} · ` : "")}${escapeHtml(issue.label)}</strong><br>${escapeHtml(issue.reason)}</span></li>`).join("");
    card.innerHTML = `
      <div class="header">
        <div class="mascot" aria-hidden="true"><i class="ear left"></i><i class="ear right"></i><span class="face"><i class="eye left"></i><i class="eye right"></i><i class="mouth"></i></span></div>
        <div class="title"><strong>本页填充进度 · ${summary.percent}%</strong><span>${summary.complete}/${summary.total} 个字段已完成</span></div>
        <div class="controls"><button class="icon-button collapse" title="收起">−</button><button class="icon-button close" title="关闭">×</button></div>
      </div>
      <div class="body">
        <div class="progress-line"><span style="width:${summary.percent}%"></span></div>
        <div class="modules">${modulesHtml}</div>
        ${summary.relocatedEntries ? `<div class="added-note">已将 ${summary.relocatedEntries} 条错放在实习模块的项目移除，并迁回项目经历</div>` : ""}
        ${summary.addedEntries ? `<div class="added-note">已自动新增 ${summary.addedEntries} 个经历填写区块</div>` : ""}
        ${summary.issues.length ? `<div class="issues"><div class="issues-title"><span>需要检查</span><span>${summary.issues.length} 项</span></div><ul class="issue-list">${issuesHtml}</ul>${summary.issues.length > 5 ? `<div class="more">另有 ${summary.issues.length - 5} 项，请在网页中继续检查</div>` : ""}</div>` : '<div class="success-note">本页识别到的字段均已完成，请提交前再检查一次。</div>'}
      </div>`;
    shadow.append(card);
    document.documentElement.append(host);
    shadow.querySelector(".close").addEventListener("click", clearProgressWidget);
    shadow.querySelector(".collapse").addEventListener("click", (event) => {
      card.classList.toggle("collapsed");
      event.currentTarget.textContent = card.classList.contains("collapsed") ? "+" : "−";
      event.currentTarget.title = card.classList.contains("collapsed") ? "展开" : "收起";
    });
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  }

  const messageListener = (incoming, _sender, sendResponse) => {
    if (incoming?.type === "RESUME_HELPER_V2_PING") {
      sendResponse({ ok: true, version: CONTENT_VERSION });
      return;
    }
    if (!incoming?.type?.startsWith("RESUME_HELPER_V2_")) return;
    const message = { ...incoming, type: incoming.type.replace("RESUME_HELPER_V2_", "RESUME_HELPER_") };
    if (!message || !["RESUME_HELPER_SCAN", "RESUME_HELPER_FILL", "RESUME_HELPER_APPLY_REQUIRED", "RESUME_HELPER_CLEAR"].includes(message.type)) return;
    (async () => {
      if (message.type === "RESUME_HELPER_CLEAR") {
        clearHighlights();
        clearProgressWidget();
        sendResponse({ ok: true });
        return;
      }

      clearHighlights();
      if (message.type === "RESUME_HELPER_SCAN") clearProgressWidget();
      if (message.type === "RESUME_HELPER_SCAN") {
        const matches = buildFillPlan(message.profile || {});
        matches.forEach(({ element }) => element.classList.add("resume-helper-match"));
        const summary = matches.map(({ element: _element, ...item }) => item);
        const controlTypes = [...new Set(summary.map((item) => item.controlLabel))];
        const requiredDescriptors = await enrichRequiredOptions(requiredUnknownFields(matches, message.profile || {}, message.requiredAnswerMemory || {}));
        requiredDescriptors.forEach(({ element }) => element.classList.add("resume-helper-match"));
        const requiredFields = publicRequiredFields(requiredDescriptors);
        sendResponse({ ok: true, fields: summary, requiredFields, controlTypes, fillableCount: summary.filter((item) => item.hasProfileValue && !item.hasPageValue).length });
        return;
      }

      if (message.type === "RESUME_HELPER_APPLY_REQUIRED") {
        const profile = message.profile || {};
        let applied = 0;
        let failed = 0;
        const outcomes = [];
        for (const [id, answer] of Object.entries(message.answers || {})) {
          if (!String(answer || "").trim()) continue;
          // Selecting an option may rerender the form and replace later inputs.
          const descriptor = requiredUnknownFields(buildFillPlan(profile), profile, message.requiredAnswerMemory || {}).find((field) => field.id === id);
          if (!descriptor) {
            failed += 1;
            outcomes.push({ match: { key: "additional.smartRequired", label: "待确认答案", occurrence: 0 }, status: "failed", reason: "对应字段已变化或已有内容，请重新扫描后确认" });
            continue;
          }
          if (await setRequiredDescriptorValue(descriptor, answer)) {
            applied += 1;
            descriptor.element.classList.add("resume-helper-filled");
            outcomes.push({ match: requiredOutcomeMatch(descriptor), status: "filled" });
          } else {
            failed += 1;
            descriptor.element.classList.add("resume-helper-skipped");
            outcomes.push({ match: requiredOutcomeMatch(descriptor), status: "failed", reason: failedControlReason(descriptor.element) });
          }
        }
        await delay(80);
        const remaining = await enrichRequiredOptions(requiredUnknownFields(buildFillPlan(profile), profile, message.requiredAnswerMemory || {}));
        const progress = summarizeOutcomes(outcomes, publicRequiredFields(remaining));
        showProgressWidget(progress);
        sendResponse({ ok: true, applied, failed, requiredFields: publicRequiredFields(remaining), modules: progress.modules, issues: progress.issues, percent: progress.percent });
        return;
      }

      const relocation = await repairMisplacedProjectEntries(message.profile || {});
      const expansion = await expandRepeatableSections(message.profile || {});
      let filled = 0;
      let skippedExisting = 0;
      let missingValue = 0;
      let failed = 0;
      const outcomes = [];
      const processed = new WeakSet();
      const processedFields = new Set();
      for (let pass = 0; pass < 4; pass += 1) {
        const passMatches = buildFillPlan(message.profile || {});
        let discovered = 0;
        for (const originalMatch of passMatches) {
          const match = originalMatch.element.isConnected ? originalMatch : buildFillPlan(message.profile || {}).find((candidate) =>
            candidate.key === originalMatch.key
            && candidate.occurrence === originalMatch.occurrence
            && (candidate.component || "") === (originalMatch.component || "")
            && humanFieldLabel(candidate.element) === humanFieldLabel(originalMatch.element)
          );
          if (!match) continue;
          const logicalField = `${match.key}|${match.occurrence}|${match.component || ""}|${humanFieldLabel(match.element)}`;
          if (processed.has(match.element) || processedFields.has(logicalField)) continue;
          processed.add(match.element);
          processedFields.add(logicalField);
          discovered += 1;
          const groupId = match.key.split(".")[0];
          if (REPEATABLE_GROUPS.has(groupId) && desiredEntryCount(message.profile || {}, groupId) === 0) continue;
          const value = profileValueForMatch(message.profile || {}, match);
          if (!String(value).trim()) {
            if (match.hasPageValue) {
              skippedExisting += 1;
              match.element.classList.add("resume-helper-skipped");
              outcomes.push({ match, status: "preserved" });
              continue;
            }
            if (!isRequiredControl(match.element)) continue;
            missingValue += 1;
            match.element.classList.add("resume-helper-skipped");
            continue;
          }
          if (match.hasPageValue && !message.overwriteExisting && !match.repairExisting && !shouldRepairPartialEntry(match, message.profile || {})) {
            skippedExisting += 1;
            match.element.classList.add("resume-helper-skipped");
            outcomes.push({ match, status: "preserved" });
            continue;
          }
          if (await setNativeValue(match.element, value, match.key, match.adapter)) {
            filled += 1;
            match.element.classList.add("resume-helper-filled");
            outcomes.push({ match, status: "filled" });
          } else {
            failed += 1;
            match.element.classList.add("resume-helper-skipped");
            outcomes.push({ match, status: "failed", reason: failedControlReason(match.element) });
          }
        }
        if (!discovered) break;
        await delay(90);
      }
      let matches = buildFillPlan(message.profile || {});
      const smartRequired = await fillSmartRequiredFields(matches, message.profile || {}, message.requiredAnswerMemory || {});
      await enrichRequiredOptions(smartRequired.remaining);
      filled += smartRequired.filled;
      smartRequired.outcomes.forEach((outcome) => {
        const index = outcome.match.key !== "additional.smartRequired" ? outcomes.findIndex((item) =>
          item.match.key === outcome.match.key && item.match.occurrence === outcome.match.occurrence
          && (item.match.component || "") === (outcome.match.component || "")
        ) : -1;
        if (index >= 0) outcomes[index] = outcome;
        else outcomes.push(outcome);
      });
      matches = buildFillPlan(message.profile || {});
      const unknownRequired = publicRequiredFields(smartRequired.remaining);
      const progress = summarizeOutcomes(outcomes, unknownRequired);
      progress.addedEntries = expansion.totalAdded;
      progress.relocatedEntries = relocation.relocated;
      const pageOnlyGroups = new Set(matches.filter((match) => {
        const groupId = match.key.split(".")[0];
        return REPEATABLE_GROUPS.has(groupId) && desiredEntryCount(message.profile || {}, groupId) === 0 && match.hasPageValue;
      }).map((match) => match.key.split(".")[0]));
      pageOnlyGroups.forEach((groupId) => progress.issues.push({ label: "网页已有内容", module: moduleLabel(groupId), reason: "当前资料中没有这一模块，小助手已保留网页内容，请检查是否为旧数据", type: "page-only-data" }));
      relocation.issues.forEach((issue) => progress.issues.push({ label: "项目迁移", module: moduleLabel(issue.groupId), reason: issue.reason, type: "relocate-entry-failed" }));
      expansion.issues.forEach((issue) => progress.issues.push({ label: "自动新增", module: moduleLabel(issue.groupId), reason: issue.reason, type: "add-entry-failed" }));
      showProgressWidget(progress);
      sendResponse({ ok: true, matched: matches.length, filled, smartFilled: smartRequired.filled, skippedExisting, missingValue, failed, relocatedEntries: relocation.relocated, addedEntries: expansion.totalAdded, addedByGroup: expansion.addedByGroup, modules: progress.modules, issues: progress.issues, requiredFields: unknownRequired, percent: progress.percent });
    })().catch((error) => sendResponse({ ok: false, error: error.message || "填充失败" }));
    return true;
  };
  globalThis.__resumeHelperController = { version: CONTENT_VERSION, listener: messageListener };
  chrome.runtime.onMessage.addListener(messageListener);
})();
