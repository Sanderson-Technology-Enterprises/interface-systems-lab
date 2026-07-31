# Responsive Disclosure Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the compact horizontal header scroller with the approved
single-DOM responsive disclosure navigation while preserving desktop inline
navigation and library ownership boundaries.

**Architecture:** Keep `SiteHeader` server rendered and move only navigation
state into a focused `ResponsiveNavigation` client component. Render one link
structure for every viewport, present it inline above `78rem`, and expose it
through a nonmodal disclosure panel at or below `78rem`. Use local CSS only for
geometry while `interactive-surface-css` owns interactive state paint.

**Tech Stack:** Next.js 16, React 19, TypeScript, layout-style-css 3,
ui-style-kit-css, ui-style-kit-icons, interactive-surface-css, CSS media
queries, Playwright, ESLint, Prettier

## Global Constraints

- Work only on the current `refactorAndRefine` branch.
- Do not create or use a worktree.
- Do not push, publish, deploy, merge, or rewrite history.
- Follow test-driven development: add and observe a focused failing browser
  regression before production changes.
- Keep one navigation DOM; do not duplicate mobile and desktop link lists.
- Use the typed `UiIcon` component for the menu icon.
- Use professional comments only where behavior or ownership is non-obvious.
- Do not add local hover, focus, active, or pressed overrides to the navigation
  controls.
- Do not modify demos that intentionally omit `interactive-surface-css`.
- Keep `git diff --check`, formatting, linting, and type checking clean.
- Use task-owned ports `4175` and `4176`; do not stop listeners on other ports.

---

### Task 1: Add the compact disclosure behavior regression

**Files:**

- Modify: `tests/browser/site.spec.ts`

**Interfaces:**

- Exercises the real rendered header at `799 × 700`.
- Locates the menu by accessible button role and the primary navigation by
  landmark role.
- Proves closed/open geometry, complete destinations, and absence of document
  overflow.

- [ ] **Step 1: Write the failing browser test**

Add a focused test named
`compact header discloses every navigation destination without horizontal overflow`.
Before writing it, name the mutation it catches: restoring an always-visible
nowrap navigation row, omitting the toggle, or leaving destinations outside the
panel must fail the test.

The test should:

```ts
await page.setViewportSize({ width: 799, height: 700 });
await page.goto("/");

const menu = page.getByRole("button", { name: /open navigation menu/i });
const navigation = page.getByRole("navigation", {
  name: "Primary navigation",
});

await expect(menu).toBeVisible();
await expect(menu).toHaveAttribute("aria-expanded", "false");
await expect(navigation).toBeHidden();
await menu.click();
await expect(menu).toHaveAttribute("aria-expanded", "true");
await expect(navigation).toBeVisible();
```

Assert all ten section labels plus `Discover STE` and `GitHub`. Derive the
literal label list in the test rather than importing production data. Compare
`document.documentElement.scrollWidth` to `clientWidth`.

- [ ] **Step 2: Run the RED test**

Run:

```powershell
$env:PLAYWRIGHT_TEST_PORT = "4175"
try {
  npm.cmd run test:browser -- --project=desktop-chromium --grep "compact header discloses"
} finally {
  Remove-Item Env:PLAYWRIGHT_TEST_PORT -ErrorAction SilentlyContinue
}
```

Expected: the test fails because the current header has no menu button and
still exposes the horizontal scroller.

- [ ] **Step 3: Commit the executable regression with the implementation**

Do not commit a knowingly red branch state. Keep the test change unstaged until
Task 2 turns it green.

---

### Task 2: Implement the single-DOM responsive navigation

**Files:**

- Create: `app/components/ResponsiveNavigation.tsx`
- Modify: `app/components/SiteHeader.tsx`
- Modify: `app/styles/shell.css`
- Modify: `app/styles/responsive.css`
- Modify: `tests/browser/site.spec.ts`

**Interfaces:**

- `ResponsiveNavigationProps`
  - `companyUrl: string`
  - `repositoryUrl: string`
- Compact toggle:
  - `aria-controls="primary-navigation-panel"`
  - `aria-expanded={isOpen}`
  - accessible open/close name
- Panel state:
  - `data-open={isOpen}`
- Responsive state reset:
  - `matchMedia("(min-width: 78.0625rem)")`

- [ ] **Step 1: Create the client component**

Create `ResponsiveNavigation.tsx` with module-level immutable navigation data,
one boolean state value, and refs for the navigation root and toggle.

Register effects only while necessary:

```ts
useEffect(() => {
  if (!isOpen) return;

  const closeFromOutside = (event: PointerEvent) => {
    if (!navigationRef.current?.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };
  const closeFromEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      menuButtonRef.current?.focus();
    }
  };

  document.addEventListener("pointerdown", closeFromOutside);
  document.addEventListener("keydown", closeFromEscape);
  return () => {
    document.removeEventListener("pointerdown", closeFromOutside);
    document.removeEventListener("keydown", closeFromEscape);
  };
}, [isOpen]);
```

Use a separate mount effect for the desktop media query and close state when it
starts matching. Render the typed menu icon, the ten section links, and the two
external actions exactly once.

- [ ] **Step 2: Refactor the header owner**

Keep the brand markup in `SiteHeader`, remove its local navigation data,
`header-links`, old `<nav>`, and `primary-nav-cue`, then render:

```tsx
<ResponsiveNavigation
  companyUrl={companyUrl}
  repositoryUrl={SITE.repositoryUrl}
/>
```

- [ ] **Step 3: Replace scroller CSS with disclosure geometry**

In `shell.css`:

- make the header inner wrapper a two-column brand/navigation layout;
- define desktop inline `.navigation-panel`, `.primary-nav`, and
  `.navigation-actions` geometry;
- keep `.site-action` target geometry;
- remove navigation overflow and custom scrollbar styles;
- remove the obsolete cue;
- keep state styling out of local CSS.

In `responsive.css` at `max-width: 78rem`:

- show `.navigation-toggle`;
- position `.navigation-panel` immediately below the header row;
- hide the panel unless `data-open="true"`;
- use an intrinsic grid for section links;
- separate external actions;
- constrain panel height with dynamic viewport units and vertical scrolling;
- preserve the collapsed sticky-header scroll margin.

At `max-width: 46rem`, use one panel column and keep the static-header policy.
Update print rules to hide `.site-navigation`.

- [ ] **Step 4: Turn the focused regression GREEN**

Run the Task 1 command again. Expected: one passing test with no console error,
Next overlay, or document overflow.

- [ ] **Step 5: Expand behavior coverage**

Update the existing compact header, anchor, tab-order, and responsive matrix
tests so they assert the approved disclosure contract instead of the removed
scrollbar contract. Add real behavior assertions for:

- link selection closes the panel;
- `Escape` closes and restores toggle focus;
- outside pointer interaction closes without stealing focus;
- resizing above `78rem` closes disclosure state and exposes inline navigation;
- `1248px` remains compact while `1440px` is inline;
- all approved compact viewports avoid document overflow;
- hash targets settle below the visible header.

- [ ] **Step 6: Run focused GREEN coverage**

Run:

```powershell
$env:PLAYWRIGHT_TEST_PORT = "4175"
try {
  npm.cmd run test:browser -- --project=desktop-chromium --grep "header|navigation|responsive"
} finally {
  Remove-Item Env:PLAYWRIGHT_TEST_PORT -ErrorAction SilentlyContinue
}
npm.cmd run typecheck
npm.cmd run lint
git diff --check
```

Expected: all commands exit `0` with no warnings or formatting failures.

- [ ] **Step 7: Format and commit the feature**

Run:

```powershell
npm.cmd exec prettier -- --write app/components/ResponsiveNavigation.tsx app/components/SiteHeader.tsx app/styles/shell.css app/styles/responsive.css tests/browser/site.spec.ts
git diff --check
git add -- app/components/ResponsiveNavigation.tsx app/components/SiteHeader.tsx app/styles/shell.css app/styles/responsive.css tests/browser/site.spec.ts
git commit -m "feat: add responsive disclosure navigation"
```

---

### Task 3: Complete rendered and repository acceptance

**Files:**

- Verify: all Task 2 files
- Create ignored QA evidence under `.qa/responsive-navigation/`

**Interfaces:**

- Uses repository preview port `4175`.
- Produces compact closed/open, phone, and desktop screenshots plus a diagnostic
  result with no console warnings, page errors, or framework overlays.

- [ ] **Step 1: Run the full quality gate**

Snapshot generated Next files before the command and restore them afterward:

```powershell
$qaRoot = ".qa/responsive-navigation"
New-Item -ItemType Directory -Path $qaRoot -Force | Out-Null
Copy-Item next-env.d.ts "$qaRoot/next-env.before-quality" -Force
Copy-Item tsconfig.json "$qaRoot/tsconfig.before-quality" -Force
$env:PLAYWRIGHT_TEST_PORT = "4175"
try {
  npm.cmd run quality
} finally {
  Remove-Item Env:PLAYWRIGHT_TEST_PORT -ErrorAction SilentlyContinue
  Copy-Item "$qaRoot/next-env.before-quality" next-env.d.ts -Force
  Copy-Item "$qaRoot/tsconfig.before-quality" tsconfig.json -Force
}
```

Expected: formatting, linting, type checking, unit/fixture/brand tests,
Turbopack hydration, Pages export, metadata checks, and the full browser matrix
all pass.

- [ ] **Step 2: Run browser-driven rendered acceptance**

Use the Browser connector against a task-owned preview and inspect:

- `799 × 700`, closed and open;
- `390 × 844`, open;
- `844 × 390`, open with reachable panel content;
- `1248 × 800`, compact boundary;
- `1440 × 1000`, desktop inline.

Exercise keyboard order, `Escape`, outside pointer interaction, hash
navigation, and resize. Capture screenshots for the `799px` closed/open,
phone-open, and desktop-inline states. Confirm zero warnings, zero errors, and
no Next.js overlay.

- [ ] **Step 3: Draft the separate interaction-library adoption strategy**

Create
`docs/superpowers/specs/2026-07-30-interactive-surface-css-adoption-draft.md`
with:

- an ownership matrix for site chrome, integration demos, UI-only controls,
  native controls, and explicit without-library comparisons;
- an inventory and exemption method;
- phased implementation and rendered verification;
- automated safeguards against local state-style overrides;
- explicit protection for demos whose purpose is to omit the interaction
  library.

Do not implement the broad audit in this feature.

- [ ] **Step 4: Review and commit the draft**

Format the document, inspect it for placeholders and scope creep, then commit:

```powershell
git add -- docs/superpowers/specs/2026-07-30-interactive-surface-css-adoption-draft.md
git commit -m "docs: draft interactive surface adoption strategy"
```

- [ ] **Step 5: Complete the final repository audit**

Run:

```powershell
git diff --check
git status --short --branch
git log -5 --oneline
Get-NetTCPConnection -LocalPort 4175,4176 -State Listen -ErrorAction SilentlyContinue
```

Expected: the branch is `refactorAndRefine`, authored files are committed,
task-owned ports are free, and no worktree, push, deployment, or merge occurred.
