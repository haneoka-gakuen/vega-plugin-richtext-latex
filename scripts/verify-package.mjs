import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
if (!manifest.repository?.url?.endsWith("/vega-plugin-richtext-latex.git")) {
  throw new Error("package repository must point to the independent LaTeX plugin repository");
}
if (manifest.publishConfig?.access !== "public" || manifest.publishConfig?.provenance !== true) {
  throw new Error("public provenance publishing is required");
}
if (!manifest.vega?.formats?.includes("latex")) {
  throw new Error("LaTeX format metadata is required");
}
process.stdout.write("LaTeX rich-text package boundary verified\n");
