export type ResourceLink = "repository" | "wiki" | "npm" | "demo";

export type EcosystemPackage = {
  name: "layout-style-css" | "ui-style-kit-css" | "interactive-surface-css";
  displayName: string;
  version: string;
  layer: string;
  summary: string;
  attribute: string;
  recommendedEntryPoint: string;
  fixture: "layout-only" | "ui-only" | "interactive-only";
  links: Record<ResourceLink, string>;
};

export const ECOSYSTEM_PACKAGES: readonly EcosystemPackage[] = [
  {
    name: "layout-style-css",
    displayName: "Layout Style CSS",
    version: "2.1.0",
    layer: "Structure",
    summary:
      "Responsive shells, wrappers, grids, panes, and switchable layout personalities.",
    attribute: 'data-ly-layout="bento"',
    recommendedEntryPoint: "layout-style-css",
    fixture: "layout-only",
    links: {
      repository: "https://github.com/Foscat/Layout-Style-CSS",
      wiki: "https://github.com/Foscat/Layout-Style-CSS/wiki",
      npm: "https://www.npmjs.com/package/layout-style-css",
      demo: "https://foscat.github.io/Layout-Style-CSS/",
    },
  },
  {
    name: "ui-style-kit-css",
    displayName: "UI Style Kit CSS",
    version: "2.1.0",
    layer: "Identity",
    summary:
      "Visual systems, palettes, native-element coverage, and display modes.",
    attribute: 'data-ui="minimal-saas"',
    recommendedEntryPoint: "ui-style-kit-css/visual.css",
    fixture: "ui-only",
    links: {
      repository: "https://github.com/Foscat/ui-style-kit-css",
      wiki: "https://github.com/Foscat/ui-style-kit-css/wiki",
      npm: "https://www.npmjs.com/package/ui-style-kit-css",
      demo: "https://foscat.github.io/ui-style-kit-css/",
    },
  },
  {
    name: "interactive-surface-css",
    displayName: "Interactive Surface CSS",
    version: "1.5.0",
    layer: "Behavior",
    summary:
      "Consistent hover, focus-visible, active, pressed, and disabled states.",
    attribute: 'class="interactive-surface"',
    recommendedEntryPoint: "interactive-surface-css/standalone-preset.css",
    fixture: "interactive-only",
    links: {
      repository: "https://github.com/Foscat/Interactive-Surface-CSS",
      wiki: "https://github.com/Foscat/Interactive-Surface-CSS/wiki",
      npm: "https://www.npmjs.com/package/interactive-surface-css",
      demo: "https://foscat.github.io/Interactive-Surface-CSS/",
    },
  },
] as const;

export const NPM_INSTALL =
  "npm install ui-style-kit-css@2.1.0 layout-style-css@2.1.0 interactive-surface-css@1.5.0";

// The cascade follows each package's documented ownership boundary.
export const BUNDLER_IMPORTS = [
  '@import "ui-style-kit-css/visual.css";',
  '@import "ui-style-kit-css/interactive-surface-theme.css";',
  '@import "interactive-surface-css/state-core.css";',
  '@import "layout-style-css";',
] as const;

export const CDN_LINKS = [
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
] as const;

export const CDN_MARKUP = CDN_LINKS.map(
  ({ href }) => `<link rel="stylesheet" href="${href}">`,
).join("\n");

export type AdoptionPathId =
  | "layout-only"
  | "ui-only"
  | "interactive-only"
  | "layout-ui"
  | "layout-interactive"
  | "ui-interactive"
  | "all-canonical"
  | "all-legacy";

export type AdoptionScope = "one" | "pair" | "all" | "legacy";
export type AdoptionFormat = "npm" | "bundler" | "cdn";

export type AdoptionSnippet = {
  id: string;
  format: AdoptionFormat;
  label: string;
  title: string;
  code: string;
};

export type AdoptionPath = {
  id: AdoptionPathId;
  scope: AdoptionScope;
  title: string;
  summary: string;
  packages: readonly EcosystemPackage["name"][];
  deprecated: boolean;
  snippets: readonly AdoptionSnippet[];
};

const uiVisualCdn = CDN_LINKS[0];
const uiThemeCdn = CDN_LINKS[1];
const interactionCoreCdn = CDN_LINKS[2];
const layoutCdn = CDN_LINKS[3];
const interactionStandaloneCdn = {
  packageName: "interactive-surface-css",
  href: "https://cdn.jsdelivr.net/npm/interactive-surface-css@1.5.0/standalone-preset.css",
} as const;
const uiLegacyCdn = {
  packageName: "ui-style-kit-css",
  href: "https://cdn.jsdelivr.net/npm/ui-style-kit-css@2.1.0/dist/ui-style-kit.with-bridge.min.css",
} as const;
const interactionLegacyCdn = {
  packageName: "interactive-surface-css",
  href: "https://cdn.jsdelivr.net/npm/interactive-surface-css@1.5.0/interactive-surface.css",
} as const;
const layoutBridgeCdn = {
  packageName: "layout-style-css",
  href: "https://cdn.jsdelivr.net/npm/layout-style-css@2.1.0/dist/integrations/ui-style-kit.css",
} as const;
const layoutLegacyCdn = {
  packageName: "layout-style-css",
  href: "https://cdn.jsdelivr.net/npm/layout-style-css@2.1.0/dist/legacy.css",
} as const;

function cdnMarkup(links: readonly { readonly href: string }[]): string {
  return links
    .map(({ href }) => `<link rel="stylesheet" href="${href}">`)
    .join("\n");
}

function adoptionSnippets(
  id: AdoptionPathId,
  npm: string,
  bundler: readonly string[],
  cdn: readonly { readonly href: string }[],
  npmTitle: string,
): readonly AdoptionSnippet[] {
  return [
    {
      id: `${id}-npm`,
      format: "npm",
      label: "npm",
      title: npmTitle,
      code: npm,
    },
    {
      id: `${id}-bundler`,
      format: "bundler",
      label: "CSS imports",
      title:
        id === "all-legacy"
          ? "Load migration compatibility"
          : "Load the cascade",
      code: bundler.join("\n"),
    },
    {
      id: `${id}-cdn`,
      format: "cdn",
      label: "CDN",
      title: "Use immutable CDN links",
      code: cdnMarkup(cdn),
    },
  ];
}

export const ADOPTION_PATHS = [
  {
    id: "layout-only",
    scope: "one",
    title: "Layout Style CSS",
    summary:
      "Adopt responsive structure without changing component paint or state behavior.",
    packages: ["layout-style-css"],
    deprecated: false,
    snippets: adoptionSnippets(
      "layout-only",
      "npm install layout-style-css@2.1.0",
      ['@import "layout-style-css";'],
      [layoutCdn],
      "Install Layout Style CSS",
    ),
  },
  {
    id: "ui-only",
    scope: "one",
    title: "UI Style Kit CSS",
    summary:
      "Adopt themes, component paint, and native-control styling without a layout dependency.",
    packages: ["ui-style-kit-css"],
    deprecated: false,
    snippets: adoptionSnippets(
      "ui-only",
      "npm install ui-style-kit-css@2.1.0",
      ['@import "ui-style-kit-css/visual.css";'],
      [uiVisualCdn],
      "Install UI Style Kit CSS",
    ),
  },
  {
    id: "interactive-only",
    scope: "one",
    title: "Interactive Surface CSS",
    summary:
      "Adopt portable state mechanics with the package's neutral standalone presentation.",
    packages: ["interactive-surface-css"],
    deprecated: false,
    snippets: adoptionSnippets(
      "interactive-only",
      "npm install interactive-surface-css@1.5.0",
      ['@import "interactive-surface-css/standalone-preset.css";'],
      [interactionStandaloneCdn],
      "Install Interactive Surface CSS",
    ),
  },
  {
    id: "layout-ui",
    scope: "pair",
    title: "Layout plus UI",
    summary:
      "Combine structural recipes with visual identity while retaining existing interaction behavior.",
    packages: ["ui-style-kit-css", "layout-style-css"],
    deprecated: false,
    snippets: adoptionSnippets(
      "layout-ui",
      "npm install ui-style-kit-css@2.1.0 layout-style-css@2.1.0",
      ['@import "ui-style-kit-css/visual.css";', '@import "layout-style-css";'],
      [uiVisualCdn, layoutCdn],
      "Install Layout and UI",
    ),
  },
  {
    id: "layout-interactive",
    scope: "pair",
    title: "Layout plus interaction",
    summary:
      "Combine responsive geometry with standalone interaction surfaces and states.",
    packages: ["interactive-surface-css", "layout-style-css"],
    deprecated: false,
    snippets: adoptionSnippets(
      "layout-interactive",
      "npm install interactive-surface-css@1.5.0 layout-style-css@2.1.0",
      [
        '@import "interactive-surface-css/standalone-preset.css";',
        '@import "layout-style-css";',
      ],
      [interactionStandaloneCdn, layoutCdn],
      "Install Layout and Interaction",
    ),
  },
  {
    id: "ui-interactive",
    scope: "pair",
    title: "UI plus interaction",
    summary:
      "Feed UI theme paint into the canonical state engine without adopting layout structure.",
    packages: ["ui-style-kit-css", "interactive-surface-css"],
    deprecated: false,
    snippets: adoptionSnippets(
      "ui-interactive",
      "npm install ui-style-kit-css@2.1.0 interactive-surface-css@1.5.0",
      [
        '@import "ui-style-kit-css/visual.css";',
        '@import "ui-style-kit-css/interactive-surface-theme.css";',
        '@import "interactive-surface-css/state-core.css";',
      ],
      [uiVisualCdn, uiThemeCdn, interactionCoreCdn],
      "Install UI and Interaction",
    ),
  },
  {
    id: "all-canonical",
    scope: "all",
    title: "The canonical all-three stack",
    summary:
      "Use the complete ownership-separated cascade demonstrated by the flagship page.",
    packages: [
      "ui-style-kit-css",
      "interactive-surface-css",
      "layout-style-css",
    ],
    deprecated: false,
    snippets: adoptionSnippets(
      "all-canonical",
      NPM_INSTALL,
      BUNDLER_IMPORTS,
      CDN_LINKS,
      "Install all three",
    ),
  },
  {
    id: "all-legacy",
    scope: "legacy",
    title: "Legacy v2 compatibility",
    summary:
      "Use only while migrating frozen structural and stateful compatibility paths to the canonical stack.",
    packages: [
      "ui-style-kit-css",
      "interactive-surface-css",
      "layout-style-css",
    ],
    deprecated: true,
    snippets: adoptionSnippets(
      "all-legacy",
      NPM_INSTALL,
      [
        '@import "ui-style-kit-css/with-bridge.css";',
        '@import "interactive-surface-css/interactive-surface.css";',
        '@import "layout-style-css/integrations/ui-style-kit.css";',
        '@import "layout-style-css/legacy.css";',
      ],
      [uiLegacyCdn, interactionLegacyCdn, layoutBridgeCdn, layoutLegacyCdn],
      "Install legacy-compatible releases",
    ),
  },
] as const satisfies readonly AdoptionPath[];
