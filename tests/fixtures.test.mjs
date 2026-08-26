import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import {
  access,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { before, test } from "node:test";

import { BUNDLER_IMPORTS } from "../app/data/ecosystem.ts";

const execFileAsync = promisify(execFile);
const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const generatedRoot = path.join(
  repositoryRoot,
  "public",
  "fixtures",
  "generated",
);

const expectedFixtures = [
  "layout-only",
  "ui-only",
  "icon-only",
  "interactive-only",
  "layout-ui",
  "ui-icons",
  "layout-interactive",
  "ui-interactive",
  "all-canonical",
];

const expectedPackages = {
  "layout-only": ["layout-style-css"],
  "ui-only": ["ui-style-kit-css"],
  "icon-only": ["ui-style-kit-icons"],
  "interactive-only": ["interactive-surface-css"],
  "layout-ui": ["ui-style-kit-css", "layout-style-css"],
  "ui-icons": ["ui-style-kit-css", "ui-style-kit-icons"],
  "layout-interactive": ["interactive-surface-css", "layout-style-css"],
  "ui-interactive": ["ui-style-kit-css", "interactive-surface-css"],
  "all-canonical": [
    "ui-style-kit-css",
    "ui-style-kit-icons",
    "interactive-surface-css",
    "layout-style-css",
  ],
};

const expectedAssets = {
  "ui-visual": {
    export: "ui-style-kit-css/visual.css",
    target: "assets/ui-style-kit-css/2.2.0/ui-style-kit.visual.css",
  },
  "ui-theme": {
    export: "ui-style-kit-css/interactive-surface-theme.css",
    target: "assets/ui-style-kit-css/2.2.0/interactive-surface-theme.css",
  },
  "icon-css": {
    export: "ui-style-kit-icons/css.css",
    target: "assets/ui-style-kit-icons/1.0.0/ui-style-kit-icons.css",
  },
  "interaction-core": {
    export: "interactive-surface-css/state-core.css",
    target: "assets/interactive-surface-css/1.6.0/state-core.css",
  },
  "interaction-standalone": {
    export: "interactive-surface-css/standalone-preset.css",
    target: "assets/interactive-surface-css/1.6.0/standalone-preset.css",
  },
  "layout-core": {
    export: "layout-style-css",
    target: "assets/layout-style-css/3.1.0/layout-style-css.css",
  },
};

const expectedStyles = {
  "layout-only": ["layout-core"],
  "ui-only": ["ui-visual"],
  "icon-only": ["icon-css"],
  "interactive-only": ["interaction-standalone"],
  "layout-ui": ["ui-visual", "layout-core"],
  "ui-icons": ["ui-visual", "icon-css"],
  "layout-interactive": ["interaction-standalone", "layout-core"],
  "ui-interactive": ["ui-visual", "ui-theme", "interaction-core"],
  "all-canonical": BUNDLER_IMPORTS.filter(
    (statement) => !statement.includes("ui-style-kit-icons/element"),
  ).map((statement) => {
    const packageExport = statement.match(/^import "([^"]+)";$/)?.[1];
    const asset = Object.entries(expectedAssets).find(
      ([, candidate]) => candidate.export === packageExport,
    );
    assert.ok(asset, `Missing fixture asset for ${packageExport}`);
    return asset[0];
  }),
};

function stylesheetLinks(html) {
  return Array.from(
    html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g),
    (match) => match[1],
  );
}

async function treeSnapshot(root, relative = "") {
  const current = path.join(root, relative);
  const entries = await readdir(current, { withFileTypes: true });
  const snapshot = [];
  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) {
      snapshot.push(...(await treeSnapshot(root, child)));
      continue;
    }
    assert.equal(entry.isFile(), true, `Unexpected generated entry: ${child}`);
    const contents = await readFile(path.join(root, child));
    snapshot.push({
      hash: createHash("sha256").update(contents).digest("hex"),
      path: child.split(path.sep).join("/"),
    });
  }
  return snapshot;
}

before(async () => {
  await execFileAsync(process.execPath, ["scripts/build-fixtures.mjs"], {
    cwd: repositoryRoot,
  });
});

test("the fixture catalog declares the exact package combinations", async () => {
  const catalog = JSON.parse(
    await readFile(
      path.join(repositoryRoot, "app", "data", "integration-fixtures.json"),
      "utf8",
    ),
  );

  assert.deepEqual(
    catalog.map(({ id }) => id),
    expectedFixtures,
  );
  assert.equal(new Set(catalog.map(({ id }) => id)).size, catalog.length);
  assert.equal(
    catalog.some(({ id }) => id === "all-legacy"),
    false,
  );
  assert.deepEqual(
    catalog.find(({ id }) => id === "all-canonical")?.packages,
    expectedPackages["all-canonical"],
  );
  for (const fixture of catalog) {
    assert.deepEqual(fixture.packages, expectedPackages[fixture.id]);
    assert.deepEqual(fixture.styles, expectedStyles[fixture.id]);
  }
});

test("fixture generation runs before every development and production build", async () => {
  const packageManifest = JSON.parse(
    await readFile(path.join(repositoryRoot, "package.json"), "utf8"),
  );
  assert.equal(
    packageManifest.scripts["fixtures:build"],
    "node scripts/build-fixtures.mjs",
  );
  assert.equal(
    packageManifest.scripts["test:fixtures"],
    "node --test tests/fixtures.test.mjs tests/icon-assets.test.mjs",
  );
  assert.equal(packageManifest.scripts.predev, "npm run assets:build");
  assert.equal(packageManifest.scripts.prebuild, "npm run assets:build");
  assert.equal(
    packageManifest.scripts["prebuild:pages"],
    "npm run assets:build",
  );
  assert.equal(packageManifest.scripts.dev, "next dev");
  assert.equal(packageManifest.scripts.build, "next build");
  assert.equal(
    packageManifest.scripts["build:pages"],
    "cross-env PAGES_BASE_PATH=/interface-systems-lab next build",
  );
  assert.equal(
    packageManifest.scripts["test:dev-hydration"],
    "node scripts/run-dev-hydration.mjs",
  );
  assert.equal(
    packageManifest.scripts["assets:brand"],
    "node scripts/build-brand-assets.mjs",
  );
  assert.equal(
    packageManifest.scripts["test:brand"],
    "node --test tests/brand-assets.test.mjs",
  );
  assert.match(
    packageManifest.scripts.quality,
    /npm run test:fixtures && npm run test:brand && npm run test:dev-hydration/,
  );

  const gitignore = await readFile(
    path.join(repositoryRoot, ".gitignore"),
    "utf8",
  );
  assert.equal(
    gitignore
      .split(/\r?\n/)
      .filter((line) => line === "/public/fixtures/generated/").length,
    1,
  );
});

test("the generator writes exactly nine deterministic documents", async () => {
  const generatedStat = await lstat(generatedRoot);
  assert.equal(generatedStat.isSymbolicLink(), false);

  const htmlFiles = (await readdir(generatedRoot))
    .filter((entry) => entry.endsWith(".html"))
    .sort();
  assert.deepEqual(
    htmlFiles,
    expectedFixtures.map((id) => `${id}.html`).sort(),
  );

  const firstBuild = await treeSnapshot(generatedRoot);
  const expectedTree = [
    ...expectedFixtures.map((id) => `${id}.html`),
    ...Object.values(expectedAssets).map(({ target }) => target),
  ].sort();
  assert.deepEqual(
    firstBuild.map(({ path: generatedPath }) => generatedPath).sort(),
    expectedTree,
  );
  await execFileAsync(process.execPath, ["scripts/build-fixtures.mjs"], {
    cwd: repositoryRoot,
  });
  const secondBuild = await treeSnapshot(generatedRoot);
  assert.deepEqual(secondBuild, firstBuild);
});

test("validation rejects unsafe inputs before replacing generated output", async () => {
  const generator = await import("../scripts/build-fixtures.mjs");
  const catalog = JSON.parse(
    await readFile(
      path.join(repositoryRoot, "app", "data", "integration-fixtures.json"),
      "utf8",
    ),
  );
  const sentinelPath = path.join(generatedRoot, "sentinel.keep");
  const invalidBuilds = [
    {
      label: "duplicate fixture id",
      options: { catalog: [...catalog, catalog[0]] },
      pattern: /duplicate fixture id.*layout-only/i,
    },
    {
      label: "unknown asset key",
      options: {
        catalog: [
          { ...catalog[0], styles: ["layout-core", "not-a-public-asset"] },
          ...catalog.slice(1),
        ],
      },
      pattern: /unknown asset key.*not-a-public-asset/i,
    },
    {
      label: "missing fixture title",
      options: {
        catalog: [{ ...catalog[0], title: undefined }, ...catalog.slice(1)],
      },
      pattern: /fixture.*layout-only.*non-empty title/i,
    },
    {
      label: "non-string fixture summary",
      options: {
        catalog: [{ ...catalog[0], summary: 42 }, ...catalog.slice(1)],
      },
      pattern: /fixture.*layout-only.*non-empty summary/i,
    },
    {
      label: "version drift",
      options: {
        expectedVersions: {
          ...generator.EXPECTED_PACKAGE_VERSIONS,
          "ui-style-kit-css": "9.9.9",
        },
      },
      pattern: /ui-style-kit-css.*expected 9\.9\.9.*found 2\.2\.0/i,
    },
    {
      label: "missing export",
      options: {
        assets: {
          ...generator.FIXTURE_ASSETS,
          "ui-visual": {
            ...generator.FIXTURE_ASSETS["ui-visual"],
            export: "./not-a-real-export.css",
          },
        },
      },
      pattern: /fixture source.*ui-visual.*not a regular file/i,
    },
  ];

  try {
    for (const invalid of invalidBuilds) {
      await writeFile(sentinelPath, invalid.label, "utf8");
      await assert.rejects(
        generator.buildFixtures(invalid.options),
        invalid.pattern,
      );
      assert.equal(await readFile(sentinelPath, "utf8"), invalid.label);
    }
  } finally {
    await rm(sentinelPath, { force: true });
    await generator.buildFixtures();
  }
});

test("fixture ids cannot traverse outside the generated directory", async () => {
  const generator = await import("../scripts/build-fixtures.mjs");
  const catalog = JSON.parse(
    await readFile(
      path.join(repositoryRoot, "app", "data", "integration-fixtures.json"),
      "utf8",
    ),
  );
  const traversalCatalog = [
    { ...catalog[0], id: "../escaped-fixture" },
    ...catalog.slice(1),
  ];
  assert.throws(
    () => generator.validateFixtureCatalog(traversalCatalog),
    /invalid fixture id.*\.\.\/escaped-fixture/i,
  );
  await assert.rejects(
    access(
      path.join(repositoryRoot, "public", "fixtures", "escaped-fixture.html"),
    ),
  );
});

test("resolved fixture sources must exist as regular files", async () => {
  const generator = await import("../scripts/build-fixtures.mjs");
  const missingSource = path.join(
    repositoryRoot,
    "scripts",
    "not-a-real-export.css",
  );
  await assert.rejects(
    generator.assertAssetSourcesExist({ "missing-style": missingSource }),
    /fixture source.*missing-style.*not a regular file/i,
  );
});

test("output safety rejects a wrong target and symbolic-link path components", async () => {
  const { assertSafeGeneratedPath } =
    await import("../scripts/build-fixtures.mjs");
  const temporaryRoot = await mkdtemp(
    path.join(os.tmpdir(), "interface-fixture-safety-"),
  );
  try {
    await assert.rejects(
      assertSafeGeneratedPath(
        temporaryRoot,
        path.join(temporaryRoot, "public", "fixtures", "generated-other"),
      ),
      /must resolve exactly to.*public.*fixtures.*generated/i,
    );

    const leafRepository = path.join(temporaryRoot, "leaf-repository");
    const leafOutside = path.join(temporaryRoot, "leaf-outside");
    await mkdir(path.join(leafRepository, "public", "fixtures"), {
      recursive: true,
    });
    await mkdir(leafOutside, { recursive: true });
    await symlink(
      leafOutside,
      path.join(leafRepository, "public", "fixtures", "generated"),
      "junction",
    );
    await assert.rejects(
      assertSafeGeneratedPath(
        leafRepository,
        path.join(leafRepository, "public", "fixtures", "generated"),
      ),
      /symbolic-link path component.*generated/i,
    );

    const ancestorRepository = path.join(temporaryRoot, "ancestor-repository");
    const ancestorOutside = path.join(temporaryRoot, "ancestor-outside");
    await mkdir(ancestorRepository, { recursive: true });
    await mkdir(path.join(ancestorOutside, "fixtures"), { recursive: true });
    await symlink(
      ancestorOutside,
      path.join(ancestorRepository, "public"),
      "junction",
    );
    await assert.rejects(
      assertSafeGeneratedPath(
        ancestorRepository,
        path.join(ancestorRepository, "public", "fixtures", "generated"),
      ),
      /symbolic-link path component.*public/i,
    );
  } finally {
    await rm(temporaryRoot, { force: true, recursive: true });
  }
});

test("copied package styles are byte-identical to their public exports", async () => {
  for (const [key, asset] of Object.entries(expectedAssets)) {
    const source = await readFile(
      fileURLToPath(import.meta.resolve(asset.export)),
    );
    const generated = await readFile(path.join(generatedRoot, asset.target));
    assert.deepEqual(generated, source, `${key} drifted while copying`);
  }

  const expectedVersions = {
    "ui-style-kit-css": "2.2.0",
    "ui-style-kit-icons": "1.0.0",
    "interactive-surface-css": "1.6.0",
    "layout-style-css": "3.1.0",
  };
  for (const [packageName, expectedVersion] of Object.entries(
    expectedVersions,
  )) {
    const packageManifest = JSON.parse(
      await readFile(
        fileURLToPath(import.meta.resolve(`${packageName}/package.json`)),
        "utf8",
      ),
    );
    assert.equal(packageManifest.version, expectedVersion);
  }
});

test("each fixture uses only its ordered local styles and semantic proof hooks", async () => {
  for (const id of expectedFixtures) {
    const html = await readFile(path.join(generatedRoot, `${id}.html`), "utf8");
    const expectedLinks = expectedStyles[id].map(
      (key) => `./${expectedAssets[key].target}`,
    );

    assert.deepEqual(stylesheetLinks(html), expectedLinks, id);
    assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
    assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, id);
    assert.equal((html.match(/<main(?:\s|>)/g) ?? []).length, 1, id);
    assert.match(html, /<label[^>]*for="fixture-field"/);
    assert.match(html, /<input[^>]*id="fixture-field"/);
    for (const hook of [
      "data-fixture-root",
      "data-proof-layout",
      "data-proof-paint",
      "data-proof-ui-control",
      "data-proof-interaction",
      "data-proof-pressed",
    ]) {
      assert.match(html, new RegExp(`\\b${hook}\\b`), `${id}: ${hook}`);
    }
    assert.doesNotMatch(html, /<style(?:\s|>)/i);
    assert.doesNotMatch(html, /\sstyle=/i);
    const usesIcons = ["icon-only", "ui-icons", "all-canonical"].includes(id);
    if (usesIcons) {
      assert.match(html, /<usk-icon\b/);
      assert.match(html, /ui-style-kit-icons\.js/);
      assert.match(
        html,
        /asset-base="\.\.\/\.\.\/assets\/ui-style-kit-icons\/1\.0\.0\/"/,
      );
    } else {
      assert.doesNotMatch(html, /<usk-icon\b/);
      assert.doesNotMatch(html, /ui-style-kit-icons\.js/);
    }
    assert.doesNotMatch(html, /https?:\/\//i);
    assert.doesNotMatch(html, /(?:href|src)="\//i);
    assert.doesNotMatch(
      html,
      /class="[^"]*ui-button[^"]*interactive-surface|class="[^"]*interactive-surface[^"]*ui-button/,
    );
    assert.match(html, /class="[^"]*\bui-card\b[^"\n]*"[^>]*data-proof-paint/);
    assert.match(html, /class="[^"]*\bui-field\b/);
    assert.match(html, /class="[^"]*\bui-input\b/);
    const uiControl = html.match(
      /<button\b[^>]*data-proof-ui-control[^>]*>/,
    )?.[0];
    const interaction = html.match(
      /<button\b[^>]*data-proof-interaction[^>]*>/,
    )?.[0];
    const pressed = html.match(/<button\b[^>]*data-proof-pressed[^>]*>/)?.[0];
    assert.ok(uiControl, `${id}: missing UI button proof`);
    assert.match(uiControl, /class="[^"]*\bui-button\b/);
    assert.match(uiControl, /data-ui-variant="primary"/);
    assert.doesNotMatch(uiControl, /\binteractive-surface\b/);
    assert.ok(interaction, `${id}: missing interaction proof`);
    assert.match(interaction, /class="[^"]*\binteractive-surface\b/);
    assert.doesNotMatch(interaction, /\bui-button(?:-|\b)/);
    assert.ok(pressed, `${id}: missing pressed proof`);
    assert.match(pressed, /class="[^"]*\binteractive-surface\b/);
    assert.match(pressed, /aria-pressed="true"/);
    assert.notEqual(uiControl, interaction);

    assert.match(html, /\bdata-ly-layout="bento"/);
    assert.doesNotMatch(html, /\bdata-layout=/);
    assert.doesNotMatch(html, /\bdata-proof-legacy-layout\b/);
  }
});
