# Interactive Surface CSS Adoption Draft

- **Date:** 2026-07-30
- **Status:** Draft for review
- **Branch:** `refactorAndRefine`
- **Scope:** Interface Systems Lab runtime and its generated integration proofs

## Objective

Make the flagship site a faithful demonstration of
`interactive-surface-css` wherever the complete ecosystem is supposed to be
active, while preserving every proof whose purpose is to show a package
without the interaction layer.

The result should make ownership obvious:

- `layout-style-css` owns geometry;
- `ui-style-kit-css` owns visual identity and base paint;
- `ui-style-kit-icons` owns semantic icon artwork;
- `interactive-surface-css` owns hover, focus-visible, active, persistent,
  busy, and disabled mechanics.

Local site CSS may size and position controls. It must not compete with the
interaction library for state paint, elevation, or motion.

## Recommended Architecture

Keep native semantic elements in component source. Do not replace links,
buttons, or summaries with one polymorphic component that obscures their
attributes and behavior.

Add a small typed prop builder instead:

```ts
type SurfaceVariant =
  "primary" | "secondary" | "accent" | "subtle" | "warning" | "danger";

type SurfaceLevel = 1 | 2 | 3;

type SurfaceContractOptions = {
  className?: string;
  level: SurfaceLevel;
  variant: SurfaceVariant;
};

export function surfaceContract({
  className,
  level,
  variant,
}: SurfaceContractOptions) {
  return {
    className: ["interactive-surface", "site-action", className]
      .filter(Boolean)
      .join(" "),
    "data-surface-level": String(level),
    "data-surface-variant": variant,
  };
}
```

This keeps `<a>`, `<button>`, and `<summary>` visible in JSX while making the
library contract typed and consistent. Existing components may adopt it
incrementally; migration must not become a prerequisite for every valid
surface in one change.

Intentional non-interaction proofs should declare an explicit policy on the
smallest stable ancestor:

```tsx
<section data-interaction-policy="ui-only">
  {/* These controls intentionally demonstrate ui-style-kit-css alone. */}
</section>
```

Approved policy values:

| Policy              | Meaning                                                         |
| ------------------- | --------------------------------------------------------------- |
| `layout-only`       | Geometry proof intentionally excludes UI and interaction paint  |
| `ui-only`           | UI Style Kit proof intentionally excludes interaction mechanics |
| `native-only`       | Browser/native behavior and UI-native paint remain observable   |
| `icon-only`         | Icon runtime proof has no interaction dependency                |
| `fixture-isolation` | Generated iframe owns its package import contract               |

An exemption is documentation and executable policy, not a generic escape
hatch. Every exempt region must correspond to an approved showcase purpose.

## Ownership Matrix

| Surface category                              | Interaction policy | Required treatment                                       |
| --------------------------------------------- | ------------------ | -------------------------------------------------------- |
| Header, hero, footer, skip link               | Complete stack     | Use `interactive-surface`                                |
| Company, install, and library calls to action | Complete stack     | Use `interactive-surface`                                |
| Workbench navigation and operational actions  | Complete stack     | Use `interactive-surface`, except named UI-only specimen |
| Icon Lab controls outside icon specimens      | Complete stack     | Use `interactive-surface`                                |
| Interaction Lab controls                      | Interaction proof  | Use the documented class, variant, level, and state API  |
| Layout-only specimen controls                 | `layout-only`      | Preserve the intentional omission                        |
| UI component specimens                        | `ui-only`          | Preserve UI classes without interaction augmentation     |
| Native control atlas                          | `native-only`      | Preserve browser semantics and UI-native paint           |
| Isolated integration iframes                  | Catalog-owned      | Match each fixture's exact dependency declaration        |
| Surrounding integration-lab navigation        | Complete stack     | Use `interactive-surface`                                |

## Current-State Audit

### Already aligned

The following areas already apply the interaction contract consistently:

- responsive header menu, section links, and external header actions;
- Interface Observatory selectors and resource actions;
- Lab configuration controls;
- Feature Showcase actions;
- most Combined Workbench navigation and operational controls;
- Native Dialog demonstration actions;
- Install Guide copy controls;
- Library Directory resource and adoption links;
- company conversion actions;
- Interaction Lab variants, levels, collision states, and reset action.

### High-value complete-stack gaps

These are the first migration candidates because they are site or control-plane
surfaces rather than intentional package-isolation specimens:

1. `HeroActions`
   - `Launch the workbench`
   - `Visit Sanderson Technology Enterprises`
2. `SiteFooter`
   - company link;
   - GitHub repository link;
   - four npm package links.
3. `IconLab`
   - `Restore authored frame`.
4. Global skip link
   - retain the local focus-reveal translation;
   - delegate focus paint and motion feedback to the interaction library.
5. Complete-stack disclosure controls
   - integration adoption groups;
   - install adoption groups;
   - Interaction Lab API disclosure.

### Protected intentional omissions

The following omissions are part of the showcase contract and must not be
“fixed” by a blanket class insertion:

- `Approve project direction` uses only the selected UI prefix. Existing tests
  explicitly protect that UI-only comparison.
- `Run visual system review` and the UI component atlas use only
  `ui-style-kit-css`. Existing tests explicitly protect the absence of
  `interactive-surface`.
- the native input atlas and native state controls must preserve native/UI
  behavior without interaction-layer state replacement;
- Layout Lab specimen disclosures may remain `layout-only` where their purpose
  is to expose unpainted geometry;
- `layout-only`, `ui-only`, and `icon-only` generated fixtures must not import
  or apply the interaction package;
- pair fixtures without `interactive-surface-css` must remain without it;
- the `interactive-only` fixture uses its standalone preset rather than UI
  Style Kit integration paint.

The catalog remains the source of truth for generated fixture ownership. The
flagship page must not reach into an iframe to normalize its controls.

## Local CSS Rules

### Allowed

- display, grid, flex, positioning, gaps, and responsive composition;
- minimum target size and static padding;
- wrapping, overflow, and viewport constraints;
- special accessibility geometry such as revealing the skip link;
- static container background, border, and elevation where the element is not
  itself an interactive surface.

### Disallowed on library-owned surfaces

- local `:hover`, `:focus-visible`, or `:active` paint;
- local state transforms, elevation, or state-layer opacity;
- local rules for `.is-active`, `.is-loading`, `.is-disabled`,
  `[aria-pressed]`, `[aria-selected]`, or `[aria-current]` that duplicate the
  package;
- UI-specific hover classes used to repair interaction behavior;
- `!important` rules that override interaction package state.

The existing `.skip-link:focus` translation is a permitted accessibility
geometry exception. If migrated, its rule should contain only the reveal
property and no focus paint.

## Phased Implementation

### Phase 1: Add executable ownership policy

1. Add the typed `surfaceContract` helper and unit coverage for variant, level,
   and class composition.
2. Add `data-interaction-policy` only to approved exemption regions.
3. Add a rendered audit that inventories interactive elements outside isolated
   iframes.
4. Make the audit fail when an eligible control has neither the interaction
   contract nor an approved exemption ancestor.

This phase should initially fail against the known complete-stack gaps.

### Phase 2: Complete site chrome

Migrate:

- hero actions;
- footer organization, repository, and package links;
- the skip link.

Preserve each element's native semantics, destination, new-tab announcement,
and active UI-prefix class. Add interaction classes and data attributes rather
than replacing UI classes.

### Phase 3: Complete control-plane interactions

Migrate:

- Icon Lab frame reset;
- integration and install disclosure summaries;
- Interaction Lab API disclosure;
- any additional lab navigation that controls the showcase rather than serving
  as a package specimen.

For `<summary>`, confirm the library does not interfere with the native marker,
open state, keyboard toggle, or details semantics.

### Phase 4: Lock intentional exclusions

Add explicit policy markers and assertions for:

- the UI-only approval pill;
- the UI component atlas;
- native control specimens;
- layout-only specimen disclosures selected during implementation review;
- every generated fixture based on its catalog package list.

Tests must fail if an interaction class leaks into a protected proof or if an
unapproved exemption value appears.

### Phase 5: Remove competing local state rules

Parse authored site CSS and inspect rules that combine an eligible surface with
state selectors. Fail when those rules modify:

- background or color;
- border or outline;
- box shadow or filter;
- transform or opacity;
- transition or animation;
- interaction package custom properties.

Permit a narrowly documented property allowlist for accessibility geometry,
such as the skip-link reveal translation.

## Automated Verification

### Semantic inventory

In Playwright, inventory:

```text
a[href], button, summary, input, select, textarea, [tabindex]
```

For each rendered element outside generated iframes:

- determine whether it is an eligible complete-stack surface;
- require `interactive-surface`, `data-surface-variant`, and
  `data-surface-level`; or
- require the closest approved `data-interaction-policy` ancestor.

Native inputs should be evaluated through their declared policy region rather
than forced into a button-oriented class contract.

### Behavior proof

For representative migrated surfaces, compare computed state under:

- base;
- real pointer hover when hover is available;
- keyboard focus-visible;
- real active press;
- persistent ARIA/class state where applicable;
- busy and disabled precedence.

The test should prove interaction-package variables or state layers change. It
should not hard-code one visual preset's RGB values.

### Exemption proof

For every intentional proof:

- assert its catalog or policy value;
- assert the interaction stylesheet/import is absent when required;
- assert the representative control lacks `interactive-surface`;
- assert the proof remains usable by pointer and keyboard.

### Responsive and accessibility proof

Run the adoption audit at:

- `320 × 568`;
- `390 × 844`;
- `844 × 390`;
- `1024 × 768`;
- `1440 × 1000`.

Verify 44px targets where appropriate, no horizontal overflow, no clipped
focus indication, reduced-motion behavior, forced-colors behavior, and zero axe
violations.

## Acceptance Criteria

- Every complete-stack interaction has one explicit interaction-library
  contract.
- Every omission has a named, approved showcase policy.
- No blanket exemption wraps an entire page or hides unreviewed controls.
- UI-only, native-only, layout-only, icon-only, and fixture-isolated proofs
  remain faithful to their purpose.
- Local CSS does not override library-owned interaction state.
- Links, buttons, summaries, dialog controls, and keyboard order retain native
  semantics.
- All variants and levels are typed and valid.
- The complete rendered audit passes across the responsive matrix, reduced
  motion, forced colors, and the cross-browser gate.

## Out of Scope

- Redesigning UI Style Kit component paint.
- Adding interaction mechanics inside a fixture that does not declare the
  package.
- Replacing native controls with custom widgets.
- Removing useful package-isolation comparisons.
- Refactoring every semantic element into a generic React component.
- Publishing, deploying, or changing package versions.
