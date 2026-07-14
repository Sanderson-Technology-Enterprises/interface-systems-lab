import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  BUNDLER_IMPORTS,
  CDN_LINKS,
  ECOSYSTEM_PACKAGES,
  NPM_INSTALL,
} from "../app/data/ecosystem";

const expectedNames = [
  "layout-style-css",
  "ui-style-kit-css",
  "interactive-surface-css",
];

test("registry exposes every package and resource in ecosystem order", () => {
  assert.deepEqual(
    ECOSYSTEM_PACKAGES.map(({ name }) => name),
    expectedNames,
  );

  for (const pkg of ECOSYSTEM_PACKAGES) {
    assert.deepEqual(Object.keys(pkg.links), [
      "repository",
      "wiki",
      "npm",
      "demo",
    ]);
    for (const url of Object.values(pkg.links)) {
      assert.match(url, /^https:\/\//);
    }
  }
});

test("installation examples pin approved versions and cascade order", () => {
  assert.equal(
    NPM_INSTALL,
    "npm install layout-style-css@1.1.2 ui-style-kit-css@2.0.3 interactive-surface-css@1.3.0",
  );
  assert.deepEqual(BUNDLER_IMPORTS, [
    '@import "ui-style-kit-css/with-bridge.css";',
    '@import "interactive-surface-css/interactive-surface.css";',
    '@import "layout-style-css/bridge.css";',
    '@import "layout-style-css";',
  ]);
  assert.deepEqual(
    CDN_LINKS.map(({ packageName }) => packageName),
    [
      "ui-style-kit-css",
      "interactive-surface-css",
      "layout-style-css",
    ],
  );
});

test("documented package versions match installed package manifests", async () => {
  for (const pkg of ECOSYSTEM_PACKAGES) {
    const manifest = JSON.parse(
      await readFile(
        new URL(`../node_modules/${pkg.name}/package.json`, import.meta.url),
        "utf8",
      ),
    ) as { version: string };

    assert.equal(manifest.version, pkg.version);
  }
});
