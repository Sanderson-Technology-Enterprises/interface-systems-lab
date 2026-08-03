import { expect, test } from "@playwright/test";

test("Turbopack development hydrates UiIcon before custom-element upgrade", async ({
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
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await page.goto("/lab/");

  const icons = page.locator("#icons usk-icon");
  await expect(icons).toHaveCount(14);
  await expect
    .poll(() =>
      icons
        .first()
        .evaluate(
          (icon) =>
            Boolean(customElements.get("usk-icon")) &&
            Boolean(icon.shadowRoot?.querySelector("svg")),
        ),
    )
    .toBe(true);

  expect(hydrationDiagnostics).toEqual([]);
  expect(pageErrors).toEqual([]);
});
