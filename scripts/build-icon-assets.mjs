import { cp, lstat, mkdir, readFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const EXPECTED_ICON_VERSION = "1.0.0";
export const EXPECTED_ICON_CONTRACT = "1.0.0";
export const EXPECTED_ICON_COUNT = 64;
export const EXPECTED_ICON_PACK_COUNT = 12;

const modulePath = fileURLToPath(import.meta.url);
const defaultRepositoryRoot = path.resolve(path.dirname(modulePath), "..");

export function validateIconContract(contract) {
  if (contract?.schemaVersion !== EXPECTED_ICON_CONTRACT) {
    throw new Error(`Icon contract version must be ${EXPECTED_ICON_CONTRACT}.`);
  }
  if (contract?.requiredIconCount !== EXPECTED_ICON_COUNT) {
    throw new Error(`Icon required icon count must be ${EXPECTED_ICON_COUNT}.`);
  }
  if (
    !Array.isArray(contract.icons) ||
    contract.icons.length !== EXPECTED_ICON_COUNT
  ) {
    throw new Error("Icon contract requires the complete semantic icon list.");
  }
}

export async function assertSafeIconAssetPath(repositoryRoot, output) {
  const resolvedRoot = path.resolve(repositoryRoot);
  const resolvedOutput = path.resolve(output);
  const expected = path.join(
    "public",
    "assets",
    "ui-style-kit-icons",
    EXPECTED_ICON_VERSION,
  );
  const relative = path.relative(resolvedRoot, resolvedOutput);
  if (relative !== expected) {
    throw new Error(
      `Icon output must resolve exactly to ${expected}; received ${relative || "."}.`,
    );
  }

  let component = resolvedRoot;
  for (const segment of expected.split(path.sep)) {
    component = path.join(component, segment);
    try {
      const status = await lstat(component);
      if (status.isSymbolicLink()) {
        throw new Error(
          `Icon output contains symbolic-link path component: ${segment}.`,
        );
      }
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  return resolvedOutput;
}

async function readJson(specifier) {
  const source = fileURLToPath(import.meta.resolve(specifier));
  return {
    source,
    value: JSON.parse(await readFile(source, "utf8")),
  };
}

async function assertRegularFile(source, description) {
  const status = await lstat(source);
  if (!status.isFile()) {
    throw new Error(`${description} is not a regular file: ${source}`);
  }
}

export async function buildIconAssets(options = {}) {
  const repositoryRoot = path.resolve(
    options.repositoryRoot ?? defaultRepositoryRoot,
  );
  const output = await assertSafeIconAssetPath(
    repositoryRoot,
    options.output ??
      path.join(
        repositoryRoot,
        "public",
        "assets",
        "ui-style-kit-icons",
        EXPECTED_ICON_VERSION,
      ),
  );
  const { source: manifestSource, value: manifest } = await readJson(
    "ui-style-kit-icons/package.json",
  );
  const { value: contract } = await readJson(
    "ui-style-kit-icons/contract.json",
  );
  const { value: registry } = await readJson(
    "ui-style-kit-icons/registry.json",
  );
  const packageRoot = path.dirname(manifestSource);

  if (manifest.version !== EXPECTED_ICON_VERSION) {
    throw new Error(
      `ui-style-kit-icons version must be ${EXPECTED_ICON_VERSION}; found ${manifest.version}.`,
    );
  }
  if (registry.contractVersion !== EXPECTED_ICON_CONTRACT) {
    throw new Error(
      `ui-style-kit-icons contract must be ${EXPECTED_ICON_CONTRACT}; found ${registry.contractVersion}.`,
    );
  }
  validateIconContract(contract);
  if (
    registry.requiredIconCount !== EXPECTED_ICON_COUNT ||
    registry.packCount !== EXPECTED_ICON_PACK_COUNT ||
    !Array.isArray(registry.packs) ||
    registry.packs.length !== EXPECTED_ICON_PACK_COUNT
  ) {
    throw new Error("The published icon registry is incomplete.");
  }

  for (const pack of registry.packs) {
    if (
      pack.requiredIconCount !== EXPECTED_ICON_COUNT ||
      !Array.isArray(pack.coreIcons) ||
      pack.coreIcons.length !== EXPECTED_ICON_COUNT
    ) {
      throw new Error(`Icon pack "${pack.id}" is incomplete.`);
    }
    for (const icon of pack.coreIcons) {
      await assertRegularFile(
        path.join(packageRoot, pack.sourcePath, icon.file),
        `Icon "${icon.id}" in pack "${pack.id}"`,
      );
    }
  }

  const runtimeSource = path.join(packageRoot, "dist", "ui-style-kit-icons.js");
  const cssSource = path.join(packageRoot, "dist", "ui-style-kit-icons.css");
  const registrySource = path.join(packageRoot, "dist", "registry.js");
  await assertRegularFile(runtimeSource, "Icon runtime");
  await assertRegularFile(cssSource, "Icon stylesheet");
  await assertRegularFile(registrySource, "Icon runtime registry");

  await rm(output, { force: true, recursive: true });
  await mkdir(output, { recursive: true });
  await cp(runtimeSource, path.join(output, "ui-style-kit-icons.js"));
  await cp(cssSource, path.join(output, "ui-style-kit-icons.css"));
  await cp(registrySource, path.join(output, "registry.js"));
  await cp(path.join(packageRoot, "icons"), path.join(output, "icons"), {
    recursive: true,
  });
  await cp(path.join(packageRoot, "packs"), path.join(output, "packs"), {
    recursive: true,
  });

  return {
    output,
    packCount: registry.packCount,
    requiredIconCount: registry.requiredIconCount,
    version: manifest.version,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === modulePath) {
  const result = await buildIconAssets();
  console.log(
    `Staged ${result.requiredIconCount} semantic icons across ${result.packCount} packs.`,
  );
}
