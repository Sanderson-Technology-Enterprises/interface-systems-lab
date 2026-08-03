import { expect, test } from "@playwright/test";

test("homepage presents a concise developer portal", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("./");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Design every layer. Keep one interface.",
    }),
  ).toBeVisible();
  await expect(page.locator(".configuration-console")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Open lab" })).toHaveAttribute(
    "href",
    "/interface-systems-lab/lab/",
  );
  await expect(
    page.getByRole("heading", { name: "Use one package or combine all four." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Install the complete stack." }),
  ).toBeVisible();

  const firstViewportValue = await page
    .locator(".home-hero")
    .evaluate((hero) => {
      const heading = hero.querySelector("h1");
      const action = hero.querySelector<HTMLElement>(
        '[data-hero-action="primary"]',
      );
      if (heading === null || action === null) return false;

      return (
        heading.getBoundingClientRect().top >= 0 &&
        action.getBoundingClientRect().bottom <= window.innerHeight
      );
    });
  expect(firstViewportValue).toBe(true);
});

test("lab route retains the complete configurable experience", async ({
  page,
}) => {
  await page.goto("./lab/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Configure the system. Inspect every layer.",
    }),
  ).toBeVisible();
  await expect(page.locator(".configuration-console")).toBeVisible();

  const menu = page.getByRole("button", { name: "Open lab sections" });
  await expect(menu).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Primary navigation" }),
  ).toBeHidden();
  await menu.click();
  await expect(
    page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", { name: "Integration" }),
  ).toBeVisible();
});

test("homepage and lab remain collision-free across the responsive matrix", async ({
  page,
}) => {
  const viewports = [
    { width: 305, height: 568 },
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 844, height: 390 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1248, height: 800 },
    { width: 1249, height: 800 },
    { width: 1366, height: 768 },
    { width: 1440, height: 1000 },
  ];
  const runtimeErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);

    for (const route of ["./", "./lab/"]) {
      await page.goto(route);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("main#main-content")).toHaveCount(1);
      const skipLink = page.getByRole("link", { name: "Skip to main content" });
      await skipLink.focus();
      await expect(skipLink).toBeFocused();

      const menu = page.getByRole("button", {
        name: /Open menu|Open lab sections/,
      });
      if (await menu.isVisible()) await menu.click();

      const headerHealth = await page
        .locator(".site-header")
        .evaluate((header) => {
          const brand = header.querySelector<HTMLElement>(".brand");
          const navigation =
            header.querySelector<HTMLElement>(".site-navigation");
          const visibleLinks = Array.from(
            header.querySelectorAll<HTMLElement>("a"),
          ).filter((link) => link.getClientRects().length > 0);

          return {
            brandClearsNavigation:
              brand !== null && navigation !== null
                ? brand.getBoundingClientRect().right <=
                  navigation.getBoundingClientRect().left
                : false,
            labelsFit: visibleLinks.every(
              (link) => link.scrollWidth <= link.clientWidth,
            ),
            noHorizontalOverflow:
              document.documentElement.scrollWidth <=
              document.documentElement.clientWidth,
          };
        });

      expect(headerHealth).toEqual({
        brandClearsNavigation: true,
        labelsFit: true,
        noHorizontalOverflow: true,
      });

      if (route === "./lab/" && viewport.width === 768) {
        const labHeroColumnCount = await page
          .locator(".lab-hero")
          .evaluate(
            (hero) =>
              getComputedStyle(hero)
                .gridTemplateColumns.split(/\s+/)
                .filter(Boolean).length,
          );
        expect(labHeroColumnCount).toBe(1);
      }
    }
  }

  expect(runtimeErrors).toEqual([]);
});

test("legacy shared configurations redirect to the lab", async ({ page }) => {
  await page.goto("./?layout=split-screen&ui=cyberpunk#workbench");

  await expect(page).toHaveURL(
    /\/interface-systems-lab\/lab\/\?layout=split-screen&ui=cyberpunk#workbench$/,
  );
  await expect(page.locator(".experience")).toHaveAttribute(
    "data-ly-layout",
    "split-screen",
  );
});
