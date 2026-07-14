import { expect, test } from "@playwright/test";

const resourceUrls = [
  "https://github.com/Foscat/Layout-Style-CSS",
  "https://github.com/Foscat/Layout-Style-CSS/wiki",
  "https://www.npmjs.com/package/layout-style-css",
  "https://foscat.github.io/Layout-Style-CSS/",
  "https://github.com/Foscat/ui-style-kit-css",
  "https://github.com/Foscat/ui-style-kit-css/wiki",
  "https://www.npmjs.com/package/ui-style-kit-css",
  "https://foscat.github.io/ui-style-kit-css/",
  "https://github.com/Foscat/Interactive-Surface-CSS",
  "https://github.com/Foscat/Interactive-Surface-CSS/wiki",
  "https://www.npmjs.com/package/interactive-surface-css",
  "https://foscat.github.io/Interactive-Surface-CSS/",
];

test.beforeEach(async ({ page }) => {
  await page.goto("./");
});

test("renders the production metadata and complete resource directory", async ({ page }, testInfo) => {
  const runtimeErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  await expect(page).toHaveTitle(/Interface Systems Lab/);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: /Design every layer/i })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://foscat.github.io/interface-systems-lab/",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://foscat.github.io/interface-systems-lab/interface-systems-lab-social-card.png",
  );
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);

  for (const url of resourceUrls) {
    await expect(page.locator(`a[href="${url}"]`).first()).toBeAttached();
  }

  await page.screenshot({
    path: `.tmp/observatory-${testInfo.project.name}.png`,
    fullPage: true,
  });
  expect(runtimeErrors).toEqual([]);
});

test("keeps workbench controls, state, and copy affordances functional", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  const layout = page.getByLabel(/01.*Layout/);
  await layout.selectOption("bauhaus");
  await expect(page.locator(".experience")).toHaveAttribute("data-layout", "bauhaus");
  await expect(page.getByText("Layout changed to Bauhaus.")).toBeAttached();

  const save = page.locator(".project-card button[aria-pressed]");
  await expect(save).toHaveAccessibleName("Save project to shortlist");
  await save.click();
  await expect(save).toHaveAttribute("aria-pressed", "true");
  await expect(save).toHaveAccessibleName("Remove project from shortlist");
  await expect(save).toHaveText("Saved");

  const copy = page.locator(".code-strip button");
  await expect(copy).toHaveAccessibleName("Copy configuration");
  await copy.click();
  await expect(copy).toHaveText("Copied");
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain(
    'data-layout="bauhaus"',
  );
});

test("fits the viewport and honors reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

  const animationNames = await page.locator(".observatory-orbit").evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).animationName),
  );
  expect(animationNames.every((name) => name === "none")).toBe(true);
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
});
