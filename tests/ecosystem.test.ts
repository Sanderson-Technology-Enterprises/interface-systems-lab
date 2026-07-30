import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  ADOPTION_PATHS,
  BUNDLER_IMPORTS,
  CDN_LINKS,
  CDN_MARKUP,
  ECOSYSTEM_PACKAGES,
  NPM_INSTALL,
} from "../app/data/ecosystem";
import {
  absoluteSiteAsset,
  buildVerificationMetadata,
  SITE,
  withBasePath,
} from "../app/lib/site";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));

test("UiIcon owns the typed custom-element and asset-base contract", () => {
  const source = readFileSync(
    path.join(repositoryRoot, "app", "components", "UiIcon.tsx"),
    "utf8",
  );

  assert.match(source, /import "ui-style-kit-icons\/element"/);
  assert.match(source, /React\.createElement\("usk-icon"/);
  assert.match(source, /NEXT_PUBLIC_PAGES_BASE_PATH/);
  assert.match(source, /decorative: true/);
  assert.match(source, /label: string/);
});

async function readShippingSources(directory: URL): Promise<string[]> {
  const sources: string[] = [];
  const supportedExtensions =
    /\.(?:json|md|mjs|ts|tsx|txt|webmanifest|xml|ya?ml)$/;

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === "generated") continue;
    const entryUrl = new URL(
      `${encodeURIComponent(entry.name)}${entry.isDirectory() ? "/" : ""}`,
      directory,
    );

    if (entry.isDirectory()) {
      sources.push(...(await readShippingSources(entryUrl)));
    } else if (supportedExtensions.test(entry.name)) {
      sources.push(await readFile(entryUrl, "utf8"));
    }
  }

  return sources;
}

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

test("adoption paths cover every standalone, pair, canonical, and legacy fixture", () => {
  assert.deepEqual(
    ADOPTION_PATHS.map(({ id }) => id),
    [
      "layout-only",
      "ui-only",
      "interactive-only",
      "layout-ui",
      "layout-interactive",
      "ui-interactive",
      "all-canonical",
      "all-legacy",
    ],
  );
  assert.deepEqual(
    ADOPTION_PATHS.reduce<Record<string, number>>((counts, path) => {
      counts[path.scope] = (counts[path.scope] ?? 0) + 1;
      return counts;
    }, {}),
    { one: 3, pair: 3, all: 1, legacy: 1 },
  );

  const uiVisualCdn =
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ui-style-kit-css@2.1.0/dist/ui-style-kit.visual.min.css">';
  const uiThemeCdn =
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ui-style-kit-css@2.1.0/styles/interactive-surface-theme.css">';
  const uiLegacyCdn =
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ui-style-kit-css@2.1.0/dist/ui-style-kit.with-bridge.min.css">';
  const interactionCoreCdn =
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/interactive-surface-css@1.5.0/state-core.css">';
  const interactionStandaloneCdn =
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/interactive-surface-css@1.5.0/standalone-preset.css">';
  const interactionLegacyCdn =
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/interactive-surface-css@1.5.0/interactive-surface.css">';
  const layoutCdn =
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/layout-style-css@2.1.0/dist/layout-style-css.min.css">';
  const layoutBridgeCdn =
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/layout-style-css@2.1.0/dist/integrations/ui-style-kit.css">';
  const layoutLegacyCdn =
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/layout-style-css@2.1.0/dist/legacy.css">';
  const expectedMatrix = {
    "layout-only": {
      packages: ["layout-style-css"],
      snippets: [
        "npm install layout-style-css@2.1.0",
        '@import "layout-style-css";',
        layoutCdn,
      ],
    },
    "ui-only": {
      packages: ["ui-style-kit-css"],
      snippets: [
        "npm install ui-style-kit-css@2.1.0",
        '@import "ui-style-kit-css/visual.css";',
        uiVisualCdn,
      ],
    },
    "interactive-only": {
      packages: ["interactive-surface-css"],
      snippets: [
        "npm install interactive-surface-css@1.5.0",
        '@import "interactive-surface-css/standalone-preset.css";',
        interactionStandaloneCdn,
      ],
    },
    "layout-ui": {
      packages: ["ui-style-kit-css", "layout-style-css"],
      snippets: [
        "npm install ui-style-kit-css@2.1.0 layout-style-css@2.1.0",
        [
          '@import "ui-style-kit-css/visual.css";',
          '@import "layout-style-css";',
        ].join("\n"),
        [uiVisualCdn, layoutCdn].join("\n"),
      ],
    },
    "layout-interactive": {
      packages: ["interactive-surface-css", "layout-style-css"],
      snippets: [
        "npm install interactive-surface-css@1.5.0 layout-style-css@2.1.0",
        [
          '@import "interactive-surface-css/standalone-preset.css";',
          '@import "layout-style-css";',
        ].join("\n"),
        [interactionStandaloneCdn, layoutCdn].join("\n"),
      ],
    },
    "ui-interactive": {
      packages: ["ui-style-kit-css", "interactive-surface-css"],
      snippets: [
        "npm install ui-style-kit-css@2.1.0 interactive-surface-css@1.5.0",
        [
          '@import "ui-style-kit-css/visual.css";',
          '@import "ui-style-kit-css/interactive-surface-theme.css";',
          '@import "interactive-surface-css/state-core.css";',
        ].join("\n"),
        [uiVisualCdn, uiThemeCdn, interactionCoreCdn].join("\n"),
      ],
    },
    "all-canonical": {
      packages: [
        "ui-style-kit-css",
        "interactive-surface-css",
        "layout-style-css",
      ],
      snippets: [NPM_INSTALL, BUNDLER_IMPORTS.join("\n"), CDN_MARKUP],
    },
    "all-legacy": {
      packages: [
        "ui-style-kit-css",
        "interactive-surface-css",
        "layout-style-css",
      ],
      snippets: [
        NPM_INSTALL,
        [
          '@import "ui-style-kit-css/with-bridge.css";',
          '@import "interactive-surface-css/interactive-surface.css";',
          '@import "layout-style-css/integrations/ui-style-kit.css";',
          '@import "layout-style-css/legacy.css";',
        ].join("\n"),
        [
          uiLegacyCdn,
          interactionLegacyCdn,
          layoutBridgeCdn,
          layoutLegacyCdn,
        ].join("\n"),
      ],
    },
  } as const;

  for (const path of ADOPTION_PATHS) {
    const expected = expectedMatrix[path.id];
    assert.deepEqual(path.packages, expected.packages, path.id);
    assert.deepEqual(
      path.snippets.map(({ format }) => format),
      ["npm", "bundler", "cdn"],
      path.id,
    );
    assert.deepEqual(
      path.snippets.map(({ code }) => code),
      expected.snippets,
      path.id,
    );
    for (const snippet of path.snippets) {
      assert.doesNotMatch(snippet.code, /\blatest\b/i, path.id);
    }
    for (const packageName of path.packages) {
      const packageVersion = ECOSYSTEM_PACKAGES.find(
        (candidate) => candidate.name === packageName,
      )?.version;
      assert.ok(packageVersion, packageName);
      assert.match(
        path.snippets[0].code,
        new RegExp(`${packageName}@${packageVersion}`),
      );
    }
  }
});

test("canonical adoption preserves ownership while legacy imports stay quarantined", () => {
  const canonical = ADOPTION_PATHS.find(({ id }) => id === "all-canonical");
  const legacy = ADOPTION_PATHS.find(({ id }) => id === "all-legacy");
  assert.ok(canonical);
  assert.ok(legacy);

  assert.equal(canonical.deprecated, false);
  assert.equal(legacy.deprecated, true);
  assert.equal(canonical.snippets[0].title, "Install all three");
  assert.equal(canonical.snippets[1].code, BUNDLER_IMPORTS.join("\n"));
  assert.equal(canonical.snippets[2].code, CDN_MARKUP);

  const deprecatedImports =
    /with-bridge|interactive-surface\.css|integrations\/ui-style-kit|legacy\.css|data-layout/;
  for (const path of ADOPTION_PATHS.filter(({ deprecated }) => !deprecated)) {
    assert.doesNotMatch(
      path.snippets.map(({ code }) => code).join("\n"),
      deprecatedImports,
      path.id,
    );
  }
  assert.match(legacy.snippets[1].code, /ui-style-kit-css\/with-bridge\.css/);
  assert.match(
    legacy.snippets[1].code,
    /interactive-surface-css\/interactive-surface\.css/,
  );
  assert.match(
    legacy.snippets[1].code,
    /layout-style-css\/integrations\/ui-style-kit\.css/,
  );
  assert.match(legacy.snippets[1].code, /layout-style-css\/legacy\.css/);
});

test("package directory exposes independent entrypoints and fixture anchors", () => {
  assert.deepEqual(
    ECOSYSTEM_PACKAGES.map(({ name, recommendedEntryPoint, fixture }) => ({
      fixture,
      name,
      recommendedEntryPoint,
    })),
    [
      {
        fixture: "layout-only",
        name: "layout-style-css",
        recommendedEntryPoint: "layout-style-css",
      },
      {
        fixture: "ui-only",
        name: "ui-style-kit-css",
        recommendedEntryPoint: "ui-style-kit-css/visual.css",
      },
      {
        fixture: "interactive-only",
        name: "interactive-surface-css",
        recommendedEntryPoint: "interactive-surface-css/standalone-preset.css",
      },
    ],
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
  const [pageSource, experienceSource, configurationSource] = await Promise.all(
    [
      readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
      readFile(
        new URL("../app/components/LabExperience.tsx", import.meta.url),
        "utf8",
      ),
      readFile(new URL("../app/lib/configuration.ts", import.meta.url), "utf8"),
    ],
  );
  const runtimeSource = `${pageSource}\n${experienceSource}\n${configurationSource}`;

  assert.equal(
    runtimeSource.match(/\bdata-layout\b/g)?.length ?? 0,
    0,
    "the configuration runtime must not emit the deprecated data-layout attribute",
  );
  assert.match(pageSource, /<LabExperience>/);
  assert.match(experienceSource, /data-ly-layout=\{configuration\.layout\}/);
  assert.match(
    configurationSource,
    /data-ly-layout="\$\{configuration\.layout\}"/,
  );
});

test("install guide tracks restartable copy timers and cleans them on unmount", async () => {
  const installGuideSource = await readFile(
    new URL("../app/components/InstallGuide.tsx", import.meta.url),
    "utf8",
  );

  assert.match(
    installGuideSource,
    /useRef<Map<SnippetId, number>>\(new Map\(\)\)/,
  );
  assert.match(
    installGuideSource,
    /copyTimeoutsRef\.current\.get\(id\)[\s\S]*window\.clearTimeout\(existingTimeout\)/,
  );
  assert.match(
    installGuideSource,
    /const copyTimeouts = copyTimeoutsRef\.current;[\s\S]*return \(\) => \{[\s\S]*copyTimeouts\.values\(\)[\s\S]*window\.clearTimeout\(timeoutId\)[\s\S]*copyTimeouts\.clear\(\)/,
  );
});

test("not-found primary action declares its documented surface level", async () => {
  const notFoundSource = await readFile(
    new URL("../app/not-found.tsx", import.meta.url),
    "utf8",
  );

  assert.match(
    notFoundSource,
    /data-surface-variant="primary"\s+data-surface-level="2"/,
  );
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

test("quality runs every source, fixture, export, and browser gate", async () => {
  const manifestSource = await readFile(
    new URL("../package.json", import.meta.url),
    "utf8",
  );
  const manifest = JSON.parse(manifestSource) as {
    scripts: Record<string, string>;
  };

  const requiredCommands = [
    "npm run format:check",
    "npm run lint",
    "npm run typecheck",
    "npm run test:unit",
    "npm run test:fixtures",
    "npm run build:pages",
    "npm run test:export",
    "npm run test:browser",
  ];
  let previousCommandIndex = -1;
  for (const command of requiredCommands) {
    const commandIndex = manifest.scripts.quality.indexOf(
      command,
      previousCommandIndex + 1,
    );
    assert.ok(commandIndex > previousCommandIndex, command);
    previousCommandIndex = commandIndex;
  }
});

test("Pages workflow verifies the complete artifact before non-PR deployment", async () => {
  const workflow = await readFile(
    new URL("../.github/workflows/deploy-pages.yml", import.meta.url),
    "utf8",
  );

  assert.match(workflow, /^\s*run: npm ci\s*$/m);
  assert.doesNotMatch(workflow, /legacy-peer-deps/);
  assert.match(workflow, /^\s*run: npm run fixtures:build\s*$/m);
  assert.match(
    workflow,
    /^\s*run: npx playwright install --with-deps chromium firefox webkit\s*$/m,
  );
  assert.match(workflow, /^\s*path: out\s*$/m);
  assert.match(
    workflow,
    /- name: Upload verified Pages artifact\s+if: github\.event_name != 'pull_request' && github\.ref == 'refs\/heads\/main'[\s\S]*?path: out/,
  );
  assert.match(
    workflow,
    /deploy:\s+name: Deploy GitHub Pages\s+if: github\.event_name != 'pull_request' && github\.ref == 'refs\/heads\/main'\s+needs: verify/,
  );
  assert.match(
    workflow,
    /concurrency:\s+group: \$\{\{ github\.event_name == 'pull_request' && format\('verify-pr-\{0\}', github\.event\.pull_request\.number\) \|\| 'pages' \}\}\s+cancel-in-progress: true/,
  );
  const mainDeploymentGuard =
    "if: github.event_name != 'pull_request' && github.ref == 'refs/heads/main'";
  assert.equal(workflow.split(mainDeploymentGuard).length - 1, 2);
  const verifyTimeout = Number(
    workflow.match(/verify:[\s\S]*?timeout-minutes:\s*(\d+)/)?.[1],
  );
  assert.ok(verifyTimeout >= 30, `verify timeout was ${verifyTimeout}`);

  const fixtureStep = workflow.indexOf("run: npm run fixtures:build");
  const browserStep = workflow.indexOf(
    "run: npx playwright install --with-deps chromium firefox webkit",
  );
  const qualityStep = workflow.indexOf("run: npm run quality");
  assert.ok(fixtureStep >= 0);
  assert.ok(browserStep > fixtureStep);
  assert.ok(qualityStep > browserStep);
});

test("Playwright keeps exhaustive Chromium and tagged cross-engine projects", async () => {
  const config = (await import("../playwright.config")).default;
  const projects = config.projects ?? [];
  const byName = new Map(projects.map((project) => [project.name, project]));
  assert.equal(projects.length, 4);

  for (const project of [
    "desktop-chromium",
    "mobile-chromium",
    "desktop-firefox",
    "desktop-webkit",
  ]) {
    assert.ok(byName.has(project), project);
  }
  for (const project of ["desktop-chromium", "mobile-chromium"]) {
    assert.equal(byName.get(project)?.grep, undefined, `${project} grep`);
  }
  for (const project of projects) {
    assert.equal(project.grepInvert, undefined, `${project.name} grepInvert`);
  }
  for (const [project, browser] of [
    ["desktop-chromium", "chromium"],
    ["mobile-chromium", "chromium"],
    ["desktop-firefox", "firefox"],
    ["desktop-webkit", "webkit"],
  ] as const) {
    assert.equal(byName.get(project)?.use?.defaultBrowserType, browser);
  }
  for (const project of ["desktop-firefox", "desktop-webkit"]) {
    assert.equal(String(byName.get(project)?.grep), "/@cross-engine/");
  }
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

test("site identity targets the transferred organization", () => {
  const site = SITE as unknown as {
    basePath: string;
    brandLogo: string;
    brandLogoPath: string;
    origin: string;
    owner: {
      description: string;
      github: string;
      image: string;
      logo: string;
      name: string;
      organizationId: string;
      slogan: string;
      title: string;
      url: string;
    };
    repository: string;
    socialImage: string;
    socialImageAlt: string;
    url: string;
  };

  assert.equal(site.basePath, "/interface-systems-lab");
  assert.equal(
    site.origin,
    "https://sanderson-technology-enterprises.github.io",
  );
  assert.equal(
    site.url,
    "https://sanderson-technology-enterprises.github.io/interface-systems-lab/",
  );
  assert.equal(
    site.repository,
    "https://github.com/Sanderson-Technology-Enterprises/interface-systems-lab",
  );
  assert.equal(
    site.socialImage,
    "https://sanderson-technology-enterprises.github.io/interface-systems-lab/interface-systems-lab-social-card.png",
  );
  assert.equal(
    site.socialImageAlt,
    "Interface Systems Lab graphic showing 3 libraries, 1 interface, and 5,280 possibilities across layout, identity, and interaction.",
  );
  assert.equal(site.brandLogoPath, "android-chrome-512x512.png");
  assert.equal(
    site.brandLogo,
    "https://sanderson-technology-enterprises.github.io/interface-systems-lab/android-chrome-512x512.png",
  );
  const requiredOwnerIdentity = {
    name: "Sanderson Technology Enterprises",
    title: "Sanderson Technology Enterprises | Strategic Platform Development",
    slogan: "Strategic Platform Development",
    url: "https://sandersontechnologyenterprises.com",
    github: "https://github.com/Sanderson-Technology-Enterprises",
    organizationId: "https://sandersontechnologyenterprises.com/#organization",
    logo: "https://sandersontechnologyenterprises.com/assets/icon-512.png",
    image:
      "https://sandersontechnologyenterprises.com/assets/social-preview.png",
    description:
      "Founder-led software studio building creator-owned web platforms, private content systems, admin dashboards, and operational workflows for adult entertainment businesses.",
  } as const;
  for (const [key, value] of Object.entries(requiredOwnerIdentity)) {
    assert.equal(site.owner[key as keyof typeof site.owner], value, key);
  }
});

test("asset helpers distinguish explicit Pages paths from canonical URLs", () => {
  assert.equal(withBasePath("/favicon.ico", ""), "/favicon.ico");
  assert.equal(withBasePath("/favicon.ico", "   "), "/favicon.ico");
  assert.equal(
    withBasePath("favicon.ico", "/interface-systems-lab"),
    "/interface-systems-lab/favicon.ico",
  );
  assert.equal(
    withBasePath("/", "/interface-systems-lab/"),
    "/interface-systems-lab/",
  );
  assert.equal(
    absoluteSiteAsset("/favicon.ico"),
    "https://sanderson-technology-enterprises.github.io/interface-systems-lab/favicon.ico",
  );

  const mutableEnvironment = process.env as Record<string, string | undefined>;
  const originalNodeEnvironment = mutableEnvironment.NODE_ENV;
  const originalPagesBasePath = mutableEnvironment.PAGES_BASE_PATH;
  try {
    mutableEnvironment.NODE_ENV = "production";
    delete mutableEnvironment.PAGES_BASE_PATH;
    assert.equal(withBasePath("/favicon.ico"), "/favicon.ico");
  } finally {
    if (originalNodeEnvironment === undefined)
      delete mutableEnvironment.NODE_ENV;
    else mutableEnvironment.NODE_ENV = originalNodeEnvironment;
    if (originalPagesBasePath === undefined)
      delete mutableEnvironment.PAGES_BASE_PATH;
    else mutableEnvironment.PAGES_BASE_PATH = originalPagesBasePath;
  }
});

test("verification metadata includes only trimmed non-empty values", () => {
  assert.equal(buildVerificationMetadata({}), undefined);
  assert.equal(
    buildVerificationMetadata({
      BING_SITE_VERIFICATION: "  ",
      GOOGLE_SITE_VERIFICATION: "\t",
    }),
    undefined,
  );
  assert.deepEqual(
    buildVerificationMetadata({ GOOGLE_SITE_VERIFICATION: " google-token " }),
    { google: "google-token" },
  );
  assert.deepEqual(
    buildVerificationMetadata({ BING_SITE_VERIFICATION: " bing-token " }),
    { other: { "msvalidate.01": "bing-token" } },
  );
  assert.deepEqual(
    buildVerificationMetadata({
      BING_SITE_VERIFICATION: "bing-token",
      GOOGLE_SITE_VERIFICATION: "google-token",
    }),
    {
      google: "google-token",
      other: { "msvalidate.01": "bing-token" },
    },
  );
});

test("active shipping surfaces omit the superseded Foscat lab identity", async () => {
  const sources = (
    await Promise.all(
      ["../app/", "../scripts/", "../.github/", "../public/"].map(
        (relativePath) =>
          readShippingSources(new URL(relativePath, import.meta.url)),
      ),
    )
  ).flat();
  sources.push(
    await readFile(new URL("../README.md", import.meta.url), "utf8"),
  );
  const shippingSource = sources.join("\n");
  const staleSite = shippingSource.match(
    /https:\/\/foscat\.github\.io\/interface-systems-lab\/?/i,
  );
  const staleRepository = shippingSource.match(
    /https:\/\/github\.com\/Foscat\/interface-systems-lab\/?/i,
  );

  assert.equal(
    staleSite?.[0] ?? null,
    null,
    `stale lab site: ${staleSite?.[0]}`,
  );
  assert.equal(
    staleRepository?.[0] ?? null,
    null,
    `stale lab repository: ${staleRepository?.[0]}`,
  );
});

test("search verification examples remain empty and server-owned", async () => {
  const exampleUrl = new URL("../.env.example", import.meta.url);
  let example = "";
  try {
    example = await readFile(exampleUrl, "utf8");
  } catch {
    assert.fail(".env.example must document optional verification variables");
  }
  const layoutSource = await readFile(
    new URL("../app/layout.tsx", import.meta.url),
    "utf8",
  );
  const declarations = Object.fromEntries(
    example
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => line.split("=", 2)),
  );

  assert.deepEqual(declarations, {
    GOOGLE_SITE_VERIFICATION: "",
    BING_SITE_VERIFICATION: "",
  });
  assert.match(layoutSource, /buildVerificationMetadata\(process\.env\)/);
  assert.doesNotMatch(layoutSource, /NEXT_PUBLIC_.*SITE_VERIFICATION/);
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
  const [
    page,
    observatory,
    installGuide,
    directory,
    layoutLab,
    siteHeader,
    siteFooter,
  ] = await Promise.all([
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
      new URL("../app/components/labs/LayoutLab.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../app/components/SiteHeader.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../app/components/SiteFooter.tsx", import.meta.url),
      "utf8",
    ),
  ]);

  assert.match(observatory, /Interface Observatory/);
  assert.doesNotMatch(observatory, /signal-bars/);
  assert.match(installGuide, /Install all three/);
  assert.match(directory, /Library resources/);
  assert.match(layoutLab, /Layout laboratory/);
  assert.match(layoutLab, /data-ly-recipe="dashboard"/);
  assert.match(page, /<LabExperience>/);
  assert.doesNotMatch(page, /^"use client";/);
  assert.match(siteHeader, /brand-logo/);
  assert.match(siteHeader, /SITE\.productLine/);
  assert.match(siteHeader, /favicon-48x48\.png/);
  assert.match(siteFooter, /android-chrome-192x192\.png/);
  assert.doesNotMatch(observatory, />\s*Inspect\s*</);
});

test("Task 3 sources omit dormant local hooks and keep FeatureShowcase static", async () => {
  const [page, siteFooter, layoutLab, featureShowcase] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../app/components/SiteFooter.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../app/components/labs/LayoutLab.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../app/components/FeatureShowcase.tsx", import.meta.url),
      "utf8",
    ),
  ]);

  const taskSources = [page, siteFooter, layoutLab].join("\n");
  const staticClassTokens = Array.from(
    taskSources.matchAll(/className="([^"]*)"/g),
    (match) => match[1]?.split(/\s+/) ?? [],
  ).flat();
  for (const className of [
    "capability-runway",
    "capability-preview",
    "company-conversion",
    "footer-actions",
    "layout-lab",
    "recipe-container",
    "wrapper-inventory",
  ]) {
    assert.equal(
      staticClassTokens.includes(className),
      false,
      `${className} should not survive as an unused local hook`,
    );
  }

  assert.doesNotMatch(featureShowcase, /^"use client";/);
  assert.doesNotMatch(
    featureShowcase,
    /getUiPrefix|useLabConfiguration|LabExperience/,
  );
  assert.doesNotMatch(featureShowcase, /ly-wrapper--xl|\bicon-only\b/);
  assert.match(featureShowcase, /interactive-surface site-action/);
});

test("local CSS owns the observatory without retaining the audio meter", async () => {
  const [observatoryCss, responsiveCss, globalCss] = await Promise.all([
    readFile(new URL("../app/styles/observatory.css", import.meta.url), "utf8"),
    readFile(new URL("../app/styles/responsive.css", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(observatoryCss, /\.observatory-stage/);
  assert.match(observatoryCss, /@keyframes orbit/);
  assert.doesNotMatch(observatoryCss, /\.signal-bars/);
  assert.match(responsiveCss, /prefers-reduced-motion/);
  assert.doesNotMatch(globalCss, /observatory/);
});
