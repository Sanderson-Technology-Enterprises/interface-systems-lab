# interactive-surface-css Follow-Up Brief

## Browser-Visible Symptom

No confirmed `interactive-surface-css` defect remains after the site recovery. The failed hero interaction came from overlapping custom orbit button geometry, not from the interaction primitive itself.

## Exact Reproduction In This Site

Before recovery, each orbit control was a full circular button. Smaller orbit buttons sat on top of larger orbit buttons, so browser automation and users could hit the wrong control.

## Isolated Reproduction Attempt Outside The Site

The issue does not reproduce with ordinary `.interactive-surface` buttons. It requires custom absolute positioning and overlapping hit areas from this site's observatory.

## Likely Owning Library

Interface Systems Lab owns the confirmed fix. `interactive-surface-css` may own a documentation example if positioned controls become a recurring usage pattern.

## Proposed Upstream Fix

Do not change the library for this site-specific geometry. Consider adding a documentation note that custom positioned controls must provide non-overlapping hit areas and should keep decorative motion separate from the actual button element.

## Downstream Regression Test

Keep the site browser test that clicks the `Identity` orbit button through the `Interface layer selector` group and verifies `aria-pressed="true"`. Add an upstream fixture only if the library introduces positioned-control recipes.

## Release Impact

No release required for the current confirmed fix.
