import { expect, type Locator, type Page, test } from "@playwright/test";

const layoutPersonalities = [
  "minimal-saas",
  "bauhaus",
  "tactile",
  "cyberpunk",
  "f-pattern",
  "brutalism",
  "neumorphism",
  "y2k",
  "retro-glass",
  "z-pattern",
  "retrofuturism",
  "mondrian",
  "synthwave",
  "bento",
  "maximalist",
  "split-screen",
] as const;

const layoutRecipes = [
  "app-shell",
  "dashboard",
  "docs",
  "list-detail",
  "split-hero",
  "gallery",
  "card-grid",
] as const;

const primitiveHooks = [
  ["stack", ".ly-stack"],
  ["cluster", ".ly-cluster"],
  ["center", ".ly-center"],
  ["cover", ".ly-cover"],
  ["switcher", ".ly-switcher"],
  ["sidebar", ".ly-sidebar"],
  ["grid", ".ly-grid:not(.ly-grid--auto)"],
  ["grid-auto", ".ly-grid.ly-grid--auto"],
  ["split", ".ly-split"],
  ["panes-2", ".ly-panes.ly-panes--2"],
  ["panes-3", ".ly-panes.ly-panes--3"],
  ["media", ".ly-media"],
  ["reel", ".ly-reel"],
  ["frame", ".ly-frame"],
  ["scroll", ".ly-scroll"],
  ["breakout", ".ly-wrapper.ly-wrapper--breakout"],
] as const;

const wrapperVariants = [
  "compact",
  "prose",
  "content",
  "wide",
  "full",
  "breakout",
] as const;

const spacingUtilities = [
  ...Array.from({ length: 10 }, (_, index) => `ly-gap-${index}`),
  ...Array.from({ length: 10 }, (_, index) => `ly-pad-${index}`),
  "ly-px-4",
  "ly-px-6",
  "ly-px-8",
  "ly-py-4",
  "ly-py-6",
  "ly-py-8",
];

const recipeAreas: Partial<Record<(typeof layoutRecipes)[number], string[]>> = {
  "app-shell": ["header", "nav", "main", "aside", "footer"],
  dashboard: ["header", "nav", "main", "aside", "footer"],
  docs: ["header", "nav", "main", "aside", "footer"],
  "list-detail": ["primary", "secondary", "actions"],
  "split-hero": ["content", "media", "actions"],
};

async function openLayoutDetails(page: Page) {
  await page.locator("#layouts details").evaluateAll((details) => {
    for (const detail of details) (detail as HTMLDetailsElement).open = true;
  });
}

async function focusSignature(page: Page): Promise<string> {
  return page.evaluate(() => {
    const element = document.activeElement;
    if (!(element instanceof HTMLElement)) return "";

    return [
      element.tagName,
      element.getAttribute("aria-label") ?? "",
      element.getAttribute("href") ?? "",
      element.textContent?.trim().replace(/\s+/g, " ") ?? "",
    ].join("|");
  });
}

async function readWorkbenchTabOrder(page: Page, shell: Locator) {
  const focusables = shell.locator(
    'a[href], button:not(:disabled), select:not(:disabled), input:not(:disabled), [tabindex="0"]',
  );
  const count = await focusables.count();
  expect(count).toBeGreaterThanOrEqual(5);

  await focusables.first().focus();
  const order: string[] = [];
  for (let index = 0; index < count; index += 1) {
    order.push(await focusSignature(page));
    if (index < count - 1) await page.keyboard.press("Tab");
  }
  return order;
}

test.beforeEach(async ({ page }) => {
  await page.goto("./");
});

test("layout laboratory renders the complete recipe and primitive contracts", async ({
  page,
}) => {
  const renderedRecipes = await page
    .locator("[data-layout-recipe]")
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("data-layout-recipe")),
    );
  expect(renderedRecipes).toEqual(layoutRecipes);

  for (const recipe of layoutRecipes) {
    const specimen = page.locator(
      `[data-layout-recipe="${recipe}"][data-ly-recipe="${recipe}"]`,
    );
    await expect(specimen).toHaveCount(1);
    expect(
      await specimen.evaluate((element) =>
        Boolean(element.parentElement?.closest(".ly-wrapper")),
      ),
    ).toBe(true);

    const expectedAreas = recipeAreas[recipe];
    if (expectedAreas !== undefined) {
      await expect
        .poll(() =>
          specimen
            .locator(":scope > [data-ly-area]")
            .evaluateAll((areas) =>
              areas.map((area) => area.getAttribute("data-ly-area")),
            ),
        )
        .toEqual(expectedAreas);
    } else {
      await expect(specimen.locator(":scope > *")).toHaveCount(4);
      await expect(specimen.locator(":scope > [data-ly-area]")).toHaveCount(0);
    }
  }

  await expect(
    page.locator('main [data-ly-recipe="app-shell"] main'),
  ).toHaveCount(0);
  await expect(
    page.locator('[data-layout-recipe="app-shell"] > [data-ly-area="main"]'),
  ).toHaveJSProperty("tagName", "SECTION");
  await expect(page.locator('[data-ly-area="sidebar"]')).toHaveCount(0);

  for (const [name, selector] of primitiveHooks) {
    const specimen = page.locator(
      `[data-layout-primitive="${name}"]${selector}`,
    );
    await expect(specimen).toHaveCount(1);
    await expect(
      specimen.locator("[data-primitive-label]").first(),
    ).toContainText(/\S/);
  }

  await expect(
    page.locator('[data-layout-primitive="cover"] > [data-ly-cover-center]'),
  ).toHaveCount(1);
  await expect(
    page.locator(
      '[data-layout-primitive="sidebar"] > [data-ly-sidebar="side"]',
    ),
  ).toHaveCount(1);
  await expect(
    page.locator(
      '[data-layout-primitive="sidebar"] > [data-ly-sidebar="content"]',
    ),
  ).toHaveCount(1);
  for (const hook of ["asset", "content", "actions"]) {
    await expect(
      page.locator(
        `[data-layout-primitive="media"] > [data-ly-media="${hook}"]`,
      ),
    ).toHaveCount(1);
  }
  for (const lane of ["content", "feature", "full"]) {
    await expect(
      page.locator(
        `[data-layout-primitive="breakout"] > [data-ly-lane="${lane}"]`,
      ),
    ).toHaveCount(1);
  }

  for (const variant of wrapperVariants) {
    await expect(
      page.locator(
        `[data-wrapper-variant="${variant}"].ly-wrapper--${variant}`,
      ),
    ).toHaveCount(1);
  }
  const renderedUtilities = await page
    .locator("[data-layout-utility]")
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("data-layout-utility")),
    );
  expect(renderedUtilities).toEqual(spacingUtilities);

  await expect(page.locator('[data-layout-primitive="grid"]')).toBeVisible();
  await expect(page.locator("#layouts details")).toHaveCount(3);
  await expect(
    page.locator("#layouts details [data-layout-primitive]"),
  ).not.toHaveCount(0);
});

test("layout laboratory applies every personality without changing DOM or tab order", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("./");

  const root = page.locator(".experience.ly-root");
  const layoutSelect = page.getByLabel(/01.*Layout/);
  await expect(layoutSelect.locator("option")).toHaveCount(
    layoutPersonalities.length,
  );
  await expect
    .poll(() =>
      layoutSelect
        .locator("option")
        .evaluateAll((options) =>
          options.map((option) => (option as HTMLOptionElement).value),
        ),
    )
    .toEqual(layoutPersonalities);
  await expect(page.locator("[data-ly-layout]")).toHaveCount(1);

  const shell = page.locator('[data-layout-recipe="app-shell"]');
  const baseGrid = page.locator('[data-layout-primitive="grid"]');
  await expect(shell).toHaveCount(1);
  await expect(baseGrid).toBeVisible();
  const readGeometry = async () => ({
    gridColumns: await baseGrid.evaluate(
      (element) => getComputedStyle(element).gridTemplateColumns,
    ),
    shellAreas: await shell.evaluate(
      (element) => getComputedStyle(element).gridTemplateAreas,
    ),
    shellColumns: await shell.evaluate(
      (element) => getComputedStyle(element).gridTemplateColumns,
    ),
  });
  const readDomSignature = () =>
    page
      .locator("[data-layout-recipe], [data-ly-area]")
      .evaluateAll((elements) =>
        elements.map((element) =>
          [
            element.tagName,
            element.getAttribute("data-layout-recipe") ?? "",
            element.getAttribute("data-ly-area") ?? "",
          ].join("|"),
        ),
      );

  const initialGeometry = await readGeometry();
  const initialDom = await readDomSignature();
  const initialTabOrder = await readWorkbenchTabOrder(page, shell);

  await layoutSelect.selectOption("split-screen");
  await expect(root).toHaveAttribute("data-ly-layout", "split-screen");
  await expect(page.locator("[data-ly-layout]")).toHaveCount(1);

  const changedGeometry = await readGeometry();
  expect(changedGeometry.shellAreas).not.toBe(initialGeometry.shellAreas);
  expect(changedGeometry.shellColumns).not.toBe(initialGeometry.shellColumns);
  expect(changedGeometry.gridColumns).not.toBe(initialGeometry.gridColumns);
  expect(await readDomSignature()).toEqual(initialDom);
  expect(await readWorkbenchTabOrder(page, shell)).toEqual(initialTabOrder);

  for (const personality of layoutPersonalities) {
    await layoutSelect.selectOption(personality);
    await expect(root).toHaveAttribute("data-ly-layout", personality);
  }
});

test("layout laboratory uses only the active UI prefix for pill actions", async ({
  page,
}) => {
  const pill = page.getByRole("button", { name: "Approve project direction" });
  await expect(pill).toHaveClass(/\bsaas-button-pill\b/);
  await expect(pill).not.toHaveClass(/\binteractive-surface\b/);

  const initialGeometry = await pill.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      alignItems: style.alignItems,
      blockSize: bounds.height,
      display: style.display,
      justifyContent: style.justifyContent,
      paddingInlineEnd: Number.parseFloat(style.paddingInlineEnd),
      paddingInlineStart: Number.parseFloat(style.paddingInlineStart),
      textAlign: style.textAlign,
    };
  });
  expect(initialGeometry).toMatchObject({
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  });
  expect(["flex", "inline-flex"]).toContain(initialGeometry.display);
  expect(initialGeometry.blockSize).toBeGreaterThanOrEqual(44);
  expect(initialGeometry.paddingInlineStart).toBeGreaterThan(0);
  expect(initialGeometry.paddingInlineEnd).toBeGreaterThan(0);

  await page.getByLabel(/02.*Visual style/).selectOption("retro-glass");
  await expect(pill).toHaveClass(/\brg-button-pill\b/);
  await expect(pill).not.toHaveClass(/\bsaas-button-pill\b/);
  const prefixedPillClasses = (await pill.getAttribute("class"))
    ?.split(/\s+/)
    .filter((className) => className.endsWith("-button-pill"));
  expect(prefixedPillClasses).toEqual(["rg-button-pill"]);
});

test("layout laboratory remains overflow-free with every disclosure open", async ({
  page,
}) => {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("./");
    await expect(page.locator("#layouts details")).toHaveCount(3);
    await expect(page.locator("#layouts [data-layout-recipe]")).toHaveCount(6);
    await openLayoutDetails(page);

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

    const oversizedSpecimens = await page
      .locator(
        "#layouts [data-layout-recipe], #layouts [data-layout-primitive]",
      )
      .evaluateAll((elements) =>
        elements
          .map((element) => ({
            name:
              element.getAttribute("data-layout-recipe") ??
              element.getAttribute("data-layout-primitive"),
            right: element.getBoundingClientRect().right,
            width: element.getBoundingClientRect().width,
          }))
          .filter(
            ({ right, width }) =>
              width > window.innerWidth + 1 || right > window.innerWidth + 1,
          ),
      );
    expect(oversizedSpecimens).toEqual([]);
  }
});
