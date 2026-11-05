import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));

export function renderSurface(source) {
  const assets = source.replace(/(src|href)="(?!https?:|data:|#)([^"]+)"/g, '$1="../extension/$2"');
  return '<!-- Generated from the original extension HTML by scripts/prepare-demo.mjs. -->\n' + assets.replace('</head>', '  <link rel="stylesheet" href="surface.css">\n    <script src="extension-adapter.js"></script>\n  </head>');
}

export function renderDemoEngine(source) {
  const writeAnchor = '  async function setNativeValue(element, value, key, adapter = controlType(element)) {';
  const planAnchor = '        const passMatches = buildFillPlan(message.profile || {});';
  for (const anchor of [writeAnchor, planAnchor]) {
    if (source.split(anchor).length !== 2) throw new Error("The extension changed: review the demo pacing adapter before generating it.");
  }
  const wrapper = `  // Demo-only await points. The original extension file remains unchanged.
  async function setNativeValue(element, value, key, adapter = controlType(element)) {
    const pacing = globalThis.ResumeRefillDemoPacing;
    await pacing?.beforeWrite({ element, key, adapter });
    const result = await setNativeValueWithoutDemoPacing(element, value, key, adapter);
    await pacing?.afterWrite({ element, key, adapter, success: result });
    return result;
  }

  async function setNativeValueWithoutDemoPacing(element, value, key, adapter = controlType(element)) {`;
  const orderedPlan = `${planAnchor}
        if (globalThis.ResumeRefillDemoPacing?.active) passMatches.sort((a, b) => {
          if (a.element === b.element) return 0;
          return a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
        });`;
  return '// Generated from extension/content.js with demo-only pacing and visual field order.\n' + source.replace(writeAnchor, wrapper).replace(planAnchor, orderedPlan);
}

export async function prepareDemo() {
  for (const name of ["popup", "options"]) {
    const source = await readFile(path.join(root, "extension", `${name}.html`), "utf8");
    await writeFile(path.join(root, "demo", `${name}.html`), renderSurface(source));
  }
  const content = await readFile(path.join(root, "extension/content.js"), "utf8");
  await writeFile(path.join(root, "demo/fill-engine.js"), renderDemoEngine(content));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await prepareDemo();
