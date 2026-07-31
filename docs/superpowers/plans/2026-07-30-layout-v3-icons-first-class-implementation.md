# Layout v3 And First-Class Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate Interface Systems Lab to `layout-style-css@3.0.0` and make `ui-style-kit-icons@1.0.0` a typed, first-class, statically exported part of the existing four-control showcase.

**Architecture:** A client `UiIcon` adapter owns the React/custom-element boundary and supplies a Pages-aware asset base to every `<usk-icon>`. A deterministic build script stages the published runtime and SVG packs, while a new Icon Lab demonstrates automatic `data-ui` pack selection; the existing ecosystem catalog, adoption paths, fixtures, and Layout v3 markup are migrated as one contract.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9, Node.js 22 test runner, Playwright, `layout-style-css@3.0.0`, `ui-style-kit-css@2.1.0`, `ui-style-kit-icons@1.0.0`, `interactive-surface-css@1.5.0`

## Global Constraints

- Preserve the existing one-page observatory identity, content hierarchy, configuration state, URL format, storage format, and four global controls.
- Pin `layout-style-css` exactly to `3.0.0` and `ui-style-kit-icons` exactly to `1.0.0`.
- Keep `ui-style-kit-css@2.1.0` and `interactive-surface-css@1.5.0`.
- Do not recreate removed Layout v2 aliases, responsive utilities, order utilities, bridge imports, or the legacy bundle.
- Use `withBasePath("/assets/ui-style-kit-icons/1.0.0/")` for exported icon assets.
- Require every `UiIcon` caller to choose either a meaningful `label` or `decorative: true`.
- Preserve existing user-owned changes in `app/components/SiteHeader.tsx` and `next-env.d.ts`; never stage or overwrite them unless the feature intentionally edits the same lines and retains the user's content.
- Add professional comments only where they explain a non-obvious contract, safety boundary, or browser behavior.
- Keep formatting, linting, type checking, all tests, static export verification, accessibility, and rendered QA green.
- Do not deploy, publish, tag, or push as part of this plan.
- Execute tasks in dependency order `1, 2, 3, 5, 6, 7, 4, 8`. The Layout v3
  package pin belongs to Task 7, after Task 6 removes fixture imports that v3
  no longer exports.

---

### Task 1: Capture The Existing Visual Contract

**Files:**

- Create: `.qa/layout-v3-icons/baseline-desktop.png`
- Create: `.qa/layout-v3-icons/baseline-mobile.png`
- Modify: `.gitignore`
- Inspect: `app/page.tsx`
- Inspect: `app/styles/*.css`

**Interfaces:**

- Consumes: the current committed site plus the user's unstaged header-copy edit
- Produces: desktop and mobile baseline screenshots used during final fidelity QA

- [ ] **Step 1: Read the browser-control instructions**

Run:

```powershell
Get-Content -Raw "C:\Users\Foscat Laptop\.codex\plugins\cache\openai-bundled\browser\26.721.41059\skills\control-in-app-browser\SKILL.md"
```

Expected: the complete in-app Browser workflow is available and no Chrome-profile requirement is present.

Add the temporary review directory to `.gitignore`:

```text
.qa/
```

- [ ] **Step 2: Build the current Pages artifact**

Run:

```powershell
npm.cmd run build:pages
```

Expected: exit code `0` and a fresh `out/` directory.

- [ ] **Step 3: Open the current artifact in the in-app browser**

Prepare the project-path mirror and start the preview server:

```powershell
npm.cmd run preview:prepare
$existingListener = Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue
if ($existingListener) {
  throw "Port 4173 is already in use."
}
$previewProcess = Start-Process -FilePath "npm.cmd" -ArgumentList @(
  "exec",
  "serve",
  "--",
  ".preview",
  "-l",
  "4173",
  "--no-clipboard"
) -WindowStyle Hidden -PassThru
$previewProcess.Id
```

Retain the printed process ID in the execution notes. Use the Browser skill
to open
`http://127.0.0.1:4173/interface-systems-lab/` and preserve the user's visible
`Discover STE` copy.

Expected: the page renders with its current observatory layout and no startup console error.

- [ ] **Step 4: Capture desktop and mobile baselines**

Capture:

```text
.qa/layout-v3-icons/baseline-desktop.png  at 1440 x 1000
.qa/layout-v3-icons/baseline-mobile.png   at 390 x 844
```

Expected: both files exist, are non-empty, and show the full first viewport without horizontal clipping.

- [ ] **Step 5: Inspect both baseline files**

Run:

```powershell
Get-Item ".qa\layout-v3-icons\baseline-desktop.png", ".qa\layout-v3-icons\baseline-mobile.png"
```

Then use `view_image` on each file.

Expected: the baseline establishes the existing palette, type hierarchy, control density, header copy, and responsive collapse that later work must preserve.

Resolve and stop only the preview server that owns port `4173`:

```powershell
$listener = Get-NetTCPConnection -LocalPort 4173 -State Listen
$owner = Get-CimInstance Win32_Process -Filter "ProcessId=$($listener.OwningProcess)"
if ($owner.CommandLine -notmatch "serve(?:\.cmd)?\s+\.preview|serve.*\.preview") {
  throw "Port 4173 is not owned by the expected preview server."
}
Stop-Process -Id $listener.OwningProcess
```

Expected: no listener remains on port `4173`.

---

### Task 2: Pin Packages And Stage Icon Assets

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `scripts/build-icon-assets.mjs`
- Create: `tests/icon-assets.test.mjs`
- Modify: `.gitignore`

**Interfaces:**

- Consumes: `ui-style-kit-icons/package.json`, `ui-style-kit-icons/registry.json`, and the package's public runtime and SVG asset tree
- Produces: `buildIconAssets(options?)`, `validateIconContract(contract)`, `assertSafeIconAssetPath(root, output)`, and `public/assets/ui-style-kit-icons/1.0.0/`

- [ ] **Step 1: Write the failing asset-contract tests**

Create `tests/icon-assets.test.mjs` with:

```js
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  EXPECTED_ICON_CONTRACT,
  EXPECTED_ICON_COUNT,
  EXPECTED_ICON_VERSION,
  assertSafeIconAssetPath,
  buildIconAssets,
  validateIconContract,
} from "../scripts/build-icon-assets.mjs";

test("the icon contract accepts the pinned published package", async () => {
  const contract = JSON.parse(
    await readFile(
      new URL(
        "../node_modules/ui-style-kit-icons/contract/icon-contract.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );

  assert.equal(EXPECTED_ICON_VERSION, "1.0.0");
  assert.equal(EXPECTED_ICON_CONTRACT, "1.0.0");
  assert.equal(EXPECTED_ICON_COUNT, 64);
  assert.doesNotThrow(() => validateIconContract(contract));
});

test("the icon contract rejects incomplete semantic coverage", () => {
  assert.throws(
    () =>
      validateIconContract({
        schemaVersion: "1.0.0",
        requiredIconCount: 63,
        icons: [],
      }),
    /required icon count/i,
  );
});

test("icon output must stay in the versioned public asset directory", async () => {
  const repositoryRoot = path.resolve(".");
  await assert.rejects(
    assertSafeIconAssetPath(
      repositoryRoot,
      path.join(repositoryRoot, "public"),
    ),
    /exactly/i,
  );
});

test("the icon builder stages runtime modules and SVG packs", async () => {
  const temporaryRoot = await mkdtemp(
    path.join(os.tmpdir(), "interface-systems-icons-"),
  );

  try {
    const output = path.join(
      temporaryRoot,
      "public",
      "assets",
      "ui-style-kit-icons",
      EXPECTED_ICON_VERSION,
    );
    const result = await buildIconAssets({
      repositoryRoot: temporaryRoot,
      output,
    });

    assert.equal(result.version, EXPECTED_ICON_VERSION);
    assert.equal(result.requiredIconCount, EXPECTED_ICON_COUNT);
    await stat(path.join(output, "ui-style-kit-icons.js"));
    await stat(path.join(output, "ui-style-kit-icons.css"));
    await stat(path.join(output, "registry.js"));
    await stat(path.join(output, "icons", "dashboard.svg"));
    await stat(
      path.join(output, "packs", "cyberpunk", "icons", "dashboard.svg"),
    );
  } finally {
    await rm(temporaryRoot, { force: true, recursive: true });
  }
});
```

- [ ] **Step 2: Add the focused asset test command and verify RED**

Modify the test script to include both fixture suites:

```json
"test:fixtures": "node --test tests/fixtures.test.mjs tests/icon-assets.test.mjs"
```

Run:

```powershell
npm.cmd run test:fixtures
```

Expected: FAIL because `scripts/build-icon-assets.mjs` does not exist.

- [ ] **Step 3: Install the pinned dependencies**

Run:

```powershell
npm.cmd install --save-exact ui-style-kit-icons@1.0.0
```

Expected: `package.json` and `package-lock.json` record the exact icon version
without changing the currently installed Layout, UI Style Kit, or Interactive
Surface versions. Task 7 pins Layout v3 after the legacy fixture imports are
removed.

- [ ] **Step 4: Implement the safe asset builder**

Create `scripts/build-icon-assets.mjs` with these public constants and functions:

```js
import { cp, lstat, mkdir, readFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const EXPECTED_ICON_VERSION = "1.0.0";
export const EXPECTED_ICON_CONTRACT = "1.0.0";
export const EXPECTED_ICON_COUNT = 64;

const modulePath = fileURLToPath(import.meta.url);
const defaultRepositoryRoot = path.resolve(path.dirname(modulePath), "..");

export function validateIconContract(contract) {
  if (contract?.schemaVersion !== EXPECTED_ICON_CONTRACT) {
    throw new Error(`Icon contract version must be ${EXPECTED_ICON_CONTRACT}.`);
  }
  if (contract?.requiredIconCount !== EXPECTED_ICON_COUNT) {
    throw new Error(`Icon required icon count must be ${EXPECTED_ICON_COUNT}.`);
  }
  if (
    !Array.isArray(contract.icons) ||
    contract.icons.length !== EXPECTED_ICON_COUNT
  ) {
    throw new Error("Icon contract requires the complete semantic icon list.");
  }
}

export async function assertSafeIconAssetPath(repositoryRoot, output) {
  const resolvedRoot = path.resolve(repositoryRoot);
  const resolvedOutput = path.resolve(output);
  const expected = path.join(
    "public",
    "assets",
    "ui-style-kit-icons",
    EXPECTED_ICON_VERSION,
  );
  const relative = path.relative(resolvedRoot, resolvedOutput);
  if (relative !== expected) {
    throw new Error(
      `Icon output must resolve exactly to ${expected}; received ${relative || "."}.`,
    );
  }

  let component = resolvedRoot;
  for (const segment of expected.split(path.sep)) {
    component = path.join(component, segment);
    try {
      const status = await lstat(component);
      if (status.isSymbolicLink()) {
        throw new Error(
          `Icon output contains symbolic-link path component: ${segment}.`,
        );
      }
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  return resolvedOutput;
}
```

Complete the module with:

```js
async function readJson(specifier) {
  const source = fileURLToPath(import.meta.resolve(specifier));
  return {
    source,
    value: JSON.parse(await readFile(source, "utf8")),
  };
}

async function assertRegularFile(source, description) {
  const status = await lstat(source);
  if (!status.isFile()) {
    throw new Error(`${description} is not a regular file: ${source}`);
  }
}

export async function buildIconAssets(options = {}) {
  const repositoryRoot = path.resolve(
    options.repositoryRoot ?? defaultRepositoryRoot,
  );
  const output = await assertSafeIconAssetPath(
    repositoryRoot,
    options.output ??
      path.join(
        repositoryRoot,
        "public",
        "assets",
        "ui-style-kit-icons",
        EXPECTED_ICON_VERSION,
      ),
  );
  const { source: manifestSource, value: manifest } = await readJson(
    "ui-style-kit-icons/package.json",
  );
  const { value: contract } = await readJson(
    "ui-style-kit-icons/contract.json",
  );
  const { value: registry } = await readJson(
    "ui-style-kit-icons/registry.json",
  );
  const packageRoot = path.dirname(manifestSource);

  if (manifest.version !== EXPECTED_ICON_VERSION) {
    throw new Error(
      `ui-style-kit-icons version must be ${EXPECTED_ICON_VERSION}; found ${manifest.version}.`,
    );
  }
  if (registry.contractVersion !== EXPECTED_ICON_CONTRACT) {
    throw new Error(
      `ui-style-kit-icons contract must be ${EXPECTED_ICON_CONTRACT}; found ${registry.contractVersion}.`,
    );
  }
  validateIconContract(contract);
  if (
    registry.requiredIconCount !== EXPECTED_ICON_COUNT ||
    !Array.isArray(registry.packs) ||
    registry.packs.length !== registry.packCount
  ) {
    throw new Error("The published icon registry is incomplete.");
  }

  for (const pack of registry.packs) {
    if (
      pack.requiredIconCount !== EXPECTED_ICON_COUNT ||
      !Array.isArray(pack.coreIcons) ||
      pack.coreIcons.length !== EXPECTED_ICON_COUNT
    ) {
      throw new Error(`Icon pack "${pack.id}" is incomplete.`);
    }
    for (const icon of pack.coreIcons) {
      await assertRegularFile(
        path.join(packageRoot, pack.sourcePath, icon.file),
        `Icon "${icon.id}" in pack "${pack.id}"`,
      );
    }
  }

  const runtimeSource = path.join(packageRoot, "dist", "ui-style-kit-icons.js");
  const cssSource = path.join(packageRoot, "dist", "ui-style-kit-icons.css");
  const registrySource = path.join(packageRoot, "dist", "registry.js");
  await assertRegularFile(runtimeSource, "Icon runtime");
  await assertRegularFile(cssSource, "Icon stylesheet");
  await assertRegularFile(registrySource, "Icon runtime registry");

  await rm(output, { force: true, recursive: true });
  await mkdir(output, { recursive: true });
  await cp(runtimeSource, path.join(output, "ui-style-kit-icons.js"));
  await cp(cssSource, path.join(output, "ui-style-kit-icons.css"));
  await cp(registrySource, path.join(output, "registry.js"));
  await cp(path.join(packageRoot, "icons"), path.join(output, "icons"), {
    recursive: true,
  });
  await cp(path.join(packageRoot, "packs"), path.join(output, "packs"), {
    recursive: true,
  });

  return {
    output,
    packCount: registry.packCount,
    requiredIconCount: registry.requiredIconCount,
    version: manifest.version,
  };
}
```

The staged mapping is:

```text
dist/ui-style-kit-icons.js -> ui-style-kit-icons.js
dist/ui-style-kit-icons.css -> ui-style-kit-icons.css
dist/registry.js            -> registry.js
icons/                      -> icons/
packs/                      -> packs/
```

The CLI tail must be:

```js
if (process.argv[1] && path.resolve(process.argv[1]) === modulePath) {
  const result = await buildIconAssets();
  console.log(
    `Staged ${result.requiredIconCount} semantic icons across ${result.packCount} packs.`,
  );
}
```

- [ ] **Step 5: Wire deterministic asset builds**

Update `package.json`:

```json
"predev": "npm run assets:build",
"prebuild": "npm run assets:build",
"prebuild:pages": "npm run assets:build",
"assets:build": "node scripts/build-icon-assets.mjs && npm run fixtures:build"
```

Add the generated versioned icon asset directory to `.gitignore`:

```text
public/assets/ui-style-kit-icons/
```

- [ ] **Step 6: Run the focused tests and build**

Run:

```powershell
npm.cmd run test:fixtures
npm.cmd run assets:build
```

Expected: both commands exit `0`; runtime modules, system SVGs, and pack SVGs exist under the versioned public directory.

- [ ] **Step 7: Commit the asset pipeline**

Run:

```powershell
git add package.json package-lock.json .gitignore scripts/build-icon-assets.mjs tests/icon-assets.test.mjs
git commit -m "build: stage first-class icon assets"
```

Expected: the commit excludes `app/components/SiteHeader.tsx`, `next-env.d.ts`, generated icon assets, and baseline QA screenshots.

---

### Task 3: Add The Typed `UiIcon` Adapter

**Files:**

- Create: `app/components/UiIcon.tsx`
- Create: `tests/ui-icon-types.tsx`
- Modify: `app/layout.tsx`
- Modify: `next.config.ts`
- Modify: `tests/ecosystem.test.ts`

**Interfaces:**

- Consumes: `IconName` and `IconFrame` from `ui-style-kit-icons`, plus `withBasePath()` from `app/lib/site.ts`
- Produces: `UiIcon(props: UiIconProps)` with a discriminated accessibility union

- [ ] **Step 1: Write the failing compile-time contract**

Create `tests/ui-icon-types.tsx`:

```tsx
import { UiIcon } from "../app/components/UiIcon";

const decorative = <UiIcon decorative name="dashboard" />;
const meaningful = <UiIcon label="Dashboard" name="dashboard" />;
const framed = <UiIcon decorative frame="soft" name="palette" size="2rem" />;

const missingAccessibilityIntent = (
  // @ts-expect-error Accessibility intent is required.
  <UiIcon name="dashboard" />
);

const conflictingAccessibilityIntent = (
  // @ts-expect-error Decorative icons cannot also announce a label.
  <UiIcon decorative label="Dashboard" name="dashboard" />
);

const unknownIcon = (
  // @ts-expect-error Icon names are restricted to the published contract.
  <UiIcon decorative name="not-a-published-icon" />
);

void [
  decorative,
  meaningful,
  framed,
  missingAccessibilityIntent,
  conflictingAccessibilityIntent,
  unknownIcon,
];
```

- [ ] **Step 2: Add a source-contract test and verify RED**

Append to `tests/ecosystem.test.ts`:

```ts
test("UiIcon owns the typed custom-element and asset-base contract", () => {
  const source = readFileSync(
    path.join(repositoryRoot, "app", "components", "UiIcon.tsx"),
    "utf8",
  );

  assert.match(source, /import "ui-style-kit-icons\/element"/);
  assert.match(source, /React\.createElement\("usk-icon"/);
  assert.match(source, /NEXT_PUBLIC_PAGES_BASE_PATH/);
  assert.match(source, /decorative: true/);
  assert.match(source, /label: string/);
});
```

Run:

```powershell
npm.cmd run typecheck
npm.cmd run test:unit
```

Expected: FAIL because `UiIcon.tsx` does not exist.

- [ ] **Step 3: Implement the adapter**

Create `app/components/UiIcon.tsx`:

```tsx
"use client";

import React from "react";
import "ui-style-kit-icons/element";
import type { IconFrame, IconName } from "ui-style-kit-icons";

import { withBasePath } from "../lib/site";

const ICON_ASSET_BASE = withBasePath(
  "/assets/ui-style-kit-icons/1.0.0/",
  process.env.NEXT_PUBLIC_PAGES_BASE_PATH ?? "",
);

type UiIconBaseProps = {
  className?: string;
  frame?: IconFrame;
  name: IconName;
  size?: string;
};

export type UiIconProps = UiIconBaseProps &
  (
    | {
        decorative: true;
        label?: never;
      }
    | {
        decorative?: false;
        label: string;
      }
  );

export function UiIcon({
  className,
  decorative,
  frame,
  label,
  name,
  size,
}: UiIconProps) {
  const classes = ["usk-icon", className].filter(Boolean).join(" ");

  return React.createElement("usk-icon", {
    "asset-base": ICON_ASSET_BASE,
    className: classes,
    frame,
    label: decorative ? undefined : label,
    name,
    size,
  });
}
```

- [ ] **Step 4: Expose the configured Pages base path to the client**

In `next.config.ts`, add:

```ts
env: {
  NEXT_PUBLIC_PAGES_BASE_PATH: basePath,
},
```

to `nextConfig`. This compiles the same empty/local or
`/interface-systems-lab` Pages base into the client adapter that Next already
uses for the exported asset prefix.

- [ ] **Step 5: Load the package's public CSS layer**

In `app/layout.tsx`, preserve the existing ownership order and add:

```ts
import "ui-style-kit-icons/css.css";
```

after `layout-style-css`.

- [ ] **Step 6: Run adapter verification**

Run:

```powershell
npm.cmd run typecheck
npm.cmd run test:unit
npm.cmd run lint
```

Expected: all three commands exit `0`; the `@ts-expect-error` cases are consumed and no custom JSX namespace widening is needed.

- [ ] **Step 7: Commit the typed adapter**

Run:

```powershell
git add app/components/UiIcon.tsx app/layout.tsx next.config.ts tests/ui-icon-types.tsx tests/ecosystem.test.ts
git commit -m "feat: add typed UI icon adapter"
```

Expected: only the adapter contract, CSS import, and focused tests are committed.

---

### Task 4: Build The First-Class Icon Lab

**Files:**

- Create: `app/components/labs/IconLab.tsx`
- Modify: `app/page.tsx`
- Modify: `app/components/SiteHeader.tsx`
- Modify: `app/styles/labs.css`
- Modify: `app/styles/responsive.css`
- Modify: `tests/ecosystem.test.ts`
- Modify: `tests/browser/site.spec.ts`
- Modify: `tests/browser/accessibility.spec.ts`

**Interfaces:**

- Consumes: `UiIcon`, `useLabConfiguration()`, `getPack()`, `IconFrame`, and `IconName`
- Produces: `#icons`, `[data-icon-lab]`, `[data-active-icon-pack]`, `[data-icon-specimen]`, and the local “Icon frame” control

- [ ] **Step 1: Write the failing page-order and browser contracts**

Add a source-order assertion to `tests/ecosystem.test.ts`:

```ts
test("the Icon Lab follows UI and precedes interaction", () => {
  const pageSource = readFileSync(
    path.join(repositoryRoot, "app", "page.tsx"),
    "utf8",
  );
  assert.ok(
    pageSource.indexOf("<UiNativeLab") < pageSource.indexOf("<IconLab"),
  );
  assert.ok(
    pageSource.indexOf("<IconLab") < pageSource.indexOf("<InteractionLab"),
  );
});
```

Add to `tests/browser/site.spec.ts`:

```ts
test("icons follow the selected UI pack and expose frame variants", async ({
  page,
}) => {
  await page.goto("./?ui=minimal-saas&theme=midnight-gold&mode=dark");

  const lab = page.locator("[data-icon-lab]");
  const firstIcon = lab.locator("usk-icon").first();
  await expect(lab).toBeVisible();
  await expect(lab.locator("[data-active-icon-pack]")).toHaveText(
    /Minimal SaaS/i,
  );
  await expect(firstIcon).toHaveAttribute("data-pack", "minimal-saas");
  await expect
    .poll(() =>
      firstIcon.evaluate((element) =>
        Boolean(element.shadowRoot?.querySelector("svg")),
      ),
    )
    .toBe(true);

  await page.getByLabel("Visual style").selectOption("cyberpunk");
  await expect(firstIcon).toHaveAttribute("data-pack", "cyberpunk");

  await page.getByLabel("Icon frame").selectOption("none");
  await expect(firstIcon).toHaveAttribute("frame", "none");
});
```

Add an accessibility expectation to `tests/browser/accessibility.spec.ts`:

```ts
await expect(
  page.locator('[data-icon-lab] usk-icon[role="img"]'),
).toHaveAttribute("aria-label", /.+/);
```

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```powershell
npm.cmd run test:unit
npm.cmd run test:browser -- --grep "icons follow"
```

Expected: FAIL because the Icon Lab and selectors do not exist.

- [ ] **Step 3: Implement the Icon Lab**

Create `app/components/labs/IconLab.tsx` with:

```tsx
"use client";

import { getPack, type IconFrame, type IconName } from "ui-style-kit-icons";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { UiIcon } from "../UiIcon";
import { useLabConfiguration } from "../LabExperience";

const ICON_FRAMES = [
  "auto",
  "soft",
  "none",
] as const satisfies readonly IconFrame[];

const ICON_SPECIMENS = [
  ["dashboard", "Dashboard"],
  ["browser", "Browser"],
  ["palette", "Visual identity"],
  ["layers", "Layers"],
  ["activity", "Activity"],
  ["shield", "Security"],
  ["database", "Data"],
  ["credit-card", "Commerce"],
  ["message", "Communication"],
  ["warning", "Feedback"],
  ["terminal", "Developer tools"],
  ["rocket", "Delivery"],
] as const satisfies readonly (readonly [IconName, string])[];

export function IconLab() {
  const { configuration } = useLabConfiguration();
  const [frame, setFrame] = useState<IconFrame>("auto");
  const [errorMessage, setErrorMessage] = useState("");
  const sectionRef = useRef<HTMLElement | null>(null);
  const pack = getPack(configuration.ui);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleError = () => {
      setErrorMessage(
        "One or more icon assets could not load. Text labels remain available.",
      );
    };
    section.addEventListener("usk-icon-error", handleError);
    return () => {
      section.removeEventListener("usk-icon-error", handleError);
    };
  }, []);

  const handleFrameChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selected = ICON_FRAMES.find(
      (candidate) => candidate === event.target.value,
    );
    if (selected) setFrame(selected);
  };

  return (
    <section
      ref={sectionRef}
      className="icon-lab section-band ly-section"
      id="icons"
      data-icon-lab
      aria-labelledby="icons-title"
    >
      <div className="ly-wrapper ly-stack ly-gap-6">
        <div className="section-heading ly-split ly-gap-6 ly-items-end">
          <div className="ly-stack ly-gap-2">
            <p className="section-label">Iconography laboratory</p>
            <h2 id="icons-title">One meaning, styled for every interface.</h2>
          </div>
          <p>
            Visual Style selects the artwork pack automatically. Palette and
            mode then supply color and contrast without changing semantics.
          </p>
        </div>

        <div className="icon-lab-toolbar ly-cluster ly-gap-4">
          <p>
            Active pack: <strong data-active-icon-pack>{pack.label}</strong>
          </p>
          <label>
            <span>Icon frame</span>
            <select value={frame} onChange={handleFrameChange}>
              {ICON_FRAMES.map((value) => (
                <option value={value} key={value}>
                  {value === "auto"
                    ? "Authored"
                    : `${value.charAt(0).toUpperCase()}${value.slice(1)}`}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="icon-specimen-grid ly-grid ly-gap-4">
          {ICON_SPECIMENS.map(([name, label]) => (
            <article
              className="icon-specimen ly-stack ly-gap-2 ly-pad-4"
              data-icon-specimen={name}
              key={name}
            >
              <UiIcon decorative frame={frame} name={name} size="3rem" />
              <strong>{label}</strong>
              <code>{name}</code>
            </article>
          ))}
        </div>

        <div className="icon-accessibility-proof ly-cluster ly-gap-4">
          <UiIcon
            frame={frame}
            label={`${pack.label} palette icon`}
            name="palette"
            size="3rem"
          />
          <p>
            Standalone meaningful icons announce a label; icons beside visible
            text are decorative.
          </p>
        </div>

        <p className="muted-copy">
          Bauhaus intentionally uses the neutral System pack. Retrofuturism uses
          Synthwave artwork.
        </p>
        <p className="ly-visually-hidden" aria-live="polite">
          {errorMessage}
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Insert the section and navigation anchor**

In `app/page.tsx`:

```tsx
import { IconLab } from "./components/labs/IconLab";
```

and:

```tsx
<UiNativeLab />
<IconLab />
<InteractionLab />
```

In `app/components/SiteHeader.tsx`, retain the user's `Discover STE` text and insert:

```ts
["Icons", "icons"],
```

between UI + native and Interactions.

- [ ] **Step 5: Add page-owned Icon Lab styles**

Append focused rules to `app/styles/labs.css`:

```css
.icon-lab-toolbar,
.icon-accessibility-proof {
  justify-content: space-between;
}

.icon-lab-toolbar label {
  display: grid;
  gap: 0.5rem;
}

.icon-specimen-grid {
  --ly-grid-min: min(100%, 10rem);
}

.icon-specimen {
  min-inline-size: 0;
  border: 1px solid rgb(var(--usk-border-rgb) / 0.72);
  background: rgb(var(--usk-surface-rgb) / 0.72);
}

.icon-specimen usk-icon {
  color: rgb(var(--usk-text-rgb));
}
```

Add this mobile rule to `app/styles/responsive.css`:

```css
@media (max-width: 42rem) {
  .icon-lab-toolbar,
  .icon-accessibility-proof {
    align-items: stretch;
    flex-direction: column;
  }
}
```

- [ ] **Step 6: Run focused verification**

Run:

```powershell
npm.cmd run format
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
npm.cmd run build:pages
npm.cmd run test:browser -- --grep "icons follow|accessibility"
```

Expected: all commands exit `0`; the rendered custom elements load local SVGs and follow `data-ui`.

- [ ] **Step 7: Commit the Icon Lab**

Run:

```powershell
git add app/components/labs/IconLab.tsx app/page.tsx app/components/SiteHeader.tsx app/styles/labs.css app/styles/responsive.css tests/ecosystem.test.ts tests/browser/site.spec.ts tests/browser/accessibility.spec.ts
git commit -m "feat: add first-class icon laboratory"
```

Expected: the commit intentionally includes the user's preserved `Discover STE` header copy because the same file is edited for the Icons navigation anchor; mention this in the handoff.

---

### Task 5: Expand Ecosystem And Adoption Contracts

**Files:**

- Modify: `app/data/ecosystem.ts`
- Modify: `app/components/InstallGuide.tsx`
- Modify: `app/components/LibraryDirectory.tsx`
- Modify: `app/lib/site.ts`
- Modify: `app/page.tsx`
- Modify: `README.md`
- Modify: `tests/ecosystem.test.ts`
- Modify: `tests/export.test.mjs`
- Modify: `tests/browser/site.spec.ts`

**Interfaces:**

- Consumes: the four pinned package versions and existing install/adoption components
- Produces: four-package `ECOSYSTEM_PACKAGES`, `NPM_INSTALL`, `BUNDLER_IMPORTS`, `CDN_LINKS`, and meaningful icon adoption paths

- [ ] **Step 1: Update failing ecosystem expectations**

Change the expected package order in `tests/ecosystem.test.ts` to:

```ts
[
  "layout-style-css",
  "ui-style-kit-css",
  "ui-style-kit-icons",
  "interactive-surface-css",
];
```

Add exact expectations:

```ts
assert.equal(ECOSYSTEM_PACKAGES[0]?.version, "3.0.0");
assert.equal(ECOSYSTEM_PACKAGES[2]?.version, "1.0.0");
assert.match(NPM_INSTALL, /ui-style-kit-icons@1\.0\.0/);
assert.deepEqual(
  ADOPTION_PATHS.map(({ id }) => id),
  [
    "layout-only",
    "ui-only",
    "icons-only",
    "interactive-only",
    "layout-ui",
    "ui-icons",
    "layout-interactive",
    "ui-interactive",
    "all-canonical",
  ],
);
assert.equal(
  ADOPTION_PATHS.some(({ id }) => id === "all-legacy"),
  false,
);
```

Update the browser package-directory count from three to four.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```powershell
npm.cmd run test:unit
```

Expected: FAIL because the current catalog has three packages and advertises v2 legacy paths.

- [ ] **Step 3: Add the Iconography package entry**

Expand `EcosystemPackage["name"]` and `fixture`, then insert:

```ts
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
```

- [ ] **Step 4: Update install and import contracts**

Set:

```ts
export const NPM_INSTALL =
  "npm install ui-style-kit-css@2.1.0 ui-style-kit-icons@1.0.0 layout-style-css@3.0.0 interactive-surface-css@1.5.0";

export const BUNDLER_IMPORTS = [
  'import "ui-style-kit-css/visual.css";',
  'import "ui-style-kit-css/interactive-surface-theme.css";',
  'import "interactive-surface-css/state-core.css";',
  'import "layout-style-css";',
  'import "ui-style-kit-icons/css.css";',
  'import "ui-style-kit-icons/element";',
] as const;
```

Add immutable icon CSS and ESM runtime CDN records at `1.0.0`. Render the
runtime as a module script in `CDN_MARKUP`; do not encode JavaScript as a
stylesheet link.

Use:

```ts
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

function cdnMarkup(assets: readonly CdnAsset[]): string {
  return assets
    .map((asset) =>
      asset.kind === "style"
        ? `<link rel="stylesheet" href="${asset.href}">`
        : `<script type="module" src="${asset.href}"></script>`,
    )
    .join("\n");
}
```

- [ ] **Step 5: Replace adoption IDs and paths**

Update the type union:

```ts
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
```

Add `icons-only` and `ui-icons`, update every Layout version to `3.0.0`,
include Icons in `all-canonical`, rename visible all-three copy to
all-four/complete-stack wording, and delete the legacy CDN constants and
`all-legacy` path.

- [ ] **Step 6: Update visible documentation and structured data**

Update `README.md`, `InstallGuide.tsx`, `LibraryDirectory.tsx`, and package
structured data in `app/page.tsx` so:

- the ecosystem table contains four packages
- installation examples include Icons and Layout v3
- the ownership explanation names Iconography
- package counts derive from `ECOSYSTEM_PACKAGES.length`
- `ui-style-kit-icons` structured data identifies JavaScript/SVG rather than
  claiming it is CSS-only
- `SITE.description` names all four packages
- social-card alternative text accurately describes the existing image
  without presenting its embedded legacy package count as current metadata

- [ ] **Step 7: Run ecosystem verification**

Run:

```powershell
npm.cmd run format
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
```

Expected: all commands exit `0`; no public adoption snippet contains Layout v2, bridge, or legacy exports.

- [ ] **Step 8: Commit ecosystem adoption**

Run:

```powershell
git add app/data/ecosystem.ts app/components/InstallGuide.tsx app/components/LibraryDirectory.tsx app/page.tsx README.md tests/ecosystem.test.ts tests/browser/site.spec.ts
git commit -m "docs: promote icons in ecosystem adoption"
```

---

### Task 6: Add Icon Fixtures And Remove Legacy Integration

**Files:**

- Modify: `app/data/integration-fixtures.json`
- Modify: `app/components/labs/IntegrationLab.tsx`
- Modify: `scripts/build-fixtures.mjs`
- Modify: `tests/fixtures.test.mjs`
- Modify: `tests/browser/site.spec.ts`

**Interfaces:**

- Consumes: staged icon assets from Task 2 and the updated package catalog from Task 5
- Produces: `icon-only`, `ui-icons`, and four-package `all-canonical` generated fixture pages

- [ ] **Step 1: Write the failing fixture catalog expectations**

Update `tests/fixtures.test.mjs` to require:

```js
assert.deepEqual(
  catalog.map(({ id }) => id),
  [
    "layout-only",
    "ui-only",
    "icon-only",
    "interactive-only",
    "layout-ui",
    "ui-icons",
    "layout-interactive",
    "ui-interactive",
    "all-canonical",
  ],
);
assert.equal(
  catalog.some(({ id }) => id === "all-legacy"),
  false,
);
assert.deepEqual(catalog.find(({ id }) => id === "all-canonical")?.packages, [
  "ui-style-kit-css",
  "ui-style-kit-icons",
  "interactive-surface-css",
  "layout-style-css",
]);
```

Require icon fixtures to contain:

```js
assert.match(html, /<usk-icon\b/);
assert.match(html, /ui-style-kit-icons\.js/);
assert.match(
  html,
  /asset-base="\.\.\/\.\.\/assets\/ui-style-kit-icons\/1\.0\.0\/"/,
);
```

- [ ] **Step 2: Run fixture tests and verify RED**

Run:

```powershell
npm.cmd run test:fixtures
```

Expected: FAIL because the catalog still includes `all-legacy` and has no icon fixtures.

- [ ] **Step 3: Update the fixture catalog**

In `app/data/integration-fixtures.json`:

- update Layout descriptions to the v3 intrinsic system
- add `icon-only` in group `one` with `styles: ["icon-css"]`
- add `ui-icons` in group `pair` with
  `styles: ["ui-visual", "icon-css"]`
- add `ui-style-kit-icons` and `icon-css` to `all-canonical`
- remove `all-legacy`

Use these exact new definitions:

```json
{
  "id": "icon-only",
  "title": "UI Style Kit Icons standalone",
  "group": "one",
  "summary": "Semantic SVG artwork with readable fallback paint and no required visual-theme dependency.",
  "packages": ["ui-style-kit-icons"],
  "styles": ["icon-css"],
  "deprecated": false
},
{
  "id": "ui-icons",
  "title": "UI plus icons",
  "group": "pair",
  "summary": "The selected UI preset supplies icon artwork while palette and mode supply coordinated paint.",
  "packages": ["ui-style-kit-css", "ui-style-kit-icons"],
  "styles": ["ui-visual", "icon-css"],
  "deprecated": false
}
```

- [ ] **Step 4: Update fixture assets and package versions**

In `scripts/build-fixtures.mjs`:

```js
export const EXPECTED_PACKAGE_VERSIONS = Object.freeze({
  "interactive-surface-css": "1.5.0",
  "layout-style-css": "2.1.0",
  "ui-style-kit-css": "2.1.0",
  "ui-style-kit-icons": "1.0.0",
});
```

Task 7 updates the temporary Layout expectation to `3.0.0` when it pins the
new package version.

Remove `layout-ui-bridge` and `layout-legacy`. Add:

```js
"icon-css": Object.freeze({
  export: "ui-style-kit-icons/css.css",
  target: "assets/ui-style-kit-icons/1.0.0/ui-style-kit-icons.css",
}),
```

- [ ] **Step 5: Generate icon-aware fixture markup**

In `fixtureMarkup()` add:

```js
const usesIcons = fixture.packages.includes("ui-style-kit-icons");
```

When true, add to `<head>`:

```html
<script
  type="module"
  src="../../assets/ui-style-kit-icons/1.0.0/ui-style-kit-icons.js"
></script>
```

and add a visible specimen:

```html
<article class="ly-stack ly-gap-4" data-proof-icons>
  <h2>Theme-aware iconography</h2>
  <div class="ly-cluster ly-gap-4">
    <usk-icon
      name="dashboard"
      label="Dashboard"
      asset-base="../../assets/ui-style-kit-icons/1.0.0/"
    ></usk-icon>
    <usk-icon
      name="palette"
      label="Palette"
      asset-base="../../assets/ui-style-kit-icons/1.0.0/"
    ></usk-icon>
  </div>
</article>
```

Delete all legacy root attributes and legacy proof markup.

- [ ] **Step 6: Remove the legacy disclosure**

In `IntegrationLab.tsx`, change the group type to `"one" | "pair"`, remove
the legacy `FixtureGroup`, and update canonical copy to “complete
four-package stack.”

- [ ] **Step 7: Run fixture and browser verification**

Run:

```powershell
npm.cmd run assets:build
npm.cmd run test:fixtures
npm.cmd run build:pages
npm.cmd run test:browser -- --grep "integration|fixture"
```

Expected: all commands exit `0`; generated icon fixture modules and SVG
requests return `200` under the Pages base path.

- [ ] **Step 8: Commit fixture integration**

Run:

```powershell
git add app/data/integration-fixtures.json app/components/labs/IntegrationLab.tsx scripts/build-fixtures.mjs tests/fixtures.test.mjs tests/browser/site.spec.ts
git commit -m "feat: prove icon integration fixtures"
```

---

### Task 7: Complete The Layout Style CSS v3 Migration

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `app/**/*.tsx`
- Modify: `app/styles/shell.css`
- Modify: `app/styles/observatory.css`
- Modify: `app/styles/labs.css`
- Modify: `app/styles/responsive.css`
- Modify: `scripts/build-fixtures.mjs`
- Modify: `tests/ecosystem.test.ts`
- Modify: `tests/fixtures.test.mjs`
- Modify: `tests/browser/capabilities.spec.ts`
- Modify: `tests/browser/site.spec.ts`
- Modify: `README.md`

**Interfaces:**

- Consumes: the published Layout v3 migration contract
- Produces: canonical v3 markup with intrinsic grids/panes, retained personalities, and application-owned responsive topology

- [ ] **Step 1: Write a failing removed-selector audit**

Add to `tests/ecosystem.test.ts`:

```ts
test("authored runtime sources do not use removed Layout v2 selectors", () => {
  const sourceFiles = collectSourceFiles([
    path.join(repositoryRoot, "app"),
    path.join(repositoryRoot, "scripts"),
  ]);
  const removed =
    /\bly-(?:grid--auto|panes--[23]|(?:md|lg)-[a-z0-9-]+|order-[a-z0-9-]+|(?:gap|pad)-(?:1|3|5|7|9)|(?:px|py)-(?:4|6|8)|bleed)\b/u;

  for (const file of sourceFiles) {
    assert.doesNotMatch(
      readFileSync(file, "utf8"),
      removed,
      `${path.relative(repositoryRoot, file)} uses a removed Layout v2 selector`,
    );
  }
});
```

Define this helper in the test file:

```ts
function collectSourceFiles(roots: readonly string[]): string[] {
  const extensions = new Set([".css", ".js", ".mjs", ".ts", ".tsx"]);
  const files: string[] = [];

  const visit = (candidate: string) => {
    for (const entry of readdirSync(candidate, { withFileTypes: true })) {
      const entryPath = path.join(candidate, entry.name);
      if (entry.isDirectory()) {
        visit(entryPath);
      } else if (entry.isFile() && extensions.has(path.extname(entry.name))) {
        files.push(entryPath);
      }
    }
  };

  roots.forEach(visit);
  return files;
}
```

Import `readdirSync` alongside `readFileSync`.

- [ ] **Step 2: Run the audit and verify RED**

Run:

```powershell
npm.cmd run test:unit
```

Expected: FAIL and list current uses of `ly-grid--auto`, `ly-panes--2`,
`ly-panes--3`, responsive column utilities, and odd spacing utilities.

- [ ] **Step 3: Replace removed primitive aliases**

Before changing selectors, pin the published Layout v3 package and update the
fixture version contract:

```powershell
npm.cmd install --save-exact layout-style-css@3.0.0
```

Set `EXPECTED_PACKAGE_VERSIONS["layout-style-css"]` to `"3.0.0"` in
`scripts/build-fixtures.mjs`.

Apply these exact mappings in authored markup and generated fixtures:

```text
ly-grid ly-grid--auto -> ly-grid
ly-panes ly-panes--2  -> ly-panes + data-pane-count="2"
ly-panes ly-panes--3  -> ly-panes + data-pane-count="3"
```

Add application-owned pane tuning:

```css
[data-pane-count="2"] {
  --ly-pane-min: min(100%, 12rem);
}

[data-pane-count="3"] {
  --ly-pane-min: min(100%, 9rem);
}
```

Update capability selectors and expected primitive names in
`tests/browser/capabilities.spec.ts`.

- [ ] **Step 4: Replace removed responsive column utilities**

Remove `ly-md-cols-*` and `ly-lg-cols-*` from markup. Use existing component
hooks and add:

```css
.control-deck,
.library-list > li {
  --ly-grid-columns: 1;
}

@container ly-scope (min-width: 44rem) {
  .control-deck {
    --ly-grid-columns: 2;
  }
}

@container ly-scope (min-width: 64rem) {
  .control-deck,
  .library-list > li {
    --ly-grid-columns: 4;
  }
}
```

For other responsive grids, prefer v3's intrinsic `.ly-grid`; add a named
component hook and a `ly-scope` query only when the browser test proves an
exact column topology is part of the product contract.

- [ ] **Step 5: Replace removed spacing utilities**

Use this migration table consistently:

```text
ly-gap-1 -> ly-gap-2
ly-gap-3 -> ly-gap-4
ly-gap-5 -> ly-gap-6
ly-gap-7 -> ly-gap-8
ly-gap-9 -> ly-gap-8
ly-pad-1 -> ly-pad-2
ly-pad-3 -> ly-pad-4
ly-pad-5 -> ly-pad-6
ly-pad-7 -> ly-pad-8
ly-pad-9 -> ly-pad-8
```

Replace removed logical padding utilities with page-owned hooks:

```css
.site-pad-block-6 {
  padding-block: 1.5rem;
}

.site-pad-inline-6 {
  padding-inline: 1.5rem;
}
```

Use these named hooks only at current `ly-py-6`/`ly-px-6` call sites; do not
recreate the complete removed utility family.

- [ ] **Step 6: Remove v2 imports, legacy language, and stale versions**

Verify zero authored occurrences of:

```text
layout-style-css/legacy.css
layout-style-css/integrations/ui-style-kit.css
layout-style-css@2.1.0
Legacy compatibility stack
```

Update the Layout Lab's visible version and migration notes to `3.0.0`.
Preserve all sixteen `data-ly-layout` values and canonical
`data-ly-recipe`/`data-ly-area` hooks.

- [ ] **Step 7: Verify DOM and responsive behavior**

Run:

```powershell
npm.cmd run format
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
npm.cmd run test:fixtures
npm.cmd run build:pages
npm.cmd run test:browser -- --grep "layout|responsive|viewport|keyboard order|short"
```

Expected: all commands exit `0`; source order remains keyboard order, and
mobile portrait, mobile landscape, tablet, desktop, tall, and short
allocations have no horizontal overflow.

- [ ] **Step 8: Commit the v3 migration**

Run:

```powershell
git add package.json package-lock.json app scripts/build-fixtures.mjs tests README.md
git status --short
git commit -m "refactor: migrate showcase to layout v3"
```

Before committing, confirm `next-env.d.ts` is not staged. Confirm the user's
`Discover STE` copy is still present whether it was committed in Task 4 or
remains as a preserved worktree change.

---

### Task 8: Export, Accessibility, And Rendered QA

**Files:**

- Modify: `tests/export.test.mjs`
- Modify: `tests/browser/site.spec.ts`
- Modify: `tests/browser/accessibility.spec.ts`
- Modify: `playwright.config.ts`
- Create: `.qa/layout-v3-icons/final-desktop.png`
- Create: `.qa/layout-v3-icons/final-mobile.png`
- Create: `.qa/layout-v3-icons/fidelity-ledger.md`

**Interfaces:**

- Consumes: the complete implementation and Task 1 baseline images
- Produces: requirement-by-requirement completion evidence and rendered desktop/mobile comparisons

- [ ] **Step 1: Add export asset assertions**

Extend `tests/export.test.mjs` to require:

```js
await stat(
  path.join(
    outRoot,
    "assets",
    "ui-style-kit-icons",
    "1.0.0",
    "ui-style-kit-icons.js",
  ),
);
await stat(
  path.join(
    outRoot,
    "assets",
    "ui-style-kit-icons",
    "1.0.0",
    "packs",
    "cyberpunk",
    "icons",
    "dashboard.svg",
  ),
);
```

Assert exported HTML references the versioned icon base and contains no
`node_modules` or retired Layout v2 export.

- [ ] **Step 2: Prove export assertions fail before a fresh build**

After a fresh build, temporarily move the expected runtime file, run the
export test, and restore it in a `finally` block:

```powershell
$assetPath = Resolve-Path -LiteralPath "out\assets\ui-style-kit-icons\1.0.0\ui-style-kit-icons.js"
$backupPath = "$($assetPath.Path).regression-check"
try {
  Move-Item -LiteralPath $assetPath.Path -Destination $backupPath
  npm.cmd run test:export
  if ($LASTEXITCODE -eq 0) {
    throw "Export test unexpectedly passed without the icon runtime."
  }
} finally {
  if (Test-Path -LiteralPath $backupPath) {
    Move-Item -LiteralPath $backupPath -Destination $assetPath.Path
  }
}
```

Expected: the inner export command fails because the runtime is missing, and
the `finally` block restores the exact file.

- [ ] **Step 3: Build and run the full automated gate**

Make the existing Playwright server port configurable so unrelated local
listeners do not need to be stopped:

```ts
const browserPort = process.env.PLAYWRIGHT_TEST_PORT?.trim() || "4173";
const browserBaseUrl = `http://127.0.0.1:${browserPort}/interface-systems-lab/`;
```

Use `browserBaseUrl` for both `use.baseURL` and `webServer.url`, and interpolate
`browserPort` into the existing preview command.

Run:

```powershell
npm.cmd run format:check
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
npm.cmd run test:fixtures
npm.cmd run build:pages
npm.cmd run test:export
$env:PLAYWRIGHT_TEST_PORT = "4175"
npm.cmd run test:browser
npm.cmd run quality
Remove-Item Env:PLAYWRIGHT_TEST_PORT
npm.cmd audit --audit-level=moderate
git diff --check
```

Expected: every command exits `0`. Record exact test counts and browser
engines from the fresh output; do not reuse earlier results.

- [ ] **Step 4: Run rendered in-app Browser QA**

Open the fresh Pages artifact in the in-app browser and verify:

```text
Desktop: 1440 x 1000
Mobile:   390 x 844
Short:    844 x 390
```

Exercise:

1. Visual Style from Minimal SaaS to Cyberpunk to Retrofuturism to Bauhaus.
2. Palette and mode changes, including contrast mode.
3. Icon frame Authored, Soft, and None.
4. Icons navigation anchor.
5. Copy, share, randomize, and reset.
6. Icon-only, UI-plus-icons, and complete-stack fixtures.
7. All visible external and package links.

Inspect the console and network log. Expected: no uncaught error, no failed
SVG/module request, no hydration warning, and no horizontal overflow.

- [ ] **Step 5: Capture and inspect final screenshots**

Save:

```text
.qa/layout-v3-icons/final-desktop.png
.qa/layout-v3-icons/final-mobile.png
```

Use `view_image` on the matching baseline and final images in the same QA
pass. Compare at least:

1. header and hero hierarchy
2. palette and typography
3. configuration-console density
4. section width and spacing rhythm
5. mobile collapse and horizontal fit
6. Icon Lab artwork, labels, and frame alignment

- [ ] **Step 6: Write the fidelity ledger**

Create `.qa/layout-v3-icons/fidelity-ledger.md` with this completed table:

```md
| Comparison point      | Baseline evidence    | Final evidence       | Result or fix                                                        |
| --------------------- | -------------------- | -------------------- | -------------------------------------------------------------------- |
| Header and hero       | baseline-desktop.png | final-desktop.png    | Record whether hierarchy and copy are preserved and name any repair. |
| Palette and type      | baseline-desktop.png | final-desktop.png    | Record computed or visible parity and name any repair.               |
| Configuration console | baseline-desktop.png | final-desktop.png    | Record density and wrapping parity and name any repair.              |
| Section rhythm        | baseline-desktop.png | final-desktop.png    | Record width and spacing parity and name any repair.                 |
| Mobile fit            | baseline-mobile.png  | final-mobile.png     | Record overflow and collapse results and name any repair.            |
| Icon treatment        | Existing UI system   | final desktop/mobile | Record pack, alignment, and frame results and name any repair.       |
```

Replace each instruction in the final column with observed evidence. Record
the above-the-fold copy diff; the only accepted pre-existing user copy change
is `Discover STE`.

- [ ] **Step 7: Audit completion against the approved spec**

For each numbered completion criterion in
`docs/superpowers/specs/2026-07-30-layout-v3-icons-first-class-design.md`,
identify the file, automated check, or rendered observation proving it.

Expected: all seven criteria have current evidence. Any missing evidence means
the task remains incomplete and must be fixed before handoff.

- [ ] **Step 8: Commit final verification coverage**

Run:

```powershell
git add tests/export.test.mjs tests/browser/site.spec.ts tests/browser/accessibility.spec.ts
git commit -m "test: verify icon export and accessibility"
```

Do not commit `.qa/` artifacts unless the user explicitly asks to retain them.

- [ ] **Step 9: Confirm repository handoff state**

Run:

```powershell
git status --short --branch
git log -8 --oneline --decorate
git diff --check
```

Expected: only the user's intentionally preserved `next-env.d.ts` change and
any explicitly retained user changes remain; report branch, commits, changed
files, test counts, and the rendered QA result.
