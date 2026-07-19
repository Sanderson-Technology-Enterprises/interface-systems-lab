# Ecosystem Gap Audit

## Summary

The site recovery confirmed that most browser-visible breakage came from this site's custom composition, not from a proven styling defect in the libraries. One upstream package-contract issue is confirmed: `layout-style-css@1.1.2` advertises exact peer versions that conflict with the current approved stack.

## Confirmed Upstream Gap

- `npm.cmd ls layout-style-css ui-style-kit-css interactive-surface-css` reports `ui-style-kit-css@2.0.3` as invalid against `layout-style-css` peer `2.0.1`.
- The same command reports `interactive-surface-css@1.3.0` as invalid against `layout-style-css` peer `1.2.5`.
- The site currently installs with `--legacy-peer-deps`; a clean consumer should not need that for the documented current stack.

## Site-Only Fixes

- The observatory failure came from overlapping full-circle button hit areas and animated controls.
- The mobile collapse came from oversized local composition and broad grid/card usage.
- The install and library sections needed local wrapping and one-column-first reflow.

## Recommended Library Order

1. Update `layout-style-css` peer dependency ranges and release metadata.
2. Add or refresh narrow-width demo fixtures in `ui-style-kit-css` if native elements still need better card-size resilience.
3. Add an `interactive-surface-css` documentation note or fixture for using interaction primitives inside custom positioned controls.

## Regression Gate For Future Ecosystem Work

Create a small consumer fixture that installs the three current packages without `--legacy-peer-deps`, imports the documented CSS order, renders a narrow and desktop layout, and runs Playwright overflow plus interaction checks.
