import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  EXPECTED_ICON_CONTRACT,
  EXPECTED_ICON_COUNT,
  EXPECTED_ICON_VERSION,
  assertSafeIconAssetPath,
  buildIconAssets,
  validateIconContract,
} from "../scripts/build-icon-assets.mjs";

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
    await stat(path.join(output, "ui-style-kit-icons.js"));
    await stat(path.join(output, "ui-style-kit-icons.css"));
    await stat(path.join(output, "registry.js"));
    await stat(path.join(output, "icons", "dashboard.svg"));
    await stat(
      path.join(output, "packs", "cyberpunk", "icons", "dashboard.svg"),
    );
  } finally {
    await rm(temporaryRoot, { force: true, recursive: true });
  }
});
