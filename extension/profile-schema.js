(function initResumeHelperSchema(root) {
  const FIELD_GROUPS = [
    {
      id: "personal",
      title: "基本信息",
      repeatable: false,
      fields: [
        ["fullName", "姓名", "text", "例如：张三"],
        ["gender", "性别", "select", "请选择", ["男", "女"]],
        ["firstName", "名 / First name", "text", "San"],
        ["lastName", "姓 / Last name", "text", "Zhang"],
        ["preferredName", "常用名", "text", "可选"],
        ["email", "邮箱", "email", "name@example.com"],
        ["phone", "手机号", "tel", "+86 138 0000 0000"],
        ["phoneCountryCode", "手机区号", "select", "请选择", ["+86"]],
        ["address", "地址", "text", "街道及门牌号"],
        ["city", "城市", "text", "例如：北京；网申时自动选择"],
        ["state", "省 / 州", "text", "Shanghai"],
        ["postalCode", "邮编", "text", "200000"],
        ["country", "国家 / 地区", "select", "请选择", ["中国大陆", "中国香港", "中国澳门", "中国台湾", "外籍"]],
        ["nativePlace", "籍贯", "text", "例如：河北省 / 石家庄市；网申时自动逐级选择"],
        ["ethnicity", "民族", "text", "例如：汉族；网申时自动选择"],
        ["idType", "证件类型", "select", "请选择", ["中华人民共和国居民身份证", "港澳居民来往内地通行证", "台湾居民来往大陆通行证", "护照"]],
        ["idNumber", "证件号码", "text", "仅在确实需要时填写"],
        ["birthDate", "出生日期", "date", "YYYY-MM-DD"],
        ["wechat", "微信号", "text", "可选"],
        ["hobbies", "兴趣爱好", "text", "可选"],
        ["linkedin", "LinkedIn", "url", "https://linkedin.com/in/..."],
        ["github", "GitHub", "url", "https://github.com/..."],
        ["website", "个人网站", "url", "https://..."],
        ["headline", "职业标题", "text", "例如：Product Designer"],
        ["summary", "个人简介", "textarea", "简要介绍你的经验与优势"]
      ]
    },
    {
      id: "education",
      title: "教育经历",
      repeatable: true,
      addLabel: "添加教育经历",
      fields: [
        ["school", "学校", "text", "学校名称"],
        ["country", "学校所在国家 / 地区", "text", "例如：中国、美国；按每段教育经历填写"],
        ["state", "学校所在省 / 州", "text", "可选"],
        ["city", "学校所在城市", "text", "可选"],
        ["college", "学院 / 院系", "text", "学院或院系名称"],
        ["majorCategory", "专业类别", "text", "例如：经济学类"],
        ["degree", "学历 / 学位", "select", "请选择", ["博士研究生", "硕士研究生", "大学本科", "大学专科", "高中", "中专"]],
        ["major", "专业", "text", "专业名称"],
        ["studyMode", "学习形式", "select", "请选择", ["全日制", "非全日制"]],
        ["isHighest", "是否最高学历", "select", "请选择", ["是", "否"]],
        ["isDualDegree", "是否双学位", "select", "请选择", ["是", "否"]],
        ["ranking", "专业成绩排名", "text", "例如：前 10%"],
        ["startDate", "开始时间", "month", "YYYY-MM"],
        ["endDate", "结束时间", "month", "YYYY-MM"],
        ["gpa", "GPA", "text", "可选"],
        ["laboratory", "实验室", "text", "可选"],
        ["advisor", "导师", "text", "可选"],
        ["researchDirection", "研究方向", "text", "可选"],
        ["description", "补充说明", "textarea", "课程、荣誉或活动"]
      ]
    },
    {
      id: "experience",
      title: "工作经历",
      repeatable: true,
      addLabel: "添加工作经历",
      fields: [
        ["company", "公司", "text", "公司名称"],
        ["title", "职位", "text", "职位名称"],
        ["location", "工作地点", "text", "城市或 Remote"],
        ["startDate", "开始时间", "month", "YYYY-MM"],
        ["endDate", "结束时间", "month", "YYYY-MM；在职可留空"],
        ["description", "工作描述", "textarea", "职责与成果"]
      ]
    },
    {
      id: "internship",
      title: "实习经历",
      repeatable: true,
      addLabel: "添加实习经历",
      fields: [
        ["company", "实习公司", "text", "公司或机构名称"],
        ["title", "实习职位", "text", "职位名称"],
        ["location", "实习地点", "text", "城市或远程"],
        ["startDate", "开始时间", "month", "YYYY-MM"],
        ["endDate", "结束时间", "month", "YYYY-MM"],
        ["description", "实习内容", "textarea", "职责、项目与成果"]
      ]
    },
    {
      id: "project",
      title: "项目经历",
      repeatable: true,
      addLabel: "添加项目经历",
      fields: [
        ["name", "项目名称", "text", "项目、比赛或案例名称"],
        ["role", "项目角色", "text", "例如：项目组员、负责人、队长"],
        ["startDate", "开始时间", "month", "YYYY-MM"],
        ["endDate", "结束时间", "month", "YYYY-MM"],
        ["description", "项目内容", "textarea", "项目背景、任务、使用方法与成果"],
        ["responsibilities", "项目职责", "textarea", "你在项目中的具体分工与贡献"]
      ]
    },
    {
      id: "campus",
      title: "校园经历",
      repeatable: true,
      addLabel: "添加校园经历",
      fields: [
        ["name", "经历名称", "text", "社团、学生组织或校园活动名称"],
        ["role", "担任角色", "text", "例如：负责人、部长、成员"],
        ["location", "地点", "text", "可选"],
        ["startDate", "开始时间", "month", "YYYY-MM"],
        ["endDate", "结束时间", "month", "YYYY-MM"],
        ["description", "职责内容", "textarea", "负责事项、活动成果或组织贡献"]
      ]
    },
    {
      id: "honor",
      title: "荣誉奖励",
      repeatable: true,
      addLabel: "添加荣誉奖励",
      fields: [
        ["type", "奖项类型", "text", "例如：竞赛、奖学金、荣誉称号"],
        ["name", "奖项名称", "text", "奖项或荣誉名称"],
        ["date", "获奖时间", "date", "YYYY-MM-DD"],
        ["description", "获奖情况", "textarea", "奖项名称、级别和获奖说明"]
      ]
    },
    {
      id: "publication",
      title: "论文 / 期刊",
      repeatable: true,
      addLabel: "添加论文 / 期刊",
      fields: [
        ["title", "论文名称", "text", "论文或文章标题"],
        ["authorOrder", "作者顺序", "text", "例如：第一作者"],
        ["publicationDate", "发表时间", "date", "YYYY-MM-DD"],
        ["journal", "刊物 / 机构", "text", "期刊、会议或发布机构"],
        ["description", "论文详情", "textarea", "摘要、成果或论文链接"]
      ]
    },
    {
      id: "patent",
      title: "发明成果 / 专利",
      repeatable: true,
      addLabel: "添加发明成果 / 专利",
      fields: [
        ["type", "成果类型", "text", "例如：发明专利、软件著作权"],
        ["name", "成果名称", "text", "专利或成果名称"],
        ["registrationNumber", "登记号", "text", "申请号、授权号或软著登记号"],
        ["registrationDate", "登记日期", "date", "YYYY-MM-DD"],
        ["inventorRank", "发明人排名", "text", "例如：第一发明人"],
        ["description", "核心简介", "textarea", "技术方案、创新点和应用场景"]
      ]
    },
    {
      id: "skill",
      title: "语言 / 证书 / 技能",
      repeatable: true,
      addLabel: "添加语言 / 证书 / 技能",
      fields: [
        ["type", "技能类型", "select", "请选择", ["外语语种", "证书", "开发语言", "其他技能"]],
        ["name", "名称", "text", "语言、证书或技能名称"],
        ["score", "成绩 / 等级", "text", "考试成绩、熟练程度或证书等级"],
        ["proficiency", "掌握程度", "text", "例如：熟练、精通"],
        ["speaking", "听说能力", "text", "例如：熟练"],
        ["readingWriting", "读写能力", "text", "例如：熟练"],
        ["description", "补充说明", "textarea", "可选"]
      ]
    },
    {
      id: "additional",
      title: "补充信息",
      repeatable: false,
      fields: [
        ["skills", "技能", "textarea", "用逗号分隔"],
        ["languages", "语言", "textarea", "例如：中文（母语），英语（流利）"],
        ["salary", "期望薪资", "text", "可选"],
        ["availableDate", "可入职日期", "date", "YYYY-MM-DD"]
      ]
    }
  ];

  const createEmptyProfile = () => ({
    personal: {},
    education: [{}],
    experience: [{}],
    internship: [{}],
    project: [{}],
    campus: [{}],
    honor: [{}],
    publication: [{}],
    patent: [{}],
    skill: [{}],
    additional: {},
    meta: { updatedAt: null, schemaVersion: 6 }
  });

  function makeProfileVersionId() {
    if (root.crypto?.randomUUID) return `resume-${root.crypto.randomUUID()}`;
    return `resume-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function createProfileVersion({ name = "默认简历", profile = createEmptyProfile(), sourceFileName = "" } = {}) {
    const now = new Date().toISOString();
    return {
      id: makeProfileVersionId(),
      name: String(name || "默认简历").trim() || "默认简历",
      profile,
      sourceFileName: String(sourceFileName || profile?.meta?.sourceFileName || ""),
      createdAt: now,
      updatedAt: profile?.meta?.updatedAt || now
    };
  }

  function normalizeProfileLibrary(stored = {}) {
    let profiles = Array.isArray(stored.resumeProfiles) ? stored.resumeProfiles.filter((item) => item && typeof item === "object") : [];
    profiles = profiles.map((item, index) => {
      const profile = item.profile && typeof item.profile === "object" ? item.profile : createEmptyProfile();
      return {
        id: String(item.id || makeProfileVersionId()),
        name: String(item.name || `简历版本 ${index + 1}`).trim() || `简历版本 ${index + 1}`,
        profile,
        sourceFileName: String(item.sourceFileName || profile?.meta?.sourceFileName || ""),
        createdAt: item.createdAt || profile?.meta?.importedAt || new Date().toISOString(),
        updatedAt: item.updatedAt || profile?.meta?.updatedAt || null
      };
    });
    if (!profiles.length) profiles = [createProfileVersion({ name: "默认简历", profile: stored.resumeProfile || createEmptyProfile() })];
    const requestedId = String(stored.activeResumeProfileId || "");
    const activeId = profiles.some((item) => item.id === requestedId) ? requestedId : profiles[0].id;
    return { profiles, activeId, activeProfile: profiles.find((item) => item.id === activeId).profile };
  }

  root.ResumeHelperSchema = { FIELD_GROUPS, createEmptyProfile, createProfileVersion, normalizeProfileLibrary };
})(globalThis);
