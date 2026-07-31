import {
  copyFile,
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  rm,
} from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const EXPECTED_ICON_VERSION = "1.0.0";
export const EXPECTED_ICON_CONTRACT = "1.0.0";
export const EXPECTED_ICON_COUNT = 64;
export const EXPECTED_ICON_PACK_COUNT = 12;

const ICON_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const modulePath = fileURLToPath(import.meta.url);
const defaultRepositoryRoot = path.resolve(path.dirname(modulePath), "..");
const defaultPackageRoot = path.dirname(
  fileURLToPath(import.meta.resolve("ui-style-kit-icons/package.json")),
);

function normalizeComparableRelativePath(candidate) {
  const normalized = candidate.split(path.sep).join("/");
  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}

function isWithinRoot(root, candidate, allowRoot = false) {
  const relative = path.relative(root, candidate);
  return (
    (allowRoot && relative === "") ||
    (relative !== "" &&
      relative !== ".." &&
      !relative.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relative))
  );
}

function normalizePackageRelativePath(
  source,
  description,
  { allowRoot = false } = {},
) {
  if (typeof source !== "string" || source.trim().length === 0) {
    throw new Error(`${description} must be a non-empty relative path.`);
  }
  if (path.posix.isAbsolute(source) || path.win32.isAbsolute(source)) {
    throw new Error(`${description} must remain beneath the package root.`);
  }

  const normalizedSeparators = source.replaceAll("\\", "/");
  if (allowRoot && normalizedSeparators === ".") return ".";

  const segments = normalizedSeparators.split("/");
  if (segments.some((segment) => segment === "..")) {
    throw new Error(`${description} contains path traversal.`);
  }
  if (segments.some((segment) => segment === "" || segment === ".")) {
    throw new Error(`${description} must use a normalized relative path.`);
  }

  return segments.join("/");
}

async function assertDirectoryRoot(source, description) {
  const resolved = path.resolve(source);
  let status;
  try {
    status = await lstat(resolved);
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new Error(`${description} does not exist: ${resolved}`);
    }
    throw error;
  }
  if (status.isSymbolicLink() || !status.isDirectory()) {
    throw new Error(
      `${description} must be a regular directory, not a symbolic link or reparse point: ${resolved}`,
    );
  }
  return resolved;
}

async function assertSafePackageSource(
  packageRoot,
  relativeSource,
  description,
  { allowRoot = false, kind = "file" } = {},
) {
  const normalized = normalizePackageRelativePath(relativeSource, description, {
    allowRoot,
  });
  const resolvedRoot = path.resolve(packageRoot);
  const resolvedSource =
    normalized === "."
      ? resolvedRoot
      : path.resolve(resolvedRoot, ...normalized.split("/"));

  if (!isWithinRoot(resolvedRoot, resolvedSource, allowRoot)) {
    throw new Error(`${description} must remain beneath the package root.`);
  }

  let component = resolvedRoot;
  const segments = normalized === "." ? [] : normalized.split("/");
  for (const [index, segment] of segments.entries()) {
    component = path.join(component, segment);
    let status;
    try {
      status = await lstat(component);
    } catch (error) {
      if (error?.code === "ENOENT") {
        throw new Error(`${description} does not exist: ${component}`);
      }
      throw error;
    }
    if (status.isSymbolicLink()) {
      throw new Error(
        `${description} contains a symbolic link or reparse point: ${segment}`,
      );
    }
    if (index < segments.length - 1 && !status.isDirectory()) {
      throw new Error(
        `${description} contains a non-directory path component: ${segment}`,
      );
    }
    if (index === segments.length - 1) {
      const valid =
        kind === "directory" ? status.isDirectory() : status.isFile();
      if (!valid) {
        throw new Error(
          `${description} is not a regular ${kind}: ${component}`,
        );
      }
    }
  }

  const physicalRoot = await realpath(resolvedRoot);
  const physicalSource = await realpath(resolvedSource);
  if (!isWithinRoot(physicalRoot, physicalSource, allowRoot)) {
    throw new Error(
      `${description} resolves through a symbolic link or reparse point outside the package root.`,
    );
  }
  if (
    normalized !== "." &&
    // Root-relative comparison preserves Windows 8.3 aliases while exposing
    // any component that resolves to a different physical package location.
    normalizeComparableRelativePath(
      path.relative(physicalRoot, physicalSource),
    ) !== normalizeComparableRelativePath(normalized)
  ) {
    throw new Error(
      `${description} resolves through a symbolic link or reparse point.`,
    );
  }

  return {
    relative: normalized,
    source: resolvedSource,
  };
}

function validateSemanticIds(ids, description, expectedCount) {
  if (!Array.isArray(ids) || ids.length !== expectedCount) {
    throw new Error(
      `${description} must contain exactly ${expectedCount} entries.`,
    );
  }

  const seen = new Set();
  for (const id of ids) {
    if (
      typeof id !== "string" ||
      id.trim().length === 0 ||
      !ICON_ID_PATTERN.test(id)
    ) {
      throw new Error(`${description} contains a non-empty invalid id.`);
    }
    if (seen.has(id)) {
      throw new Error(`${description} contains duplicate id "${id}".`);
    }
    seen.add(id);
  }
  return ids;
}

function semanticIdsFromEntries(entries, description, expectedCount) {
  if (!Array.isArray(entries)) {
    throw new Error(`${description} must be an array.`);
  }
  return validateSemanticIds(
    entries.map((entry) => entry?.id),
    description,
    expectedCount,
  );
}

function assertExactIds(actual, expected, description) {
  if (
    actual.length !== expected.length ||
    actual.some((id, index) => id !== expected[index])
  ) {
    throw new Error(
      `${description} must exactly match contract semantic icon ids.`,
    );
  }
}

function assertExactIdSet(actual, expected, description) {
  const sortedActual = [...actual].sort();
  const sortedExpected = [...expected].sort();
  if (
    sortedActual.length !== sortedExpected.length ||
    sortedActual.some((id, index) => id !== sortedExpected[index])
  ) {
    throw new Error(`${description} must exactly match its declared icon ids.`);
  }
}

export function validateIconContract(contract) {
  if (contract?.schemaVersion !== EXPECTED_ICON_CONTRACT) {
    throw new Error(`Icon contract version must be ${EXPECTED_ICON_CONTRACT}.`);
  }
  if (contract?.requiredIconCount !== EXPECTED_ICON_COUNT) {
    throw new Error(`Icon required icon count must be ${EXPECTED_ICON_COUNT}.`);
  }
  return semanticIdsFromEntries(
    contract.icons,
    "Contract semantic icon ids",
    EXPECTED_ICON_COUNT,
  );
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
      if (!status.isDirectory()) {
        throw new Error(
          `Icon output path component is not a directory: ${segment}.`,
        );
      }
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  return resolvedOutput;
}

async function readJsonSource(packageRoot, relativeSource, description) {
  const { source } = await assertSafePackageSource(
    packageRoot,
    relativeSource,
    description,
  );
  return {
    source,
    value: JSON.parse(await readFile(source, "utf8")),
  };
}

async function collectValidatedFiles(packageRoot, relativeRoot, description) {
  const { source: sourceRoot, relative: normalizedRoot } =
    await assertSafePackageSource(packageRoot, relativeRoot, description, {
      allowRoot: relativeRoot === ".",
      kind: "directory",
    });
  const files = [];

  async function visit(currentSource, currentRelative) {
    const entries = await readdir(currentSource, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));

    for (const entry of entries) {
      const entrySource = path.join(currentSource, entry.name);
      const entryRelative =
        currentRelative === "."
          ? entry.name
          : `${currentRelative}/${entry.name}`;
      const status = await lstat(entrySource);
      if (entry.isSymbolicLink() || status.isSymbolicLink()) {
        throw new Error(
          `${description} contains a symbolic link or reparse point: ${entryRelative}`,
        );
      }
      if (entry.isDirectory() && status.isDirectory()) {
        await visit(entrySource, entryRelative);
        continue;
      }
      if (!entry.isFile() || !status.isFile()) {
        throw new Error(
          `${description} contains a non-regular filesystem entry: ${entryRelative}`,
        );
      }

      const validated = await assertSafePackageSource(
        packageRoot,
        entryRelative,
        `${description} file "${entryRelative}"`,
      );
      files.push(validated);
    }
  }

  await visit(sourceRoot, normalizedRoot);
  return files;
}

function validateIconEntryFiles(entries, packId, kind) {
  for (const entry of entries) {
    const expectedFile = `icons/${entry.id}.svg`;
    if (entry.file !== expectedFile) {
      throw new Error(
        `Icon pack "${packId}" ${kind} icon "${entry.id}" must use ${expectedFile}.`,
      );
    }
  }
}

async function validatePackDirectories(packageRoot, expectedPackIds) {
  const { source: packsRoot } = await assertSafePackageSource(
    packageRoot,
    "packs",
    "Published icon packs directory",
    { kind: "directory" },
  );
  const entries = await readdir(packsRoot, { withFileTypes: true });
  const physicalPackIds = [];

  for (const entry of entries) {
    const entrySource = path.join(packsRoot, entry.name);
    const status = await lstat(entrySource);
    if (entry.isSymbolicLink() || status.isSymbolicLink()) {
      throw new Error(
        `Published icon packs contain a symbolic link or reparse point: ${entry.name}`,
      );
    }
    if (!entry.isDirectory() || !status.isDirectory()) {
      throw new Error(
        `Published icon packs contain a non-directory entry: ${entry.name}`,
      );
    }
    physicalPackIds.push(entry.name);
  }

  assertExactIdSet(
    physicalPackIds,
    expectedPackIds,
    "Physical published pack ids",
  );
}

async function validatePack(packageRoot, pack, contractIds, seenPackIds) {
  const packId = pack?.id;
  validateSemanticIds([packId], "Registry pack ids", 1);
  if (seenPackIds.has(packId)) {
    throw new Error(`Registry pack ids contains duplicate id "${packId}".`);
  }
  seenPackIds.add(packId);

  const expectedSourcePath = packId === "system" ? "." : `packs/${packId}`;
  const sourcePath = normalizePackageRelativePath(
    pack.sourcePath,
    `Icon pack "${packId}" source path`,
    { allowRoot: packId === "system" },
  );
  if (sourcePath !== expectedSourcePath) {
    throw new Error(
      `Icon pack "${packId}" source path must be ${expectedSourcePath}.`,
    );
  }
  await assertSafePackageSource(
    packageRoot,
    sourcePath,
    `Icon pack "${packId}" source path`,
    { allowRoot: packId === "system", kind: "directory" },
  );

  if (pack.requiredIconCount !== EXPECTED_ICON_COUNT) {
    throw new Error(`Icon pack "${packId}" is incomplete.`);
  }
  const registryCoreIds = semanticIdsFromEntries(
    pack.coreIcons,
    `Icon pack "${packId}" registry core icon ids`,
    EXPECTED_ICON_COUNT,
  );
  assertExactIds(
    registryCoreIds,
    contractIds,
    `Icon pack "${packId}" registry core icon ids`,
  );

  const registryOptionalIds = semanticIdsFromEntries(
    pack.optionalIcons,
    `Icon pack "${packId}" registry optional icon ids`,
    pack.optionalIcons?.length ?? 0,
  );
  const allRegistryIds = [...registryCoreIds, ...registryOptionalIds];
  if (new Set(allRegistryIds).size !== allRegistryIds.length) {
    throw new Error(`Icon pack "${packId}" contains duplicate icon ids.`);
  }
  validateIconEntryFiles(pack.coreIcons, packId, "registry core");
  validateIconEntryFiles(pack.optionalIcons, packId, "registry optional");

  const expectedManifestPath =
    packId === "system" ? "manifest.json" : `${sourcePath}/manifest.json`;
  const manifestPath = normalizePackageRelativePath(
    pack.manifest,
    `Icon pack "${packId}" manifest path`,
  );
  if (manifestPath !== expectedManifestPath) {
    throw new Error(
      `Icon pack "${packId}" manifest path must be ${expectedManifestPath}.`,
    );
  }
  const { value: manifest } = await readJsonSource(
    packageRoot,
    manifestPath,
    `Icon pack "${packId}" manifest`,
  );
  if (
    manifest.version !== EXPECTED_ICON_VERSION ||
    manifest.contractVersion !== EXPECTED_ICON_CONTRACT ||
    manifest.requiredIconCount !== EXPECTED_ICON_COUNT
  ) {
    throw new Error(`Icon pack "${packId}" manifest contract is incomplete.`);
  }

  const manifestCoreIds = semanticIdsFromEntries(
    manifest.coreIcons,
    `Icon pack "${packId}" manifest core icon ids`,
    EXPECTED_ICON_COUNT,
  );
  assertExactIds(
    manifestCoreIds,
    contractIds,
    `Icon pack "${packId}" manifest core icon ids`,
  );
  const manifestOptionalIds = semanticIdsFromEntries(
    manifest.optionalIcons,
    `Icon pack "${packId}" manifest optional icon ids`,
    manifest.optionalIcons?.length ?? 0,
  );
  assertExactIds(
    manifestOptionalIds,
    registryOptionalIds,
    `Icon pack "${packId}" manifest optional icon ids`,
  );
  validateIconEntryFiles(manifest.coreIcons, packId, "manifest core");
  validateIconEntryFiles(manifest.optionalIcons, packId, "manifest optional");

  const iconFiles = await collectValidatedFiles(
    packageRoot,
    sourcePath === "." ? "icons" : `${sourcePath}/icons`,
    `Icon pack "${packId}" physical icon sources`,
  );
  const physicalIds = iconFiles.map(({ relative }) => {
    const relativeToPack =
      sourcePath === "." ? relative : path.posix.relative(sourcePath, relative);
    const match = relativeToPack.match(/^icons\/([a-z0-9-]+)\.svg$/u);
    if (!match) {
      throw new Error(
        `Icon pack "${packId}" has an invalid physical icon source: ${relativeToPack}`,
      );
    }
    return match[1];
  });
  validateSemanticIds(
    physicalIds,
    `Icon pack "${packId}" physical icon ids`,
    allRegistryIds.length,
  );
  assertExactIdSet(
    physicalIds,
    allRegistryIds,
    `Icon pack "${packId}" physical icon ids`,
  );

  if (packId === "system") {
    return iconFiles;
  }
  return collectValidatedFiles(
    packageRoot,
    sourcePath,
    `Icon pack "${packId}"`,
  );
}

function addCopy(copyPlan, source, target) {
  if (copyPlan.some((entry) => entry.target === target)) {
    throw new Error(`Duplicate icon asset output target: ${target}`);
  }
  copyPlan.push({ source, target });
}

async function copyValidatedPlan(packageRoot, output, copyPlan) {
  const sortedPlan = [...copyPlan].sort((left, right) =>
    left.target.localeCompare(right.target),
  );
  for (const entry of sortedPlan) {
    const normalizedTarget = normalizePackageRelativePath(
      entry.target,
      "Icon asset output target",
    );
    const destination = path.resolve(output, ...normalizedTarget.split("/"));
    if (!isWithinRoot(output, destination)) {
      throw new Error(`Icon asset output target escapes the staging root.`);
    }

    const relativeSource = path
      .relative(packageRoot, entry.source)
      .split(path.sep)
      .join("/");
    const { source } = await assertSafePackageSource(
      packageRoot,
      relativeSource,
      `Icon copy source "${relativeSource}"`,
    );
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(source, destination);
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
  const packageRoot = await assertDirectoryRoot(
    options.packageRoot ?? defaultPackageRoot,
    "Pinned ui-style-kit-icons package root",
  );

  const { value: manifest } = await readJsonSource(
    packageRoot,
    "package.json",
    "Icon package manifest",
  );
  const { value: contract } = await readJsonSource(
    packageRoot,
    "contract/icon-contract.json",
    "Icon contract",
  );
  const { value: registry } = await readJsonSource(
    packageRoot,
    "dist/registry.json",
    "Icon registry",
  );

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
  const contractIds = validateIconContract(contract);
  const registryIds = validateSemanticIds(
    registry.coreIconIds,
    "Registry semantic icon ids",
    EXPECTED_ICON_COUNT,
  );
  assertExactIds(registryIds, contractIds, "Registry semantic icon ids");

  if (
    registry.requiredIconCount !== EXPECTED_ICON_COUNT ||
    registry.packCount !== EXPECTED_ICON_PACK_COUNT ||
    !Array.isArray(registry.packs) ||
    registry.packs.length !== EXPECTED_ICON_PACK_COUNT
  ) {
    throw new Error("The published icon registry is incomplete.");
  }

  const copyPlan = [];
  const fixedAssets = [
    ["dist/ui-style-kit-icons.js", "ui-style-kit-icons.js", "Icon runtime"],
    [
      "dist/ui-style-kit-icons.css",
      "ui-style-kit-icons.css",
      "Icon stylesheet",
    ],
    ["dist/registry.js", "registry.js", "Icon runtime registry"],
  ];
  for (const [relativeSource, target, description] of fixedAssets) {
    const validated = await assertSafePackageSource(
      packageRoot,
      relativeSource,
      description,
    );
    addCopy(copyPlan, validated.source, target);
  }

  const seenPackIds = new Set();
  for (const pack of registry.packs) {
    const files = await validatePack(
      packageRoot,
      pack,
      contractIds,
      seenPackIds,
    );
    for (const file of files) {
      addCopy(copyPlan, file.source, file.relative);
    }
  }
  if (!seenPackIds.has("system")) {
    throw new Error('The published icon registry must include pack "system".');
  }
  await validatePackDirectories(
    packageRoot,
    [...seenPackIds].filter((id) => id !== "system"),
  );

  // Replace staged assets only after every source has passed the complete
  // identity, containment, and filesystem-entry validation pass.
  await rm(output, { force: true, recursive: true });
  await mkdir(output, { recursive: true });
  await copyValidatedPlan(packageRoot, output, copyPlan);

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
