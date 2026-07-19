# Interface Observatory SEO and GitHub Pages Design

## Purpose

Interface Systems Lab will become the canonical interactive showcase for three coordinated CSS libraries: `layout-style-css`, `ui-style-kit-css`, and `interactive-surface-css`. The site will primarily serve developers evaluating or adopting the packages, while retaining a concise explanation of their value for client-facing interface work.

The production URL is `https://foscat.github.io/interface-systems-lab/`. All exported metadata, crawler files, manifest paths, social images, and internal links must work from that GitHub Pages project path.

## Visual Direction: Interface Observatory

The page will use an observatory metaphor to show three independent interface layers working as one system. The existing audio-like signal bars will be removed and replaced with a responsive orbital diagram:

- the outer orbit represents `layout-style-css` and structural geometry;
- the middle orbit represents `ui-style-kit-css` and visual identity;
- the inner orbit represents `interactive-surface-css` and interaction states;
- a central interface core shows that all three layers act on the same semantic markup;
- restrained rotation and pulse motion will pause for reduced-motion users;
- orbit labels remain real HTML so the explanation is selectable, accessible, and responsive;
- the graphic changes accent treatment with the active theme and mode but does not become a separate application control.

The visual language will retain the current dark, technical personality while reducing dashboard chrome. Large editorial typography, open section bands, precise rules, and the single orbital composition will replace decorative meters, redundant badges, and repeated card framing.

## Information Architecture

The final page will use this order:

1. **Header:** brand, Workbench, Install, Libraries, and GitHub repository links.
2. **Hero:** developer-first positioning, primary Workbench action, secondary GitHub action, and the orbital system graphic.
3. **Workbench:** the current layout, UI style, palette, and mode controls with the client portal preview and live configuration output.
4. **Install:** npm and CDN integration examples with copy controls and explicit source-order guidance.
5. **Libraries:** three package rows, each with purpose, current version, repository, wiki, npm, and live demo links.
6. **Architecture:** the three ownership boundaries and the shared root attribute contract.
7. **Footer:** project repository, package links, production URL context, and technology attribution.

The current standalone client-services contact section will be removed. A short client-work value statement may remain in the architecture or footer, but the primary conversion paths are package adoption and GitHub exploration.

## Dependency and Import Contract

The installation section must distinguish installation order from stylesheet cascade order.

### npm installation

The package command lists dependencies by ecosystem layer:

```bash
npm install layout-style-css@1.1.2 ui-style-kit-css@2.0.3 interactive-surface-css@1.3.0
```

### Bundler imports

The cascade order follows the packages' current bridge contracts: theme and visual tokens first, interaction behavior second, and layout bridge/structure last.

```css
@import "ui-style-kit-css/with-bridge.css";
@import "interactive-surface-css/interactive-surface.css";
@import "layout-style-css/bridge.css";
@import "layout-style-css";
```

### CDN links

CDN snippets will use immutable, exact versions and jsDelivr package URLs in the same cascade order:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/ui-style-kit-css@2.0.3/dist/ui-style-kit.with-bridge.min.css"
/>
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/interactive-surface-css@1.3.0/interactive-surface.css"
/>
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/layout-style-css@1.1.2/dist/layout-style-css.min.css"
/>
```

The implementation must verify that every CDN URL returns a successful response and that each exported path exists in the installed package. If the exact package contract differs, the snippet will be corrected to the verified current entrypoint rather than preserving an invalid planned URL.

## Resource Directory

Each library row will expose four visible, descriptive links:

| Library                   | Repository                                          | Wiki                                                     | npm                                                     | Live demo                                           |
| ------------------------- | --------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------- |
| `layout-style-css`        | `https://github.com/Foscat/Layout-Style-CSS`        | `https://github.com/Foscat/Layout-Style-CSS/wiki`        | `https://www.npmjs.com/package/layout-style-css`        | `https://foscat.github.io/Layout-Style-CSS/`        |
| `ui-style-kit-css`        | `https://github.com/Foscat/ui-style-kit-css`        | `https://github.com/Foscat/ui-style-kit-css/wiki`        | `https://www.npmjs.com/package/ui-style-kit-css`        | `https://foscat.github.io/ui-style-kit-css/`        |
| `interactive-surface-css` | `https://github.com/Foscat/Interactive-Surface-CSS` | `https://github.com/Foscat/Interactive-Surface-CSS/wiki` | `https://www.npmjs.com/package/interactive-surface-css` | `https://foscat.github.io/Interactive-Surface-CSS/` |

These destinations were verified during design on 2026-07-14. Automated link-contract tests will assert the exact destinations, while live HTTP checks will remain a deliberate verification step because external availability can change independently of this repository.

## SEO and Discoverability Contract

The exported document will include:

- a title template and a unique home-page title;
- a concise search description and relevant, non-spammy keywords;
- `metadataBase` and an absolute canonical URL;
- author, creator, publisher, application name, category, and referrer metadata;
- explicit indexing, following, snippet, image-preview, and video-preview robot directives;
- Open Graph website metadata with canonical URL, locale, site name, title, description, and a 1200 x 630 social image;
- Twitter summary-large-image metadata;
- favicon, PNG icon, Apple touch icon, maskable icon, manifest, and Microsoft tile metadata;
- theme-color declarations for supported light and dark color schemes;
- JSON-LD for `WebSite`, `WebPage`, `SoftwareApplication`, and the three software packages as an `ItemList`;
- semantic landmark and heading structure, descriptive link text, accessible labels, and crawlable package copy;
- static `robots.txt` and `sitemap.xml` output at the project root;
- a Pages-safe web manifest whose icon URLs include the project base path in the deployed artifact;
- a custom `404.html` suitable for GitHub Pages static hosting.

Metadata must not claim unsupported capabilities, ratings, pricing, or organization facts. Structured data will describe the project and public packages using values visible on the page.

## Application Structure

The existing single page is large enough that the implementation should separate stable content from behavior:

- `app/layout.tsx` owns global metadata, viewport configuration, fonts, and JSON-LD placement.
- `app/page.tsx` remains the client entry and composes focused sections.
- `app/components/InterfaceObservatory.tsx` owns the accessible orbital visualization.
- `app/components/InstallGuide.tsx` owns snippets and copy behavior.
- `app/components/LibraryDirectory.tsx` renders the verified resource rows.
- `app/data/ecosystem.ts` is the single source for package versions, install entrypoints, and external destinations.
- `app/robots.ts`, `app/sitemap.ts`, and `app/manifest.ts` generate Pages-aware crawler and manifest artifacts.
- `app/not-found.tsx` provides the static not-found experience.
- `scripts/verify-export.mjs` validates the exported Pages artifact and external-link contract.

Existing work in `public/interface-systems-lab-social-card.png` will be preserved and used. The intentional deletion of `public/favicon.svg` will also be preserved; metadata will reference the existing production PNG and ICO favicon set instead.

## Interaction and Accessibility

- All existing workbench controls remain keyboard-operable and labeled.
- Copy controls report success or fallback instructions through the existing polite live region.
- External links use descriptive names; links that open in a new tab must also include safe `rel` values and an accessible indication.
- The orbital diagram is supplementary and never the only explanation of package ownership.
- Focus remains visible across every theme and mode.
- Motion respects `prefers-reduced-motion` and does not gate information.
- The page must remain usable at 320 CSS pixels without horizontal document overflow.
- Color and control behavior continue to be owned by the three libraries; local CSS handles only lab-specific composition and the observatory illustration.

## GitHub Pages and Continuous Deployment

The Next.js app remains a static export. `next.config.ts` will derive the Pages base path from `PAGES_BASE_PATH`, preserve trailing slashes, and keep image optimization disabled for static hosting.

The GitHub Actions workflow will use separate quality and deployment responsibilities:

1. checkout the exact commit;
2. install the supported Node 22 runtime and npm dependencies with a clean lockfile install;
3. run lint and repository tests;
4. build with `PAGES_BASE_PATH=/interface-systems-lab` for this project site;
5. verify `out/index.html`, canonical/social URLs, crawler files, manifest paths, resource destinations, install order, and absence of broken root-relative assets;
6. configure Pages, upload only the verified `out/` artifact, and deploy it;
7. expose the deployed URL through the protected `github-pages` environment.

The workflow will retain least-privilege permissions, concurrency cancellation, push-to-`main`, pull-request quality checks where applicable, and manual dispatch support. Deployment is only performed for `main` or a manual run, never for an untrusted pull request.

## Error Handling

- Clipboard failure leaves the snippet selectable and changes the control label to a manual-copy instruction.
- Missing or invalid ecosystem resource data fails repository verification rather than silently omitting links.
- Export verification reports the exact file and URL contract that failed.
- GitHub Pages paths are computed from one shared site configuration to avoid canonical, manifest, and asset-prefix drift.
- External link downtime is reported distinctly from local source-contract failures.

## Verification and Acceptance Criteria

Implementation is complete only when all of the following are true:

- lint and TypeScript/build checks pass without configuration suppression;
- the static export builds for `/interface-systems-lab`;
- artifact checks prove canonical, Open Graph, Twitter, icon, manifest, sitemap, robots, and JSON-LD output;
- the manifest and all local assets resolve from the Pages project base path;
- npm and CDN examples show verified entrypoints in the documented order;
- all twelve repository, wiki, npm, and demo destinations are present and live checks succeed;
- the audio-like bar graph no longer exists and the responsive orbital graphic renders correctly;
- the workbench still updates layout, UI style, palette, and mode and its copy controls work;
- keyboard, reduced-motion, desktop, and mobile browser checks pass;
- the exported site has no horizontal document overflow or missing console assets;
- the deployment workflow passes a syntax and contract review and uses the verified output artifact;
- a rendered desktop and mobile comparison confirms the approved Interface Observatory hierarchy and visual direction.

## Scope Boundaries

This work does not publish new npm versions, modify the three library repositories, or enable GitHub Pages settings through account-level administration. It prepares and verifies this repository so a push to `main` can deploy once the repository's Pages source is set to GitHub Actions. Any external Pages-setting or GitHub permission blocker will be reported separately from local completion.
