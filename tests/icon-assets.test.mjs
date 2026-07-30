import assert from "node:assert/strict";
import {
  cp,
  lstat,
  mkdtemp,
  readFile,
  rm,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import { fileURLToPath } from "node:url";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  EXPECTED_ICON_CONTRACT,
  EXPECTED_ICON_COUNT,
  EXPECTED_ICON_PACK_COUNT,
  EXPECTED_ICON_VERSION,
  assertSafeIconAssetPath,
  buildIconAssets,
  validateIconContract,
} from "../scripts/build-icon-assets.mjs";

const publishedPackageRoot = path.dirname(
  fileURLToPath(import.meta.resolve("ui-style-kit-icons/package.json")),
);

async function mutateJson(source, mutate) {
  const value = JSON.parse(await readFile(source, "utf8"));
  mutate(value);
  await writeFile(source, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  return value;
}

async function withMutablePackage(run) {
  const temporaryRoot = await mkdtemp(
    path.join(os.tmpdir(), "interface-systems-icons-mutation-"),
  );
  const packageRoot = path.join(temporaryRoot, "ui-style-kit-icons");
  const output = path.join(
    temporaryRoot,
    "public",
    "assets",
    "ui-style-kit-icons",
    EXPECTED_ICON_VERSION,
  );

  try {
    await cp(publishedPackageRoot, packageRoot, { recursive: true });
    await run({ output, packageRoot, temporaryRoot });
  } finally {
    await rm(temporaryRoot, { force: true, recursive: true });
  }
}

test("the icon contract accepts the pinned published package", async () => {
  const contract = JSON.parse(
    await readFile(
      new URL(
        "../node_modules/ui-style-kit-icons/contract/icon-contract.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );

  assert.equal(EXPECTED_ICON_VERSION, "1.0.0");
  assert.equal(EXPECTED_ICON_CONTRACT, "1.0.0");
  assert.equal(EXPECTED_ICON_COUNT, 64);
  assert.doesNotThrow(() => validateIconContract(contract));
});

test("the icon contract rejects incomplete semantic coverage", () => {
  assert.throws(
    () =>
      validateIconContract({
        schemaVersion: "1.0.0",
        requiredIconCount: 63,
        icons: [],
      }),
    /required icon count/i,
  );
});

test("icon output must stay in the versioned public asset directory", async () => {
  const repositoryRoot = path.resolve(".");
  await assert.rejects(
    assertSafeIconAssetPath(
      repositoryRoot,
      path.join(repositoryRoot, "public"),
    ),
    /exactly/i,
  );
});

test("the icon builder rejects a duplicated contract semantic id", async () => {
  await withMutablePackage(async ({ output, packageRoot, temporaryRoot }) => {
    const contract = await mutateJson(
      path.join(packageRoot, "contract", "icon-contract.json"),
      (value) => {
        value.icons[1].id = value.icons[0].id;
      },
    );
    assert.equal(contract.icons[0].id, "home");
    assert.equal(contract.icons[1].id, "home");
    assert.equal(
      new Set(contract.icons.map(({ id }) => id)).size,
      EXPECTED_ICON_COUNT - 1,
    );

    await assert.rejects(
      buildIconAssets({
        output,
        packageRoot,
        repositoryRoot: temporaryRoot,
      }),
      /contract semantic icon ids.*duplicate.*home/i,
    );
  });
});

test("the icon builder rejects a replaced registry semantic id", async () => {
  await withMutablePackage(async ({ output, packageRoot, temporaryRoot }) => {
    const registry = await mutateJson(
      path.join(packageRoot, "dist", "registry.json"),
      (value) => {
        value.coreIconIds[1] = "replacement-dashboard";
      },
    );
    assert.equal(registry.coreIconIds.includes("replacement-dashboard"), true);
    assert.equal(registry.coreIconIds.includes("dashboard"), false);

    await assert.rejects(
      buildIconAssets({
        output,
        packageRoot,
        repositoryRoot: temporaryRoot,
      }),
      /registry semantic icon ids.*contract semantic icon ids/i,
    );
  });
});

test("the icon builder rejects a traversing pack source path", async () => {
  await withMutablePackage(async ({ output, packageRoot, temporaryRoot }) => {
    const registry = await mutateJson(
      path.join(packageRoot, "dist", "registry.json"),
      (value) => {
        value.packs.find(({ id }) => id === "cyberpunk").sourcePath =
          "packs/../../outside";
      },
    );
    const sourcePath = registry.packs.find(
      ({ id }) => id === "cyberpunk",
    ).sourcePath;
    assert.match(sourcePath, /\.\./);

    await assert.rejects(
      buildIconAssets({
        output,
        packageRoot,
        repositoryRoot: temporaryRoot,
      }),
      /pack "cyberpunk" source path.*path traversal/i,
    );
  });
});

test("the icon builder rejects a symbolic-link pack directory component", async () => {
  await withMutablePackage(async ({ output, packageRoot, temporaryRoot }) => {
    const source = path.join(packageRoot, "packs", "bento", "style-source");
    const linked = path.join(packageRoot, "packs", "cyberpunk", "style-source");
    await rm(linked, { recursive: true });
    await symlink(
      source,
      linked,
      process.platform === "win32" ? "junction" : "dir",
    );
    assert.equal((await lstat(linked)).isSymbolicLink(), true);

    await assert.rejects(
      buildIconAssets({
        output,
        packageRoot,
        repositoryRoot: temporaryRoot,
      }),
      /symbolic link or reparse point.*style-source/i,
    );
  });
});

test("the icon builder rejects a per-pack semantic identity mismatch", async () => {
  await withMutablePackage(async ({ output, packageRoot, temporaryRoot }) => {
    const manifest = await mutateJson(
      path.join(packageRoot, "packs", "cyberpunk", "manifest.json"),
      (value) => {
        value.coreIcons[1].id = "replacement-dashboard";
      },
    );
    assert.equal(manifest.coreIcons[1].id, "replacement-dashboard");
    assert.equal(
      new Set(manifest.coreIcons.map(({ id }) => id)).size,
      EXPECTED_ICON_COUNT,
    );

    await assert.rejects(
      buildIconAssets({
        output,
        packageRoot,
        repositoryRoot: temporaryRoot,
      }),
      /pack "cyberpunk" manifest core icon ids.*contract semantic icon ids/i,
    );
  });
});

test("the icon builder stages runtime modules and SVG packs", async () => {
  const temporaryRoot = await mkdtemp(
    path.join(os.tmpdir(), "interface-systems-icons-"),
  );

  try {
    const output = path.join(
      temporaryRoot,
      "public",
      "assets",
      "ui-style-kit-icons",
      EXPECTED_ICON_VERSION,
    );
    const result = await buildIconAssets({
      repositoryRoot: temporaryRoot,
      output,
    });

    assert.equal(result.version, EXPECTED_ICON_VERSION);
    assert.equal(result.requiredIconCount, EXPECTED_ICON_COUNT);
    assert.equal(result.packCount, EXPECTED_ICON_PACK_COUNT);
    await stat(path.join(output, "ui-style-kit-icons.js"));
    await stat(path.join(output, "ui-style-kit-icons.css"));
    await stat(path.join(output, "registry.js"));
    await stat(path.join(output, "icons", "dashboard.svg"));
    await stat(
      path.join(output, "packs", "cyberpunk", "icons", "dashboard.svg"),
    );
    await stat(
      path.join(
        output,
        "packs",
        "cyberpunk",
        "dist",
        "cyberpunk-icon-pack.css",
      ),
    );
    await stat(
      path.join(
        output,
        "packs",
        "cyberpunk",
        "sprite",
        "cyberpunk-icon-pack.inline.svg",
      ),
    );
    await stat(path.join(output, "packs", "cyberpunk", "manifest.json"));
    await stat(
      path.join(
        output,
        "packs",
        "cyberpunk",
        "style-source",
        "cyberpunk-style-source.md",
      ),
    );
  } finally {
    await rm(temporaryRoot, { force: true, recursive: true });
  }
});
