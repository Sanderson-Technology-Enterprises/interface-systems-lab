# Responsive Disclosure Navigation Design

- **Date:** 2026-07-30
- **Status:** Approved
- **Selected direction:** Option 1, responsive disclosure panel
- **Branch:** `refactorAndRefine`

## Purpose

Replace the header's compact-width horizontal scroller with one accessible
disclosure menu. The revised header must keep every destination available
without crushing labels, introducing horizontal overflow, or asking people to
discover a scrollbar.

This change also establishes the correct ownership boundary for header
interactions:

- `layout-style-css` owns structural layout primitives;
- `ui-style-kit-css` owns theme and visual paint;
- `ui-style-kit-icons` supplies the typed menu icon;
- `interactive-surface-css` owns interactive states.

Local site CSS may position and size those pieces, but it must not override the
interaction library's hover, focus, active, or pressed treatments.

## Responsive Contract

### Above 78rem

- The brand, section navigation, `Discover STE`, and `GitHub` remain inline.
- The menu control is hidden.
- All links are rendered from the same navigation DOM used at compact widths.
- The header remains sticky and retains the existing anchor-clearance behavior.

### At or below 78rem

- The first row contains only the brand and a `Menu` disclosure control.
- The existing horizontal navigation scrollbar and `Scroll for more` cue are
  removed.
- Activating `Menu` reveals one full-width panel immediately below the first
  row.
- Section destinations use an intrinsic responsive grid.
- `Discover STE` and `GitHub` are visually separated in the final action row.
- Tablet widths may use two or three columns; phone widths use one column.
- In short landscape viewports, the panel receives a dynamic-viewport maximum
  height and its own vertical scrolling region.
- At or below 46rem the header remains static, matching the existing mobile
  scroll policy.

The exact boundary is intentional: `78rem` remains compact. Desktop inline
navigation begins above that value.

## Component Architecture

Create a focused client component:

```tsx
<ResponsiveNavigation
  companyUrl={SITE.companyUrl}
  repositoryUrl={SITE.repositoryUrl}
/>
```

`SiteHeader` remains the server-rendered owner of the header shell and brand.
`ResponsiveNavigation` owns only disclosure state and navigation behavior.

The component contains:

1. one typed `<UiIcon name="menu" />` toggle;
2. one primary `<nav>` containing every in-page section link;
3. one external action group containing `Discover STE` and `GitHub`.

No destination is duplicated for separate mobile and desktop markup. CSS
changes the presentation of this single structure.

## Interaction Behavior

The disclosure is nonmodal:

- it does not trap focus;
- it does not lock body scrolling;
- it does not add a backdrop;
- normal document tab order remains available.

The toggle exposes `aria-expanded` and `aria-controls`. Its accessible name
communicates whether it opens or closes the navigation menu.

When the panel is open:

- selecting any section or external link closes it;
- pressing `Escape` closes it and returns focus to the toggle;
- clicking or tapping outside the navigation closes it without moving focus;
- resizing across the desktop boundary closes compact disclosure state.

The toggle and links have a minimum 44px interactive target. Their classes
include `interactive-surface site-action` plus intentional surface data
attributes so the interaction library owns hover, focus, active, and pressed
feedback.

## Visual and CSS Ownership

Local CSS is limited to:

- header and panel positioning;
- inline versus disclosure layout;
- responsive grids and gaps;
- target geometry;
- panel overflow and viewport constraints;
- static panel background, border, and elevation.

Local CSS must not define `:hover`, `:focus`, `:focus-visible`, or `:active`
rules for the toggle or navigation links. Existing local scrollbar paint and
the compact navigation cue are removed with the obsolete horizontal-scroller
behavior.

The compact panel may overlay page content below the header. It remains
anchored to the header's first row and does not change the collapsed header
height used for sticky anchor clearance.

## Accessibility and Navigation

- The primary navigation keeps its `aria-label`.
- The menu button is a native `button` with `type="button"`.
- The hidden compact panel is removed from visual and accessibility flow by
  CSS; at desktop widths the same panel is always visible.
- Keyboard focus order is brand, menu toggle, then disclosed navigation items.
- Hash navigation closes the panel before the browser completes the target
  scroll.
- Every in-page target must settle below the visible sticky header.
- External links preserve their existing destination and new-tab behavior.

## Verification Matrix

### Automated behavior

- Closed compact state shows brand plus one menu control and no horizontal
  overflow.
- Open compact state exposes every section and external link.
- Link selection, `Escape`, outside interaction, and desktop resize close the
  panel according to the approved focus behavior.
- Inline desktop state exposes the same destinations without a menu control.
- In-page navigation lands below the header.
- No hydration warning, console error, or Next.js error overlay appears.

### Viewports

- Phones: `305`, `320`, and `390` CSS pixels wide.
- Original regression: `799` CSS pixels wide.
- Short landscape: `844 × 390`.
- Tablet/compact desktop: `768 × 1024`, `1024 × 768`.
- Boundary: `1248` CSS pixels wide.
- Desktop: `1440 × 1000`.

At each relevant viewport, verify document width, closed/open geometry, panel
reachability, and absence of a horizontal navigation scrollbar.

### Rendered evidence

Capture and inspect:

- compact closed and open states at `799px`;
- a phone open state;
- the desktop inline state.

Rendered acceptance must include pointer and keyboard interaction, not only
markup or token inspection.

## Acceptance Criteria

- No header destination is clipped, crushed, or dependent on horizontal
  scrolling at any approved viewport.
- The `799px` regression shown by the user is resolved.
- Compact widths show one disclosure control and a usable responsive panel.
- Desktop shows one clean inline navigation row.
- There is only one navigation destination structure in the DOM.
- The menu icon uses the typed `UiIcon` API.
- `interactive-surface-css` owns all menu and link interaction states.
- Local CSS contains no competing state overrides for these controls.
- Keyboard, outside-click, resize, and hash-navigation behaviors match this
  specification.
- The full repository quality gate and rendered browser checks pass.
- No worktree is created.

## Out of Scope

- A blanket conversion of every interactable element in the site.
- Changing demonstrations that intentionally show a control without
  `interactive-surface-css`.
- Redesigning content sections, library configuration, or brand assets.
- Publishing, deploying, pushing, merging, or rewriting branch history.

The broader `interactive-surface-css` adoption strategy will be drafted as a
separate ownership and rollout document after this menu implementation is
verified.
