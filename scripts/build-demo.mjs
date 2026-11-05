import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { prepareDemo } from "./prepare-demo.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const target = path.join(root, "dist/site");
await prepareDemo();
await rm(target, { recursive: true, force: true });
await mkdir(path.join(target, "extension/icons"), { recursive: true });
for (const folder of ["demo", "examples", "docs"]) await cp(path.join(root, folder), path.join(target, folder), { recursive: true });
await cp(path.join(root, "extension"), path.join(target, "extension"), { recursive: true });
await writeFile(path.join(target, "index.html"), '<!doctype html><html lang="en"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=demo/"><title>Resume Refill</title><a href="demo/">Open the interactive demo</a></html>\n');
await writeFile(path.join(target, ".nojekyll"), "");
console.log("Static demo built at dist/site/. Includes fictional data and the filling engine only.");
