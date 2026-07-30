# Interface Systems Lab Four-Layer Brand Assets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the complete Interface Systems Lab logo family and social card so every public brand surface represents Layout, Identity, Iconography, and Interaction.

**Architecture:** Preserve `public/logo-master.png` as the single transparent logo source, add the approved nested iconography frame through an image-editing pass, and derive every browser/app icon through one deterministic Sharp-based builder. Keep the social card reproducible by separating an image-edited background plate from exact programmatic logo and typography composition, then lock the result with source, export, browser, dimension, format, and legacy-hash tests.

**Tech Stack:** AI image editing, Node.js ESM, Sharp 0.34.5, React/Next.js metadata, Node test runner, Playwright, Prettier, ESLint, TypeScript

## Global Constraints

- Work only in the current repository and current `refactorAndRefine` branch.
- Do not create or use a git worktree.
- Preserve the user's unstaged `next-env.d.ts` byte-for-byte and never stage it.
- Do not push, publish, deploy, merge, or rewrite branch history.
- The approved visual direction is Option A: nested icon frame.
- Preserve the existing outer silhouette and navy, gold, cyan, and white palette.
- Map the visible mark from outside to inside as Layout, Identity, Iconography, and Interaction.
- Keep `public/logo-master.png` at `1254 × 1254` with transparency.
- Keep `public/logo-chroma-source.png` at `1254 × 1254` over the existing saturated magenta field.
- Keep `public/interface-systems-lab-social-card.png` at `1200 × 630`.
- The social card must say `4 libraries.`, `1 interface.`, and `5,280 possibilities.`
- The social ownership row must say `Layout · Identity · Iconography · Interaction`.
- Keep the existing social-card filename, canonical URL, and all icon filenames.
- Do not add a fifth brand color.
- The `5,280` count remains unchanged because icon artwork follows the selected UI preset.
- Use real image assets; do not replace the mark with emoji, text symbols, placeholder boxes, or unrelated SVG artwork.
- Use professional comments only where the implementation needs non-obvious ownership, format, or safety context.
- Format every authored text/code file and leave `git diff --check` clean.

## File and Responsibility Map

### Create

- `assets/brand/interface-systems-lab-social-card-background.png`
  - Clean `1200 × 630` source plate retaining the current technical background,
    edge geometry, grid, and texture while containing no logo or text.
- `scripts/build-brand-assets.mjs`
  - Validates the approved master, regenerates every deterministic derivative,
    writes the multi-resolution ICO, builds the preview sheet, and composes the
    final social card from exact text plus the clean source plate.
- `tests/brand-assets.test.mjs`
  - Verifies dimensions, PNG/ICO format contracts, source plate integrity,
    changed legacy hashes, exact social copy source, and package-script wiring.

### Modify

- `public/logo-master.png`
- `public/logo-chroma-source.png`
- `public/favicon.ico`
- `public/favicon-preview.png`
- `public/favicon-16x16.png`
- `public/favicon-32x32.png`
- `public/favicon-48x48.png`
- `public/apple-touch-icon.png`
- `public/android-chrome-192x192.png`
- `public/android-chrome-512x512.png`
- `public/maskable-icon-512x512.png`
- `public/mstile-150x150.png`
- `public/interface-systems-lab-social-card.png`
- `app/lib/site.ts`
- `package.json`
- `package-lock.json`
- `tests/fixtures.test.mjs`
- `tests/ecosystem.test.ts`
- `tests/export.test.mjs`
- `tests/browser/site.spec.ts`
- `scripts/verify-export.mjs`

### Preserve

- `next-env.d.ts`
  - User-owned unstaged change; snapshot before every Next command and restore
    it byte-for-byte afterward.
- `public/favicon.svg`
  - Must remain absent; the project intentionally uses PNG/ICO favicon assets.

---

### Task 1: Rebuild the complete four-layer logo family

**Files:**

- Create: `scripts/build-brand-assets.mjs`
- Create: `tests/brand-assets.test.mjs`
- Modify: `package.json:20-31`
- Modify: `package-lock.json`
- Modify: `tests/fixtures.test.mjs:174-206`
- Modify: `public/logo-master.png`
- Modify: `public/logo-chroma-source.png`
- Modify: `public/favicon.ico`
- Modify: `public/favicon-preview.png`
- Modify: `public/favicon-16x16.png`
- Modify: `public/favicon-32x32.png`
- Modify: `public/favicon-48x48.png`
- Modify: `public/apple-touch-icon.png`
- Modify: `public/android-chrome-192x192.png`
- Modify: `public/android-chrome-512x512.png`
- Modify: `public/maskable-icon-512x512.png`
- Modify: `public/mstile-150x150.png`

**Interfaces:**

- Consumes: the approved three-layer `public/logo-master.png` as the image-edit
  reference and the Option A design in
  `docs/superpowers/specs/2026-07-30-four-layer-brand-assets-design.md`.
- Produces:
  - `buildLogoFamily({ sourceMaster, publicRoot }): Promise<void>`
  - `buildPngIco(entries): Buffer`
  - `npm run assets:brand`
  - `npm run test:brand`
  - the approved transparent master plus every deterministic logo derivative.
- Later tasks rely on `public/logo-master.png` and
  `scripts/build-brand-assets.mjs` when composing the social card.

- [ ] **Step 1: Snapshot the user-owned generated file and current brand hashes**

Run:

```powershell
$qaRoot = Join-Path (Resolve-Path ".qa").Path "four-layer-brand"
New-Item -ItemType Directory -Path $qaRoot -Force | Out-Null
Copy-Item -LiteralPath "next-env.d.ts" -Destination (Join-Path $qaRoot "next-env.before")
Get-FileHash public/logo-master.png, public/logo-chroma-source.png, public/favicon.ico, public/favicon-preview.png, public/favicon-16x16.png, public/favicon-32x32.png, public/favicon-48x48.png, public/apple-touch-icon.png, public/android-chrome-192x192.png, public/android-chrome-512x512.png, public/maskable-icon-512x512.png, public/mstile-150x150.png -Algorithm SHA256
```

Expected: twelve legacy hashes matching the constants in Step 2. The snapshot
must remain outside git because `.qa/` is ignored.

- [ ] **Step 2: Write the failing logo-family contract**

Create `tests/brand-assets.test.mjs` with this complete initial contract:

```js
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test from "node:test";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const legacyHashes = new Map([
  [
    "public/logo-master.png",
    "8ff9b62f7ca1724b452047e5c37c084deee79b24f0558928599684a9910d23aa",
  ],
  [
    "public/logo-chroma-source.png",
    "801462899c236bf2caeea2667c303542f429302eb4f9fe4526256d63e8cfdd4a",
  ],
  [
    "public/favicon.ico",
    "7bbccbc4bacc988dfb79dccc3e68c4f42b57a8122c957f59448be8359819ef5f",
  ],
  [
    "public/favicon-preview.png",
    "262489ac78d5fa51c88c78802101c80f858ec731dd4fe96f5260a6b6c8ed541e",
  ],
  [
    "public/favicon-16x16.png",
    "9346aac1d3dfd0e02a7adf9fa6e53573df0d4db76875c7b079805046a9c079d1",
  ],
  [
    "public/favicon-32x32.png",
    "425aaeb35336e19ff024e051544dd5301f810963f565cd0de7f2ba61385bf32c",
  ],
  [
    "public/favicon-48x48.png",
    "3e55d206d069f0ef1407203a30d131e7be79a7411b6f6ab41562f8f974115e14",
  ],
  [
    "public/apple-touch-icon.png",
    "93f1ccf3f9aa097d39fd7629f820cbe357e0780a27f18065c4a5624eb82da34d",
  ],
  [
    "public/android-chrome-192x192.png",
    "f30dbdd0ebb9bfc4222afc162f4119c37782eb288b4c17693eeec971a8ca6fa9",
  ],
  [
    "public/android-chrome-512x512.png",
    "50bb274c702d8ff26cc4179e156e8d96feca60617616817a263bbabe59a4d9fd",
  ],
  [
    "public/maskable-icon-512x512.png",
    "3d665313419b1ac4786dd04e740ff0d3057cf0fdee9e0f6c3d5817391038dfe2",
  ],
  [
    "public/mstile-150x150.png",
    "03e7f7a9cf8355e3b092d1d7d0e36e55cf1f042f89bb3b45b2921d0936a3c1f4",
  ],
]);

const pngDimensions = new Map([
  ["public/logo-master.png", [1254, 1254]],
  ["public/logo-chroma-source.png", [1254, 1254]],
  ["public/favicon-preview.png", [900, 360]],
  ["public/favicon-16x16.png", [16, 16]],
  ["public/favicon-32x32.png", [32, 32]],
  ["public/favicon-48x48.png", [48, 48]],
  ["public/apple-touch-icon.png", [180, 180]],
  ["public/android-chrome-192x192.png", [192, 192]],
  ["public/android-chrome-512x512.png", [512, 512]],
  ["public/maskable-icon-512x512.png", [512, 512]],
  ["public/mstile-150x150.png", [150, 150]],
]);

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function readPngHeader(buffer) {
  assert.equal(
    buffer.subarray(0, 8).toString("hex"),
    "89504e470d0a1a0a",
    "asset must use a PNG signature",
  );
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    colorType: buffer[25],
  };
}

test("the four-layer logo family replaces every legacy binary", async () => {
  for (const [relativePath, legacyHash] of legacyHashes) {
    const buffer = await readFile(path.join(repositoryRoot, relativePath));
    assert.notEqual(
      sha256(buffer),
      legacyHash,
      `${relativePath} still contains the three-layer mark`,
    );
  }
});

test("brand PNG outputs retain their public dimensions and color contracts", async () => {
  for (const [relativePath, [width, height]] of pngDimensions) {
    const buffer = await readFile(path.join(repositoryRoot, relativePath));
    const metadata = readPngHeader(buffer);
    assert.deepEqual(
      [metadata.width, metadata.height],
      [width, height],
      relativePath,
    );
  }

  const master = readPngHeader(
    await readFile(path.join(repositoryRoot, "public/logo-master.png")),
  );
  const chroma = readPngHeader(
    await readFile(path.join(repositoryRoot, "public/logo-chroma-source.png")),
  );
  assert.equal(master.colorType, 6, "master must remain RGBA");
  assert.equal(chroma.colorType, 2, "chroma source must remain RGB");
});

test("favicon.ico contains 16, 32, and 48 pixel 32-bit entries", async () => {
  const buffer = await readFile(
    path.join(repositoryRoot, "public/favicon.ico"),
  );
  assert.equal(buffer.readUInt16LE(0), 0);
  assert.equal(buffer.readUInt16LE(2), 1);
  assert.equal(buffer.readUInt16LE(4), 3);

  const entries = Array.from({ length: 3 }, (_, index) => {
    const offset = 6 + index * 16;
    return {
      width: buffer[offset] || 256,
      height: buffer[offset + 1] || 256,
      planes: buffer.readUInt16LE(offset + 4),
      bits: buffer.readUInt16LE(offset + 6),
    };
  });
  assert.deepEqual(entries, [
    { width: 16, height: 16, planes: 1, bits: 32 },
    { width: 32, height: 32, planes: 1, bits: 32 },
    { width: 48, height: 48, planes: 1, bits: 32 },
  ]);
});
```

- [ ] **Step 3: Wire the brand test and builder into package contracts**

Update `package.json` scripts to contain:

```json
{
  "assets:brand": "node scripts/build-brand-assets.mjs",
  "test:brand": "node --test tests/brand-assets.test.mjs",
  "quality": "npm run format:check && npm run lint && npm run typecheck && npm run test:unit && npm run test:fixtures && npm run test:brand && npm run test:dev-hydration && npm run build:pages && npm run test:export && npm run test:browser"
}
```

Add Sharp as an explicit exact dev dependency:

```powershell
npm.cmd install --save-dev --save-exact sharp@0.34.5
```

Update the package-script assertions in `tests/fixtures.test.mjs`:

```js
assert.equal(
  packageManifest.scripts["assets:brand"],
  "node scripts/build-brand-assets.mjs",
);
assert.equal(
  packageManifest.scripts["test:brand"],
  "node --test tests/brand-assets.test.mjs",
);
assert.match(
  packageManifest.scripts.quality,
  /npm run test:fixtures && npm run test:brand && npm run test:dev-hydration/,
);
```

Do not add `assets:brand` to `predev`, `prebuild`, or `prebuild:pages`.
Regenerating tracked binary brand assets during ordinary builds would create
platform-sensitive worktree churn; the quality gate validates them instead.

- [ ] **Step 4: Run the focused tests to verify the intended RED state**

Run:

```powershell
npm.cmd run test:brand
npm.cmd run test:fixtures
```

Expected:

- `test:brand` fails because all twelve binaries still match the legacy hashes.
- `test:fixtures` passes because the new script ordering is fully wired.

- [ ] **Step 5: Produce the approved four-layer master through image editing**

Use the Creative Production asset workflow and the image-generation editing
tool with `public/logo-master.png` as the reference. Use this exact prompt:

```text
Edit the supplied Interface Systems Lab logo without changing its canvas,
transparent background, outer navy open-diamond silhouette, gold identity
diamond, cyan three-way interaction control, gradients, padding, or shadow
character. Add one distinct fourth nested ownership layer for Iconography:
a crisp centered diamond-outline frame positioned visually between the gold
diamond and the cyan control. The new frame uses only white through icy cyan,
has clean rounded corners, remains visible at favicon scale, and does not cover
or replace the cyan control. No text, no badge, no extra symbols, no purple,
no new colors, no background, and no additional geometry outside the existing
mark. Preserve production-quality antialiasing and transparent edges.
```

Save the generated candidate to:

```text
.qa/four-layer-brand/logo-master-candidate.png
```

Inspect it with the local image viewer at original resolution. Reject and rerun
the edit if any of these occur:

- the outer navy silhouette changes;
- the gold diamond changes shape;
- the cyan control is replaced or obscured;
- the background becomes opaque;
- the new diamond is not visibly between identity and interaction;
- a new brand color appears;
- edges or gradients become visibly noisy.

- [ ] **Step 6: Implement deterministic derivative generation**

Create `scripts/build-brand-assets.mjs` with these public boundaries and
generation constants:

```js
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const publicRoot = path.join(repositoryRoot, "public");

const transparentOutputs = new Map([
  ["favicon-16x16.png", 16],
  ["favicon-32x32.png", 32],
  ["favicon-48x48.png", 48],
  ["apple-touch-icon.png", 180],
  ["android-chrome-192x192.png", 192],
  ["android-chrome-512x512.png", 512],
  ["mstile-150x150.png", 150],
]);

function readOption(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function buildPngIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  const directory = Buffer.alloc(entries.length * 16);
  let dataOffset = header.length + directory.length;
  for (const [index, entry] of entries.entries()) {
    const offset = index * 16;
    directory[offset] = entry.size === 256 ? 0 : entry.size;
    directory[offset + 1] = entry.size === 256 ? 0 : entry.size;
    directory[offset + 2] = 0;
    directory[offset + 3] = 0;
    directory.writeUInt16LE(1, offset + 4);
    directory.writeUInt16LE(32, offset + 6);
    directory.writeUInt32LE(entry.png.length, offset + 8);
    directory.writeUInt32LE(dataOffset, offset + 12);
    dataOffset += entry.png.length;
  }

  return Buffer.concat([header, directory, ...entries.map(({ png }) => png)]);
}

async function renderTransparent(masterBuffer, size) {
  return sharp(masterBuffer)
    .resize(size, size, {
      fit: "contain",
      kernel: sharp.kernel.lanczos3,
    })
    .ensureAlpha()
    .png()
    .toBuffer();
}

export async function buildLogoFamily({
  sourceMaster,
  outputRoot = publicRoot,
}) {
  const input = await readFile(sourceMaster);
  const metadata = await sharp(input).metadata();
  if (
    metadata.width !== metadata.height ||
    !metadata.width ||
    metadata.width < 1024
  ) {
    throw new Error("Brand master must be a square image at least 1024px.");
  }

  const stats = await sharp(input).ensureAlpha().stats();
  const alpha = stats.channels[3];
  if (!alpha || alpha.min !== 0 || alpha.max !== 255) {
    throw new Error(
      "Brand master must contain both transparent and opaque pixels.",
    );
  }

  const masterBuffer = await sharp(input)
    .resize(1254, 1254, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: sharp.kernel.lanczos3,
    })
    .ensureAlpha()
    .png()
    .toBuffer();
  await writeFile(path.join(outputRoot, "logo-master.png"), masterBuffer);

  const rendered = new Map();
  for (const [fileName, size] of transparentOutputs) {
    const buffer = await renderTransparent(masterBuffer, size);
    rendered.set(size, buffer);
    await writeFile(path.join(outputRoot, fileName), buffer);
  }

  const chroma = await sharp({
    create: {
      width: 1254,
      height: 1254,
      channels: 3,
      background: "#ff00ff",
    },
  })
    .composite([{ input: masterBuffer }])
    .removeAlpha()
    .png()
    .toBuffer();
  await writeFile(path.join(outputRoot, "logo-chroma-source.png"), chroma);

  const maskableMark = await renderTransparent(masterBuffer, 380);
  const maskable = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: "#081b33",
    },
  })
    .composite([{ input: maskableMark, left: 66, top: 66 }])
    .png()
    .toBuffer();
  await writeFile(path.join(outputRoot, "maskable-icon-512x512.png"), maskable);

  const previewMark = await renderTransparent(masterBuffer, 260);
  const previewTileMark = await renderTransparent(masterBuffer, 140);
  const pixelPreview = await sharp(rendered.get(48))
    .resize(176, 176, { kernel: sharp.kernel.nearest })
    .png()
    .toBuffer();
  const darkTile = await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: "#081b33",
    },
  })
    .composite([{ input: previewTileMark, left: 20, top: 20 }])
    .png()
    .toBuffer();
  const preview = await sharp({
    create: {
      width: 900,
      height: 360,
      channels: 4,
      background: "#f4f7fb",
    },
  })
    .composite([
      { input: previewMark, left: 35, top: 50 },
      { input: darkTile, left: 355, top: 90 },
      { input: pixelPreview, left: 650, top: 92 },
    ])
    .png()
    .toBuffer();
  await writeFile(path.join(outputRoot, "favicon-preview.png"), preview);

  const icoEntries = [16, 32, 48].map((size) => ({
    size,
    png: rendered.get(size),
  }));
  await writeFile(
    path.join(outputRoot, "favicon.ico"),
    buildPngIco(icoEntries),
  );

  return { masterBuffer };
}

const requestedMaster = readOption("--master");
await buildLogoFamily({
  sourceMaster: requestedMaster
    ? path.resolve(requestedMaster)
    : path.join(publicRoot, "logo-master.png"),
});
```

Keep the script focused on logo-family generation in this task. Task 2 will
extend it with the social-card interface.

- [ ] **Step 7: Generate the public logo family**

Run:

```powershell
npm.cmd run assets:brand -- --master .qa/four-layer-brand/logo-master-candidate.png
```

Expected:

- the transparent master becomes exactly `1254 × 1254`;
- the chroma source is RGB over `#ff00ff`;
- the ICO contains PNG-backed 16, 32, and 48 pixel entries;
- the maskable icon retains the navy field and safe-zone scale;
- the preview sheet shows the updated mark in all three contexts.

- [ ] **Step 8: Run the focused GREEN checks**

Run:

```powershell
npm.cmd exec prettier -- --write package.json package-lock.json scripts/build-brand-assets.mjs tests/brand-assets.test.mjs tests/fixtures.test.mjs
npm.cmd run test:brand
npm.cmd run test:fixtures
npm.cmd run lint
node --check scripts/build-brand-assets.mjs
git diff --check
```

Expected: every command exits `0`; the legacy-hash test proves all twelve logo
family binaries changed.

- [ ] **Step 9: Perform small-size visual acceptance**

Inspect these files with the local image viewer:

```text
public/logo-master.png
public/favicon-preview.png
public/favicon-16x16.png
public/favicon-32x32.png
public/favicon-48x48.png
public/apple-touch-icon.png
public/android-chrome-192x192.png
public/android-chrome-512x512.png
public/maskable-icon-512x512.png
public/mstile-150x150.png
```

Accept only when:

- the white/cyan diamond is visible without overpowering the cyan node;
- no magenta fringe appears;
- `16 × 16` remains recognizable;
- the maskable mark stays inside the central safe zone;
- all outputs share the same geometry.

- [ ] **Step 10: Commit Task 1**

Stage only the Task 1 files and explicitly exclude `next-env.d.ts`:

```powershell
git add -- package.json package-lock.json scripts/build-brand-assets.mjs tests/brand-assets.test.mjs tests/fixtures.test.mjs public/logo-master.png public/logo-chroma-source.png public/favicon.ico public/favicon-preview.png public/favicon-16x16.png public/favicon-32x32.png public/favicon-48x48.png public/apple-touch-icon.png public/android-chrome-192x192.png public/android-chrome-512x512.png public/maskable-icon-512x512.png public/mstile-150x150.png
git diff --cached --check
git commit -m "feat: rebuild the four-layer logo family"
```

Expected: one focused commit; `git status --short` still shows only the user's
unstaged `next-env.d.ts` outside ignored QA files.

---

### Task 2: Rebuild the social card and metadata for four libraries

**Files:**

- Create: `assets/brand/interface-systems-lab-social-card-background.png`
- Modify: `scripts/build-brand-assets.mjs`
- Modify: `tests/brand-assets.test.mjs`
- Modify: `public/interface-systems-lab-social-card.png`
- Modify: `app/lib/site.ts:15-18`
- Modify: `tests/ecosystem.test.ts:804-829`
- Modify: `tests/export.test.mjs:26-29`
- Modify: `tests/browser/site.spec.ts:29-32`
- Modify: `scripts/verify-export.mjs:17-20`

**Interfaces:**

- Consumes:
  - Task 1 `public/logo-master.png`;
  - Task 1 `buildLogoFamily({ sourceMaster, outputRoot })`;
  - the current `public/interface-systems-lab-social-card.png` as the image-edit
    reference.
- Produces:
  - `buildSocialCard({ backgroundPath, logoPath, outputPath }): Promise<void>`
  - `assets/brand/interface-systems-lab-social-card-background.png`
  - a deterministic `1200 × 630` four-library social card
  - exact four-library social alternative text across runtime, export, and
    browser contracts.

- [ ] **Step 1: Extend the failing binary and copy contract**

Add the social card to `legacyHashes` in `tests/brand-assets.test.mjs`:

```js
[
  "public/interface-systems-lab-social-card.png",
  "7c088b8f919d68b55e60248ad61c688a3b2aa6b86e630d6bd430628c2a8b9f59",
],
```

Add its dimensions to `pngDimensions`:

```js
["public/interface-systems-lab-social-card.png", [1200, 630]],
[
  "assets/brand/interface-systems-lab-social-card-background.png",
  [1200, 630],
],
```

Add an exact authored-copy test:

```js
test("authored social metadata describes all four libraries", async () => {
  const paths = [
    "app/lib/site.ts",
    "tests/ecosystem.test.ts",
    "tests/export.test.mjs",
    "tests/browser/site.spec.ts",
    "scripts/verify-export.mjs",
  ];

  for (const relativePath of paths) {
    const source = await readFile(
      path.join(repositoryRoot, relativePath),
      "utf8",
    );
    assert.match(source, /4 libraries, 1 interface, and 5,280 possibilities/);
    assert.match(source, /layout, identity, iconography, and interaction/);
    assert.doesNotMatch(source, /3 libraries/);
  }
});
```

Update the expected `socialImageAlt` constants in:

- `tests/ecosystem.test.ts`
- `tests/export.test.mjs`
- `tests/browser/site.spec.ts`
- `scripts/verify-export.mjs`

Use this exact string everywhere:

```js
"Interface Systems Lab social card with the text \u201c4 libraries, 1 interface, and 5,280 possibilities\u201d over layout, identity, iconography, and interaction.";
```

- [ ] **Step 2: Run the social contract to verify RED**

Run:

```powershell
npm.cmd run test:brand
npm.cmd run test:unit
```

Expected:

- `test:brand` fails because the social card still has the legacy hash and
  `app/lib/site.ts` still says `3 libraries`;
- the ecosystem unit assertion fails against the old runtime alternative text.

- [ ] **Step 3: Produce a clean social-card background source**

Use the Creative Production asset workflow and image-generation editing tool
with `public/interface-systems-lab-social-card.png` as the reference. Use this
exact prompt:

```text
Edit the supplied 1200 by 630 Interface Systems Lab social card into a clean
reusable background plate. Remove only the left-side logo and every title,
statistic, separator label, and other text. Reconstruct the underlying
slate-to-navy technical background, fine grid, subtle grain, cyan linework,
gold corner geometry, and lower-right navy geometry so the removals are
seamless. Preserve the original canvas, palette, lighting, texture density,
edge geometry, and empty left-logo/right-copy composition zones. Add no logo,
no letters, no numbers, no symbols, no watermark, and no new decorative motif.
```

Save the accepted source plate as:

```text
assets/brand/interface-systems-lab-social-card-background.png
```

Normalize it to `1200 × 630` and inspect it at original size. Reject and rerun
if any old letters, numbers, logo fragments, or visibly smeared reconstruction
areas remain.

- [ ] **Step 4: Add deterministic social-card composition**

Extend `scripts/build-brand-assets.mjs` with these constants and functions:

```js
const socialCardBackground = path.join(
  repositoryRoot,
  "assets",
  "brand",
  "interface-systems-lab-social-card-background.png",
);
const socialCardOutput = path.join(
  publicRoot,
  "interface-systems-lab-social-card.png",
);

function socialTypographySvg() {
  return Buffer.from(`
    <svg width="1200" height="630" viewBox="0 0 1200 630"
         xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3"
                        flood-color="#071525" flood-opacity=".45"/>
        </filter>
      </defs>
      <g font-family="Arial, Helvetica, sans-serif" filter="url(#shadow)">
        <text x="555" y="208" fill="#f7f7f4" font-size="84"
              font-weight="800" letter-spacing="3">INTERFACE</text>
        <text x="555" y="296" fill="#f7f7f4" font-size="84"
              font-weight="800" letter-spacing="3">SYSTEMS</text>
        <text x="989" y="296" fill="#08bff2" font-size="84"
              font-weight="800" letter-spacing="3">LAB</text>
      </g>
      <g fill="#ffc63d" font-family="Arial, Helvetica, sans-serif"
         font-size="39" font-weight="600">
        <text x="556" y="357">4 libraries.</text>
        <text x="556" y="402">1 interface.</text>
        <text x="556" y="447">5,280 possibilities.</text>
      </g>
      <line x1="556" y1="478" x2="1110" y2="478"
            stroke="#62d7ff" stroke-opacity=".42"/>
      <g font-family="Arial, Helvetica, sans-serif"
         font-size="23" font-weight="600">
        <text x="556" y="524" fill="#ffc63d">Layout</text>
        <text x="635" y="524" fill="#62d7ff">·</text>
        <text x="659" y="524" fill="#f7f7f4">Identity</text>
        <text x="753" y="524" fill="#62d7ff">·</text>
        <text x="777" y="524" fill="#ffc63d">Iconography</text>
        <text x="928" y="524" fill="#62d7ff">·</text>
        <text x="952" y="524" fill="#f7f7f4">Interaction</text>
      </g>
    </svg>
  `);
}

export async function buildSocialCard({
  backgroundPath = socialCardBackground,
  logoPath = path.join(publicRoot, "logo-master.png"),
  outputPath = socialCardOutput,
} = {}) {
  const background = await sharp(backgroundPath)
    .resize(1200, 630, { fit: "fill" })
    .png()
    .toBuffer();
  const logo = await sharp(logoPath)
    .resize(405, 405, {
      fit: "contain",
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer();

  const output = await sharp(background)
    .composite([
      { input: logo, left: 78, top: 92 },
      { input: socialTypographySvg(), left: 0, top: 0 },
    ])
    .png({ palette: true, colours: 256, dither: 0.85 })
    .toBuffer();
  await writeFile(outputPath, output);
}
```

After the existing logo-family call at the script entry point, add:

```js
await buildSocialCard();
```

The SVG exists only as a deterministic text/layout overlay inside the builder;
it is not a replacement brand mark or a public SVG asset.

- [ ] **Step 5: Update runtime social alternative text**

Replace `SITE.socialImageAlt` in `app/lib/site.ts` with:

```ts
socialImageAlt:
  "Interface Systems Lab social card with the text \u201c4 libraries, 1 interface, and 5,280 possibilities\u201d over layout, identity, iconography, and interaction.",
```

Do not change `SITE.socialImage`, the canonical URL, or any public asset
filename.

- [ ] **Step 6: Generate the social card**

Run:

```powershell
npm.cmd run assets:brand
```

Expected: the logo derivatives reproduce deterministically and
`public/interface-systems-lab-social-card.png` becomes exactly `1200 × 630`
with the four-library copy.

- [ ] **Step 7: Inspect the social card at full and reduced size**

Open these files with the local image viewer:

```text
assets/brand/interface-systems-lab-social-card-background.png
public/interface-systems-lab-social-card.png
```

Also generate a reduced QA copy without modifying public assets:

```powershell
node -e "import('sharp').then(async ({default:sharp})=>sharp('public/interface-systems-lab-social-card.png').resize(600,315).png().toFile('.qa/four-layer-brand/social-card-600x315.png'))"
```

Inspect `.qa/four-layer-brand/social-card-600x315.png`.

Accept only when:

- the title is crisp and correctly spelled;
- `4 libraries.`, `1 interface.`, and `5,280 possibilities.` are exact;
- all four ownership labels are visible without overlap or clipping;
- the approved four-layer logo is visible;
- no removed three-library text or logo fragment remains;
- the reduced preview preserves hierarchy and legibility.

- [ ] **Step 8: Run focused GREEN checks**

Run:

```powershell
npm.cmd exec prettier -- --write scripts/build-brand-assets.mjs tests/brand-assets.test.mjs app/lib/site.ts tests/ecosystem.test.ts tests/export.test.mjs tests/browser/site.spec.ts scripts/verify-export.mjs
npm.cmd run test:brand
npm.cmd run test:unit
npm.cmd run test:fixtures
npm.cmd run lint
npm.cmd run typecheck
git diff --check
```

Expected: all commands exit `0`. The brand test proves the social card changed,
dimensions remain correct, and authored sources contain no stale
`3 libraries` social claim.

- [ ] **Step 9: Verify exported metadata**

Snapshot the user-owned file, build the Pages export, and restore it:

```powershell
$nextEnvSnapshot = ".qa/four-layer-brand/next-env.before-export"
Copy-Item -LiteralPath "next-env.d.ts" -Destination $nextEnvSnapshot
try {
  npm.cmd run build:pages
  npm.cmd run test:export
} finally {
  Copy-Item -LiteralPath $nextEnvSnapshot -Destination "next-env.d.ts" -Force
}
```

Expected:

- Pages build produces six static routes;
- export tests pass;
- Open Graph and Twitter image-alt metadata use the four-library string;
- canonical social image URLs remain unchanged.

- [ ] **Step 10: Commit Task 2**

Stage only Task 2 files:

```powershell
git add -- assets/brand/interface-systems-lab-social-card-background.png scripts/build-brand-assets.mjs tests/brand-assets.test.mjs public/interface-systems-lab-social-card.png app/lib/site.ts tests/ecosystem.test.ts tests/export.test.mjs tests/browser/site.spec.ts scripts/verify-export.mjs
git diff --cached --check
git commit -m "feat: align social branding with four libraries"
```

Expected: one focused commit; `next-env.d.ts` remains unstaged.

---

### Task 3: Complete rendered acceptance and the full quality gate

**Files:**

- Verify: all Task 1 and Task 2 outputs
- Create ignored QA evidence:
  - `.qa/four-layer-brand/logo-master-dark.png`
  - `.qa/four-layer-brand/logo-master-light.png`
  - `.qa/four-layer-brand/social-card-600x315.png`
  - `.qa/four-layer-brand/header-logo.png`
  - `.qa/four-layer-brand/footer-logo.png`
  - `.qa/four-layer-brand/acceptance.md`

**Interfaces:**

- Consumes: the two implementation commits, `npm run quality`, Playwright
  preview port `4175`, and the user-owned `next-env.d.ts` snapshot.
- Produces: final visual, metadata, export, browser, audit, port, and repository
  evidence without an evidence-only commit.

- [ ] **Step 1: Verify the intended branch and clean implementation scope**

Run:

```powershell
git branch --show-current
git log -3 --oneline
git status --short
git diff --check
```

Expected:

- branch is `refactorAndRefine`;
- the two brand implementation commits follow the approved spec commit
  `9bd43eb`;
- `next-env.d.ts` is the only non-ignored working-tree change;
- no worktree was created.

- [ ] **Step 2: Clear only the prior repository preview from QA port 4175**

The plan was written while port `4175` hosted the repository's previously
launched `.preview` server. Resolve the current listener instead of trusting a
stale PID:

```powershell
$listener = Get-NetTCPConnection -LocalPort 4175 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($listener) {
  $process = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)"
  $expectedRoot = (Resolve-Path ".").Path
  if (
    $process.Name -ne "node.exe" -or
    $process.CommandLine -notlike "*$expectedRoot*" -or
    $process.CommandLine -notlike "*serve* .preview -l 4175*"
  ) {
    throw "Port 4175 is not owned by the repository preview; refusing to stop it."
  }
  Stop-Process -Id $listener.OwningProcess
}
```

Never stop the user-owned Python listeners on `4173` or `4174`.

- [ ] **Step 3: Generate light and dark master proofs**

Run:

```powershell
node -e "import('sharp').then(async ({default:sharp})=>{const logo=await sharp('public/logo-master.png').resize(900,900).png().toBuffer();await sharp({create:{width:1000,height:1000,channels:4,background:'#f4f7fb'}}).composite([{input:logo,left:50,top:50}]).png().toFile('.qa/four-layer-brand/logo-master-light.png');await sharp({create:{width:1000,height:1000,channels:4,background:'#081b33'}}).composite([{input:logo,left:50,top:50}]).png().toFile('.qa/four-layer-brand/logo-master-dark.png')})"
```

Inspect both proofs with the local image viewer. Confirm clean alpha edges, no
magenta fringe, visible iconography frame, preserved silhouette, and readable
four-layer hierarchy.

- [ ] **Step 4: Run the complete controller-owned quality gate**

Protect `next-env.d.ts` and `tsconfig.json`, then run:

```powershell
$nextEnvSnapshot = ".qa/four-layer-brand/next-env.before-quality"
$tsconfigSnapshot = ".qa/four-layer-brand/tsconfig.before-quality"
Copy-Item -LiteralPath "next-env.d.ts" -Destination $nextEnvSnapshot
Copy-Item -LiteralPath "tsconfig.json" -Destination $tsconfigSnapshot
$env:PLAYWRIGHT_TEST_PORT = "4175"
try {
  npm.cmd run quality
} finally {
  Remove-Item Env:PLAYWRIGHT_TEST_PORT -ErrorAction SilentlyContinue
  Copy-Item -LiteralPath $nextEnvSnapshot -Destination "next-env.d.ts" -Force
  Copy-Item -LiteralPath $tsconfigSnapshot -Destination "tsconfig.json" -Force
}
```

Expected:

- formatting passes;
- lint passes;
- type checking passes;
- unit tests pass;
- fixture/icon mutation tests pass;
- brand-asset tests pass;
- the real Turbopack hydration regression passes;
- Pages build/export tests pass;
- all 130 browser tests pass;
- ports `4175` and `4176` are free after the run.

- [ ] **Step 5: Capture rendered header and footer logo evidence**

Prepare and serve the Pages preview on owned port `4175`:

```powershell
npm.cmd run preview:prepare
$serveCommand = (Resolve-Path "node_modules/.bin/serve.cmd").Path
$previewProcess = Start-Process -FilePath $serveCommand -ArgumentList @(".preview", "-l", "4175", "--no-clipboard") -WorkingDirectory (Get-Location).Path -WindowStyle Hidden -PassThru
$previewUrl = "http://127.0.0.1:4175/interface-systems-lab/"
$previewReady = $false
for ($attempt = 0; $attempt -lt 40; $attempt++) {
  try {
    $response = Invoke-WebRequest -Uri $previewUrl -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -eq 200) {
      $previewReady = $true
      break
    }
  } catch {
    Start-Sleep -Milliseconds 250
  }
}
if (-not $previewReady) {
  throw "Preview did not become ready at $previewUrl"
}
```

Use the repository Playwright browser with base URL:

```text
http://127.0.0.1:4175/interface-systems-lab/
```

Create ignored `.qa/four-layer-brand/capture-brand.mjs`:

```js
import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 2,
});
const diagnostics = [];
page.on("console", (message) => {
  if (message.type() === "warning" || message.type() === "error") {
    diagnostics.push(`${message.type()}: ${message.text()}`);
  }
});
page.on("pageerror", (error) => {
  diagnostics.push(`pageerror: ${error.message}`);
});

await page.goto("http://127.0.0.1:4175/interface-systems-lab/", {
  waitUntil: "networkidle",
});
await page.locator(".brand-logo").screenshot({
  path: ".qa/four-layer-brand/header-logo.png",
});
await page.locator(".footer-logo").screenshot({
  path: ".qa/four-layer-brand/footer-logo.png",
});

const overlays = await page
  .locator("nextjs-portal, [data-nextjs-dialog-overlay]")
  .count();
await browser.close();

if (diagnostics.length > 0 || overlays > 0) {
  throw new Error(
    `Rendered brand QA failed:\n${diagnostics.join("\n")}\noverlays=${overlays}`,
  );
}
```

Run:

```powershell
node .qa/four-layer-brand/capture-brand.mjs
```

This captures:

- `.brand-logo` at its rendered header size to
  `.qa/four-layer-brand/header-logo.png`;
- `.footer-logo` at its rendered footer size to
  `.qa/four-layer-brand/footer-logo.png`.

Attach console and page-error listeners before navigation. Confirm zero
warnings, zero errors, and no Next overlay. Stop only the listener and launcher
owned by this task:

```powershell
$listener = Get-NetTCPConnection -LocalPort 4175 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($listener) {
  Stop-Process -Id $listener.OwningProcess
}
if (Get-Process -Id $previewProcess.Id -ErrorAction SilentlyContinue) {
  Stop-Process -Id $previewProcess.Id
}
```

- [ ] **Step 6: Inspect the final public family together**

Inspect:

```text
public/favicon-preview.png
.qa/four-layer-brand/header-logo.png
.qa/four-layer-brand/footer-logo.png
public/maskable-icon-512x512.png
public/interface-systems-lab-social-card.png
.qa/four-layer-brand/social-card-600x315.png
```

Record the result in `.qa/four-layer-brand/acceptance.md` with this completed
table:

```markdown
| Surface              | Four layers visible | Geometry preserved | Text exact | Accepted |
| -------------------- | ------------------- | ------------------ | ---------- | -------- |
| Master on light      | Yes                 | Yes                | N/A        | Yes      |
| Master on dark       | Yes                 | Yes                | N/A        | Yes      |
| 16px favicon         | Yes                 | Yes                | N/A        | Yes      |
| Header logo          | Yes                 | Yes                | N/A        | Yes      |
| Footer logo          | Yes                 | Yes                | N/A        | Yes      |
| Maskable icon        | Yes                 | Yes                | N/A        | Yes      |
| Social card 1200x630 | Yes                 | Yes                | Yes        | Yes      |
| Social card 600x315  | Yes                 | Yes                | Yes        | Yes      |
```

Do not commit ignored QA evidence.

- [ ] **Step 7: Run the dependency audit without forcing breaking changes**

Run:

```powershell
npm.cmd audit --audit-level=moderate
```

Expected at plan-writing time: npm may still report the known upstream
`brace-expansion` and Next/Sharp advisories. Do not run `npm audit fix --force`,
downgrade Next, or introduce an unrelated ESLint major upgrade. Report the
current result honestly.

- [ ] **Step 8: Perform final repository and port checks**

Run:

```powershell
git diff --check
git status --short
git log -4 --oneline
Get-NetTCPConnection -LocalPort 4173,4174,4175,4176 -State Listen -ErrorAction SilentlyContinue
```

Expected:

- only `next-env.d.ts` remains unstaged;
- user-owned Python listeners on `4173` and `4174` remain untouched if still
  present;
- task-owned ports `4175` and `4176` have no listeners;
- no push, deployment, merge, or worktree occurred.

- [ ] **Step 9: Finish without an evidence-only commit**

If Step 4 through Step 8 reveal no authored-file changes, do not create another
commit. If a real implementation or test correction was required, rerun the
affected focused checks plus the full quality gate, then commit only that
correction with a precise conventional message.

## Completion Evidence

Before reporting completion, provide:

- the current branch and the two implementation commit SHAs;
- the exact `npm run quality` result and test counts;
- the direct Turbopack hydration result;
- the final asset dimensions and visual acceptance result;
- the unchanged canonical social image path;
- the current npm audit result;
- confirmation that `next-env.d.ts` is the sole unstaged change;
- confirmation that no worktree, push, deployment, or merge occurred.
