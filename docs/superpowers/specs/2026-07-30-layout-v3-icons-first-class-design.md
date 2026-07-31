# Layout v3 And First-Class Icons Design

## Goal

Upgrade Interface Systems Lab to `layout-style-css@3.0.0` and add
`ui-style-kit-icons@1.0.0` as the fourth first-class ecosystem package. The
existing one-page observatory must demonstrate that icon artwork follows the
selected UI preset without adding another global configuration choice.

## Approved Direction

- Preserve the current page identity, section rhythm, configuration model, and
  four global controls: layout, visual style, palette, and mode.
- Add a dedicated Icon Lab between the UI and native-elements laboratory and
  the interaction-state laboratory.
- Use the icon package's `<usk-icon>` runtime through one typed React adapter.
- Stage published icon assets into the static export instead of relying on
  `node_modules`, a mutable CDN, or a bundled `_next` URL.
- Treat Layout Style CSS v3 as a clean-break migration. Do not retain or
  recreate removed v2 aliases or compatibility bundles.
- Preserve existing user edits in the worktree and keep unrelated changes out
  of feature commits.

## Published Ecosystem Contract

The site pins and demonstrates these exact releases:

- `layout-style-css@3.0.0` for structure and responsive composition.
- `ui-style-kit-css@2.1.0` for visual identity and theme paint.
- `ui-style-kit-icons@1.0.0` for icon semantics, artwork, and pack selection.
- `interactive-surface-css@1.5.0` for interaction-state styling.

The flagship import order is:

```ts
import "ui-style-kit-css/visual.css";
import "ui-style-kit-css/interactive-surface-theme.css";
import "interactive-surface-css/state-core.css";
import "layout-style-css";
import "ui-style-kit-icons/css.css";
```

The page root remains the shared runtime contract:

```html
<div
  class="experience ly-root ly-page"
  data-ly-layout="bento"
  data-ui="minimal-saas"
  data-theme="midnight-gold"
  data-mode="dark"
></div>
```

`ui-style-kit-icons` resolves the nearest `data-ui` automatically. The global
configuration state, URL query parameters, local-storage payload, copied
markup, and share URLs therefore remain unchanged.

## Typed React Adapter

Create `app/components/UiIcon.tsx` as a client component. It imports
`ui-style-kit-icons/element`, renders the package's native `<usk-icon>`, and
owns the React-to-custom-element boundary.

The public component contract is:

```ts
import type { IconFrame, IconName } from "ui-style-kit-icons";

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
```

The discriminated accessibility union is intentional:

- An icon beside visible text is passed `decorative`.
- A standalone meaningful icon is passed `label`.
- Callers cannot omit both accessibility decisions.

The adapter uses `React.createElement("usk-icon", ...)` so custom-element
attributes remain explicit without widening the application's global JSX
types. It always supplies:

- `name`
- `frame` when selected
- `size` when selected
- `label` only for meaningful icons
- `className`, including the package's `usk-icon` base class
- `asset-base` set to
  `withBasePath("/assets/ui-style-kit-icons/1.0.0/")`

Putting `asset-base` on each element avoids a global setup race during
hydration and lets the package resolve asset URLs against the actual exported
document.

## Asset Pipeline

Create a focused `scripts/build-icon-assets.mjs` module. It resolves the
installed package through public exports, validates the installed package
version, reads the public registry and contract, and stages the runtime assets
under:

```text
public/assets/ui-style-kit-icons/1.0.0/
```

The staged tree includes:

- `ui-style-kit-icons.js`
- `registry.js`
- the root `icons/` system pack
- all published `packs/` directories

The script must fail before copying when:

- the installed version is not exactly `1.0.0`
- the contract version is not `1.0.0`
- the required semantic icon count is not 64
- a registered pack or icon source is missing
- an output path escapes the versioned public asset directory

Copying every registered pack keeps explicit `data-icon-pack` examples honest
and prevents future fixture or documentation examples from referencing an
unstaged published pack. The script follows the fixture builder's
path-validation and symlink-safety conventions.

An `assets:build` package script runs icon staging and fixture generation.
Development, production, and Pages prebuild hooks call `assets:build` so the
same deterministic assets back every environment.

## Icon Lab Experience

Create `app/components/labs/IconLab.tsx` and place it after `UiNativeLab` and
before `InteractionLab`.

The section includes:

- A clear heading explaining that icon artwork follows Visual Style while
  palette and mode supply paint and contrast.
- The active UI preset and resolved icon pack label.
- A representative semantic set spanning navigation, content, system,
  security, commerce, feedback, and developer-tool meanings.
- A local frame control for `auto`, `soft`, and `none`.
- A meaningful standalone-icon example with a label.
- Decorative icons beside visible action text.
- An explanation that Bauhaus intentionally resolves to the neutral system
  pack and Retrofuturism resolves to Synthwave.

The frame choice belongs only to the Icon Lab. It is not persisted in the
global configuration, query string, storage, or copied markup.

The primary navigation gains an Icons anchor between UI and Interactions.
Existing hand-authored SVGs are replaced only when a published icon has an
honest semantic match. Directional, copy, or external-link cues remain local
until the icon contract contains an equivalent; semantic meaning must not be
weakened merely to increase library usage.

## Ecosystem Catalog And Adoption

Expand `ECOSYSTEM_PACKAGES` so Iconography appears as a fourth responsibility
between Identity and Behavior. Its recommended entry point is
`ui-style-kit-icons/element`.

Update:

- package resource links
- installation commands
- bundler imports
- immutable CDN examples
- structured-data package counts
- README ecosystem tables and examples
- visible “three package” or “all-three” copy

Adoption guidance adds:

- icon-only standalone use
- UI Style Kit plus Icons
- the canonical all-four stack

Do not generate every possible four-package combination. The guide retains the
existing useful standalone and pair paths, adds the meaningful UI-plus-icons
companion boundary, and updates the canonical complete stack.

## Integration Fixtures

Add an icon-only fixture and a UI-plus-icons fixture. Update the canonical
fixture to include the icon package and a rendered semantic specimen.

The generated icon fixture loads the locally staged module with a relative URL
that works under both the local server and the GitHub Pages base path. It sets
`asset-base` to the same versioned local asset tree.

Remove the `all-legacy` fixture and legacy adoption path. Layout Style CSS v3
does not ship `legacy.css` or `integrations/ui-style-kit.css`; continuing to
advertise those paths after upgrading would be false documentation.

## Layout Style CSS v3 Migration

The migration audits authored markup, generated fixtures, tests, and
documentation against the v3 migration guide.

Required changes include:

- Remove imports of `layout-style-css/legacy.css` and
  `layout-style-css/integrations/ui-style-kit.css`.
- Replace `.ly-grid--auto` with the v3 intrinsic `.ly-grid`.
- Replace `.ly-panes--2` and `.ly-panes--3` with `.ly-panes` plus focused
  application-owned sizing hooks where the specimen needs to distinguish
  two-pane and three-pane behavior.
- Remove all `ly-md-*`, `ly-lg-*`, and visual-order utilities. Preserve DOM,
  reading, keyboard, and focus order; use named `ly-scope` container queries
  only where a fixed application topology remains necessary.
- Replace removed odd gap and padding utilities with retained even steps or
  narrowly named site classes that preserve the approved visual rhythm.
- Remove any removed recipe or region class aliases while retaining canonical
  `data-ly-recipe` and `data-ly-area` hooks.
- Keep all sixteen `data-ly-layout` personalities and update displayed package
  versions to `3.0.0`.
- Test narrow, wide, tall, and short-landscape allocations after removing v2
  orientation and responsive workarounds.

No local CSS may recreate a removed compatibility bridge or UI-prefixed
structural alias.

## Loading, Failure, And Accessibility Behavior

The custom element fetches and sanitizes SVG content. Each call site remains
usable while artwork is loading or if a request fails:

- Text-labeled controls retain their visible label.
- Gallery specimens retain a visible semantic name.
- A failed icon exposes the package's `data-error` state without throwing an
  application error or collapsing layout.

The Icon Lab listens for bubbled `usk-icon-error` events and exposes one polite
status message when an asset cannot load. It does not announce successful loads
or flood assistive technology while a pack changes.

Icons inherit `currentColor`, UI theme tokens, and high-contrast behavior from
the package. Reduced-motion behavior remains package-owned. Local CSS owns only
the Icon Lab's layout, spacing, and responsive constraints.

## Test-Driven Implementation And QA

Implementation proceeds in red-green-refactor slices.

Static and unit coverage proves:

- exact dependency and catalog versions
- the four-package ownership order
- the `UiIcon` accessibility prop contract through TypeScript
- safe, complete, versioned icon asset staging
- the expected 64-icon and registered-pack contract
- the absence of removed Layout v3 exports and selectors
- icon-only, UI-plus-icons, and canonical fixture definitions
- removal of the legacy fixture and adoption path

Rendered browser coverage proves:

- every `<usk-icon>` upgrades and loads a shadow-root SVG
- changing Visual Style changes the resolved `data-pack`
- changing palette and mode changes icon paint without changing semantics
- all three frame variants render
- icon failures leave actions usable and report one polite status
- exported Pages URLs return the staged SVG assets without 404s
- keyboard order, focus, landmark navigation, and axe scans remain clean
- there is no horizontal overflow across mobile portrait, mobile landscape,
  tablet, and desktop allocations
- short landscape remains usable under Layout v3 height-aware behavior

Final QA runs:

```text
npm run format:check
npm run lint
npm run typecheck
npm run test:unit
npm run test:fixtures
npm run build:pages
npm run test:export
npm run test:browser
npm run quality
npm audit --audit-level=moderate
git diff --check
```

The rendered site is also inspected in the in-app browser at desktop and
mobile sizes. QA covers the existing configuration flow, the new Icon Lab,
pack switching, frame switching, navigation, static asset requests, console
errors, accessibility, and responsive layout. No deployment or publish action
is part of this implementation.

## Completion Criteria

The goal is complete only when:

1. The app installs and uses all four pinned packages.
2. Layout Style CSS v3 removed surfaces are absent from runtime, fixtures,
   adoption guidance, and tests.
3. `UiIcon` enforces typed icon names, frames, and explicit accessibility.
4. The Icon Lab visibly follows the selected UI style and works in the static
   Pages artifact.
5. The ecosystem directory, install guide, fixtures, metadata, and README
   consistently describe the four-package system.
6. Focused tests, the full quality gate, audit, and rendered browser QA pass.
7. User-owned pre-existing worktree changes are preserved.
