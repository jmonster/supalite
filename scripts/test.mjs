// Keep database/WASM process state from accumulating between test files.
const files = [...new Bun.Glob("test/**/*.test.mjs").scanSync({ onlyFiles: true })].sort();
if (files.length === 0) throw new Error("No test files found");

for (const file of files) {
  const child = Bun.spawn([process.execPath, "test", "--bail", "--timeout", "60000", `./${file}`], {
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
  const code = await child.exited;
  if (code !== 0) process.exit(code);
}
console.log(`All ${files.length} test files passed in serial Bun processes.`);
