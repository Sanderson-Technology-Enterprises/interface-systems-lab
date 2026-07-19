import { expect, type Page, test } from "@playwright/test";

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

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
}

test("renders the production metadata and complete resource directory", async ({
  page,
}, testInfo) => {
  const runtimeErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  await expect(page).toHaveTitle(/Interface Systems Lab/);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator(".brand-logo")).toBeVisible();
  await expect(page.locator(".brand-logo")).toHaveAttribute(
    "src",
    /logo-master\.png$/,
  );
  await expect
    .poll(() =>
      page
        .locator(".brand-logo")
        .evaluate(
          (image: HTMLImageElement) =>
            image.complete && image.naturalWidth > 0 && image.naturalHeight > 0,
        ),
    )
    .toBe(true);
  await expect(
    page.getByText("A Sanderson Technology Enterprises product").first(),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Design every layer/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Library proof cards/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Structure proof" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Identity proof" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Behavior proof" }),
  ).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://foscat.github.io/interface-systems-lab/",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://foscat.github.io/interface-systems-lab/interface-systems-lab-social-card.png",
  );
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(
    1,
  );

  for (const url of resourceUrls) {
    await expect(page.locator(`a[href="${url}"]`).first()).toBeAttached();
  }

  await page.screenshot({
    path: `.tmp/observatory-${testInfo.project.name}.png`,
    fullPage: true,
  });
  expect(runtimeErrors).toEqual([]);
});

test("keeps workbench controls, state, and copy affordances functional", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  const identityOrbit = page
    .getByRole("group", { name: "Interface layer selector" })
    .getByRole("button", { name: "Identity" });
  await identityOrbit.click();
  await expect(identityOrbit).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#observatory-active-package")).toContainText(
    "Visual systems, palettes, native-element coverage, and display modes.",
  );
  await expect(
    page
      .locator("#observatory-active-package")
      .getByRole("link", { name: /npm/i }),
  ).toHaveAttribute("href", "https://www.npmjs.com/package/ui-style-kit-css");

  const layout = page.getByLabel(/01.*Layout/);
  await layout.selectOption("bauhaus");
  await expect(page.locator(".experience")).toHaveAttribute(
    "data-layout",
    "bauhaus",
  );
  await expect(page.getByText("Layout changed to Bauhaus.")).toBeAttached();

  const save = page.getByRole("button", { name: "Save project to shortlist" });
  await expect(save).toHaveAccessibleName("Save project to shortlist");
  await save.click();
  const saved = page.getByRole("button", {
    name: "Remove project from shortlist",
  });
  await expect(saved).toHaveAttribute("aria-pressed", "true");
  await expect(saved).toHaveText("Saved");

  const copy = page.locator(".code-strip button");
  await expect(copy).toHaveAccessibleName("Copy configuration");
  await copy.click();
  await expect(copy).toHaveText("Copied");
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain('data-layout="bauhaus"');
});

test("fits the viewport and honors reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();

  await expectNoHorizontalOverflow(page);

  const animationNames = await page
    .locator(".observatory-orbit")
    .evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).animationName),
    );
  expect(animationNames.every((name) => name === "none")).toBe(true);
  await expect(
    page.getByRole("navigation", { name: "Primary navigation" }),
  ).toBeVisible();
});

test("stays responsive across mobile portrait, mobile landscape, tablet, and desktop sizes", async ({
  page,
}) => {
  const viewports = [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 844, height: 390 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 1000 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("./");

    await expectNoHorizontalOverflow(page);

    await expect(
      page.getByRole("navigation", { name: "Primary navigation" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Structure proof" }),
    ).toBeVisible();

    const sectionHealth = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll(
          ".observatory-legend li, .product-preview, .proof-card, .install-step, .library-list li",
        ),
      ).map((element) => {
        const rect = element.getBoundingClientRect();

        return {
          height: rect.height,
          width: rect.width,
          viewportWidth: window.innerWidth,
        };
      }),
    );

    for (const item of sectionHealth) {
      expect(item.width).toBeLessThanOrEqual(item.viewportWidth);
      expect(item.height).toBeGreaterThan(20);
    }
  }
});
