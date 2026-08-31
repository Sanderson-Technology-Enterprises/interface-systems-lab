import type { IconPack } from "ui-style-kit-icons";
import iconRegistry from "ui-style-kit-icons/registry.json";

type PublishedIconPack = {
  readonly id: IconPack;
  readonly label: string;
};

type PublishedIconRegistry = {
  readonly packs: readonly PublishedIconPack[];
  readonly styleAliases: Readonly<Record<string, IconPack>>;
};

const publishedIconRegistry = iconRegistry as PublishedIconRegistry;
const fallbackIconPack: IconPack = "system";

/**
 * Resolves a UI Style Kit preset to its published icon pack metadata.
 *
 * UI Style Kit can add visual presets before the icon library gains matching
 * artwork. In that compatibility window, this mirrors the icon runtime by
 * selecting its neutral System pack.
 *
 * @param uiStyle - UI Style Kit preset identifier.
 * @returns Matching pack metadata, or the neutral System pack for an unknown preset.
 * @throws {Error} When the published registry omits the resolved pack metadata.
 */
export function resolveIconPack(uiStyle: string): PublishedIconPack {
  const packId =
    publishedIconRegistry.styleAliases[uiStyle] ?? fallbackIconPack;
  const pack = publishedIconRegistry.packs.find(({ id }) => id === packId);

  if (!pack) {
    throw new Error(`Missing icon pack metadata for ${packId}.`);
  }

  return pack;
}
