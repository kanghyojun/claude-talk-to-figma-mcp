#!/usr/bin/env node

import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const emptyModulePlugin = {
  name: "empty-figma-typing-imports",
  setup(builder) {
    builder.onResolve({ filter: /^@figma\/plugin-typings$/ }, () => ({
      path: "@figma/plugin-typings",
      namespace: "empty-module",
    }));

    builder.onLoad({ filter: /.*/, namespace: "empty-module" }, () => ({
      contents: "",
      loader: "js",
    }));
  },
};

const figmaToCodeWorkspacePlugin = {
  name: "figma-to-code-workspace-aliases",
  setup(builder) {
    builder.onResolve({ filter: /^types$/ }, () => ({
      path: path.join(repoRoot, "FigmaToCode/packages/types/src/index.ts"),
    }));
  },
};

const adapterBuild = await build({
  entryPoints: [path.join(repoRoot, "src/claude_mcp_plugin/figma-to-code-adapter.js")],
  bundle: true,
  format: "iife",
  globalName: "figmaToCodeAdapter",
  target: "es2017",
  platform: "browser",
  legalComments: "none",
  sourcemap: false,
  tsconfigRaw: {
    compilerOptions: {
      target: "ES2017",
      module: "ESNext",
      moduleResolution: "bundler",
    },
  },
  write: false,
  plugins: [emptyModulePlugin, figmaToCodeWorkspacePlugin],
});

const adapterCode = adapterBuild.outputFiles[0].text;
const pluginCode = await readFile(path.join(repoRoot, "src/claude_mcp_plugin/code.js"), "utf8");

await writeFile(
  path.join(repoRoot, "src/claude_mcp_plugin/code.bundle.js"),
  `${adapterCode}\n\n${pluginCode}`,
);

console.log("Built src/claude_mcp_plugin/code.bundle.js");
