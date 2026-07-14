# Interface Systems Lab

[Interface Systems Lab](https://foscat.github.io/interface-systems-lab/) is an interactive observatory for three coordinated, independently useful CSS libraries. It demonstrates how structure, visual identity, and interaction can share one semantic HTML contract.

- Live site: [foscat.github.io/interface-systems-lab](https://foscat.github.io/interface-systems-lab/)
- Source: [Foscat/interface-systems-lab](https://github.com/Foscat/interface-systems-lab)
- Deployment: GitHub Pages through the repository's verified Actions workflow

## Ecosystem resources

| Layer | Package | Repository | Wiki | npm | Demo |
| --- | --- | --- | --- | --- | --- |
| Structure | `layout-style-css@1.1.2` | [Repository](https://github.com/Foscat/Layout-Style-CSS) | [Wiki](https://github.com/Foscat/Layout-Style-CSS/wiki) | [npm](https://www.npmjs.com/package/layout-style-css) | [Live demo](https://foscat.github.io/Layout-Style-CSS/) |
| Identity | `ui-style-kit-css@2.0.3` | [Repository](https://github.com/Foscat/ui-style-kit-css) | [Wiki](https://github.com/Foscat/ui-style-kit-css/wiki) | [npm](https://www.npmjs.com/package/ui-style-kit-css) | [Live demo](https://foscat.github.io/ui-style-kit-css/) |
| Behavior | `interactive-surface-css@1.3.0` | [Repository](https://github.com/Foscat/Interactive-Surface-CSS) | [Wiki](https://github.com/Foscat/Interactive-Surface-CSS/wiki) | [npm](https://www.npmjs.com/package/interactive-surface-css) | [Live demo](https://foscat.github.io/Interactive-Surface-CSS/) |

## Install with npm

Install the package layers in dependency order:

```bash
npm install layout-style-css@1.1.2 ui-style-kit-css@2.0.3 interactive-surface-css@1.3.0
```

Then load styles in cascade order. Identity establishes the design tokens, behavior consumes those tokens, and structure loads last so layout utilities retain their intended geometry.

```css
@import "ui-style-kit-css/with-bridge.css";
@import "interactive-surface-css/interactive-surface.css";
@import "layout-style-css/bridge.css";
@import "layout-style-css";
```

## Use the CDN

Keep this exact order in the document head:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ui-style-kit-css@2.0.3/dist/ui-style-kit.with-bridge.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/interactive-surface-css@1.3.0/interactive-surface.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/layout-style-css@1.1.2/dist/layout-style-css.min.css">
```

The versions are intentionally pinned so production interfaces do not change when a package publishes a new release.

## Shared markup contract

The libraries coordinate through four root attributes while preserving semantic HTML:

```html
<main
  class="ly-root"
  data-layout="bento"
  data-ui="minimal-saas"
  data-theme="midnight-gold"
  data-mode="dark"
>
  <!-- Semantic application content -->
</main>
```

