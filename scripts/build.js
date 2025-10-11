#!/usr/bin/env node

const { execSync } = require("child_process");
const { join } = require("path");

for (const dir of ["tree-sitter-pandoc-markdown", "tree-sitter-pandoc-markdown-inline"]) {
  console.log(`building ${dir}`);
  execSync("tree-sitter generate --abi=14 --no-bindings", {
    stdio: "inherit",
    cwd: join(__dirname, "..", dir)
  });
}
