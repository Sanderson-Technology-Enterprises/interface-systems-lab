import assert from "node:assert/strict";
import test from "node:test";

import {
  ATLAS_COVERAGE,
  SUPPORTED_COMBINATIONS,
  SUPPORTED_COMBINATIONS_LABEL,
} from "../app/data/atlas";

test("atlas coverage mirrors every published library contract", () => {
  assert.deepEqual(
    {
      areas: ATLAS_COVERAGE.layout.areas.length,
      personalities: ATLAS_COVERAGE.layout.personalities.length,
      primitives: ATLAS_COVERAGE.layout.primitives.length,
      recipes: ATLAS_COVERAGE.layout.recipes.length,
      wrappers: ATLAS_COVERAGE.layout.wrappers.length,
    },
    { areas: 11, personalities: 16, primitives: 20, recipes: 7, wrappers: 7 },
  );
  assert.deepEqual(
    {
      nativeFullyThemed: ATLAS_COVERAGE.ui.nativeElements.fullyThemed.length,
      nativeNonRendered: ATLAS_COVERAGE.ui.nativeElements.nonRendered.length,
      nativePlatformOwned:
        ATLAS_COVERAGE.ui.nativeElements.platformOwned.length,
      nativeProgressive:
        ATLAS_COVERAGE.ui.nativeElements.progressivelyEnhanced.length,
      semantic: ATLAS_COVERAGE.ui.semanticSelectors.length,
      universal: ATLAS_COVERAGE.ui.universalVisualSuffixes.length,
    },
    {
      nativeFullyThemed: 83,
      nativeNonRendered: 12,
      nativePlatformOwned: 6,
      nativeProgressive: 20,
      semantic: 29,
      universal: 94,
    },
  );
  assert.deepEqual(
    {
      dataHooks: ATLAS_COVERAGE.interaction.dataHooks.length,
      levels: ATLAS_COVERAGE.interaction.levels.length,
      stable: ATLAS_COVERAGE.interaction.stableSelectors.length,
      states: ATLAS_COVERAGE.interaction.stateClasses.length,
      variants: ATLAS_COVERAGE.interaction.variants.length,
    },
    { dataHooks: 3, levels: 3, stable: 13, states: 3, variants: 6 },
  );
});

test("possibility count multiplies configurable design choices but not modes", () => {
  assert.equal(SUPPORTED_COMBINATIONS, 16 * 7 * 20 * 20);
  assert.equal(SUPPORTED_COMBINATIONS, 44_800);
  assert.equal(SUPPORTED_COMBINATIONS_LABEL, "44,800");
  assert.equal("modes" in ATLAS_COVERAGE.ui, false);
});
