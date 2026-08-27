#!/usr/bin/env node

import { fileURLToPath } from "node:url";

const bundledConfigPath = fileURLToPath(
  new URL("../config/secretlintrc.json", import.meta.url),
);
const originalArgv = process.argv;

function hasConfigArgument(args) {
  return args.some(
    (arg) =>
      arg === "--secretlintrc" ||
      arg.startsWith("--secretlintrc=") ||
      arg === "--secretlintrcJSON" ||
      arg.startsWith("--secretlintrcJSON="),
  );
}

async function main() {
  try {
    const userArgs = originalArgv.slice(2);
    const effectiveArgs = hasConfigArgument(userArgs)
      ? userArgs
      : ["--secretlintrc", bundledConfigPath, ...userArgs];

    // secretlint/cli parses process.argv when the module is loaded.
    process.argv = [originalArgv[0], originalArgv[1], ...effectiveArgs];

    const { cli, run } = await import("secretlint/cli");
    const { exitStatus, stderr, stdout } = await run(cli.input, cli.flags);

    if (stdout) {
      process.stdout.write(`${stdout}\n`);
    }

    if (stderr) {
      process.stderr.write(`${stderr}\n`);
    }

    process.exitCode = exitStatus;
  } catch (error) {
    const message =
      error instanceof Error ? (error.stack ?? error.message) : String(error);
    process.stderr.write(`dnb-secretlint: ${message}\n`);
    process.exitCode = 2;
  } finally {
    process.argv = originalArgv;
  }
}

await main();
