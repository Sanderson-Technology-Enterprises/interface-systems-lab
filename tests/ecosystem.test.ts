import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

import {
  BUNDLER_IMPORTS,
  CDN_LINKS,
  CDN_MARKUP,
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
  assert.deepEqual(
    ECOSYSTEM_PACKAGES.map(({ version }) => version),
    ["2.1.0", "2.1.0", "1.5.0"],
  );
  assert.equal(
    ECOSYSTEM_PACKAGES.find(({ name }) => name === "layout-style-css")
      ?.attribute,
    'data-ly-layout="bento"',
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
    "npm install ui-style-kit-css@2.1.0 layout-style-css@2.1.0 interactive-surface-css@1.5.0",
  );
  assert.deepEqual(BUNDLER_IMPORTS, [
    '@import "ui-style-kit-css/visual.css";',
    '@import "ui-style-kit-css/interactive-surface-theme.css";',
    '@import "interactive-surface-css/state-core.css";',
    '@import "layout-style-css";',
  ]);
  assert.deepEqual(CDN_LINKS, [
    {
      packageName: "ui-style-kit-css",
      href: "https://cdn.jsdelivr.net/npm/ui-style-kit-css@2.1.0/dist/ui-style-kit.visual.min.css",
    },
    {
      packageName: "ui-style-kit-css",
      href: "https://cdn.jsdelivr.net/npm/ui-style-kit-css@2.1.0/styles/interactive-surface-theme.css",
    },
    {
      packageName: "interactive-surface-css",
      href: "https://cdn.jsdelivr.net/npm/interactive-surface-css@1.5.0/state-core.css",
    },
    {
      packageName: "layout-style-css",
      href: "https://cdn.jsdelivr.net/npm/layout-style-css@2.1.0/dist/layout-style-css.min.css",
    },
  ]);
  assert.equal(
    CDN_MARKUP,
    CDN_LINKS.map(({ href }) => `<link rel="stylesheet" href="${href}">`).join(
      "\n",
    ),
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

  assert.equal(manifest.dependencies["layout-style-css"], "2.1.0");
  assert.equal(manifest.dependencies["ui-style-kit-css"], "2.1.0");
  assert.equal(manifest.dependencies["interactive-surface-css"], "1.5.0");
  assert.match(
    layoutSource,
    /import "ui-style-kit-css\/visual\.css";[\s\S]*import "ui-style-kit-css\/interactive-surface-theme\.css";[\s\S]*import "interactive-surface-css\/state-core\.css";[\s\S]*import "layout-style-css";/,
  );
  assert.doesNotMatch(
    layoutSource,
    /with-bridge|interactive-surface-css\/interactive-surface\.css|layout-style-css\/bridge\.css/,
  );
  assert.doesNotMatch(layoutSource, /CDN_LINKS\.map/);
  assert.match(manifest.scripts.quality, /npm run test:browser/);
});

test("page runtime emits only canonical Layout 2.1 attributes", async () => {
  const pageSource = await readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );

  assert.equal(
    pageSource.match(/\bdata-layout\b/g)?.length ?? 0,
    0,
    "app/page.tsx must not emit the deprecated data-layout attribute",
  );
  assert.match(pageSource, /data-ly-layout=\{lab\.layout\}/);
  assert.match(pageSource, /data-ly-layout="\$\{lab\.layout\}"/);
});

test("package manifest and repository omit the obsolete authoring stack", async () => {
  const manifestSource = await readFile(
    new URL("../package.json", import.meta.url),
    "utf8",
  );
  const manifest = JSON.parse(manifestSource) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const declaredDependencies = {
    ...manifest.dependencies,
    ...manifest.devDependencies,
  };

  assert.equal(declaredDependencies.tailwindcss, undefined);
  assert.equal(declaredDependencies["@tailwindcss/postcss"], undefined);
  assert.equal(declaredDependencies.postcss, undefined);
  await assert.rejects(access(new URL("../.npmrc", import.meta.url)), {
    code: "ENOENT",
  });
  await assert.rejects(
    access(new URL("../postcss.config.mjs", import.meta.url)),
    { code: "ENOENT" },
  );
  assert.doesNotMatch(manifestSource, /legacy-peer-deps/);
});

test("catalog exposes every released ecosystem option", async () => {
  const {
    INTERACTION_LEVELS,
    INTERACTION_VARIANTS,
    LAYOUT_PERSONALITIES,
    LAYOUT_RECIPES,
    UI_MODES,
    UI_PRESETS,
    UI_THEMES,
    getUiPrefix,
  } = await import("../app/data/catalog");

  assert.deepEqual(LAYOUT_PERSONALITIES, [
    "minimal-saas",
    "bauhaus",
    "tactile",
    "cyberpunk",
    "f-pattern",
    "brutalism",
    "neumorphism",
    "y2k",
    "retro-glass",
    "z-pattern",
    "retrofuturism",
    "mondrian",
    "synthwave",
    "bento",
    "maximalist",
    "split-screen",
  ]);
  assert.deepEqual(LAYOUT_RECIPES, [
    "app-shell",
    "dashboard",
    "docs",
    "list-detail",
    "split-hero",
    "gallery",
    "card-grid",
  ]);
  assert.deepEqual(UI_PRESETS, [
    { id: "minimal-saas", label: "Minimal SaaS", prefix: "saas" },
    { id: "bento", label: "Bento UI", prefix: "bento" },
    { id: "maximalist", label: "Maximalist / Playful", prefix: "max" },
    { id: "bauhaus", label: "Bauhaus / Swiss Modern", prefix: "bau" },
    { id: "tactile", label: "Skeuomorphic / Tactile", prefix: "tactile" },
    { id: "neumorphism", label: "Neumorphism", prefix: "neo" },
    { id: "retrofuturism", label: "Retrofuturism", prefix: "retro" },
    { id: "brutalism", label: "Brutalism", prefix: "brutal" },
    { id: "cyberpunk", label: "Cyberpunk", prefix: "cyber" },
    { id: "y2k", label: "Y2K", prefix: "y2k" },
    { id: "retro-glass", label: "Retro Glass", prefix: "rg" },
  ]);
  assert.deepEqual(UI_THEMES, [
    "midnight-gold",
    "ocean-steel",
    "forest-moss",
    "sunset-ember",
    "royal-plum",
    "graphite-cyan",
    "desert-sage",
    "rose-quartz",
    "cyber-lime",
    "arctic-indigo",
  ]);
  assert.deepEqual(UI_MODES, ["light", "dark", "contrast"]);
  assert.deepEqual(INTERACTION_VARIANTS, [
    "primary",
    "secondary",
    "accent",
    "subtle",
    "warning",
    "danger",
  ]);
  assert.deepEqual(INTERACTION_LEVELS, [1, 2, 3]);
  assert.equal(getUiPrefix("minimal-saas"), "saas");
  assert.equal(getUiPrefix("retro-glass"), "rg");
  assert.throws(
    () => getUiPrefix("unknown" as never),
    /Unknown UI preset: unknown/,
  );
});

test("UI catalog values are derived from the published manifest", async () => {
  const [{ UI_MODES, UI_PRESETS, UI_THEMES }, manifestSource] =
    await Promise.all([
      import("../app/data/catalog"),
      readFile(
        new URL(
          "../node_modules/ui-style-kit-css/manifest.json",
          import.meta.url,
        ),
        "utf8",
      ),
    ]);
  const manifest = JSON.parse(manifestSource) as {
    presets: Array<{ id: string; label: string; prefix: string }>;
    themes: string[];
    modes: string[];
  };

  assert.deepEqual(
    UI_PRESETS,
    manifest.presets.map(({ id, label, prefix }) => ({ id, label, prefix })),
  );
  assert.deepEqual(UI_THEMES, manifest.themes);
  assert.deepEqual(UI_MODES, manifest.modes);
});

test("documented package versions match the pinned CDN URLs", () => {
  for (const pkg of ECOSYSTEM_PACKAGES) {
    const cdn = CDN_LINKS.filter(({ packageName }) => packageName === pkg.name);

    assert.notEqual(cdn.length, 0);
    for (const { href } of cdn) {
      assert.ok(href.includes(`${pkg.name}@${pkg.version}`));
    }
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
