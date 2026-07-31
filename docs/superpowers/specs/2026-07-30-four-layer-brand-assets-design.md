# Interface Systems Lab Four-Layer Brand Assets Design

- **Date:** 2026-07-30
- **Status:** Approved visual direction; implementation pending
- **Selected direction:** Option A, nested icon frame
- **Branch:** `refactorAndRefine`

## Purpose

Update the Interface Systems Lab brand assets so they accurately represent the
current four-library ecosystem:

1. `layout-style-css`
2. `ui-style-kit-css`
3. `ui-style-kit-icons`
4. `interactive-surface-css`

The existing logo and social card encode only Layout, Identity, and
Interaction. The revised assets must add Iconography without discarding the
established silhouette, palette, or visual hierarchy.

## Approved Visual Mapping

The mark remains a nested system:

| Visual layer            | Ecosystem owner | Treatment                                                             |
| ----------------------- | --------------- | --------------------------------------------------------------------- |
| Outer open navy frame   | Layout          | Existing dark-blue structural diamond                                 |
| Gold diamond            | Identity        | Existing warm visual-style surface                                    |
| New inner diamond frame | Iconography     | Crisp white-to-cyan outline between the gold surface and cyan control |
| Cyan control node       | Interaction     | Existing three-way active control symbol                              |

The new iconography layer must read as a distinct fourth nested layer at master
size while reducing to a clean high-contrast diagonal detail at favicon sizes.
It must not introduce a new brand color, replace the cyan control, or alter the
recognizable outer silhouette.

## Master Asset Contract

`public/logo-master.png` remains the transparent source of truth:

- Dimensions remain `1254 × 1254`.
- The canvas, transparent padding, outer silhouette, gradients, and shadow
  character remain consistent with the current mark.
- The iconography frame is centered on the current control node and visually
  sits between the gold identity diamond and cyan interaction symbol.
- The frame must not obscure the cyan node or merge into the gold surface.
- Alpha edges must remain clean on both light and dark backgrounds.

`public/logo-chroma-source.png` remains the editing/export companion:

- Dimensions remain `1254 × 1254`.
- It contains the same mark geometry as the transparent master.
- Transparent pixels are flattened against the existing saturated magenta
  chroma background.
- No chroma color may leak into the transparent production derivatives.

## Derived Icon Family

Every public logo derivative must be regenerated from the approved master so no
three-layer icon remains in browser, installed-app, or metadata surfaces.

| Asset                               | Required output                                                              |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| `public/favicon.ico`                | Multi-resolution favicon containing the updated small-size mark              |
| `public/favicon-16x16.png`          | `16 × 16`, transparent                                                       |
| `public/favicon-32x32.png`          | `32 × 32`, transparent                                                       |
| `public/favicon-48x48.png`          | `48 × 48`, transparent                                                       |
| `public/apple-touch-icon.png`       | `180 × 180`, updated mark                                                    |
| `public/android-chrome-192x192.png` | `192 × 192`, transparent                                                     |
| `public/android-chrome-512x512.png` | `512 × 512`, transparent                                                     |
| `public/maskable-icon-512x512.png`  | `512 × 512`, existing navy field and safe-zone composition                   |
| `public/mstile-150x150.png`         | `150 × 150`, updated mark                                                    |
| `public/favicon-preview.png`        | `900 × 360`, refreshed transparent, dark-field, and favicon-scale comparison |

Downsampling must preserve the four-layer distinction. At `16 × 16`, the new
iconography frame may simplify to a one-pixel high-contrast diamond detail, but
it must not disappear or produce muddy antialiasing. The maskable asset must
retain its current safe-zone proportions and navy background.

## Social Card Contract

`public/interface-systems-lab-social-card.png` remains `1200 × 630`.

The card keeps its established:

- slate/navy technical background and grid texture;
- gold and cyan edge geometry;
- left-side logo and right-side title hierarchy;
- white `INTERFACE SYSTEMS` wordmark with cyan `LAB`;
- gold statistics and lower ownership row.

The logo on the card uses the approved four-layer mark. The statistics change
to the exact visible copy:

```text
4 libraries.
1 interface.
5,280 possibilities.
```

The ownership row changes to:

```text
Layout · Identity · Iconography · Interaction
```

All copy must remain crisp, correctly spelled, and legible at common Open Graph
preview sizes. The added ownership label must fit without crowding, clipping,
or reducing the primary title hierarchy.

## Possibility Count

The visible count remains `5,280`.

The current configuration catalog yields:

```text
16 layout personalities × 11 UI presets × 10 themes × 3 modes = 5,280
```

`ui-style-kit-icons` does not add an independent configuration axis because its
artwork pack follows the selected UI preset. Adding the fourth library therefore
changes the ecosystem count, not the possibility count.

## Metadata and Copy

Update `SITE.socialImageAlt` in `app/lib/site.ts` to describe the revised image
accurately:

```text
Interface Systems Lab social card with the text “4 libraries, 1 interface, and
5,280 possibilities” over layout, identity, iconography, and interaction.
```

Keep the existing social-card filename and canonical URL so published metadata
and external caches continue to resolve the same asset path.

No site copy outside direct social-image descriptions should be rewritten as
part of this change unless a test exposes another explicitly stale three-library
brand claim.

## Production Workflow

1. Edit the existing master mark using the approved nested-frame direction.
2. Inspect the transparent master at native size and against light and dark
   fields.
3. Regenerate the chroma source and every derivative from that approved master.
4. Update the social card with the revised mark and exact four-library copy.
5. Update metadata alternative text and its source-level contracts.
6. Compare the complete family together before accepting individual files.

The process must preserve a single geometric source of truth. Derivatives must
not receive independent visual redesigns beyond size-specific simplification,
safe-zone placement, and background treatment already required by their format.

## Validation

### Asset integrity

- Confirm every file exists at its current public path.
- Confirm dimensions and expected alpha/background behavior.
- Confirm the chroma and transparent masters share the same mark geometry.
- Confirm no magenta fringe appears in transparent outputs.
- Confirm the favicon ICO contains the updated small-size mark.

### Visual review

- Inspect the master at native resolution.
- Inspect `512`, `192`, `180`, `150`, `48`, `32`, and `16` pixel outputs.
- Inspect transparent outputs on light and dark fields.
- Inspect the maskable icon against its safe-zone boundary.
- Inspect the social card at `1200 × 630` and a reduced preview size.
- Compare all derivatives in the refreshed `favicon-preview.png`.

### Repository contracts

Update and run the relevant tests in:

- `tests/ecosystem.test.ts`
- `tests/export.test.mjs`
- `tests/browser/site.spec.ts`
- `scripts/verify-export.mjs` when its social metadata assertions require the
  revised alternative text

The final quality run must include formatting, linting, type checking, unit and
fixture tests, Pages export verification, the Turbopack hydration regression,
and the cross-browser matrix.

## Acceptance Criteria

- The mark visibly communicates four nested ownership layers.
- Option A's inner iconography frame is present in the master and every
  derivative.
- The existing brand silhouette and navy/gold/cyan palette remain recognizable.
- Small icons remain crisp and identifiable at `16 × 16`.
- The social card says `4 libraries` and includes `Iconography`.
- The social card retains `5,280 possibilities`.
- Social metadata alternative text matches the visible card.
- No stale three-library social-card assertion remains in authored runtime or
  test sources.
- All affected repository and browser checks pass.
- The user's existing `next-env.d.ts` change remains unstaged and untouched.
- No worktree is created.

## Out of Scope

- Changing library names, versions, or dependency ownership.
- Changing the site's layout, navigation, laboratories, or configuration model.
- Adding a fifth brand color.
- Renaming public asset paths or social metadata URLs.
- Recalculating possibilities as though icon packs were independently
  selectable.
- Publishing, deploying, or pushing the branch.
