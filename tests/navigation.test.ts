import assert from "node:assert/strict";
import test from "node:test";

type NavigationModule = {
  HOME_NAVIGATION_ITEMS?: readonly { label: string; href: string }[];
  HOME_NAVIGATION_ACTIONS?: readonly { label: string; href: string }[];
  LAB_NAVIGATION_ITEMS?: readonly { label: string; href: string }[];
  LAB_NAVIGATION_ACTIONS?: readonly { label: string; href: string }[];
};

async function loadNavigationModule(): Promise<NavigationModule> {
  return import("../app/data/navigation").catch(() => ({}));
}

test("homepage navigation keeps the focused portal concise", async () => {
  const navigation = await loadNavigationModule();

  assert.ok(navigation.HOME_NAVIGATION_ITEMS);
  assert.ok(navigation.HOME_NAVIGATION_ACTIONS);
  assert.deepEqual(
    navigation.HOME_NAVIGATION_ITEMS.map(({ label, href }) => [label, href]),
    [
      ["Packages", "#libraries"],
      ["Get started", "#get-started"],
      ["About", "#company"],
    ],
  );
  assert.deepEqual(
    navigation.HOME_NAVIGATION_ACTIONS.map(({ label, href }) => [label, href]),
    [
      ["Open lab", "/lab/"],
      [
        "GitHub",
        "https://github.com/Sanderson-Technology-Enterprises/interface-systems-lab",
      ],
    ],
  );
});

test("lab navigation exposes every retained deep-link section", async () => {
  const navigation = await loadNavigationModule();

  assert.ok(navigation.LAB_NAVIGATION_ITEMS);
  assert.ok(navigation.LAB_NAVIGATION_ACTIONS);
  assert.deepEqual(
    navigation.LAB_NAVIGATION_ITEMS.map(({ label, href }) => [label, href]),
    [
      ["Top", "#top"],
      ["Workbench", "#workbench"],
      ["Layout", "#layouts"],
      ["UI & native", "#ui-native"],
      ["Icons", "#icons"],
      ["Interactions", "#interactions"],
      ["Integration", "#integrate"],
      ["Install", "#install"],
      ["Packages", "#libraries"],
    ],
  );
  assert.deepEqual(
    navigation.LAB_NAVIGATION_ACTIONS.map(({ label, href }) => [label, href]),
    [
      ["Back to overview", "/"],
      [
        "GitHub",
        "https://github.com/Sanderson-Technology-Enterprises/interface-systems-lab",
      ],
    ],
  );
});
