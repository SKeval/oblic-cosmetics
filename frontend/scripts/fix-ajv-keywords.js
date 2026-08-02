// Works around a known npm hoisting bug in this dependency tree: the top-level
// `ajv-keywords@5.1.0` (used by schema-utils -> terser-webpack-plugin during
// production builds) declares `ajv@^8` as a peer dependency, but npm hoists an
// incompatible `ajv@6` to the top-level `node_modules/ajv` instead (needed there
// by three OTHER, older `ajv-keywords@3.5.2` instances nested under babel-loader,
// file-loader, and fork-ts-checker-webpack-plugin, which all expect ajv v6).
//
// Neither a blanket nor a version-scoped `overrides` entry resolves this cleanly
// without breaking one side or the other, so instead we give ajv-keywords@5.1.0
// its own private copy of the ajv@8 that schema-utils already ships alongside it,
// leaving the shared top-level ajv@6 untouched for the older consumers.
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "node_modules", "schema-utils", "node_modules", "ajv");
const destDir = path.join(__dirname, "..", "node_modules", "ajv-keywords", "node_modules");
const dest = path.join(destDir, "ajv");

if (!fs.existsSync(src)) {
  console.warn("[fix-ajv-keywords] schema-utils's nested ajv not found, skipping (dependency tree may have changed).");
  process.exit(0);
}
if (fs.existsSync(dest)) {
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
fs.cpSync(src, dest, { recursive: true });
console.log("[fix-ajv-keywords] Gave ajv-keywords@5.1.0 its own ajv@8 copy.");
