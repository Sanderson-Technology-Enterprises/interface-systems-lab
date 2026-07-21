import uiManifest from "ui-style-kit-css/manifest.json";

export const LAYOUT_PERSONALITIES = [
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
] as const;

export const LAYOUT_RECIPES = [
  "app-shell",
  "dashboard",
  "docs",
  "list-detail",
  "split-hero",
  "gallery",
  "card-grid",
] as const;

export const INTERACTION_VARIANTS = [
  "primary",
  "secondary",
  "accent",
  "subtle",
  "warning",
  "danger",
] as const;

export const INTERACTION_LEVELS = [1, 2, 3] as const;

export type LayoutPersonality = (typeof LAYOUT_PERSONALITIES)[number];
export type LayoutRecipe = (typeof LAYOUT_RECIPES)[number];
export type InteractionVariant = (typeof INTERACTION_VARIANTS)[number];
export type InteractionLevel = (typeof INTERACTION_LEVELS)[number];

export type UiPreset =
  | "minimal-saas"
  | "bento"
  | "maximalist"
  | "bauhaus"
  | "tactile"
  | "neumorphism"
  | "retrofuturism"
  | "brutalism"
  | "cyberpunk"
  | "y2k"
  | "retro-glass";

export type UiTheme =
  | "midnight-gold"
  | "ocean-steel"
  | "forest-moss"
  | "sunset-ember"
  | "royal-plum"
  | "graphite-cyan"
  | "desert-sage"
  | "rose-quartz"
  | "cyber-lime"
  | "arctic-indigo";

export type UiMode = "light" | "dark" | "contrast";

type PublishedUiManifest = {
  readonly presets: readonly {
    readonly id: string;
    readonly label: string;
    readonly prefix: string;
  }[];
  readonly themes: readonly string[];
  readonly modes: readonly string[];
};

type UiPresetEntry = {
  readonly id: UiPreset;
  readonly label: string;
  readonly prefix: string;
};

const publishedUiManifest = uiManifest as PublishedUiManifest;

// The pinned manifest remains the runtime source of truth while these narrow
// catalog types keep downstream configuration code literal-safe.
export const UI_PRESETS = Object.freeze(
  publishedUiManifest.presets.map(({ id, label, prefix }) => ({
    id: id as UiPreset,
    label,
    prefix,
  })),
) as readonly UiPresetEntry[];

export const UI_THEMES = Object.freeze([
  ...publishedUiManifest.themes,
]) as readonly UiTheme[];

export const UI_MODES = Object.freeze([
  ...publishedUiManifest.modes,
]) as readonly UiMode[];

export function getUiPrefix(preset: UiPreset): string {
  const match = UI_PRESETS.find((entry) => entry.id === preset);
  if (!match) throw new Error(`Unknown UI preset: ${preset}`);
  return match.prefix;
}
