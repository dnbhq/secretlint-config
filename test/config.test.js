import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import config from "../config/index.js";

test("exports the recommended Secretlint preset", () => {
  assert.deepEqual(config, {
    rules: [
      {
        id: "@secretlint/secretlint-rule-preset-recommend",
      },
    ],
  });
});

test("keeps the JSON Secretlint rc file aligned with the ESM export", async () => {
  const secretlintrc = JSON.parse(
    await readFile(
      new URL("../config/secretlintrc.json", import.meta.url),
      "utf8",
    ),
  );

  assert.deepEqual(secretlintrc, config);
});
