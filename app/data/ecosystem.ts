export type ResourceLink = "repository" | "wiki" | "npm" | "demo";

export type EcosystemPackage = {
  name:
    | "layout-style-css"
    | "ui-style-kit-css"
    | "ui-style-kit-icons"
    | "interactive-surface-css";
  displayName: string;
  version: string;
  layer: string;
  summary: string;
  attribute: string;
  recommendedEntryPoint: string;
  fixture: "layout-only" | "ui-only" | "icon-only" | "interactive-only";
  links: Record<ResourceLink, string>;
};

export const ECOSYSTEM_PACKAGES: readonly EcosystemPackage[] = [
  {
    name: "layout-style-css",
    displayName: "Layout Style CSS",
    version: "3.1.0",
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
    version: "2.3.0",
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
    name: "ui-style-kit-icons",
    displayName: "UI Style Kit Icons",
    version: "1.0.0",
    layer: "Iconography",
    summary:
      "Semantic SVG artwork that automatically follows the selected UI style.",
    attribute: '<usk-icon name="dashboard">',
    recommendedEntryPoint: "ui-style-kit-icons/element",
    fixture: "icon-only",
    links: {
      repository: "https://github.com/Foscat/ui-style-kit-icons",
      wiki: "https://github.com/Foscat/ui-style-kit-icons/wiki",
      npm: "https://www.npmjs.com/package/ui-style-kit-icons",
      demo: "https://foscat.github.io/ui-style-kit-icons/",
    },
  },
  {
    name: "interactive-surface-css",
    displayName: "Interactive Surface CSS",
    version: "1.6.0",
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
  "npm install ui-style-kit-css@2.3.0 ui-style-kit-icons@1.0.0 layout-style-css@3.1.0 interactive-surface-css@1.6.0";

export const BUNDLER_IMPORTS = [
  'import "ui-style-kit-css/visual.css";',
  'import "ui-style-kit-css/interactive-surface-theme.css";',
  'import "interactive-surface-css/state-core.css";',
  'import "layout-style-css";',
  'import "ui-style-kit-icons/css.css";',
  'import "ui-style-kit-icons/element";',
] as const;

type CdnAsset = {
  readonly packageName: EcosystemPackage["name"];
  readonly kind: "module" | "style";
  readonly href: string;
};

const iconCssCdn: CdnAsset = {
  packageName: "ui-style-kit-icons",
  kind: "style",
  href: "https://cdn.jsdelivr.net/npm/ui-style-kit-icons@1.0.0/dist/ui-style-kit-icons.css",
};

const iconRuntimeCdn: CdnAsset = {
  packageName: "ui-style-kit-icons",
  kind: "module",
  href: "https://cdn.jsdelivr.net/npm/ui-style-kit-icons@1.0.0/dist/ui-style-kit-icons.js",
};

export const CDN_LINKS = [
  {
    packageName: "ui-style-kit-css",
    kind: "style",
    href: "https://cdn.jsdelivr.net/npm/ui-style-kit-css@2.3.0/dist/ui-style-kit.visual.min.css",
  },
  {
    packageName: "ui-style-kit-css",
    kind: "style",
    href: "https://cdn.jsdelivr.net/npm/ui-style-kit-css@2.3.0/styles/interactive-surface-theme.css",
  },
  {
    packageName: "interactive-surface-css",
    kind: "style",
    href: "https://cdn.jsdelivr.net/npm/interactive-surface-css@1.6.0/state-core.css",
  },
  {
    packageName: "layout-style-css",
    kind: "style",
    href: "https://cdn.jsdelivr.net/npm/layout-style-css@3.1.0/dist/layout-style-css.min.css",
  },
  iconCssCdn,
  iconRuntimeCdn,
] as const satisfies readonly CdnAsset[];

function cdnMarkup(assets: readonly CdnAsset[]): string {
  return assets
    .map((asset) =>
      asset.kind === "style"
        ? `<link rel="stylesheet" href="${asset.href}">`
        : `<script type="module" src="${asset.href}"></script>`,
    )
    .join("\n");
}

export const CDN_MARKUP = cdnMarkup(CDN_LINKS);

export type AdoptionPathId =
  | "layout-only"
  | "ui-only"
  | "icons-only"
  | "interactive-only"
  | "layout-ui"
  | "ui-icons"
  | "layout-interactive"
  | "ui-interactive"
  | "all-canonical";

export type AdoptionScope = "one" | "pair" | "all";
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
const interactionStandaloneCdn: CdnAsset = {
  packageName: "interactive-surface-css",
  kind: "style",
  href: "https://cdn.jsdelivr.net/npm/interactive-surface-css@1.6.0/standalone-preset.css",
};

function adoptionSnippets(
  id: AdoptionPathId,
  npm: string,
  bundler: readonly string[],
  cdn: readonly CdnAsset[],
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
      label: "Imports",
      title: "Load the ownership-separated stack",
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
      "npm install layout-style-css@3.1.0",
      ['import "layout-style-css";'],
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
      "npm install ui-style-kit-css@2.3.0",
      ['import "ui-style-kit-css/visual.css";'],
      [uiVisualCdn],
      "Install UI Style Kit CSS",
    ),
  },
  {
    id: "icons-only",
    scope: "one",
    title: "UI Style Kit Icons",
    summary:
      "Adopt semantic SVG artwork that follows the selected UI style without a layout dependency.",
    packages: ["ui-style-kit-icons"],
    deprecated: false,
    snippets: adoptionSnippets(
      "icons-only",
      "npm install ui-style-kit-icons@1.0.0",
      [
        'import "ui-style-kit-icons/css.css";',
        'import "ui-style-kit-icons/element";',
      ],
      [iconCssCdn, iconRuntimeCdn],
      "Install UI Style Kit Icons",
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
      "npm install interactive-surface-css@1.6.0",
      ['import "interactive-surface-css/standalone-preset.css";'],
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
    packages: ["layout-style-css", "ui-style-kit-css"],
    deprecated: false,
    snippets: adoptionSnippets(
      "layout-ui",
      "npm install layout-style-css@3.1.0 ui-style-kit-css@2.3.0",
      ['import "ui-style-kit-css/visual.css";', 'import "layout-style-css";'],
      [uiVisualCdn, layoutCdn],
      "Install Layout and UI",
    ),
  },
  {
    id: "ui-icons",
    scope: "pair",
    title: "UI plus icons",
    summary:
      "Pair UI style tokens with semantic SVG artwork that inherits the selected visual language.",
    packages: ["ui-style-kit-css", "ui-style-kit-icons"],
    deprecated: false,
    snippets: adoptionSnippets(
      "ui-icons",
      "npm install ui-style-kit-css@2.3.0 ui-style-kit-icons@1.0.0",
      [
        'import "ui-style-kit-css/visual.css";',
        'import "ui-style-kit-icons/css.css";',
        'import "ui-style-kit-icons/element";',
      ],
      [uiVisualCdn, iconCssCdn, iconRuntimeCdn],
      "Install UI and Icons",
    ),
  },
  {
    id: "layout-interactive",
    scope: "pair",
    title: "Layout plus interaction",
    summary:
      "Combine responsive geometry with standalone interaction surfaces and states.",
    packages: ["layout-style-css", "interactive-surface-css"],
    deprecated: false,
    snippets: adoptionSnippets(
      "layout-interactive",
      "npm install layout-style-css@3.1.0 interactive-surface-css@1.6.0",
      [
        'import "interactive-surface-css/standalone-preset.css";',
        'import "layout-style-css";',
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
      "npm install ui-style-kit-css@2.3.0 interactive-surface-css@1.6.0",
      [
        'import "ui-style-kit-css/visual.css";',
        'import "ui-style-kit-css/interactive-surface-theme.css";',
        'import "interactive-surface-css/state-core.css";',
      ],
      [uiVisualCdn, uiThemeCdn, interactionCoreCdn],
      "Install UI and Interaction",
    ),
  },
  {
    id: "all-canonical",
    scope: "all",
    title: "The canonical all-four stack",
    summary:
      "Use the complete ownership-separated stack demonstrated by the flagship page.",
    packages: [
      "layout-style-css",
      "ui-style-kit-css",
      "ui-style-kit-icons",
      "interactive-surface-css",
    ],
    deprecated: false,
    snippets: adoptionSnippets(
      "all-canonical",
      NPM_INSTALL,
      BUNDLER_IMPORTS,
      CDN_LINKS,
      "Install all four",
    ),
  },
] as const satisfies readonly AdoptionPath[];
