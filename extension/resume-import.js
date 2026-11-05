import * as pdfjsLib from "./vendor/pdfjs/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("./vendor/pdfjs/pdf.worker.min.mjs", import.meta.url).href;

const SECTION_ALIASES = [
  ["publication", ["论文/期刊", "论文与期刊", "论文期刊", "发表论文", "论文发表", "publications", "publication"]],
  ["patent", ["发明成果专利", "发明成果/专利", "发明专利", "专利成果", "专利", "patents", "patent"]],
  ["honor", ["荣誉奖励", "荣誉奖项", "奖项荣誉", "获奖经历", "奖项", "honors and awards", "honours and awards", "awards", "honors"]],
  ["skillRecords", ["语言/证书/技能", "语言证书技能", "语言、证书与技能", "证书与技能", "languages certificates and skills", "certifications"]],
  ["project", ["项目经历", "项目经验", "项目实践", "课程项目", "project experience", "project experiences", "projects"]],
  ["internship", ["实习经历", "实习经验", "实习实践", "internship experience", "internships", "internship"]],
  ["campus", ["校园经历", "校内经历", "社团经历", "学生工作", "校园实践", "校园活动", "campus experience", "campus activities", "extracurricular activities", "leadership experience", "activities"]],
  ["education", ["教育经历", "教育背景", "学历背景", "教育", "education background", "education"]],
  ["experience", ["工作经历", "工作经验", "全职经历", "职业经历", "professional experience", "work experience", "employment history", "experience"]],
  ["skills", ["专业技能", "个人技能", "技能清单", "技术栈", "skills", "technical skills", "core skills"]],
  ["languages", ["语言能力", "语言技能", "外语能力", "languages", "language skills"]],
  ["additional", ["其他", "其他信息", "补充信息", "additional information"]],
  ["summary", ["个人简介", "自我评价", "个人总结", "职业概述", "summary", "profile", "about me", "professional summary"]]
];

const JOB_TITLE_PATTERN = /工程师|经理|主管|总监|顾问|设计师|研究员|分析师|开发|产品|运营|市场|销售|财务|会计|审计|法务|编辑|记者|教师|助理|专员|负责人|实习生|intern|engineer|developer|manager|designer|analyst|consultant|specialist|assistant|director|lead|researcher|product|marketing|operation/i;
const COMPANY_PATTERN = /有限公司|股份公司|公司|集团|银行|事务所|研究院|研究所|实验室|工作室|中心|医院|学校|大学|company|corporation|corp\.?|limited|ltd\.?|group|bank|studio|laboratory|lab\.?|institute/i;
const EDUCATION_PATTERN = /大学|学院|学校|中学|研究生院|university|college|institute|school/i;
const DEGREE_PATTERN = /博士|硕士|本科|学士|专科|高中|ph\.?d|doctor|master|bachelor|associate|mba/i;
const CAMPUS_ROLE_PATTERN = /部长|主席|会长|负责人|组长|成员|干事|队长|社长|创始人|role|leader|president|member|chair/i;
const PROJECT_ROLE_PATTERN = /项目组员|项目成员|组员|队长|负责人|项目经理|组长|成员|project member|team member|team lead|leader/i;
const BULLET_PATTERN = /^[•●▪◦·◆◇■□▶►➤✓✔\-*—–]\s*/;
const LANGUAGE_DEFINITIONS = [
  { name: "英语", pattern: /英语|英文|雅思|托福|toefl|ielts|gre\b|gmat\b|cet[-\s]?[46]|tem[-\s]?[48]|英语[四六]级/i },
  { name: "日语", pattern: /日语|日本语|jlpt/i },
  { name: "韩语", pattern: /韩语|朝鲜语|topik/i },
  { name: "德语", pattern: /德语|testdaf|goethe/i },
  { name: "法语", pattern: /法语|delf|dalf/i },
  { name: "西班牙语", pattern: /西班牙语|dele\b/i },
  { name: "阿拉伯语", pattern: /阿拉伯语/i },
  { name: "马来西亚语", pattern: /马来西亚语|马来语/i },
  { name: "俄语", pattern: /俄语|俄文/i },
  { name: "意大利语", pattern: /意大利语/i },
  { name: "葡萄牙语", pattern: /葡萄牙语/i },
  { name: "泰语", pattern: /泰语/i },
  { name: "越南语", pattern: /越南语/i }
];
const DEVELOPMENT_LANGUAGE_DEFINITIONS = [
  { name: "JavaScript", pattern: /\b(?:javascript|node\.js|nodejs)\b/i },
  { name: "TypeScript", pattern: /\btypescript\b/i },
  { name: "Python", pattern: /\bpython(?:3)?\b/i },
  { name: "SQL", pattern: /\b(?:sql|mysql|postgresql|sqlite)\b/i },
  { name: "C++", pattern: /(?:^|[^A-Za-z0-9_])c\+\+(?=$|[^A-Za-z0-9_])/i },
  { name: "C#", pattern: /(?:^|[^A-Za-z0-9_])c#(?=$|[^A-Za-z0-9_])/i },
  { name: "Java", pattern: /\bjava(?!script)\b/i },
  { name: "R", pattern: /(?:^|[、,，;；：:\s])r(?:语言)?(?=$|[、,，;；\s])/i },
  { name: "Go", pattern: /\bgolang\b|(?:^|[、,，;；：:\s])go(?=$|[、,，;；\s])/i },
  { name: "Rust", pattern: /\brust\b/i },
  { name: "Kotlin", pattern: /\bkotlin\b/i },
  { name: "Swift", pattern: /\bswift\b/i },
  { name: "PHP", pattern: /\bphp\b/i },
  { name: "Ruby", pattern: /\bruby\b/i },
  { name: "Scala", pattern: /\bscala\b/i },
  { name: "MATLAB", pattern: /\bmatlab\b/i },
  { name: "VBA", pattern: /\bvba\b/i }
];
const CERTIFICATE_DEFINITIONS = [
  { name: "CFA", pattern: /\bcfa\b/i },
  { name: "FRM", pattern: /\bfrm\b/i },
  { name: "CPA", pattern: /\bcpa\b|注册会计师/i },
  { name: "ACCA", pattern: /\bacca\b/i },
  { name: "教师资格证", pattern: /教师资格证/i },
  { name: "计算机二级", pattern: /计算机二级|全国计算机等级考试二级/i },
  { name: "证券从业资格", pattern: /证券从业/i },
  { name: "基金从业资格", pattern: /基金从业/i },
  { name: "法律职业资格", pattern: /法律职业资格|法考/i }
];

function normalizeText(text) {
  return String(text || "")
    .normalize("NFKC")
    .replace(/[⻓⻜⻔⻚⻆戶]/g, (character) => ({ "⻓": "长", "⻜": "飞", "⻔": "门", "⻚": "页", "⻆": "角", "戶": "户" })[character])
    .replace(/\u00a0/g, " ")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function cleanLine(line) {
  return String(line || "")
    .normalize("NFKC")
    .replace(/[⻓⻜⻔⻚⻆戶]/g, (character) => ({ "⻓": "长", "⻜": "飞", "⻔": "门", "⻚": "页", "⻆": "角", "戶": "户" })[character])
    .replace(/\s+/g, " ")
    .trim();
}

function stripBullet(line) {
  return cleanLine(line).replace(BULLET_PATTERN, "").trim();
}

function detectHeading(line) {
  const candidate = cleanLine(line)
    .replace(/^[0-9一二三四五六七八九十]+[.、)）]\s*/, "")
    .replace(/[：:]$/, "")
    .toLowerCase();
  if (!candidate || candidate.length > 34) return null;
  for (const [section, aliases] of SECTION_ALIASES) {
    if (aliases.some((alias) => candidate === alias || candidate === `${alias}s`)) return section;
  }
  return null;
}

function segmentText(text) {
  const sections = { personal: [] };
  let current = "personal";
  normalizeText(text).split("\n").forEach((rawLine) => {
    const line = cleanLine(rawLine);
    if (!line) {
      sections[current] ||= [];
      sections[current].push("");
      return;
    }
    const heading = detectHeading(line);
    if (heading) {
      current = heading;
      sections[current] ||= [];
      return;
    }
    sections[current] ||= [];
    sections[current].push(line);
  });
  return sections;
}

function dateTokens(value) {
  const pattern = /(?:19|20)\d{2}(?:(?:[.\/-]|年)\s*(?:1[0-2]|0?[1-9])(?:月)?)?|至今|现在|目前|present|current|now/gi;
  return cleanLine(value).match(pattern) || [];
}

function normalizeMonth(token) {
  const match = String(token).match(/((?:19|20)\d{2})(?:(?:[.\/-]|年)\s*(\d{1,2}))?/);
  if (!match) return "";
  return `${match[1]}-${String(Number(match[2] || 1)).padStart(2, "0")}`;
}

function extractDateRange(value) {
  const tokens = dateTokens(value);
  const numeric = tokens.filter((token) => /\d/.test(token));
  const withMonth = numeric.filter((token) => /[.\/-]\s*\d{1,2}|年\s*\d{1,2}/.test(token));
  const preferred = withMonth.length ? withMonth : numeric;
  const ongoing = tokens.some((token) => /至今|现在|目前|present|current|now/i.test(token));
  return {
    startDate: normalizeMonth(preferred[0]),
    endDate: ongoing ? "" : normalizeMonth(preferred[1])
  };
}

function stripDates(value) {
  const cleaned = cleanLine(value);
  const hasMonthDate = /(?:19|20)\d{2}(?:[.\/-]|年)\s*(?:1[0-2]|0?[1-9])/.test(cleaned);
  let result = cleaned
    .replace(/(?:19|20)\d{2}(?:[.\/-]|年)\s*(?:1[0-2]|0?[1-9])(?:月)?/g, "")
    .replace(/至今|现在|目前|present|current|now/gi, "");
  if (!hasMonthDate) result = result.replace(/(?:19|20)\d{2}/g, "");
  return result.replace(/^[\s|｜·,，;；—–-]+|[\s|｜·,，;；—–-]+$/g, "").trim();
}

function hasEntryDate(value) {
  const tokens = dateTokens(value);
  const monthTokens = tokens.filter((token) => /[.\/-]\s*\d{1,2}|年\s*\d{1,2}/.test(token));
  return monthTokens.length > 0 || tokens.filter((token) => /\d/.test(token)).length > 1 || tokens.some((token) => /至今|现在|目前|present|current|now/i.test(token));
}

function splitBlocks(lines) {
  const meaningful = lines.map(cleanLine);
  const blocks = [];
  let current = [];
  let currentHasDate = false;

  for (const line of meaningful) {
    if (!line) {
      if (current.length && currentHasDate) current.push("");
      continue;
    }
    const hasDate = hasEntryDate(line);
    if (hasDate && currentHasDate) {
      const carry = [];
      const last = current[current.length - 1];
      if (last && !BULLET_PATTERN.test(last) && last.length < 70 && !/[。；;]$/.test(last)) carry.push(current.pop());
      if (current.some(Boolean)) blocks.push(current);
      current = [...carry, line];
    } else {
      current.push(line);
    }
    currentHasDate ||= hasDate;
  }
  if (current.some(Boolean)) blocks.push(current);
  return blocks.length ? blocks : [meaningful.filter(Boolean)];
}

function firstMatchLine(lines, pattern) {
  return lines.find((line) => pattern.test(line)) || "";
}

function cleanEntity(value) {
  const withoutDates = stripDates(stripBullet(value));
  return withoutDates.split(/\s{2,}|[|｜]/)[0].replace(/^[：:]+|[：:]+$/g, "").trim();
}

function headerParts(value) {
  return stripDates(stripBullet(value)).split(/[|｜·]/).map(cleanLine).filter(Boolean);
}

function companyName(value) {
  const cleaned = stripDates(stripBullet(value)).replace(/^(?:公司|单位|雇主)(?:名称)?\s*[：:]\s*/i, "");
  const chinese = cleaned.match(/[\p{Script=Han}A-Za-z0-9（）()&.\-]{2,50}?(?:有限责任公司|股份有限公司|有限公司|公司|集团|银行|事务所|研究院|研究所|实验室|工作室|中心|医院)/u)?.[0];
  if (chinese) return cleanLine(chinese);
  const english = cleaned.match(/[A-Z][A-Za-z0-9&.'\-]*(?:\s+[A-Z][A-Za-z0-9&.'\-]*){0,7}\s+(?:Company|Corporation|Corp\.?|Limited|Ltd\.?|Group|Bank|Studio|Laboratory|Lab\.?|Institute)/)?.[0];
  return cleanLine(english || cleanEntity(value));
}

function descriptionFromBlock(block, excluded = []) {
  const excludedSet = new Set(excluded.filter(Boolean));
  const candidates = block.filter((line) => line && !excludedSet.has(line) && !hasEntryDate(line));
  const paragraphs = [];
  let current = "";
  candidates.forEach((rawLine) => {
    const line = stripBullet(rawLine);
    if (line.length <= 1) return;
    const startsNewPoint = BULLET_PATTERN.test(cleanLine(rawLine)) || /^[^：:]{2,26}[：:]/.test(line);
    if (startsNewPoint && current) {
      paragraphs.push(current);
      current = "";
    }
    if (!current) current = line;
    else {
      const needsSpace = /[A-Za-z0-9)]$/.test(current) && /^[A-Za-z0-9(]/.test(line);
      current += `${needsSpace ? " " : ""}${line}`;
    }
  });
  if (current) paragraphs.push(current);
  return paragraphs.join("\n").slice(0, 5000);
}

function parseEducation(lines) {
  return splitBlocks(lines).map((block) => {
    const joined = block.join(" ");
    const schoolLine = firstMatchLine(block, EDUCATION_PATTERN) || block.find(Boolean) || "";
    const degreeLine = firstMatchLine(block.filter((line) => line !== schoolLine), DEGREE_PATTERN);
    const degreeMatch = joined.match(DEGREE_PATTERN);
    const majorMatch = joined.match(/([\p{Script=Han}A-Za-z][\p{Script=Han}A-Za-z0-9+&（）()\-\s]{1,28})(?:专业|major)/iu)
      || joined.match(/(?:专业|major)\s*[：:]?\s*([\p{Script=Han}A-Za-z][\p{Script=Han}A-Za-z0-9+&（）()\-\s]{1,28})/iu);
    const dates = extractDateRange(joined);
    let major = cleanLine(majorMatch?.[1] || "").split(/[|｜·,，]/).pop();
    if (!major && degreeLine) {
      major = stripDates(degreeLine)
        .replace(DEGREE_PATTERN, "")
        .replace(/全日制|非全日制|美国|中国|上海|北京|广州|深圳|远程/g, "")
        .split(/[|｜·]/)[0]
        .trim();
    }
    const schoolParts = headerParts(schoolLine);
    return {
      school: cleanEntity(schoolLine),
      college: cleanLine(schoolParts.find((part, index) => index > 0 && !dateTokens(part).length) || ""),
      degree: degreeMatch?.[0] || "",
      major,
      studyMode: /非全日制/.test(joined) ? "非全日制" : /全日制/.test(joined) ? "全日制" : "",
      ...dates,
      gpa: joined.match(/(?:GPA|平均绩点)\s*[：:]?\s*([0-9.]+(?:\s*\/\s*[0-9.]+)?)/i)?.[1] || "",
      description: descriptionFromBlock(block, [schoolLine, degreeLine])
    };
  }).filter((record) => record.school || record.description);
}

function cleanJobTitle(value) {
  const cleaned = cleanEntity(value).replace(/(?:北京|上海|广州|深圳|杭州|远程|美国)$/g, "").trim();
  const chinese = cleaned.match(/^.{1,28}?(?:实习生|助理|工程师|经理|主管|总监|顾问|设计师|研究员|分析师|专员|负责人)/)?.[0];
  if (chinese) return cleanLine(chinese);
  return cleaned;
}

function parseProfessional(lines, group) {
  return splitBlocks(lines).map((block) => {
    const joined = block.join(" ");
    const firstHeaderLine = block.find((line) => line && !BULLET_PATTERN.test(line)) || "";
    const companyLine = firstHeaderLine || firstMatchLine(block, COMPANY_PATTERN);
    const company = companyName(companyLine);
    const titleLine = firstMatchLine(block.filter((line) => line !== companyLine && !BULLET_PATTERN.test(line)), JOB_TITLE_PATTERN)
      || block.find((line) => line && line !== companyLine && !BULLET_PATTERN.test(line) && !dateTokens(line).length)
      || "";
    const titleFromCombinedHeader = cleanLine(stripDates(companyLine).replace(company, "").replace(/^[\s|｜·,，;；—–-]+/, ""));
    const title = cleanJobTitle(titleLine || (JOB_TITLE_PATTERN.test(titleFromCombinedHeader) ? titleFromCombinedHeader : ""));
    const locationMatch = joined.match(/(?:地点|城市|location)\s*[：:]?\s*([\p{Script=Han}A-Za-z\s-]{2,24})/iu);
    const inferredLocation = headerParts(titleLine).find((part) => /^(?:北京|上海|广州|深圳|杭州|南京|苏州|成都|武汉|西安|重庆|天津|远程|remote|美国)$/i.test(part));
    return {
      company,
      title,
      location: cleanLine(locationMatch?.[1] || inferredLocation || ""),
      ...extractDateRange(joined),
      description: descriptionFromBlock(block, [companyLine, titleLine]),
      _source: joined,
      _group: group
    };
  }).filter((record) => record.company || record.title || record.description);
}

function parseProject(lines) {
  return splitBlocks(lines).map((block) => {
    const joined = block.join(" ");
    const roleLine = firstMatchLine(block, PROJECT_ROLE_PATTERN);
    const nameLine = block.find((line) => line && line !== roleLine && !BULLET_PATTERN.test(line)) || block.find(Boolean) || "";
    return {
      name: cleanEntity(nameLine),
      role: cleanEntity(roleLine),
      ...extractDateRange(joined),
      description: descriptionFromBlock(block, [nameLine, roleLine])
    };
  }).filter((record) => record.name || record.role || record.description);
}

function parseCampus(lines) {
  return splitBlocks(lines).map((block) => {
    const joined = block.join(" ");
    const roleLine = firstMatchLine(block, CAMPUS_ROLE_PATTERN);
    const combinedParts = headerParts(roleLine);
    const rolePart = combinedParts.find((part) => CAMPUS_ROLE_PATTERN.test(part)) || roleLine;
    const nameFromCombined = combinedParts.find((part) => part !== rolePart && !CAMPUS_ROLE_PATTERN.test(part));
    const nameLine = nameFromCombined || block.find((line) => line && line !== roleLine && !BULLET_PATTERN.test(line) && !dateTokens(line).length)
      || block.find(Boolean)
      || "";
    const locationMatch = joined.match(/(?:地点|location)\s*[：:]?\s*([\p{Script=Han}A-Za-z\s-]{2,24})/iu);
    return {
      name: cleanEntity(nameLine),
      role: cleanEntity(rolePart),
      location: cleanLine(locationMatch?.[1] || ""),
      ...extractDateRange(joined),
      description: descriptionFromBlock(block, [nameLine, roleLine])
    };
  }).filter((record) => record.name || record.role || record.description);
}

function firstRecordDate(value) {
  const token = dateTokens(value).find((item) => /\d/.test(item));
  const month = normalizeMonth(token);
  return month ? `${month}-01` : "";
}

function parseHonor(lines) {
  return splitBlocks(lines).map((block) => {
    const joined = block.join(" ");
    const typeLine = block.find((line) => line && !BULLET_PATTERN.test(line) && !dateTokens(line).length) || "";
    return {
      type: cleanEntity(typeLine),
      date: firstRecordDate(joined),
      description: descriptionFromBlock(block, [typeLine])
    };
  }).filter((record) => record.type || record.description);
}

function parsePublication(lines) {
  return splitBlocks(lines).map((block) => {
    const joined = block.join(" ");
    const titleLine = block.find((line) => line && !BULLET_PATTERN.test(line) && !dateTokens(line).length) || "";
    const authorOrder = joined.match(/(?:第一|第二|第三|共同|通讯)?作者|first author|second author|co-author|corresponding author/i)?.[0] || "";
    const journal = labeledValue(joined, ["刊物", "期刊", "会议", "机构", "journal", "conference"]);
    return {
      title: cleanEntity(titleLine),
      authorOrder,
      publicationDate: firstRecordDate(joined),
      journal,
      description: descriptionFromBlock(block, [titleLine])
    };
  }).filter((record) => record.title || record.description);
}

function parsePatent(lines) {
  return splitBlocks(lines).map((block) => {
    const joined = block.join(" ");
    const nameLine = block.find((line) => line && !BULLET_PATTERN.test(line) && !dateTokens(line).length) || "";
    return {
      type: /软件著作权|软著|software copyright/i.test(joined) ? "软件著作权" : /专利|patent/i.test(joined) ? "专利" : "",
      name: cleanEntity(nameLine),
      registrationNumber: joined.match(/(?:申请号|授权号|登记号|专利号)\s*[：:]?\s*([A-Z0-9.-]{4,})/i)?.[1] || "",
      registrationDate: firstRecordDate(joined),
      inventorRank: joined.match(/(?:第一|第二|第三|共同)?(?:发明人|完成人)|first inventor|second inventor/i)?.[0] || "",
      description: descriptionFromBlock(block, [nameLine])
    };
  }).filter((record) => record.name || record.description);
}

function cleanSkillItem(value) {
  return stripBullet(value)
    .replace(/^(?:技能|专业技能|技术技能|软件技能|工具|数据提取与处理)\s*[：:]\s*/i, "")
    .replace(/^[：:、,，;；\s]+|[：:、,，;；\s]+$/g, "")
    .trim();
}

function splitSkillItems(value) {
  return String(value || "").split(/[、,，;；\n]+/).map(cleanSkillItem).filter(Boolean);
}

function mergeSkillRecords(records) {
  const merged = [];
  records.forEach((record) => {
    if (!record?.type || !record?.name) return;
    const existing = merged.find((item) => item.type === record.type && item.name.toLowerCase() === record.name.toLowerCase());
    if (!existing) {
      merged.push({ type: record.type, name: record.name.slice(0, 240), score: String(record.score || "").slice(0, 1200) });
      return;
    }
    if (record.score && !existing.score.includes(record.score)) existing.score = [existing.score, record.score].filter(Boolean).join("、").slice(0, 1200);
  });
  return merged;
}

function classifySkillRecords(skillsText, languagesText, skillRecordLines = []) {
  const records = [];
  const languageSource = [languagesText, ...skillRecordLines.filter((line) => /语言|英语|日语|韩语|德语|法语|雅思|托福|ielts|toefl|gre|cet|jlpt|topik/i.test(line))].filter(Boolean).join("、");
  LANGUAGE_DEFINITIONS.forEach((definition) => {
    if (!definition.pattern.test(languageSource)) return;
    const scoreParts = splitSkillItems(languageSource).filter((item) => definition.pattern.test(item));
    records.push({ type: "外语语种", name: definition.name, score: (scoreParts.join("、") || languageSource).slice(0, 1200) });
  });

  const rawSkillItems = splitSkillItems([skillsText, ...skillRecordLines].filter(Boolean).join("、"));
  rawSkillItems.forEach((item) => {
    if (LANGUAGE_DEFINITIONS.some((definition) => definition.pattern.test(item))) return;
    const certificates = CERTIFICATE_DEFINITIONS.filter((definition) => definition.pattern.test(item));
    if (certificates.length) {
      certificates.forEach((definition) => records.push({ type: "证书", name: definition.name, score: item === definition.name ? "" : item }));
      return;
    }
    const developmentLanguages = DEVELOPMENT_LANGUAGE_DEFINITIONS.filter((definition) => definition.pattern.test(item));
    if (developmentLanguages.length) {
      developmentLanguages.forEach((definition) => records.push({ type: "开发语言", name: definition.name, score: "" }));
      return;
    }
    const genericCertificate = item.match(/^(?:证书|资格证书)\s*[：:]?\s*(.+)$/i)?.[1];
    if (genericCertificate) records.push({ type: "证书", name: cleanSkillItem(genericCertificate), score: "" });
    else records.push({ type: "其他技能", name: item, score: "" });
  });
  return mergeSkillRecords(records);
}

function labeledValue(text, labels) {
  const labelPart = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  return cleanLine(text.match(new RegExp(`(?:${labelPart})\\s*[：:]\\s*([^\\n|｜]{2,50})`, "i"))?.[1] || "");
}

function inferName(lines, text) {
  const labeled = labeledValue(text, ["姓名", "name"]);
  if (labeled && labeled.length <= 30) return labeled;
  for (const line of lines.slice(0, 24)) {
    const candidate = cleanLine(line);
    if (!candidate || /邮箱|电话|手机|求职|简历|resume|email|phone|tel|@|https?/i.test(candidate)) continue;
    const compactChinese = candidate.replace(/\s+/g, "");
    if (/^[\p{Script=Han}·]{2,5}$/u.test(compactChinese)) return compactChinese;
    if (/^[A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+){1,3}$/.test(candidate)) return candidate;
  }
  return "";
}

function parsePersonal(sections, text) {
  const personalLines = sections.personal?.filter(Boolean) || [];
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
  const phoneCandidate = text.match(/(?:\+?86[\s-]?)?1[3-9](?:[\s-]?\d){9}/)?.[0] || "";
  const compactPhone = phoneCandidate.replace(/[\s-]/g, "");
  const phoneCountryCode = compactPhone ? "+86" : "";
  const phone = compactPhone.replace(/^\+?86(?=1[3-9]\d{9}$)/, "");
  const urls = text.match(/https?:\/\/[^\s|｜，,；;]+/gi) || [];
  const linkedin = urls.find((url) => /linkedin\.com/i.test(url)) || "";
  const github = urls.find((url) => /github\.com/i.test(url)) || "";
  const website = urls.find((url) => url !== linkedin && url !== github) || "";
  const inferredHeadline = personalLines.map(headerParts).flat().find((part) => /数据分析|商业分析|行业研究|产品|运营|开发|设计|市场|销售|求职/i.test(part) && !/毕业/.test(part)) || "";
  const headline = labeledValue(text, ["求职意向", "目标岗位", "期望职位", "position sought", "objective"]) || inferredHeadline;
  const knownCity = personalLines.join(" | ").match(/(?:^|[|｜])\s*(北京|上海|广州|深圳|杭州|南京|苏州|成都|武汉|西安|重庆|天津)\s*(?:$|[|｜])/u)?.[1] || "";
  const city = labeledValue(text, ["现居地", "所在地", "所在城市", "现居城市", "city"]) || knownCity;
  return {
    fullName: inferName(personalLines, text),
    email,
    phone,
    phoneCountryCode,
    city,
    linkedin,
    github,
    website,
    headline,
    summary: (sections.summary || []).filter(Boolean).join("\n").slice(0, 3000)
  };
}

function meaningfulRecord(record) {
  return Object.entries(record).some(([key, value]) => !key.startsWith("_") && String(value || "").trim());
}

function cleanRecords(records) {
  return records.filter(meaningfulRecord).map((record) => Object.fromEntries(Object.entries(record).filter(([key]) => !key.startsWith("_"))));
}

function parseResumeText(rawText) {
  const text = normalizeText(rawText);
  const sections = segmentText(text);
  const profile = ResumeHelperSchema.createEmptyProfile();
  profile.personal = parsePersonal(sections, text);
  profile.education = cleanRecords(parseEducation(sections.education || [])).map((record, index) => ({ ...record, isHighest: index === 0 ? "是" : "否" }));

  const workRecords = parseProfessional(sections.experience || [], "experience");
  const explicitInternships = parseProfessional(sections.internship || [], "internship");
  const internshipsFromWork = workRecords.filter((record) => /实习|intern/i.test(`${record.title} ${record._source}`));
  profile.experience = cleanRecords(workRecords.filter((record) => !internshipsFromWork.includes(record)));
  profile.internship = cleanRecords([...explicitInternships, ...internshipsFromWork]);
  profile.campus = cleanRecords(parseCampus(sections.campus || []));
  profile.project = cleanRecords(parseProject(sections.project || []));
  profile.honor = cleanRecords(parseHonor(sections.honor || []));
  profile.publication = cleanRecords(parsePublication(sections.publication || []));
  profile.patent = cleanRecords(parsePatent(sections.patent || []));
  const additionalText = (sections.additional || []).filter(Boolean).join("\n");
  const skillsText = ((sections.skills || []).filter(Boolean).map(stripBullet).join("，") || labeledValue(additionalText || text, ["技能", "专业技能"])).slice(0, 2500);
  const languagesText = ((sections.languages || []).filter(Boolean).map(stripBullet).join("，") || labeledValue(additionalText || text, ["语言", "语言能力"])).slice(0, 1200);
  profile.additional = {
    skills: skillsText,
    languages: languagesText
  };
  profile.skill = cleanRecords(classifySkillRecords(skillsText, languagesText, (sections.skillRecords || []).filter(Boolean)));

  const warnings = [];
  if (text.length < 80) warnings.push("提取到的文字较少；如果是扫描版 PDF，请换用可复制文字的 PDF 或 DOCX");
  if (!profile.personal.email && !profile.personal.phone) warnings.push("没有识别到邮箱或手机号，请手动补充");
  const detected = {
    "基本信息": Object.values(profile.personal).filter((value) => String(value || "").trim()).length,
    "教育经历": profile.education.length,
    "工作经历": profile.experience.length,
    "实习经历": profile.internship.length,
    "校园经历": profile.campus.length,
    "项目经历": profile.project.length,
    "荣誉奖励": profile.honor.length,
    "论文期刊": profile.publication.length,
    "发明专利": profile.patent.length,
    "语言证书技能": profile.skill.length
  };
  return { profile, detected, warnings, characterCount: text.length };
}

function pageText(items) {
  const positioned = items.map((item) => ({
    value: cleanLine(item.str),
    x: Number(item.transform?.[4] || 0),
    y: Number(item.transform?.[5] || 0),
    width: Number(item.width || 0)
  })).filter((item) => item.value).sort((a, b) => Math.abs(b.y - a.y) > 2.4 ? b.y - a.y : a.x - b.x);

  const rows = [];
  positioned.forEach((item) => {
    const row = rows.find((candidate) => Math.abs(candidate.y - item.y) <= 2.4);
    if (row) {
      row.items.push(item);
      row.y = (row.y * (row.items.length - 1) + item.y) / row.items.length;
    } else rows.push({ y: item.y, items: [item] });
  });
  rows.sort((a, b) => b.y - a.y);

  return rows.map((row) => {
    const sorted = row.items.sort((a, b) => a.x - b.x);
    let line = "";
    let previousEnd = null;
    sorted.forEach((item) => {
      if (line) {
        const gap = item.x - previousEnd;
        if (gap > 18) line += " | ";
        else if (gap > 2.5 || (/[A-Za-z0-9)]$/.test(line) && /^[A-Za-z0-9(]/.test(item.value))) line += " ";
      }
      line += item.value;
      previousEnd = item.x + item.width;
    });
    return cleanLine(line);
  }).filter(Boolean).join("\n");
}

async function extractPdf(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjsLib.getDocument({ data: bytes, isEvalSupported: false });
  const document = await loadingTask.promise;
  const pages = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(pageText(content.items));
    page.cleanup();
  }
  await document.cleanup();
  await loadingTask.destroy();
  return { text: pages.join("\n\n"), pageCount: pages.length, warnings: [] };
}

async function extractDocx(file) {
  if (!globalThis.mammoth?.extractRawText) throw new Error("Word 解析组件尚未加载，请刷新页面后重试");
  const result = await globalThis.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return {
    text: result.value,
    pageCount: null,
    warnings: (result.messages || []).filter((message) => message.type === "warning").slice(0, 2).map(() => "Word 文档包含部分无法识别的格式")
  };
}

async function parseFile(file) {
  if (!file) throw new Error("请选择简历文件");
  if (file.size > 15 * 1024 * 1024) throw new Error("文件超过 15 MB，请压缩后重试");
  const extension = file.name.split(".").pop()?.toLowerCase();
  let extracted;
  if (extension === "pdf" || file.type === "application/pdf") extracted = await extractPdf(file);
  else if (extension === "docx" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") extracted = await extractDocx(file);
  else if (extension === "txt" || file.type === "text/plain") extracted = { text: await file.text(), pageCount: null, warnings: [] };
  else if (extension === "doc") throw new Error("暂不支持旧版 .doc，请在 Word 中另存为 .docx 或 PDF");
  else throw new Error("暂不支持这种文件格式，请选择 PDF、DOCX 或 TXT");

  const parsed = parseResumeText(extracted.text);
  parsed.warnings.push(...extracted.warnings);
  return { ...parsed, pageCount: extracted.pageCount, fileName: file.name };
}

globalThis.ResumeImport = { parseFile, parseText: parseResumeText };
globalThis.dispatchEvent(new CustomEvent("resume-import-ready"));
