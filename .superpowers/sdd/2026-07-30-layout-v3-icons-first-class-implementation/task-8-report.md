# Task 8 Report: Export, Accessibility, and Rendered QA

## Outcome

Task 8 verification coverage and rendered QA are complete. The static export, icon runtime, accessibility behavior, responsive geometry, and cross-engine browser matrix pass. No deployment, push, or publish action was performed.

The only non-green command is `npm audit --audit-level=moderate`: npm reports 13 high findings in upstream build/development dependency trees and offers no compatible in-range remediation.

## Repairs completed during QA

- Made the Playwright preview port configurable through `PLAYWRIGHT_TEST_PORT`.
- Added export assertions for the versioned icon runtime, pack SVGs, Pages-safe references, and absence of `node_modules` or retired Layout v2 paths.
- Added icon pack, paint, frame, failure fallback, asset, navigation, accessibility, and fixture assertions.
- Reconciled Icon Lab failures that occur before React effects subscribe.
- Expanded the observatory to four bounded ecosystem layers and guarded its square mobile geometry.
- Reused the already-loaded default page in the representative configuration test so WebKit does not abort initial SVG fetches during a redundant navigation.
- Updated stale three-package and fixed-origin assertions.
- Repaired the Layout v3 app-shell contract by mapping the semantic workspace navigation to `data-ly-area="sidebar"`. At 390px this reduced the workspace from 11,693px to 2,392px and the main row from 9,940px to 1,467px.
- Updated visible workbench/footer copy to accurately describe four ecosystem layers.

## Fresh automated evidence

| Check | Result |
| --- | --- |
| `npm.cmd run format:check` | Pass |
| `npm.cmd run lint` | Pass |
| `npm.cmd run typecheck` | Pass |
| `npm.cmd run test:unit` | 36/36 pass |
| `npm.cmd run test:fixtures` | 13/13 pass |
| `npm.cmd run build:pages` | Pass; 64 icons across 12 packs and 9 fixtures staged |
| `npm.cmd run test:export` | 10/10 pass |
| `npm.cmd run verify:export` | Pass |
| Export negative proof | Expected 9 pass/1 fail after runtime removal; exact runtime restored |
| Focused WebKit navigation regression | 3/3 pass |
| Focused final layout/copy regressions | 6/6 pass across desktop/mobile Chromium |
| Final `npm.cmd run test:browser` | 128/128 pass in 2.1m |
| `npm.cmd run quality` | Pass, including its then-current 124/124 matrix; final changed surfaces were reverified by all constituent gates and the expanded 128-test matrix |
| `git diff --check` | Pass |

Browser projects covered exactly four configured projects: desktop Chromium, mobile Chromium, desktop Firefox, and desktop WebKit.

## Audit analysis

`npm.cmd audit --audit-level=moderate` reports 13 high findings:

- `brace-expansion@1.1.17` through `minimatch@3.1.5`, used by ESLint plugins and `serve`.
- `sharp@0.34.5` through current `next@16.2.12`.

Registry and dry-run evidence:

- `next@16.2.12` is current and declares `sharp ^0.34.5`; fixed `sharp@0.35.3` is outside that range.
- `minimatch@3.1.5` declares `brace-expansion ^1.1.7`; fixed `brace-expansion@5.0.8` is outside that range.
- `npm audit fix --dry-run --json` changes zero packages.
- npm only proposes breaking `--force` changes (including Next 14, ESLint 10, and serve 6).

No incompatible override and no `audit fix --force` were applied. Next, eslint-config-next, and PostCSS remain on the compatible current patch levels already verified by the full gate.

## Rendered QA

Browser classification and fallback basis: Task 1 recorded `Browser is not available: iab`. The user requested QA and approved the specification and plan, so the repository's approved Playwright workflow was used as the fallback at `http://127.0.0.1:4175/interface-systems-lab/`. The in-app Browser-specific pass was not performed because the connector was unavailable; Playwright evidence is fallback evidence and is not represented as an in-app Browser run.

- Viewports: 1440x1000 desktop, 390x844 mobile, 844x390 short landscape.
- Visual styles: Minimal SaaS, Cyberpunk, Retrofuturism to Synthwave, and Bauhaus to System.
- Palette/mode: Arctic Indigo and high contrast changed icon paint while `name="palette"` remained stable.
- Frames: `auto`, `soft`, and `none`.
- Actions: Icons anchor, copy, share, randomize, and reset.
- Fixtures: `icon-only`, `ui-icons`, and `all-canonical`, two rendered shadow-root SVGs each.
- Links: all 35 visible external, package, and fixture links activated.
- Runtime: 98 local module/SVG responses, zero failed requests, zero console warning/error, zero page error, zero hydration warning.
- Overflow: `scrollWidth` equals `clientWidth` at all three viewports.

Ignored evidence lives in `.qa/layout-v3-icons/`, including baseline/final screenshots, `local-qa-result.json`, and `fidelity-ledger.md`.

## Completion criteria evidence

1. Four pinned packages: `package.json`, unit catalog/version checks, and rendered four-layer observatory.
2. Layout v3 clean break: unit retired-selector check, fixture/export checks, updated app-shell `sidebar` contract, and browser recipe coverage.
3. Typed `UiIcon`: unit source contract, TypeScript pass, and browser accessibility assertions.
4. Icon Lab behavior/static export: export 10/10, pack/frame/paint browser coverage, and final screenshots.
5. Four-package catalog/adoption consistency: unit catalog/adoption checks, fixture 13/13, browser directory/install coverage, and corrected visible copy.
6. Automated/rendered QA: all gates above pass except the verified upstream audit blocker.
7. User work preserved: `next-env.d.ts` retains the exact `./.next/dev/types/routes.d.ts` import and is excluded from staging.

## Fix Round 1

- Corrected the browser project summary to list only the four projects actually configured: desktop Chromium, mobile Chromium, desktop Firefox, and desktop WebKit.
- Recorded the fallback basis exactly: Task 1 reported `Browser is not available: iab`; the user requested QA and approved the specification and plan; therefore the repository's approved Playwright workflow supplied fallback evidence. The in-app Browser-specific pass was not performed.
- No code or test rerun was needed because this round changes only the evidence report.
