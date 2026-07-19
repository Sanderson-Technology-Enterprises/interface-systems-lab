# Interface Systems Lab Library-First Recovery Design

## Goal

Recover Interface Systems Lab as the integration proof for `layout-style-css`, `ui-style-kit-css`, and `interactive-surface-css` by making the installed libraries own the site styling and keeping local CSS limited to site-specific composition.

## Current Evidence

- `npm run quality` previously passed while `npm run test:browser` failed, so source/export checks were not enough to prove the site.
- Browser capture showed collapsed mobile content in the observatory, workbench, feature showcase, install section, and library directory.
- The site loaded library CSS from CDN links in `app/layout.tsx`, while the project itself did not depend on the libraries it documents.
- `npm.cmd ls layout-style-css ui-style-kit-css interactive-surface-css` reports invalid peers because `layout-style-css@1.1.2` still pins older ecosystem package versions.

## Design Decisions

- Load `ui-style-kit-css`, `interactive-surface-css`, and `layout-style-css` from local package imports in the documented cascade order, then load `app/globals.css` as the final site-specific guard layer.
- Preserve the root interface contract: `.ly-root`, `data-layout`, `data-ui`, `data-theme`, and `data-mode`.
- Keep orbit buttons as the only hero controls. Decorative rings are not controls, and the lower layer list is passive status text.
- Replace the oversized feature wall with three compact proof cards so each package gets a readable mobile-safe example.
- Keep local CSS focused on observatory geometry, section layout, responsive guards, and export-safe code wrapping.
- Treat upstream library changes as follow-up work only when a problem reproduces outside this site's custom composition.

## Acceptance Criteria

- The project has direct dependencies on `layout-style-css@1.1.2`, `ui-style-kit-css@2.0.3`, and `interactive-surface-css@1.3.0`.
- The exported site keeps the production metadata, resource links, install snippets, and GitHub Pages base-path contract.
- Browser QA passes on desktop and mobile projects.
- The page has no horizontal overflow at 320, 390, 768, and 1440 pixel widths.
- Workbench controls update the root data attributes, and copy controls remain functional.
- Reduced motion disables orbit animation.
- Supporting library follow-up briefs distinguish confirmed upstream issues from site-only fixes.
