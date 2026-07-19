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
    ["ui-style-kit-css", "interactive-surface-css", "layout-style-css"],
  );
});

test("site consumes the CSS libraries as local dependencies", async () => {
  const [manifestSource, layoutSource] = await Promise.all([
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);
  const manifest = JSON.parse(manifestSource) as {
    dependencies: Record<string, string>;
    scripts: Record<string, string>;
  };

  assert.equal(manifest.dependencies["layout-style-css"], "1.1.2");
  assert.equal(manifest.dependencies["ui-style-kit-css"], "2.0.3");
  assert.equal(manifest.dependencies["interactive-surface-css"], "1.3.0");
  assert.match(
    layoutSource,
    /import "ui-style-kit-css\/with-bridge\.css";[\s\S]*import "interactive-surface-css\/interactive-surface\.css";[\s\S]*import "layout-style-css\/bridge\.css";[\s\S]*import "layout-style-css";/,
  );
  assert.doesNotMatch(layoutSource, /CDN_LINKS\.map/);
  assert.match(manifest.scripts.quality, /npm run test:browser/);
});

test("documented package versions match the pinned CDN URLs", () => {
  for (const pkg of ECOSYSTEM_PACKAGES) {
    const cdn = CDN_LINKS.find(({ packageName }) => packageName === pkg.name);

    assert.ok(cdn);
    assert.match(cdn.href, new RegExp(`${pkg.name}@${pkg.version}`));
  }
});

test("site URLs target the GitHub Pages project site", () => {
  assert.equal(SITE.url, "https://foscat.github.io/interface-systems-lab/");
  assert.equal(
    SITE.repository,
    "https://github.com/Foscat/interface-systems-lab",
  );
  assert.equal(SITE.owner.name, "Sanderson Technology Enterprises");
  assert.equal(SITE.brandLogoPath, "logo-master.png");
  assert.equal(
    SITE.brandLogo,
    "https://foscat.github.io/interface-systems-lab/logo-master.png",
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
  const [page, observatory, installGuide, directory, featureShowcase] =
    await Promise.all([
      readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
      readFile(
        new URL("../app/components/InterfaceObservatory.tsx", import.meta.url),
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
      readFile(
        new URL("../app/components/FeatureShowcase.tsx", import.meta.url),
        "utf8",
      ),
    ]);

  assert.match(observatory, /Interface Observatory/);
  assert.doesNotMatch(observatory, /signal-bars/);
  assert.match(installGuide, /Install all three/);
  assert.match(directory, /Library resources/);
  assert.match(featureShowcase, /Library proof cards/);
  assert.match(featureShowcase, /Structure proof/);
  assert.match(featureShowcase, /Identity proof/);
  assert.match(featureShowcase, /Behavior proof/);
  assert.match(page, /brand-logo/);
  assert.match(page, /SITE\.productLine/);
  assert.match(page, /SITE\.brandLogoPath/);
  assert.doesNotMatch(observatory, />\s*Inspect\s*</);
});

test("local CSS owns the observatory without retaining the audio meter", async () => {
  const css = await readFile(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );

  assert.match(css, /\.observatory-stage/);
  assert.match(css, /@keyframes orbit/);
  assert.doesNotMatch(css, /\.signal-bars/);
  assert.match(css, /prefers-reduced-motion/);
});
