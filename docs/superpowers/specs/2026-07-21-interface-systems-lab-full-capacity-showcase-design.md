# Interface Systems Lab Full-Capacity Showcase Design

## Goal

Turn Interface Systems Lab into the definitive one-page demonstration of
`layout-style-css`, `ui-style-kit-css`, and `interactive-surface-css`, while
giving developer adoption and Sanderson Technology Enterprises equal strategic
weight.

## Approved Direction

- Preserve the current midnight-gold observatory identity and the line “Design
  every layer. Keep one interface.”
- Keep one immersive public page. Do not split the primary experience into
  documentation routes.
- Let the selected layout personality, UI preset, theme, and mode transform the
  entire page, including navigation, corporate calls to action, and the footer.
- Use progressive disclosure: every capability is present on the page, while
  dense specimen inventories live in semantic `details` sections.
- Keep the working GitHub Pages URL as the canonical public URL and link
  prominently to `https://sandersontechnologyenterprises.com`.

## Ecosystem Contract

The site pins and demonstrates these exact releases:

- `ui-style-kit-css@2.1.0`
- `layout-style-css@2.1.0`
- `interactive-surface-css@1.5.0`

The canonical imports are:

```css
@import "ui-style-kit-css/visual.css";
@import "ui-style-kit-css/interactive-surface-theme.css";
@import "interactive-surface-css/state-core.css";
@import "layout-style-css";
```

The page root carries `.ly-root`, `data-ly-layout`, `data-ui`, `data-theme`,
and `data-mode`. The old `data-layout`, UI `with-bridge`, Interactive Surface
complete bundle, Layout bridge, and deprecated integration imports are shown
only as migration history, never used by the flagship runtime.

Ownership remains strict:

- Layout Style owns structure, responsive composition, recipes, and layout
  personalities.
- UI Style Kit owns themes, component and native-element paint, and preset
  identity.
- Interactive Surface owns hover, focus-visible, active, pressed, selected,
  current, busy, and disabled mechanics.
- Site CSS owns only brand assets, observatory geometry, page-specific
  composition, and narrow integration glue.

## Experience Architecture

`app/page.tsx` becomes a server-rendered composition. A client
`LabExperience` wrapper owns the global configuration and supplies the root
attributes; static children remain server-rendered, while the configuration
console, observatory, workbench, dialogs, state demonstrations, and copy/share
controls are client islands.

The page flows through these anchored sections:

1. A sticky header with the lab identity, section navigation, GitHub, and a
   visible Sanderson company link.
2. The observatory hero with equally prominent “Launch the workbench” and
   “Visit Sanderson Technology Enterprises” actions.
3. A sticky configuration console for layout, UI preset, theme, mode,
   randomize, reset, copy markup, and share link.
4. A realistic combined-system client workspace proving all three libraries
   against one semantic DOM.
5. A Layout laboratory.
6. A UI and native-elements laboratory.
7. An interaction-state laboratory.
8. An integration laboratory proving one-package, pair, all-three, canonical,
   and legacy adoption paths in isolated iframes.
9. Installation, package resources, architecture explanation, and a balanced
   final developer/company conversion section.

## Configuration Behavior

The exact state shape is:

```ts
type LabConfiguration = {
  layout: LayoutPersonality;
  ui: UiPreset;
  theme: UiTheme;
  mode: UiMode;
};
```

Defaults are `bento`, `minimal-saas`, `midnight-gold`, and `dark`. Valid URL
query parameters take precedence over the saved configuration, which takes
precedence over defaults. Invalid or unknown values are ignored. State writes
to `localStorage` under `interface-systems-lab:configuration:v1` and updates
the current URL with `history.replaceState`; the canonical link always remains
the base production URL. Reset clears saved and query state. Share copies the
fully qualified configured URL. Clipboard failures expose selectable text and
an accessible live message.

## Full Capability Inventory

### Layout Style CSS

- All 16 personalities.
- All seven recipes: app shell, dashboard, docs, list-detail, split hero,
  gallery, and card grid.
- Wrappers, center, stack, cluster, cover, switcher, sidebar, panes, media,
  reel, scroll region, frame, grid, breakout lanes, spacing, and alignment
  utilities.
- Personality changes must alter computed geometry without changing semantic
  order or keyboard order.

### UI Style Kit CSS

- All 11 presets, prefixes, 10 themes, and three modes, derived from the
  published `manifest.json` rather than duplicated constants.
- Prefixed controls, cards, panels, alerts, badges, fields, choices, switches,
  pills, centered `button-pill`, spinners, tooltips in four directions,
  semantic state helpers, shape helpers, and accessibility helpers.
- Modern semantic content and native elements, including text/search/password/
  number/date/time/color/file inputs, placeholder and file-button states,
  checkbox/radio/switch, range, progress, meter, details/summary, list markers,
  scrollbars, required/read-only/valid/invalid/disabled/indeterminate states,
  engine indicators, and a real modal dialog opened with `showModal()`.
- Platform-owned behavior such as datalist and native popup limitations is
  explained without replacing native accessibility.

### Interactive Surface CSS

- Primary, secondary, accent, subtle, warning, and danger treatments at levels
  1–3.
- Hover, focus-visible, active, pressed, selected, current, busy/loading,
  `aria-disabled`, native disabled, and class API parity.
- A collision specimen proving the precedence chain: disabled, busy, active,
  pressed/selected/current, hover, base. Focus-visible stays independent for
  all focusable non-disabled states.
- Reduced-motion and forced-colors demonstrations use the library behavior;
  local CSS only disables observatory-specific motion.

### Integration Proofs

Generated static iframe fixtures isolate each package alone, all three package
pairs, the canonical all-three stack, and the legacy stack. Fixture CSS is
copied from the installed packages during development and production builds;
the fixtures never depend on mutable CDN aliases. The adoption guide provides
use-one, use-two, and use-all-three npm, bundler, and immutable CDN examples,
with deprecated paths labeled clearly.

## SEO, Brand, and Performance

- Canonical production URL:
  `https://sanderson-technology-enterprises.github.io/interface-systems-lab/`.
- Canonical repository:
  `https://github.com/Sanderson-Technology-Enterprises/interface-systems-lab`.
- Corporate URL: `https://sandersontechnologyenterprises.com`.
- Correct canonical, Open Graph, Twitter, icon, manifest, robots, sitemap, and
  JSON-LD URLs must be emitted from one site configuration.
- Organization structured data names Sanderson Technology Enterprises and
  links to the corporate URL; the lab remains the `WebSite`, `WebPage`, and
  free `SoftwareApplication`, with an `ItemList` of the three published
  packages.
- Visible headings and copy naturally cover CSS design systems, responsive
  layout, accessible native controls, interaction states, themes, and package
  integration. No hidden keyword text or unsupported claims are added.
- The single sitemap entry omits a synthetic build-time `lastModified` value.
- Search verification metadata is optional and environment-driven; no fake
  verification tokens or analytics are shipped. The site remains cookie-free.
- Reuse appropriately sized existing logo assets instead of loading the
  1,254-pixel master image into a 48-pixel slot.
- Remove the unused Tailwind/PostCSS authoring path so the flagship proves the
  three released libraries directly.

## Accessibility and Quality

- WCAG 2.2 AA is the floor across representative configurations.
- Controls prefer 44-pixel targets and never fall below the 24-pixel target or
  spacing rule.
- Every state has visible focus, readable labels, semantic roles, keyboard
  operation, and live feedback where state changes are not otherwise announced.
- The page must have one H1, logical headings, a working skip link, landmark
  navigation, no horizontal overflow from 320 through 1,440 pixels, and usable
  forced-colors/reduced-motion behavior.
- Tests cover source contracts, invalid configuration recovery, URL and storage
  precedence, build-generated fixture isolation, export metadata, all catalog
  values, rendered style changes, keyboard behavior, native/modal states,
  interaction precedence, target sizing, axe scans, and representative
  Chromium/Firefox/WebKit rendering.
- Linting, type checking, formatting, unit tests, fixture generation, static
  export validation, browser tests, accessibility scans, audit, and a clean
  `git diff --check` are required before handoff.

## Deployment

GitHub Pages must deploy only the verified `out/` artifact through the custom
Actions workflow. The legacy Pages source is an external repository setting;
after the code is ready, switch Pages to GitHub Actions with explicit user
approval, deploy, and verify live canonical metadata, assets, links, and
rendered behavior. No deployment occurs implicitly during implementation.
