#!/usr/bin/env node
// Assemble a pr-atlas index.html from a manifest.json, then rebuild the
// .pr-atlas landing page listing every sibling PR folder that has a manifest.
//
//   node assemble.mjs <manifest.json> [output.html]
//
// Default output is index.html next to the manifest. Templates live in
// ../assets/ relative to this script. Artifact paths in the manifest are
// relative to the manifest's directory and are checked on disk.

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = join(here, "..", "assets", "shell-template.html");
const LANDING_TEMPLATE = join(here, "..", "assets", "landing-template.html");

const [manifestPath, outPath] = process.argv.slice(2);
if (!manifestPath) {
  console.error("usage: node assemble.mjs <manifest.json> [output.html]");
  process.exit(2);
}

const manifestAbs = resolve(manifestPath);
const manifestDir = dirname(manifestAbs);
const out = outPath ? resolve(outPath) : join(manifestDir, "index.html");

const manifest = JSON.parse(readFileSync(manifestAbs, "utf8"));
if (!Array.isArray(manifest.artifacts) || manifest.artifacts.length === 0) {
  console.error("manifest has no artifacts");
  process.exit(1);
}

// Figure first, then the rest in manifest order.
const order = manifest.artifacts
  .map((a, i) => ({ ...a, _i: i }))
  .sort((a, b) => (b.kind === "figure") - (a.kind === "figure") || a._i - b._i);

const warnings = [];
for (const a of order) {
  if (!a.path || !existsSync(join(manifestDir, a.path))) {
    warnings.push(`missing artifact file: ${a.id || "?"} -> ${a.path || "(no path)"}`);
  }
}

const title = manifest.pr?.title
  ? `PR Atlas — ${manifest.pr.title}`
  : "PR Atlas";

const inline = (obj) => JSON.stringify(obj).replace(/</g, "\\u003c"); // safe inside <script>

let html = readFileSync(TEMPLATE, "utf8");
html = html
  .replace("__PR_ATLAS_DATA__", inline({ pr: manifest.pr || {}, artifacts: order }))
  .replaceAll("__PR_ATLAS_TITLE__", title.replace(/[&<>]/g, ""));

writeFileSync(out, html);
console.log(`wrote ${out}`);
console.log(`artifacts: ${order.map((a) => a.id).join(", ")}`);

// --- Landing page over every sibling folder that carries a manifest ---------
// Layout: <repo>/.pr-atlas/pr-<n>/manifest.json -> landing at <repo>/.pr-atlas/index.html
const atlasRoot = dirname(manifestDir);
const entries = [];
for (const name of readdirSync(atlasRoot, { withFileTypes: true })) {
  if (!name.isDirectory()) continue;
  const mp = join(atlasRoot, name.name, "manifest.json");
  if (!existsSync(mp)) continue;
  try {
    const m = JSON.parse(readFileSync(mp, "utf8"));
    entries.push({
      dir: name.name,
      pr: m.pr || {},
      views: (m.artifacts || []).map((a) => a.title).filter(Boolean),
    });
  } catch {
    warnings.push(`unreadable manifest: ${mp}`);
  }
}
entries.sort((a, b) => (b.pr.number || 0) - (a.pr.number || 0));

if (entries.length) {
  const sample = entries.find((e) => e.pr.url)?.pr.url || "";
  const m = sample.match(/^(https?:\/\/[^/]+\/[^/]+\/[^/]+)/);
  const repo = m ? m[1].replace(/^https?:\/\//, "") : basename(dirname(atlasRoot));
  let landing = readFileSync(LANDING_TEMPLATE, "utf8");
  landing = landing
    .replace("__PR_ATLAS_LANDING__", inline({ repo, entries }))
    .replaceAll("__PR_ATLAS_TITLE__", `PR Atlas — ${repo}`);
  const landingPath = join(atlasRoot, "index.html");
  writeFileSync(landingPath, landing);
  console.log(`wrote ${landingPath} (${entries.length} walkthrough${entries.length === 1 ? "" : "s"})`);
}

for (const w of warnings) console.warn(`warning: ${w}`);
if (warnings.length) process.exitCode = 1;
