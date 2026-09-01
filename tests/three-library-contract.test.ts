import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  ADOPTION_PATHS,
  BUNDLER_IMPORTS,
  CDN_LINKS,
  ECOSYSTEM_PACKAGES,
  NPM_INSTALL,
} from "../app/data/ecosystem";
import { SUPPORTED_COMBINATIONS_LABEL } from "../app/data/atlas";
import { SITE } from "../app/lib/site";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));

test("the public ecosystem contains exactly the three CSS libraries", () => {
  assert.deepEqual(
    ECOSYSTEM_PACKAGES.map(({ name, version }) => ({ name, version })),
    [
      { name: "layout-style-css", version: "3.1.0" },
      { name: "ui-style-kit-css", version: "2.3.0" },
      { name: "interactive-surface-css", version: "1.6.0" },
    ],
  );

  assert.equal(BUNDLER_IMPORTS.length, 4);
  assert.equal(CDN_LINKS.length, 4);
  assert.equal(
    NPM_INSTALL.split(" ").filter((word) => word.includes("@")).length,
    3,
  );
  assert.equal(ADOPTION_PATHS.length, 7);
});

test("the headline count excludes display modes from the combination total", () => {
  const homepage = readFileSync(`${repositoryRoot}/app/page.tsx`, "utf8");

  assert.equal(SUPPORTED_COMBINATIONS_LABEL, "44,800");
  assert.match(homepage, /SUPPORTED_COMBINATIONS_LABEL/);
  assert.equal(16 * 7 * 20 * 20, 44_800);
});

test("site identity exposes both STE destinations", () => {
  const identity = SITE as typeof SITE & {
    customizedPlatforms: { name: string; url: string };
  };

  assert.equal(
    identity.owner.url,
    "https://sandersontechnologyenterprises.com/",
  );
  assert.deepEqual(identity.customizedPlatforms, {
    name: "Customized Platforms",
    url: "https://customizedplatforms.com/",
  });
});
