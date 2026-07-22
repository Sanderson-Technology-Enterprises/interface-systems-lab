# Interface Systems Lab Full-Capacity Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready, immersive one-page showcase that demonstrates every public capability of the three released CSS libraries and converts developers and Sanderson Technology Enterprises prospects equally.

**Architecture:** A server-rendered Next.js page composes static narrative sections inside a client `LabExperience` provider that applies the global ecosystem attributes. Pure catalog/configuration modules drive validated URL and local-storage state; focused client islands render demonstrations. Build-generated static iframe fixtures prove isolated package combinations without contaminating the main page cascade.

**Tech Stack:** Next.js 16 App Router/static export, React 19, TypeScript 5.9, CSS, Node test runner, Playwright, `@axe-core/playwright`, UI Style Kit CSS 2.1.0, Layout Style CSS 2.1.0, Interactive Surface CSS 1.5.0.

## Global Constraints

- Pin `ui-style-kit-css@2.1.0`, `layout-style-css@2.1.0`, and `interactive-surface-css@1.5.0` exactly.
- Runtime import order is UI visual, UI interactive theme, Interactive state core, Layout, then site-only CSS.
- Runtime root contract is `.ly-root`, `data-ly-layout`, `data-ui`, `data-theme`, and `data-mode`; never use `data-layout`.
- Layout owns geometry, UI Style Kit owns paint/native controls, Interactive Surface owns interaction mechanics, and site CSS owns brand/observatory/composition glue only.
- Keep one public showcase page and use semantic progressive disclosure for exhaustive inventories.
- The selected configuration transforms the complete page and persists through validated URL parameters plus `interface-systems-lab:configuration:v1` local storage.
- Give developer adoption and `https://sandersontechnologyenterprises.com` equal conversion weight.
- Canonical production URL is `https://sanderson-technology-enterprises.github.io/interface-systems-lab/`.
- Do not add analytics, cookies, fake search-verification values, unsupported claims, handcrafted SVG assets, or deprecated integration imports.
- Comments must explain only non-obvious ownership or cross-engine behavior and remain professional; all changed files must pass formatting and linting.
- Use TDD for behavior changes: add the focused failing test, verify the expected failure, implement, and verify focused plus broader tests before committing.

---

### Task 1: Migrate the released ecosystem contract

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Delete: `.npmrc`
- Delete: `postcss.config.mjs`
- Modify: `app/layout.tsx`
- Modify: `app/data/ecosystem.ts`
- Create: `app/data/catalog.ts`
- Modify: `tests/ecosystem.test.ts`
- Modify: `README.md`

**Interfaces:**

- Produces `LAYOUT_PERSONALITIES`, `LAYOUT_RECIPES`, `UI_PRESETS`, `UI_THEMES`, `UI_MODES`, `INTERACTION_VARIANTS`, `INTERACTION_LEVELS`, `getUiPrefix(preset)`, and exact install/import/CDN constants.
- Later tasks import these catalogs and never duplicate their values.

- [ ] **Step 1: Write the failing contract tests**

Update `tests/ecosystem.test.ts` to assert exact package versions, the four canonical imports in order, absence of deprecated imports and `legacy-peer-deps`, `data-ly-layout`, all 16 layouts, all seven recipes, all 11 manifest-derived presets, 10 themes, three modes, and six interaction variants/three levels. Assert `package.json` has no Tailwind/PostCSS dependencies and the obsolete config files are absent.

- [ ] **Step 2: Verify the migration tests fail for the old stack**

Run: `npm.cmd run test:unit`

Expected: FAIL on the current `1.1.2`/`2.0.3`/`1.3.0` versions, legacy imports, old `data-layout`, and missing catalogs.

- [ ] **Step 3: Install the exact releases and remove the resolver workaround**

Run:

```powershell
npm.cmd install --save-exact ui-style-kit-css@2.1.0 layout-style-css@2.1.0 interactive-surface-css@1.5.0
npm.cmd uninstall tailwindcss @tailwindcss/postcss
```

Delete `.npmrc` and `postcss.config.mjs`, then run `npm.cmd install --package-lock-only` without `--legacy-peer-deps` to prove normal resolution.

- [ ] **Step 4: Implement the canonical catalog and imports**

Use the published `ui-style-kit-css/manifest.json` at build time. `catalog.ts` must expose narrow literal-compatible arrays and:

```ts
export function getUiPrefix(preset: UiPreset): string {
  const match = UI_PRESETS.find((entry) => entry.id === preset);
  if (!match) throw new Error(`Unknown UI preset: ${preset}`);
  return match.prefix;
}
```

Update `layout.tsx` imports to:

```ts
import "ui-style-kit-css/visual.css";
import "ui-style-kit-css/interactive-surface-theme.css";
import "interactive-surface-css/state-core.css";
import "layout-style-css";
```

Replace README/data examples with the exact released versions and canonical order. Use `data-ly-layout` in every new example.

- [ ] **Step 5: Verify focused and package integrity checks**

Run:

```powershell
npm.cmd run test:unit
npm.cmd ls ui-style-kit-css layout-style-css interactive-surface-css
npm.cmd run lint
npm.cmd run typecheck
```

Expected: all commands pass with no invalid peers or legacy resolver flag.

- [ ] **Step 6: Commit the ecosystem migration**

```powershell
git add package.json package-lock.json app/layout.tsx app/data/ecosystem.ts app/data/catalog.ts tests/ecosystem.test.ts README.md
git add -u .npmrc postcss.config.mjs
git commit -m "feat: adopt the released CSS ecosystem"
```

### Task 2: Add validated, persistent, shareable configuration

**Files:**

- Create: `app/lib/configuration.ts`
- Create: `app/components/LabExperience.tsx`
- Create: `app/components/LabControls.tsx`
- Modify: `app/page.tsx`
- Create: `tests/configuration.test.ts`
- Modify: `tests/browser/site.spec.ts`

**Interfaces:**

- Produces `LabConfiguration`, `DEFAULT_CONFIGURATION`, `parseConfiguration(search)`, `parseStoredConfiguration(value)`, `serializeConfiguration(configuration)`, `configurationMarkup(configuration)`, `LabExperience`, and `useLabConfiguration()`.
- URL keys are exactly `layout`, `ui`, `theme`, and `mode`; storage key is exactly `interface-systems-lab:configuration:v1`.

- [ ] **Step 1: Write failing pure-state tests**

Create table-driven Node tests proving defaults, URL-over-storage precedence, per-field fallback for invalid values, malformed JSON recovery, stable query serialization order, and exact copied markup:

```html
<main
  class="ly-root"
  data-ly-layout="bento"
  data-ui="minimal-saas"
  data-theme="midnight-gold"
  data-mode="dark"
></main>
```

- [ ] **Step 2: Verify the state tests fail because the module is missing**

Run: `node --import tsx --test tests/configuration.test.ts`

Expected: FAIL with module-not-found for `app/lib/configuration.ts`.

- [ ] **Step 3: Implement pure validation and serialization**

Use catalog membership checks, never unchecked casts. `parseConfiguration` accepts `URLSearchParams` plus an optional stored value and returns a complete valid configuration. `serializeConfiguration` returns a `URLSearchParams` in layout/ui/theme/mode order. Storage parsing catches JSON errors and returns `null`.

- [ ] **Step 4: Write failing rendered persistence tests**

Extend `tests/browser/site.spec.ts` to load a configured query, assert every root attribute, reload and assert persistence, inject invalid query/storage data and assert defaults, change all four controls and assert URL/storage updates, reset and assert removal, and share/copy with clipboard success and failure paths.

- [ ] **Step 5: Verify rendered tests fail before the provider exists**

Run: `npm.cmd run test:browser -- --project=desktop-chromium --grep "configuration"`

Expected: FAIL on missing URL/storage behavior and the old `data-layout` contract.

- [ ] **Step 6: Implement the provider and sticky console**

`LabExperience` renders the full `.experience.ly-root` wrapper, applies all four data attributes, hydrates saved/query state in an effect, and exposes typed actions through context. `LabControls` uses labeled native selects/radios and library-owned buttons with randomize, reset, copy markup, and share. All feedback goes to one polite atomic live region; timeout cleanup occurs on unmount.

- [ ] **Step 7: Verify state behavior and commit**

Run:

```powershell
node --import tsx --test tests/configuration.test.ts
npm.cmd run test:browser -- --project=desktop-chromium --grep "configuration"
npm.cmd run lint
npm.cmd run typecheck
```

Commit:

```powershell
git add app/lib/configuration.ts app/components/LabExperience.tsx app/components/LabControls.tsx app/page.tsx tests/configuration.test.ts tests/browser/site.spec.ts
git commit -m "feat: add shareable ecosystem configuration"
```

### Task 3: Rebuild the immersive shell and complete Layout laboratory

**Files:**

- Modify: `app/page.tsx`
- Modify: `app/components/InterfaceObservatory.tsx`
- Create: `app/components/SiteHeader.tsx`
- Create: `app/components/SiteFooter.tsx`
- Create: `app/components/CombinedWorkbench.tsx`
- Create: `app/components/labs/LayoutLab.tsx`
- Modify: `app/globals.css`
- Create: `app/styles/shell.css`
- Create: `app/styles/observatory.css`
- Create: `app/styles/labs.css`
- Create: `app/styles/responsive.css`
- Modify: `tests/browser/site.spec.ts`
- Create: `tests/browser/capabilities.spec.ts`

**Interfaces:**

- Consumes `LabExperience`, `useLabConfiguration`, and the catalogs from Tasks 1–2.
- Produces anchors `top`, `workbench`, `layouts`, `ui-native`, `interactions`, `integrate`, `install`, `libraries`, and `company`.

- [ ] **Step 1: Write failing shell and Layout capability tests**

Assert one H1; all required anchors and navigation links; equal hero developer/company actions; complete-page attribute scope; all 16 personality options; seven recipe specimens; named primitive labels; recipe area hooks; unchanged DOM/tab order after personality changes; positive padding/centered text on pill controls; and no horizontal overflow at 320, 390, 768, and 1,440 pixels.

- [ ] **Step 2: Verify the new experience tests fail against the old page**

Run:

```powershell
npm.cmd run test:browser -- --project=desktop-chromium --grep "shell|layout laboratory"
npm.cmd run test:browser -- --project=mobile-chromium --grep "shell|layout laboratory"
```

Expected: FAIL on missing anchors, company CTA, new recipes, and `data-ly-layout` behavior.

- [ ] **Step 3: Implement the server composition and focused sections**

Make `page.tsx` a server component that passes static sections and client islands as children of `LabExperience`. Keep the observatory’s real buttons, `aria-pressed`, and decorative ring separation. Use `favicon-48x48.png` in the header and `android-chrome-192x192.png` in the footer rather than `logo-master.png` for small rendered slots.

- [ ] **Step 4: Implement the combined workbench and Layout laboratory**

Build the client workspace on `data-ly-recipe="app-shell"` and semantic `data-ly-area` regions. Layout specimens must use real exported recipe/primitives classes and semantic HTML; personality selection changes the global root only. Put exhaustive primitives and secondary recipes in openable `details` groups so their content remains in the document.

- [ ] **Step 5: Refactor local CSS around ownership boundaries**

Keep global reset/token aliases in `globals.css`; move shell, observatory, labs, and breakpoint rules into the four focused files imported by `layout.tsx`. Remove local component paint and generic interactive transforms where library classes provide them. Scope reduced motion to smooth scrolling and observatory animation; do not use a global transition/animation `!important` reset.

- [ ] **Step 6: Verify and commit the immersive Layout experience**

Run:

```powershell
npm.cmd run test:browser -- --project=desktop-chromium --grep "shell|layout laboratory"
npm.cmd run test:browser -- --project=mobile-chromium --grep "shell|layout laboratory"
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run format:check
```

Commit the listed files with `git commit -m "feat: build the immersive layout showcase"`.

### Task 4: Add complete UI/native and interaction laboratories

**Files:**

- Create: `app/components/labs/UiNativeLab.tsx`
- Create: `app/components/labs/InteractionLab.tsx`
- Create: `app/components/NativeDialogDemo.tsx`
- Modify: `app/styles/labs.css`
- Modify: `app/styles/responsive.css`
- Modify: `tests/browser/capabilities.spec.ts`
- Create: `tests/browser/accessibility.spec.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**

- Consumes `getUiPrefix`, UI catalogs, interaction catalogs, and `useLabConfiguration`.
- Produces stable test hooks `data-specimen`, `data-native-part`, and `data-interaction-state` without adding test-only behavior.

- [ ] **Step 1: Install axe and write failing capability/accessibility tests**

Run `npm.cmd install --save-dev --save-exact @axe-core/playwright`. Add tests that enumerate all manifest presets/themes/modes, assert computed paint changes, and exercise prefixed component classes, centered `button-pill`, four tooltip positions, form/native states, a real `showModal()` dialog/backdrop path, interaction variants/levels, ARIA/class states, state collisions, focus visibility, reduced motion, forced colors, and representative axe scans.

- [ ] **Step 2: Verify the labs are absent**

Run:

```powershell
npm.cmd run test:browser -- --project=desktop-chromium --grep "UI laboratory|native laboratory|interaction laboratory|axe"
```

Expected: FAIL on missing sections/specimens and accessibility scan targets.

- [ ] **Step 3: Implement manifest-prefixed UI specimens**

Construct prefixed class names only through `getUiPrefix`. Provide grouped semantic specimens for components/helpers and every required native control/subpart/state. Use `aria-invalid="true"`, `.is-invalid`, and user interaction for invalid examples; do not force untouched `:invalid`. Explain platform-owned popup limitations beside the relevant controls.

- [ ] **Step 4: Implement native dialog and interaction precedence**

Use an actual `<dialog>` ref with `showModal()`/`close()`, a labeled close control, and focus restoration. Interaction specimens cover variants, levels, `aria-pressed`, `aria-selected`, `aria-current`, `aria-busy`, `aria-disabled`, native disabled, `.is-active`, `.is-loading`, and `.is-disabled`. Include a collision control whose toggles make precedence observable without duplicating library transforms.

- [ ] **Step 5: Verify and commit the capability laboratories**

Run:

```powershell
npm.cmd run test:browser -- --project=desktop-chromium --grep "UI laboratory|native laboratory|interaction laboratory|axe"
npm.cmd run test:unit
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run format:check
```

Commit the listed files with `git commit -m "feat: showcase UI and interaction capabilities"`.

### Task 5: Build isolated integration proofs and complete adoption content

**Files:**

- Create: `scripts/build-fixtures.mjs`
- Modify: `.gitignore`
- Modify: `package.json`
- Create: `app/components/labs/IntegrationLab.tsx`
- Modify: `app/components/InstallGuide.tsx`
- Modify: `app/components/LibraryDirectory.tsx`
- Create: `tests/fixtures.test.mjs`
- Modify: `tests/export.test.mjs`
- Modify: `tests/browser/capabilities.spec.ts`
- Modify: `README.md`

**Interfaces:**

- Produces ignored `public/fixtures/generated/` assets and HTML for `layout-only`, `ui-only`, `interactive-only`, `layout-ui`, `layout-interactive`, `ui-interactive`, `all-canonical`, and `all-legacy`.
- `fixtures:build` runs before `dev`, `build`, and `build:pages`.

- [ ] **Step 1: Write failing fixture and integration tests**

Assert the generator creates all eight named documents, copies pinned local package CSS, gives every document a title/root contract/sample controls, uses only its declared package CSS, and labels legacy imports deprecated. Browser tests must verify each iframe loads without console errors or overflow and that the canonical all-three fixture resolves layout, paint, and interaction styles.

- [ ] **Step 2: Verify fixture tests fail before generation exists**

Run: `node --test tests/fixtures.test.mjs`

Expected: FAIL because `scripts/build-fixtures.mjs` and generated fixtures do not exist.

- [ ] **Step 3: Implement deterministic local fixture generation**

Resolve CSS through package exports/package directories, copy only the required release files into `public/fixtures/generated/assets`, and generate semantic HTML with relative asset links. Remove and recreate only the exact `public/fixtures/generated` directory after resolving and verifying it is inside the repository. Add the generated directory to `.gitignore`; never delete another public path.

- [ ] **Step 4: Implement integration/adoption UI**

Render all eight iframes with descriptive titles and lazy loading. Expand install guidance to use-one, use-two, and all-three npm/bundler/CDN recipes from centralized data. Canonical guidance is primary; legacy examples are visibly deprecated and explain their v2 compatibility purpose.

- [ ] **Step 5: Verify fixtures, export, browser behavior, and commit**

Run:

```powershell
npm.cmd run fixtures:build
node --test tests/fixtures.test.mjs
npm.cmd run build:pages
npm.cmd run test:export
npm.cmd run test:browser -- --project=desktop-chromium --grep "integration"
```

Commit source/tests/docs only, never `public/fixtures/generated`, with `git commit -m "feat: add isolated ecosystem integration proofs"`.

### Task 6: Correct SEO/brand identity, harden Pages, and finish verification

**Files:**

- Modify: `app/lib/site.ts`
- Modify: `app/layout.tsx`
- Modify: `app/robots.ts`
- Modify: `app/sitemap.ts`
- Modify: `app/manifest.ts`
- Modify: `app/not-found.tsx`
- Modify: `.github/workflows/deploy-pages.yml`
- Modify: `playwright.config.ts`
- Modify: `scripts/verify-export.mjs`
- Modify: `tests/ecosystem.test.ts`
- Modify: `tests/export.test.mjs`
- Modify: `tests/browser/site.spec.ts`
- Modify: `tests/browser/accessibility.spec.ts`
- Modify: `README.md`
- Create: `.env.example`

**Interfaces:**

- `SITE` exposes canonical lab URL/repository, owner name/URL/GitHub identity, social image, and Pages-aware asset helpers.
- Optional `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` values are included only when non-empty at build time.

- [ ] **Step 1: Write failing identity, metadata, and multi-engine tests**

Assert the organization Pages canonical/repository, visible corporate links in header/hero/final CTA/footer, Organization JSON-LD URL/identity, package versions, absolute social/icon URLs, sitemap without synthetic `lastModified`, robots without a path-valued host, base-path-safe 404 assets, and no stale Foscat lab URL. Add Firefox and WebKit projects plus representative default/alternate configuration coverage.

- [ ] **Step 2: Verify failures against stale identity metadata**

Run:

```powershell
npm.cmd run test:unit
npm.cmd run build:pages
npm.cmd run test:export
```

Expected: FAIL on the old 404 canonical/repository URLs, absent corporate URL, and stale metadata assertions.

- [ ] **Step 3: Implement canonical identity and structured data**

Centralize all URLs in `SITE`. The Organization node uses Sanderson’s corporate URL and GitHub organization identity; the lab nodes use the organization Pages URL. Keep visible copy factual and keyword-rich. Use existing right-sized logo assets. Add optional verification metadata via environment values without emitting empty tags.

- [ ] **Step 4: Harden the release workflow and quality script**

Remove `--legacy-peer-deps`, install all configured Playwright engines, run fixture generation, and make `quality` include `format:check`, lint, typecheck, unit, fixture, Pages build/export, and browser/axe tests. The workflow continues to deploy only `out/`; do not mutate the external Pages source setting during this task.

- [ ] **Step 5: Run the complete local release gate**

Run:

```powershell
npm.cmd run format
npm.cmd run quality
npm.cmd audit --audit-level=moderate
npm.cmd outdated
npm.cmd run build
git diff --check
git status --short
```

Expected: all gates pass; `npm outdated` is reviewed and either empty or contains only intentionally unpinned major upgrades unrelated to the approved CSS releases; generated fixture/build artifacts remain ignored.

- [ ] **Step 6: Perform rendered visual review and cross-engine spot checks**

Capture desktop 1,440×1,024 and mobile 390×844 full-page screenshots for the default configuration plus one high-contrast and one visually extreme preset. Inspect hierarchy, text clipping, control centering/padding, target size, sticky behavior, dialog focus, section anchors, company/developer CTA balance, and horizontal overflow. Fix every confirmed issue with a failing regression assertion before re-running the affected gate.

- [ ] **Step 7: Commit the production hardening**

```powershell
git add app .github playwright.config.ts scripts tests README.md .env.example package.json package-lock.json
git commit -m "feat: complete the Interface Systems Lab showcase"
```

Do not push, change GitHub Pages settings, or deploy without explicit approval. Prepare the exact remote-setting and live-verification steps for handoff.
