import assert from "node:assert/strict";
import test from "node:test";

import { collectExportIssues } from "../scripts/verify-export.mjs";

test("the GitHub Pages export satisfies the production SEO contract", async () => {
  const issues = await collectExportIssues();

  assert.deepEqual(issues, []);
});
