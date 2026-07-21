import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test from "node:test";

import { collectExportIssues } from "../scripts/verify-export.mjs";

test("the GitHub Pages export satisfies the production SEO contract", async () => {
  const issues = await collectExportIssues();

  assert.deepEqual(issues, []);
});

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const exportFixtureRoot = path.join(
  repositoryRoot,
  "out",
  "fixtures",
  "generated",
);
const fixtureIds = [
  "layout-only",
  "ui-only",
  "interactive-only",
  "layout-ui",
  "layout-interactive",
  "ui-interactive",
  "all-canonical",
  "all-legacy",
];

test("the Pages artifact contains every isolated integration fixture", async () => {
  const page = await readFile(
    path.join(repositoryRoot, "out", "index.html"),
    "utf8",
  );

  for (const id of fixtureIds) {
    const fixturePath = path.join(exportFixtureRoot, `${id}.html`);
    const fixture = await readFile(fixturePath, "utf8");
    assert.match(
      page,
      new RegExp(
        `src="/interface-systems-lab/fixtures/generated/${id}\\.html"`,
      ),
    );
    assert.doesNotMatch(fixture, /https?:\/\//);

    const stylesheetLinks = Array.from(
      fixture.matchAll(/<link rel="stylesheet" href="([^"]+)">/g),
      (match) => match[1],
    );
    assert.ok(stylesheetLinks.length > 0, id);
    for (const href of stylesheetLinks) {
      assert.match(href, /^\.\/assets\//, `${id}: ${href}`);
      await access(path.resolve(path.dirname(fixturePath), href));
    }
  }
});

test("the package directory links to Pages-prefixed standalone fixtures", async () => {
  const page = await readFile(
    path.join(repositoryRoot, "out", "index.html"),
    "utf8",
  );

  for (const id of ["layout-only", "ui-only", "interactive-only"]) {
    assert.match(
      page,
      new RegExp(
        `data-standalone-fixture="${id}"[^>]+href="/interface-systems-lab/fixtures/generated/${id}\\.html"`,
      ),
    );
  }
});

test("the legacy artifact retains its local relative Layout core import", async () => {
  const legacyPath = path.join(
    exportFixtureRoot,
    "assets",
    "layout-style-css",
    "2.1.0",
    "legacy.css",
  );
  const legacy = await readFile(legacyPath, "utf8");
  assert.match(legacy, /@import url\("\.\/layout-style-css\.css"\);/);
  await access(path.join(path.dirname(legacyPath), "layout-style-css.css"));
});
