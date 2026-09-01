import { expect, test } from "@playwright/test";

test("Turbopack development hydrates the interactive routes cleanly", async ({
  page,
}) => {
  const hydrationDiagnostics: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", (message) => {
    if (
      (message.type() === "error" || message.type() === "warning") &&
      /hydration|hydrated|server rendered html/i.test(message.text())
    ) {
      hydrationDiagnostics.push(message.text());
    }
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/components/");
  const search = page.getByRole("searchbox", {
    name: "Search components and contracts",
  });
  await expect(search).toBeVisible();
  await search.fill("button");
  await expect(page.locator("[data-atlas-specimen]").first()).toBeVisible();

  expect(hydrationDiagnostics).toEqual([]);
  expect(pageErrors).toEqual([]);
});
