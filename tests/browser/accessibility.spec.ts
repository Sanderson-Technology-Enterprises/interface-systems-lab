import AxeBuilder from "@axe-core/playwright";
import { expect, test, type TestInfo } from "@playwright/test";

type AxeResults = Awaited<ReturnType<AxeBuilder["analyze"]>>;

async function expectNoAxeViolations(
  results: AxeResults,
  testInfo: TestInfo,
  attachmentName: string,
) {
  await testInfo.attach(attachmentName, {
    body: JSON.stringify(results.violations, null, 2),
    contentType: "application/json",
  });
  expect(results.violations).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await page.goto("./");
});

test(
  "axe finds no violations across the complete default experience",
  { tag: "@cross-engine" },
  async ({ page }, testInfo) => {
    await page
      .locator(
        "#ui-native details, #interactions details, #integrate details, #install details",
      )
      .evaluateAll((details) => {
        for (const detail of details)
          (detail as HTMLDetailsElement).open = true;
      });
    await expect(
      page.locator('[data-specimen="ui-paint-signature"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-interaction-state="aria-pressed"]'),
    ).toBeVisible();
    await expect(page.locator("#integrate")).toBeVisible();
    await expect(page.locator("#install")).toBeVisible();
    await expect(page.locator("#libraries")).toBeVisible();
    await expect(page.locator("#company")).toBeVisible();
    await expect(
      page.locator('[data-icon-lab] usk-icon[role="img"]'),
    ).toHaveAttribute("aria-label", /.+/);
    await expect(
      page.locator("[data-icon-lab] [data-icon-specimen] usk-icon").first(),
    ).toHaveAttribute("aria-hidden", "true");
    const iconAction = page
      .locator("[data-icon-lab]")
      .getByRole("button", { name: "Restore authored frame" });
    await expect(iconAction).toBeVisible();
    await expect(iconAction.locator("usk-icon")).toHaveAttribute(
      "aria-hidden",
      "true",
    );

    const results = await new AxeBuilder({ page }).analyze();
    await expectNoAxeViolations(
      results,
      testInfo,
      "axe-default-experience.json",
    );
  },
);

test(
  "axe finds no violations in extreme configuration and modal states",
  {
    tag: "@cross-engine",
  },
  async ({ page }, testInfo) => {
    await page.goto(
      "./?layout=split-screen&ui=maximalist&theme=cyber-lime&mode=contrast",
    );
    await page
      .locator("#ui-native details, #interactions details")
      .evaluateAll((details) => {
        for (const detail of details)
          (detail as HTMLDetailsElement).open = true;
      });
    await page.getByRole("button", { name: "Validate native field" }).click();
    await page
      .getByRole("radiogroup", { name: "Persistent collision state" })
      .getByRole("radio", { name: "Selected" })
      .check();
    const busyCheckbox = page.getByRole("checkbox", { name: "Busy" });
    // Exercise native keyboard activation without depending on a pointer target
    // that WebKit may scroll beneath the sticky site header.
    await busyCheckbox.scrollIntoViewIfNeeded();
    await busyCheckbox.focus();
    await busyCheckbox.press("Space");
    await expect(busyCheckbox).toBeChecked();

    const extremeResults = await new AxeBuilder({ page })
      .include("#ui-native")
      .include("#icons")
      .include("#interactions")
      .analyze();
    await expectNoAxeViolations(
      extremeResults,
      testInfo,
      "axe-extreme-labs.json",
    );

    await page.getByRole("button", { name: "Open native dialog" }).click();
    const dialog = page.getByRole("dialog", { name: "Native dialog specimen" });
    await expect(dialog).toBeVisible();
    const dialogResults = await new AxeBuilder({ page })
      .include("dialog[open]")
      .analyze();
    await expectNoAxeViolations(
      dialogResults,
      testInfo,
      "axe-native-dialog.json",
    );
  },
);
