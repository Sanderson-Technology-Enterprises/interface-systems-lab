import {
  LAYOUT_PERSONALITIES,
  UI_MODES,
  UI_PRESETS,
  UI_THEMES,
  type LayoutPersonality,
  type UiMode,
  type UiPreset,
  type UiTheme,
} from "../data/catalog";

export type LabConfiguration = {
  layout: LayoutPersonality;
  ui: UiPreset;
  theme: UiTheme;
  mode: UiMode;
};

export const CONFIGURATION_STORAGE_KEY =
  "interface-systems-lab:configuration:v1";

export const DEFAULT_CONFIGURATION: Readonly<LabConfiguration> = Object.freeze({
  layout: "bento",
  ui: "minimal-saas",
  theme: "midnight-gold",
  mode: "dark",
});

type StoredConfiguration = Partial<LabConfiguration>;

function isLayoutPersonality(value: unknown): value is LayoutPersonality {
  return (
    typeof value === "string" &&
    LAYOUT_PERSONALITIES.some((personality) => personality === value)
  );
}

function isUiPreset(value: unknown): value is UiPreset {
  return (
    typeof value === "string" &&
    UI_PRESETS.some((preset) => preset.id === value)
  );
}

function isUiTheme(value: unknown): value is UiTheme {
  return (
    typeof value === "string" && UI_THEMES.some((theme) => theme === value)
  );
}

function isUiMode(value: unknown): value is UiMode {
  return typeof value === "string" && UI_MODES.some((mode) => mode === value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveValue<T>(
  queryValue: string | null,
  storedValue: unknown,
  fallback: T,
  isValid: (value: unknown) => value is T,
): T {
  if (isValid(queryValue)) return queryValue;
  if (isValid(storedValue)) return storedValue;
  return fallback;
}

export function parseStoredConfiguration(
  value: string | null,
): StoredConfiguration | null {
  if (value === null) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    if (!isRecord(parsed)) return null;

    // Persisted browser data is untrusted, so every field re-enters through
    // its published catalog before it can become application state.
    const configuration: StoredConfiguration = {};
    if (isLayoutPersonality(parsed.layout)) {
      configuration.layout = parsed.layout;
    }
    if (isUiPreset(parsed.ui)) configuration.ui = parsed.ui;
    if (isUiTheme(parsed.theme)) configuration.theme = parsed.theme;
    if (isUiMode(parsed.mode)) configuration.mode = parsed.mode;
    return configuration;
  } catch {
    return null;
  }
}

export function parseConfiguration(
  search: URLSearchParams,
  stored: StoredConfiguration | null = null,
): LabConfiguration {
  return {
    layout: resolveValue(
      search.get("layout"),
      stored?.layout,
      DEFAULT_CONFIGURATION.layout,
      isLayoutPersonality,
    ),
    ui: resolveValue(
      search.get("ui"),
      stored?.ui,
      DEFAULT_CONFIGURATION.ui,
      isUiPreset,
    ),
    theme: resolveValue(
      search.get("theme"),
      stored?.theme,
      DEFAULT_CONFIGURATION.theme,
      isUiTheme,
    ),
    mode: resolveValue(
      search.get("mode"),
      stored?.mode,
      DEFAULT_CONFIGURATION.mode,
      isUiMode,
    ),
  };
}

export function serializeConfiguration(
  configuration: LabConfiguration,
): URLSearchParams {
  const search = new URLSearchParams();
  search.set("layout", configuration.layout);
  search.set("ui", configuration.ui);
  search.set("theme", configuration.theme);
  search.set("mode", configuration.mode);
  return search;
}

export function configurationMarkup(configuration: LabConfiguration): string {
  return `<main
  class="ly-root"
  data-ly-layout="${configuration.layout}"
  data-ui="${configuration.ui}"
  data-theme="${configuration.theme}"
  data-mode="${configuration.mode}"
></main>`;
}
