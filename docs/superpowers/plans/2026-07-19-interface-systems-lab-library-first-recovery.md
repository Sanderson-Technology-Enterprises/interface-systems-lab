# Interface Systems Lab Library-First Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement or continue this plan task-by-task.

**Goal:** Make Interface Systems Lab a browser-verified, library-first integration site for the three CSS packages.

**Architecture:** Installed CSS packages provide the primary layout, theme, and interaction contracts. React components compose the site around those contracts, and `app/globals.css` supplies only observatory geometry, section rhythm, responsive reflow, and code wrapping.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript 5.9, Playwright, GitHub Pages, `layout-style-css`, `ui-style-kit-css`, and `interactive-surface-css`.

## Tasks

- [x] Add tests for local package consumption, bundled CSS import order, promoted browser QA, stable orbit controls, proof-card content, and responsive section health.
- [x] Install the pinned CSS libraries as direct dependencies and import them from `app/layout.tsx` in the documented cascade order.
- [x] Remove runtime CDN stylesheet injection from the document head while preserving CDN examples in the install guide.
- [x] Rebuild the observatory so decorative rings are separate from the button hit areas and the layer list is passive text.
- [x] Replace the oversized feature showcase with three compact proof cards.
- [x] Recompose the workbench, install guide, library directory, architecture list, and local CSS around mobile-first layout guards.
- [x] Promote `npm run test:browser` into `npm run quality` and align the GitHub Pages workflow with that gate.
- [x] Add library follow-up briefs under `docs/library-followups/`.
- [ ] In the library repositories, resolve confirmed upstream package-contract issues and add fixture tests before publishing new package versions.

## Verification Commands

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
npm.cmd run build:pages
npm.cmd run test:export
npm.cmd run verify:export
npm.cmd run test:browser
npm.cmd run quality
```

## Notes For Continuation

- `layout-style-css@1.1.2` is the first upstream candidate because its package manifest pins older peer dependency versions.
- The visual collapse observed in this site was fixed locally through composition changes; do not port those site-specific layout guards into the libraries without an isolated library fixture.
