import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  BUNDLER_IMPORTS,
  CDN_LINKS,
  ECOSYSTEM_PACKAGES,
  NPM_INSTALL,
} from "../app/data/ecosystem";
import { SITE, withBasePath } from "../app/lib/site";

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

test("site URLs target the GitHub Pages project site", () => {
  assert.equal(SITE.url, "https://foscat.github.io/interface-systems-lab/");
  assert.equal(
    SITE.repository,
    "https://github.com/Foscat/interface-systems-lab",
  );
  assert.equal(
    withBasePath("/site.webmanifest"),
    "/interface-systems-lab/site.webmanifest",
  );
  assert.equal(withBasePath("/"), "/interface-systems-lab/");
});

test("metadata routes opt into static generation for the exported site", async () => {
  const routes = await Promise.all(
    ["robots.ts", "sitemap.ts", "manifest.ts"].map((fileName) =>
      readFile(new URL(`../app/${fileName}`, import.meta.url), "utf8"),
    ),
  );

  for (const route of routes) {
    assert.match(route, /export const dynamic = "force-static";/);
  }
});

test("page components expose approved observatory and resource landmarks", async () => {
  const [observatory, installGuide, directory] = await Promise.all([
    readFile(
      new URL(
        "../app/components/InterfaceObservatory.tsx",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL("../app/components/InstallGuide.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../app/components/LibraryDirectory.tsx", import.meta.url),
      "utf8",
    ),
  ]);

  assert.match(observatory, /Interface Observatory/);
  assert.doesNotMatch(observatory, /signal-bars/);
  assert.match(installGuide, /Install all three/);
  assert.match(directory, /Library resources/);
});
