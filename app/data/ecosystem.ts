export type ResourceLink = "repository" | "wiki" | "npm" | "demo";

export type EcosystemPackage = {
  name: "layout-style-css" | "ui-style-kit-css" | "interactive-surface-css";
  displayName: string;
  version: string;
  layer: string;
  summary: string;
  attribute: string;
  links: Record<ResourceLink, string>;
};

export const ECOSYSTEM_PACKAGES: readonly EcosystemPackage[] = [
  {
    name: "layout-style-css",
    displayName: "Layout Style CSS",
    version: "1.1.2",
    layer: "Structure",
    summary:
      "Responsive shells, wrappers, grids, panes, and switchable layout personalities.",
    attribute: 'data-layout="bento"',
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
    version: "2.0.3",
    layer: "Identity",
    summary:
      "Visual systems, palettes, native-element coverage, and display modes.",
    attribute: 'data-ui="minimal-saas"',
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
    version: "1.3.0",
    layer: "Behavior",
    summary:
      "Consistent hover, focus-visible, active, pressed, and disabled states.",
    attribute: 'class="interactive-surface"',
    links: {
      repository: "https://github.com/Foscat/Interactive-Surface-CSS",
      wiki: "https://github.com/Foscat/Interactive-Surface-CSS/wiki",
      npm: "https://www.npmjs.com/package/interactive-surface-css",
      demo: "https://foscat.github.io/Interactive-Surface-CSS/",
    },
  },
] as const;

export const NPM_INSTALL =
  "npm install layout-style-css@1.1.2 ui-style-kit-css@2.0.3 interactive-surface-css@1.3.0";

// The cascade follows each package's documented ownership boundary.
export const BUNDLER_IMPORTS = [
  '@import "ui-style-kit-css/with-bridge.css";',
  '@import "interactive-surface-css/interactive-surface.css";',
  '@import "layout-style-css/bridge.css";',
  '@import "layout-style-css";',
] as const;

export const CDN_LINKS = [
  {
    packageName: "ui-style-kit-css",
    href: "https://cdn.jsdelivr.net/npm/ui-style-kit-css@2.0.3/dist/ui-style-kit.with-bridge.min.css",
  },
  {
    packageName: "interactive-surface-css",
    href: "https://cdn.jsdelivr.net/npm/interactive-surface-css@1.3.0/interactive-surface.css",
  },
  {
    packageName: "layout-style-css",
    href: "https://cdn.jsdelivr.net/npm/layout-style-css@1.1.2/dist/layout-style-css.min.css",
  },
] as const;

export const CDN_MARKUP = CDN_LINKS.map(
  ({ href }) => `<link rel="stylesheet" href="${href}">`,
).join("\n");
