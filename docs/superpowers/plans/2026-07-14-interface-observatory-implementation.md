# Interface Observatory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify a developer-first Interface Observatory site with comprehensive SEO, correct package installation guidance, complete ecosystem resource links, and a hardened GitHub Pages deployment.

**Architecture:** A typed ecosystem registry and site configuration will provide one source of truth for page content, metadata, structured data, and export verification. The existing client page will be decomposed into focused observatory, installation, and library-directory components while preserving the interactive workbench. Next.js metadata routes will generate crawler artifacts, and repository plus Playwright tests will verify the static export and rendered experience.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript 5.9, CSS, Node.js 22 test runner with `tsx` 4.23.1, Playwright 1.61.1, GitHub Actions, GitHub Pages.

## Global Constraints

- Production URL: `https://foscat.github.io/interface-systems-lab/`.
- GitHub repository: `https://github.com/Foscat/interface-systems-lab`.
- Package versions: `layout-style-css@1.1.2`, `ui-style-kit-css@2.0.3`, and `interactive-surface-css@1.3.0`.
- npm command order: layout, UI style, interactive surface.
- CSS cascade order: UI style with bridge, interactive surface, layout bridge, full layout bundle.
- Preserve `public/interface-systems-lab-social-card.png` and the intentional deletion of `public/favicon.svg`.
- Use the existing PNG/ICO favicon set; do not restore or reference `favicon.svg`.
- Keep `layout-style-css` responsible for structure, `ui-style-kit-css` for visual paint/theme, and `interactive-surface-css` for interaction states.
- Local CSS may own only lab-specific composition, responsive continuity, and the observatory illustration.
- All code changes must include professional comments where a non-obvious contract or workaround needs explanation.
- All changes must pass formatting, lint, TypeScript/build, export-contract, and browser checks without weakening lint rules.
- Do not publish npm packages or modify the three dependency repositories.

## File Structure

- `app/data/ecosystem.ts`: package versions, verified entrypoints, install snippets, and repository/wiki/npm/demo destinations.
- `app/lib/site.ts`: canonical site URL, Pages base-path helpers, social image URL, and shared SEO constants.
- `app/components/InterfaceObservatory.tsx`: accessible three-orbit hero illustration.
- `app/components/InstallGuide.tsx`: npm, bundler, and CDN examples with copy controls.
- `app/components/LibraryDirectory.tsx`: package ownership copy and four resource links per library.
- `app/page.tsx`: workbench state and page composition.
- `app/layout.tsx`: global metadata, viewport declarations, fonts, and JSON-LD.
- `app/robots.ts`, `app/sitemap.ts`, `app/manifest.ts`: Next.js metadata routes.
- `app/not-found.tsx`: exported GitHub Pages not-found surface.
- `app/globals.css`: page-specific observatory, installation, library, and responsive styles.
- `scripts/verify-export.mjs`: static-export contract validation.
- `scripts/prepare-preview.mjs`: project-path preview staging for browser tests.
- `tests/ecosystem.test.ts`: registry order, URL, snippet, and package-export tests.
- `tests/export.test.mjs`: exported metadata, crawler, manifest, and asset-path tests.
- `playwright.config.ts`, `playwright/site.spec.ts`: rendered desktop/mobile, interaction, accessibility, and path checks.
- `.github/workflows/deploy-pages.yml`: quality-gated Pages deployment.
- `README.md`: local, verification, resource, and Pages instructions.
- `package.json`, `package-lock.json`: test dependencies and quality scripts.

---

### Task 1: Establish the typed ecosystem contract

**Files:**
- Create: `app/data/ecosystem.ts`
- Create: `tests/ecosystem.test.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces: `ECOSYSTEM_PACKAGES`, `NPM_INSTALL`, `BUNDLER_IMPORTS`, `CDN_LINKS`, `EcosystemPackage`, and `ResourceLink`.
- Consumes: installed package manifests from `node_modules` during contract tests.

- [ ] **Step 1: Add the TypeScript test runtime and failing ecosystem test**

Run:

```powershell
npm.cmd install --save-dev --save-exact tsx@4.23.1
```

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "test:unit": "node --import tsx --test tests/*.test.ts",
    "typecheck": "tsc --noEmit"
  }
}
```

Create `tests/ecosystem.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
  BUNDLER_IMPORTS,
  CDN_LINKS,
  ECOSYSTEM_PACKAGES,
  NPM_INSTALL,
} from "../app/data/ecosystem";

const expectedNames = [
  "layout-style-css",
  "ui-style-kit-css",
  "interactive-surface-css",
];

test("registry exposes every package and resource in ecosystem order", () => {
  assert.deepEqual(
    ECOSYSTEM_PACKAGES.map(({ name }) => name),
    expectedNames,
  );
  for (const pkg of ECOSYSTEM_PACKAGES) {
    assert.deepEqual(Object.keys(pkg.links), ["repository", "wiki", "npm", "demo"]);
    for (const url of Object.values(pkg.links)) assert.match(url, /^https:\/\//);
  }
});

test("installation examples pin the approved versions and cascade order", () => {
  assert.equal(
    NPM_INSTALL,
    "npm install layout-style-css@1.1.2 ui-style-kit-css@2.0.3 interactive-surface-css@1.3.0",
  );
  assert.deepEqual(BUNDLER_IMPORTS, [
    '@import "ui-style-kit-css/with-bridge.css";',
    '@import "interactive-surface-css/interactive-surface.css";',
    '@import "layout-style-css/bridge.css";',
    '@import "layout-style-css";',
  ]);
  assert.deepEqual(CDN_LINKS.map(({ packageName }) => packageName), [
    "ui-style-kit-css",
    "interactive-surface-css",
    "layout-style-css",
  ]);
});

test("documented package entrypoints exist in installed package manifests", async () => {
  for (const pkg of ECOSYSTEM_PACKAGES) {
    const manifest = JSON.parse(
      await readFile(new URL(`../node_modules/${pkg.name}/package.json`, import.meta.url), "utf8"),
    ) as { version: string };
    assert.equal(manifest.version, pkg.version);
  }
});
```

- [ ] **Step 2: Run the test and confirm the registry is missing**

Run:

```powershell
npm.cmd run test:unit
```

Expected: FAIL because `app/data/ecosystem.ts` does not exist.

- [ ] **Step 3: Implement the ecosystem registry**

Create `app/data/ecosystem.ts`:

```ts
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
    summary: "Responsive shells, wrappers, grids, panes, and switchable layout personalities.",
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
    summary: "Visual systems, palettes, native-element coverage, and display modes.",
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
    summary: "Consistent hover, focus-visible, active, pressed, and disabled states.",
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
```

- [ ] **Step 4: Run unit and type checks**

Run:

```powershell
npm.cmd run test:unit
npm.cmd run typecheck
```

Expected: all ecosystem tests pass and TypeScript exits with code 0.

- [ ] **Step 5: Commit the contract**

```powershell
git add package.json package-lock.json app/data/ecosystem.ts tests/ecosystem.test.ts
git commit -m "test: define ecosystem resource contract"
```

### Task 2: Add one Pages-aware SEO source of truth

**Files:**
- Create: `app/lib/site.ts`
- Create: `app/robots.ts`
- Create: `app/sitemap.ts`
- Create: `app/manifest.ts`
- Create: `app/not-found.tsx`
- Modify: `app/layout.tsx`
- Modify: `next.config.ts`
- Test: `tests/ecosystem.test.ts`

**Interfaces:**
- Consumes: `ECOSYSTEM_PACKAGES` from Task 1.
- Produces: `SITE`, `withBasePath(path)`, Next.js metadata routes, and serialized JSON-LD.

- [ ] **Step 1: Add failing site-configuration tests**

Append to `tests/ecosystem.test.ts`:

```ts
import { SITE, withBasePath } from "../app/lib/site";

test("site URLs target the GitHub Pages project site", () => {
  assert.equal(SITE.url, "https://foscat.github.io/interface-systems-lab/");
  assert.equal(SITE.repository, "https://github.com/Foscat/interface-systems-lab");
  assert.equal(withBasePath("/site.webmanifest"), "/interface-systems-lab/site.webmanifest");
  assert.equal(withBasePath("/"), "/interface-systems-lab/");
});
```

Run `npm.cmd run test:unit` and expect failure because `app/lib/site.ts` is missing.

- [ ] **Step 2: Implement the shared site configuration**

Create `app/lib/site.ts`:

```ts
const productionBasePath = "/interface-systems-lab";

export const SITE = {
  name: "Interface Systems Lab",
  title: "Interface Systems Lab | Accessible CSS Interface Systems",
  description:
    "Explore and combine layout-style-css, ui-style-kit-css, and interactive-surface-css in a live accessible interface workbench.",
  url: "https://foscat.github.io/interface-systems-lab/",
  repository: "https://github.com/Foscat/interface-systems-lab",
  socialImage: "https://foscat.github.io/interface-systems-lab/interface-systems-lab-social-card.png",
  locale: "en_US",
} as const;

/** Keeps generated metadata assets aligned with the GitHub Pages project path. */
export function withBasePath(path: string): string {
  const basePath = process.env.PAGES_BASE_PATH ?? productionBasePath;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized === "/" ? `${basePath}/` : `${basePath}${normalized}`;
}
```

- [ ] **Step 3: Implement metadata, viewport, and structured data**

Replace the metadata definition in `app/layout.tsx` with a `Metadata` object containing `metadataBase`, canonical alternates, keywords, authors, creator, publisher, application name, category, referrer, robots, Open Graph, Twitter, icons, manifest, and verification-safe absolute URLs. Export a `Viewport` object with light/dark theme colors. Add a JSON-LD `<script>` before `{children}` using a graph with `WebSite`, `WebPage`, `SoftwareApplication`, and `ItemList` entries derived from `ECOSYSTEM_PACKAGES`.

Use this serialization helper so `<` cannot terminate the script element:

```ts
const structuredData = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: structuredData }}
/>
```

Set icon paths with `withBasePath`, using `/favicon.ico`, `/favicon-32x32.png`, `/favicon-16x16.png`, `/apple-touch-icon.png`, and `/site.webmanifest`. Do not reference `favicon.svg`.

- [ ] **Step 4: Implement crawler, manifest, and not-found routes**

Create `app/robots.ts` returning one allow-all rule and the absolute sitemap URL. Create `app/sitemap.ts` returning the canonical home page with `changeFrequency: "weekly"` and priority `1`. Create `app/manifest.ts` returning the approved name, description, standalone display, colors, categories, start URL, and three Pages-aware icons. Create `app/not-found.tsx` with a semantic heading, concise recovery copy, and `withBasePath("/")` home link.

The manifest icon entries must be:

```ts
icons: [
  { src: withBasePath("/android-chrome-192x192.png"), sizes: "192x192", type: "image/png", purpose: "any" },
  { src: withBasePath("/android-chrome-512x512.png"), sizes: "512x512", type: "image/png", purpose: "any" },
  { src: withBasePath("/maskable-icon-512x512.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
],
```

- [ ] **Step 5: Keep the static-export configuration explicit**

Update `next.config.ts` to keep `output: "export"`, `trailingSlash: true`, `images.unoptimized: true`, `basePath`, and `assetPrefix`, and add this contract comment:

```ts
// GitHub Pages project sites serve assets beneath the repository slug.
const basePath = process.env.PAGES_BASE_PATH ?? "";
```

- [ ] **Step 6: Run focused verification and commit**

Run:

```powershell
npm.cmd run test:unit
npm.cmd run typecheck
npm.cmd run lint
```

Expected: all commands exit 0.

Commit:

```powershell
git add app/layout.tsx app/lib/site.ts app/robots.ts app/sitemap.ts app/manifest.ts app/not-found.tsx next.config.ts tests/ecosystem.test.ts
git commit -m "feat: add Pages-aware SEO metadata"
```

### Task 3: Build the observatory and developer resource sections

**Files:**
- Create: `app/components/InterfaceObservatory.tsx`
- Create: `app/components/InstallGuide.tsx`
- Create: `app/components/LibraryDirectory.tsx`
- Modify: `app/page.tsx`
- Test: `tests/ecosystem.test.ts`

**Interfaces:**
- Consumes: `ECOSYSTEM_PACKAGES`, `NPM_INSTALL`, `BUNDLER_IMPORTS`, `CDN_MARKUP`, and `SITE`.
- Produces: accessible hero illustration, copyable install blocks, complete library resource directory, and composed developer-first page.

- [ ] **Step 1: Add failing source-contract tests for visible sections**

Append to `tests/ecosystem.test.ts`:

```ts
test("page components expose the approved observatory and resource landmarks", async () => {
  const [observatory, installGuide, directory] = await Promise.all([
    readFile(new URL("../app/components/InterfaceObservatory.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/InstallGuide.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/LibraryDirectory.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(observatory, /Interface Observatory/);
  assert.doesNotMatch(observatory, /signal-bars/);
  assert.match(installGuide, /Install all three/);
  assert.match(directory, /Library resources/);
});
```

Run `npm.cmd run test:unit` and expect failure because the component files are missing.

- [ ] **Step 2: Create the orbital system illustration**

Create `app/components/InterfaceObservatory.tsx` as a server-compatible presentational component. Render a `<figure className="observatory">` with a visually hidden `<figcaption>`, three nested `.orbit` elements, real HTML labels, and a central `.observatory-core`. Each package label comes from `ECOSYSTEM_PACKAGES`; mark purely geometric spans `aria-hidden="true"`.

The component public signature is:

```tsx
export function InterfaceObservatory() {
  return (
    <figure className="observatory" aria-labelledby="observatory-caption">
      <figcaption id="observatory-caption" className="sr-only">
        Interface Observatory: structure, identity, and behavior orbit one semantic interface core.
      </figcaption>
      <div className="observatory-stage" aria-hidden="true">
        <span className="orbit orbit-layout"><i /></span>
        <span className="orbit orbit-identity"><i /></span>
        <span className="orbit orbit-behavior"><i /></span>
        <span className="observatory-core"><b>One</b><small>interface core</small></span>
      </div>
      <ol className="observatory-legend">
        {ECOSYSTEM_PACKAGES.map((pkg) => (
          <li key={pkg.name}><span>{pkg.layer}</span><strong>{pkg.name}</strong></li>
        ))}
      </ol>
    </figure>
  );
}
```

Import the package registry at the top of the file:

```tsx
import { ECOSYSTEM_PACKAGES } from "../data/ecosystem";
```

- [ ] **Step 3: Create reusable copyable installation guidance**

Create `app/components/InstallGuide.tsx` with `"use client"`, local copied-state keyed by `"npm" | "bundler" | "cdn"`, and a `copySnippet` function that uses `navigator.clipboard.writeText`. Render three `<article>` examples in the approved order. Each code block uses `<pre><code>` and a button with an explicit accessible label. On failure, change only that button to `Select code to copy`; on success, change it to `Copied` for 1.8 seconds.

Use this data structure:

```ts
const snippets = [
  { id: "npm", label: "npm", title: "Install all three", language: "shell", code: NPM_INSTALL },
  { id: "bundler", label: "CSS imports", title: "Load the cascade", language: "css", code: BUNDLER_IMPORTS.join("\n") },
  { id: "cdn", label: "CDN", title: "Use immutable links", language: "html", code: CDN_MARKUP },
] as const;
```

- [ ] **Step 4: Create the complete library directory**

Create `app/components/LibraryDirectory.tsx`. Render one semantic article per registry entry with its version, layer, summary, attribute, and links in the fixed `repository`, `wiki`, `npm`, `demo` order. External anchors use `target="_blank"` and `rel="noreferrer noopener"`; visible copy is `Repository`, `Wiki`, `npm package`, and `Live demo`, followed by an accessible new-tab cue.

- [ ] **Step 5: Refactor the page composition without breaking the workbench**

In `app/page.tsx`:

- keep the `LabState`, selector options, randomize/reset behavior, preview state, and live announcement;
- replace the three-bar brand mark with a compact orbital brand mark;
- change header links to `Workbench`, `Install`, `Libraries`, and `GitHub`;
- replace the hero instrument and signal bars with `<InterfaceObservatory />`;
- use the hero copy `Design every layer. Keep one interface.` and retain one concise supporting paragraph;
- insert `<InstallGuide />` after the workbench;
- insert `<LibraryDirectory />` after installation;
- render architecture outcomes after the library directory;
- remove the standalone mail contact section;
- make the footer link to the project repository and the three package pages.

The page must preserve exactly one visible `<h1>`, existing `#workbench`, and a polite `aria-live` region.

- [ ] **Step 6: Run focused checks and commit**

Run:

```powershell
npm.cmd run test:unit
npm.cmd run typecheck
npm.cmd run lint
```

Expected: all commands pass.

Commit:

```powershell
git add app/components app/page.tsx app/data/ecosystem.ts tests/ecosystem.test.ts
git commit -m "feat: build interface observatory sections"
```

### Task 4: Implement the approved visual system and responsive behavior

**Files:**
- Modify: `app/globals.css`
- Test: `tests/ecosystem.test.ts`

**Interfaces:**
- Consumes: class names emitted by Task 3.
- Produces: observatory motion, developer section hierarchy, focus states, mobile continuity, and print/reduced-motion behavior.

- [ ] **Step 1: Add a failing CSS contract test**

Append to `tests/ecosystem.test.ts`:

```ts
test("local CSS owns the observatory without retaining the audio meter", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.observatory-stage/);
  assert.match(css, /@keyframes orbit/);
  assert.doesNotMatch(css, /\.signal-bars/);
  assert.match(css, /prefers-reduced-motion/);
});
```

Run `npm.cmd run test:unit` and expect failure while `.signal-bars` remains.

- [ ] **Step 2: Replace signal styling with observatory styling**

Remove `.brand-mark i`, `.hero-instrument`, `.signal-bars`, and related declarations. Add:

```css
.observatory {
  display: grid;
  gap: 1.5rem;
  margin: 0;
}

.observatory-stage {
  position: relative;
  width: min(100%, 30rem);
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  margin-inline: auto;
  isolation: isolate;
}

.orbit {
  position: absolute;
  border: 1px solid rgb(var(--usk-border-rgb));
  border-radius: 50%;
  animation: orbit 24s linear infinite;
}

.orbit-layout { inset: 2%; }
.orbit-identity { inset: 17%; animation-direction: reverse; animation-duration: 18s; }
.orbit-behavior { inset: 32%; animation-duration: 12s; }

.orbit i {
  position: absolute;
  inset: -.35rem auto auto 50%;
  width: .7rem;
  aspect-ratio: 1;
  border-radius: 50%;
  background: rgb(var(--usk-primary-rgb));
  box-shadow: 0 0 1.5rem rgb(var(--usk-primary-rgb) / .7);
}

.observatory-core {
  width: 27%;
  aspect-ratio: 1;
  display: grid;
  place-content: center;
  border: 1px solid rgb(var(--usk-primary-rgb));
  border-radius: 50%;
  background: rgb(var(--usk-surface-rgb));
  text-align: center;
}

@keyframes orbit { to { rotate: 1turn; } }
```

Add the approved legend, installation rail, code example, library row, resource-link, architecture band, and orbital brand-mark styles using existing `--usk-*` paint tokens and `ly-*` structure classes.

- [ ] **Step 3: Add mobile, focus, reduced-motion, and print rules**

At `max-width: 46rem`, keep the observatory at `min(24rem, 100%)`, stack installation content and resource links, and prevent code blocks from widening the document. Add `:focus-visible` rules for code and resource links. Within the existing reduced-motion query, set `.orbit { animation: none; }`. Hide copy controls and motion-only decoration in print without hiding readable installation text.

- [ ] **Step 4: Run checks and commit**

Run:

```powershell
npm.cmd run test:unit
npm.cmd run typecheck
npm.cmd run lint
```

Expected: all pass.

Commit:

```powershell
git add app/globals.css tests/ecosystem.test.ts
git commit -m "style: create interface observatory system"
```

### Task 5: Verify the GitHub Pages export as a deployable artifact

**Files:**
- Create: `scripts/verify-export.mjs`
- Create: `tests/export.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `out/` built with `PAGES_BASE_PATH=/interface-systems-lab`.
- Produces: `verify:export`, `test:export`, and `quality` scripts with actionable failure output.

- [ ] **Step 1: Add failing export tests and scripts**

Add scripts:

```json
{
  "scripts": {
    "build:pages": "cross-env PAGES_BASE_PATH=/interface-systems-lab next build",
    "test:export": "node --test tests/export.test.mjs",
    "verify:export": "node scripts/verify-export.mjs",
    "quality": "npm run lint && npm run typecheck && npm run test:unit && npm run build:pages && npm run test:export && npm run verify:export"
  }
}
```

Install the cross-platform environment helper:

```powershell
npm.cmd install --save-dev --save-exact cross-env@10.1.0
```

Create `tests/export.test.mjs` with Node tests that read `out/index.html`, `out/robots.txt`, `out/sitemap.xml`, `out/manifest.webmanifest`, and `out/404.html`. Assert the canonical URL, Open Graph image, Twitter card, JSON-LD types, sitemap URL, allowed robots rule, Pages-prefixed icon paths, twelve external resource links, three install snippet types, and absence of `href="/favicon` or `src="/_next`.

Run `npm.cmd run build:pages; npm.cmd run test:export` and expect failure until metadata routes and page resource content are fully exported.

- [ ] **Step 2: Implement the standalone export verifier**

Create `scripts/verify-export.mjs` using `node:fs/promises`, `node:path`, and `node:assert/strict`. Define:

```js
const OUT_DIR = new URL("../out/", import.meta.url);
const SITE_URL = "https://foscat.github.io/interface-systems-lab/";
const BASE_PATH = "/interface-systems-lab";
const REQUIRED_FILES = [
  "index.html",
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "manifest.webmanifest",
  "interface-systems-lab-social-card.png",
];
```

For every required file, assert it exists. Extract local `href` and `src` values from HTML, ignore anchors and protocols, strip query/hash suffixes, remove the base path, and assert the matching file exists under `out/`. Assert the canonical, social image, project repository, package resource URLs, and dependency order. Print `Verified GitHub Pages export at ${SITE_URL}` only after every check passes.

- [ ] **Step 3: Run the full artifact gate and commit**

Run:

```powershell
npm.cmd run quality
```

Expected: lint, typecheck, unit tests, Pages build, export tests, and verifier all pass.

Commit:

```powershell
git add package.json package-lock.json scripts/verify-export.mjs tests/export.test.mjs
git commit -m "test: verify GitHub Pages export"
```

### Task 6: Harden CI/CD and repository documentation

**Files:**
- Modify: `.github/workflows/deploy-pages.yml`
- Modify: `README.md`
- Test: `tests/export.test.mjs`

**Interfaces:**
- Consumes: `npm run quality` and `out/` from Task 5.
- Produces: pull-request quality checks, main-branch Pages deployment, and accurate user documentation.

- [ ] **Step 1: Add a failing workflow contract assertion**

Append to `tests/export.test.mjs` a test that reads `.github/workflows/deploy-pages.yml` and asserts:

```js
assert.match(workflow, /pull_request:/);
assert.match(workflow, /npm run quality/);
assert.match(workflow, /PAGES_BASE_PATH: \/interface-systems-lab/);
assert.match(workflow, /actions\/upload-pages-artifact@v3/);
assert.match(workflow, /actions\/deploy-pages@v4/);
```

Run `npm.cmd run test:export` and expect failure because the current workflow lacks the pull-request trigger and full quality command.

- [ ] **Step 2: Split validation from deployment in GitHub Actions**

Update `.github/workflows/deploy-pages.yml` to trigger on `pull_request`, pushes to `main`, and manual dispatch. Use a `build` job with contents-read permissions that checks out, sets up Node 22, runs `npm ci`, runs `npm run quality`, configures Pages only outside pull requests, and uploads `out/` only outside pull requests. Use a `deploy` job that depends on `build`, is gated by `github.event_name != 'pull_request'`, receives only `pages: write` and `id-token: write`, uses the `github-pages` environment, and deploys the uploaded artifact. Task 7 extends this job with the browser gate after Playwright is installed.

Pin the build environment variable explicitly:

```yaml
env:
  PAGES_BASE_PATH: /interface-systems-lab
```

- [ ] **Step 3: Rewrite the README as the operator and adopter guide**

Document the live URL, project purpose, three resources with repository/wiki/npm/demo links, exact Node requirement, local commands, full quality gate, npm and CDN examples in approved order, and the Pages setup step `Settings -> Pages -> Source: GitHub Actions`. State that a push to `main` deploys only after validation passes.

- [ ] **Step 4: Run workflow and documentation checks, then commit**

Run:

```powershell
npm.cmd run quality
git diff --check
```

Expected: quality passes and `git diff --check` prints no errors.

Commit:

```powershell
git add .github/workflows/deploy-pages.yml README.md tests/export.test.mjs
git commit -m "ci: gate GitHub Pages deployment"
```

### Task 7: Add rendered browser and accessibility regression coverage

**Files:**
- Create: `playwright.config.ts`
- Create: `playwright/site.spec.ts`
- Create: `scripts/prepare-preview.mjs`
- Modify: `.github/workflows/deploy-pages.yml`
- Modify: `.gitignore`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: built Next.js static export and rendered component labels from Tasks 2-4.
- Produces: automated core-workflow, mobile-overflow, metadata, link, copy, and reduced-motion evidence.

- [ ] **Step 1: Install Playwright and add the failing browser test**

Run:

```powershell
npm.cmd install --save-dev --save-exact @playwright/test@1.61.1
```

Add scripts:

```json
{
  "scripts": {
    "prepare:preview": "node scripts/prepare-preview.mjs",
    "serve:out": "npm run prepare:preview && serve .preview -l 4173 --no-clipboard",
    "test:browser": "playwright test"
  }
}
```

Install the verified static server version:

```powershell
npm.cmd install --save-dev --save-exact serve@14.2.6
```

Create `scripts/prepare-preview.mjs` to remove `.preview/`, create `.preview/interface-systems-lab/`, and recursively copy `out/` into that folder. This mirrors GitHub Pages project-path hosting locally so the prefixed `_next` assets and metadata files are exercised instead of bypassed. Add `.preview/`, `playwright-report/`, and `test-results/` to `.gitignore`.

```js
import { cp, mkdir, rm } from "node:fs/promises";

const previewRoot = new URL("../.preview/", import.meta.url);
const projectRoot = new URL("../.preview/interface-systems-lab/", import.meta.url);
const exportRoot = new URL("../out/", import.meta.url);

await rm(previewRoot, { recursive: true, force: true });
await mkdir(projectRoot, { recursive: true });
await cp(exportRoot, projectRoot, { recursive: true });
console.log("Prepared GitHub Pages project-path preview.");
```

Create `playwright.config.ts` with Chromium, `baseURL: "http://127.0.0.1:4173/interface-systems-lab/"`, screenshots on failure, trace on first retry, and a web server that runs `npm run build:pages && npm run serve:out`.

Create `playwright/site.spec.ts` with tests that:

- assert one H1 and the observatory caption;
- change all four workbench controls and verify root data attributes;
- copy the configuration and assert the success label;
- verify npm, bundler, and CDN snippets and order;
- verify twelve resource links and their exact hrefs;
- verify canonical/Open Graph/Twitter/JSON-LD in the rendered head;
- emulate reduced motion and assert orbit animation duration is `0s` or effectively disabled;
- set a 320 x 720 viewport and assert `document.documentElement.scrollWidth <= window.innerWidth`;
- create `test-results/screenshots/` with `node:fs/promises.mkdir` and capture `interface-observatory-desktop.png` and `interface-observatory-mobile.png` there after stable rendering.

- [ ] **Step 2: Run the browser suite and repair concrete failures**

Run:

```powershell
npx playwright install chromium
npm.cmd run test:browser
```

Expected: all browser tests pass. For any failure, preserve the product contract and correct the implementation or assertion using the rendered evidence; do not make hidden-on-hover or reduced-motion content permanently visible solely to satisfy a test.

- [ ] **Step 3: Run the combined gate and commit**

Extend the workflow build job after `npm ci` with:

```yaml
- name: Install Chromium
  run: npx playwright install --with-deps chromium
- name: Run repository quality gate
  run: npm run quality
- name: Verify rendered site
  run: npm run test:browser
```

Run:

```powershell
npm.cmd run quality
npm.cmd run test:browser
```

Expected: both commands pass.

Commit:

```powershell
git add .github/workflows/deploy-pages.yml .gitignore package.json package-lock.json playwright.config.ts playwright/site.spec.ts scripts/prepare-preview.mjs
git commit -m "test: cover observatory browser experience"
```

### Task 8: Complete live-link, visual, and deployment readiness audit

**Files:**
- Modify only files proven defective by the audit.
- Inspect: `out/`, generated screenshots, workflow, repository status, and external destinations.

**Interfaces:**
- Consumes: every task deliverable.
- Produces: final proof against every design acceptance criterion and an explicit deployment handoff.

- [ ] **Step 1: Run all repository gates from a clean generated state**

Run:

```powershell
Remove-Item -Recurse -Force -LiteralPath .next,out -ErrorAction SilentlyContinue
npm.cmd run quality
npm.cmd run test:browser
npm.cmd audit --audit-level=moderate
git diff --check
```

Expected: every command exits 0 and audit reports zero moderate-or-higher vulnerabilities.

- [ ] **Step 2: Verify all external destinations live**

Use `curl.exe -L -sS -o NUL -w "%{http_code}"` for all twelve repository, wiki, npm, and demo URLs plus all three CDN URLs. Accept only successful 2xx responses after redirects. Record an external outage distinctly if a destination that is correct in source is temporarily unavailable; do not silently replace it with an unrelated page.

- [ ] **Step 3: Inspect the rendered design at desktop and mobile sizes**

Open the built site at 1440 x 1000 and 390 x 844. Inspect the hero hierarchy, orbital geometry, next-section preview, workbench controls, code overflow, resource links, focus states, footer, and reduced-motion behavior. Use `view_image` on both Playwright screenshots. Write a fidelity ledger covering at least copy, layout, typography, palette, orbital treatment, spacing/container model, responsiveness, and interactions; fix every material mismatch and rerun the affected checks.

- [ ] **Step 4: Audit the export and workflow against the original objective**

Confirm directly in `out/index.html`, `out/robots.txt`, `out/sitemap.xml`, `out/manifest.webmanifest`, and `out/404.html` that all SEO, crawler, base-path, resource, and install requirements are present. Confirm `.github/workflows/deploy-pages.yml` deploys only the verified `out/` directory and that `origin` targets `Foscat/interface-systems-lab`.

- [ ] **Step 5: Inspect repository state and create the final implementation commit if repairs remain**

Run:

```powershell
git status --short
git diff --stat
git log --oneline --decorate -8
git remote -v
```

Preserve the user's original social-card addition and favicon deletion in the final scoped change. If audit repairs were needed, stage only related files and commit them with:

```powershell
git commit -m "fix: finish Pages readiness audit"
```

- [ ] **Step 6: Prepare the deployment handoff**

Report the current branch, commit sequence, checks run, live-link status, and the expected production URL. If authenticated GitHub access is available and the user has authorized pushing, push the branch and verify the remote head. Otherwise provide the exact push command and the single GitHub setting still required: `Settings -> Pages -> Source: GitHub Actions`.
