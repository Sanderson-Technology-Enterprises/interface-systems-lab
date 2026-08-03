import { SITE, withBasePath } from "./site";

const configurationKeys = ["layout", "ui", "theme", "mode"] as const;
const legacyLabHashes = new Set([
  "#workbench",
  "#layouts",
  "#ui-native",
  "#icons",
  "#interactions",
  "#integrate",
  "#install",
]);

/** Preserves previously shared static-export URLs after the lab route split. */
export function legacyLabDestination(
  search: string,
  hash: string,
  requestedBasePath = process.env.NEXT_PUBLIC_PAGES_BASE_PATH ?? "",
): string | null {
  const source = new URLSearchParams(search);
  const hasConfiguration = configurationKeys.some((key) => source.has(key));
  const hasLegacyHash = legacyLabHashes.has(hash);
  if (!hasConfiguration && !hasLegacyHash) return null;

  const labPath = withBasePath(SITE.labPath, requestedBasePath);
  const serializedQuery = source.toString();
  const preservedHash = hasLegacyHash ? hash : "";

  return `${labPath}${serializedQuery ? `?${serializedQuery}` : ""}${preservedHash}`;
}
