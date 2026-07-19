# layout-style-css Follow-Up Brief

## Browser-Visible Symptom

The site itself now renders correctly, but a clean package tree flags the approved current ecosystem stack as invalid because `layout-style-css@1.1.2` requires older exact peer versions.

## Exact Reproduction In This Site

Run:

```powershell
npm.cmd ls layout-style-css ui-style-kit-css interactive-surface-css
```

Observed result:

```text
ui-style-kit-css@2.0.3 invalid: "2.0.1" from node_modules/layout-style-css
interactive-surface-css@1.3.0 invalid: "1.2.5" from node_modules/layout-style-css
```

## Isolated Reproduction Attempt Outside The Site

The installed `node_modules/layout-style-css/package.json` declares:

```json
"peerDependencies": {
  "interactive-surface-css": "1.2.5",
  "ui-style-kit-css": "2.0.1"
}
```

A fresh fixture that installs `layout-style-css@1.1.2`, `ui-style-kit-css@2.0.3`, and `interactive-surface-css@1.3.0` should reproduce the peer warning without any Interface Systems Lab source.

## Likely Owning Library

`layout-style-css`, package metadata and release contract.

## Proposed Upstream Fix

Widen peer ranges to accept the current major-compatible ecosystem versions, for example `ui-style-kit-css >=2.0.1 <3` and `interactive-surface-css >=1.2.5 <2`, then update the package description and dev dependency fixture versions to the current stack.

## Downstream Regression Test

Add a package test or fixture that runs a clean install of the documented current stack, imports `ui-style-kit-css/with-bridge.css`, `interactive-surface-css/interactive-surface.css`, `layout-style-css/bridge.css`, and `layout-style-css`, then verifies `npm ls` exits successfully.

## Release Impact

Patch release. This is a compatibility metadata fix unless the fixture exposes additional generated CSS drift.
