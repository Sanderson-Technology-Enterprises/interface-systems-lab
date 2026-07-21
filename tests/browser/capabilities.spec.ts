import { createRequire } from "node:module";

import { expect, type Locator, type Page, test } from "@playwright/test";

type PublishedUiManifest = {
  classApi: {
    presetExtras: Record<string, string[]>;
    universalVisualSuffixes: string[];
  };
  modes: string[];
  presets: { id: string; prefix: string }[];
  themes: string[];
};

const requireFromTest = createRequire(import.meta.url);
const uiManifest = requireFromTest(
  "ui-style-kit-css/manifest.json",
) as PublishedUiManifest;

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

const alignmentUtilities = [
  "ly-items-start",
  "ly-items-center",
  "ly-items-end",
  "ly-items-stretch",
  "ly-justify-start",
  "ly-justify-center",
  "ly-justify-end",
  "ly-justify-between",
] as const;

const interactionVariants = [
  "primary",
  "secondary",
  "accent",
  "subtle",
  "warning",
  "danger",
] as const;

const interactionLevels = ["1", "2", "3"] as const;

const nativeInputTypes = [
  "text",
  "search",
  "email",
  "url",
  "tel",
  "password",
  "number",
  "date",
  "time",
  "datetime-local",
  "month",
  "week",
  "color",
  "file",
  "range",
] as const;

const uiCategories = [
  "typography",
  "surfaces",
  "buttons",
  "feedback",
  "badges",
  "fields",
  "choices",
  "switch",
  "progress",
  "spinner",
  "tooltips",
  "data",
  "helpers",
  "preset-extra",
  "native-support",
] as const;

const nativeStates = [
  "readonly",
  "required",
  "valid",
  "aria-invalid",
  "is-invalid",
  "user-invalid",
  "disabled",
  "active",
  "indeterminate",
] as const;

const interactionStates = [
  "aria-pressed",
  "aria-selected",
  "aria-current",
  "aria-busy",
  "aria-disabled",
  "native-disabled",
  "is-active",
  "is-loading",
  "is-disabled",
] as const;

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

async function readPaintSignature(locator: Locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return [
      style.backgroundColor,
      style.backgroundImage,
      style.borderColor,
      style.borderRadius,
      style.boxShadow,
      style.color,
      style.fontFamily,
    ].join("|");
  });
}

async function readInteractionSignature(locator: Locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    const layer = getComputedStyle(element, "::before");
    return {
      boxShadow: style.boxShadow,
      layerDisplay: layer.display,
      layerOpacity: Number.parseFloat(layer.opacity),
      opacity: Number.parseFloat(style.opacity),
      outlineColor: style.outlineColor,
      outlineStyle: style.outlineStyle,
      pointerEvents: style.pointerEvents,
      rotate: style.rotate,
      scale: style.scale,
      transform: style.transform,
      transitionDuration: style.transitionDuration,
      translate: style.translate,
    };
  });
}

async function openTask4Details(page: Page) {
  await page
    .locator("#ui-native details, #interactions details")
    .evaluateAll((details) => {
      for (const detail of details) (detail as HTMLDetailsElement).open = true;
    });
}

async function clickDialogBackdrop(page: Page, dialog: Locator) {
  const bounds = await dialog.boundingBox();
  expect(bounds).not.toBeNull();
  if (bounds === null) return;

  const clickPoint = {
    x: Math.max(1, bounds.x / 2),
    y: bounds.y + bounds.height / 2,
  };
  expect(clickPoint.x).toBeLessThan(bounds.x);
  await page.mouse.click(clickPoint.x, clickPoint.y);
}

async function readPseudoSignature(locator: Locator, pseudo: string) {
  return locator.evaluate((element, pseudoElement) => {
    const style = getComputedStyle(element, pseudoElement);
    return {
      appearance: style.appearance,
      backgroundColor: style.backgroundColor,
      blockSize: style.blockSize,
      borderColor: style.borderColor,
      borderRadius: style.borderRadius,
      boxShadow: style.boxShadow,
      color: style.color,
      cursor: style.cursor,
      filter: style.filter,
      inlineSize: style.inlineSize,
    };
  }, pseudo);
}

async function readAuthorRule(
  page: Page,
  selectorFragment: string,
  properties: string[],
) {
  return page.evaluate(
    ({ properties: requestedProperties, selectorFragment: fragment }) => {
      const visitRules = (
        rules: CSSRuleList,
      ): Record<string, string> | null => {
        for (const rule of rules) {
          if (
            rule instanceof CSSStyleRule &&
            rule.selectorText.includes(fragment)
          ) {
            return Object.fromEntries(
              requestedProperties.map((property) => [
                property,
                rule.style.getPropertyValue(property).trim(),
              ]),
            );
          }

          if ("cssRules" in rule) {
            const nested = visitRules((rule as CSSGroupingRule).cssRules);
            if (nested !== null) return nested;
          }
        }

        return null;
      };

      for (const styleSheet of document.styleSheets) {
        const match = visitRules(styleSheet.cssRules);
        if (match !== null) return match;
      }

      throw new Error(`Missing author rule containing ${fragment}.`);
    },
    { properties, selectorFragment },
  );
}

async function finishElementAnimations(locator: Locator) {
  await locator.evaluate(async (element) => {
    await Promise.all(
      element.getAnimations({ subtree: true }).map(async (animation) => {
        try {
          await animation.finished;
        } catch {
          // A superseded transition is expected to reject its finished promise.
        }
      }),
    );
  });
}

async function resolveComputedValue(
  locator: Locator,
  value: string,
  cssProperty: string,
) {
  return locator.evaluate(
    (element, options) => {
      const probe = document.createElement("span");
      probe.style.position = "fixed";
      probe.style.visibility = "hidden";
      probe.style.setProperty(options.cssProperty, options.value);
      (element.parentElement ?? document.body).append(probe);
      const resolved = getComputedStyle(probe)
        .getPropertyValue(options.cssProperty)
        .trim();
      probe.remove();
      return resolved;
    },
    { cssProperty, value },
  );
}

async function readUnthemedPseudoProperty(
  locator: Locator,
  pseudo: string,
  cssProperty: string,
) {
  return locator.evaluate(
    (element, options) => {
      const root = element.closest<HTMLElement>(
        "[data-ui][data-theme][data-mode]",
      );
      if (root === null) throw new Error("Missing configured UI root.");

      const attributes = ["data-ui", "data-theme", "data-mode"] as const;
      const values = attributes.map((attribute) =>
        root.getAttribute(attribute),
      );
      for (const attribute of attributes) root.removeAttribute(attribute);

      const baseline = getComputedStyle(element, options.pseudo)
        .getPropertyValue(options.cssProperty)
        .trim();

      attributes.forEach((attribute, index) => {
        const value = values[index];
        if (value !== null) root.setAttribute(attribute, value);
      });
      return baseline;
    },
    { cssProperty, pseudo },
  );
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
  const renderedAlignmentUtilities = await page
    .locator("[data-alignment-utility]")
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("data-alignment-utility")),
    );
  expect(renderedAlignmentUtilities).toEqual(alignmentUtilities);

  await expect(page.locator('[data-layout-primitive="grid"]')).toBeVisible();
  await expect(page.locator("#layouts details")).toHaveCount(3);
  await expect(
    page.locator("#layouts details [data-layout-primitive]"),
  ).not.toHaveCount(0);
});

test("layout laboratory applies every personality without changing DOM or tab order", async ({
  page,
}, testInfo) => {
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
  const readGeometry = () =>
    page.evaluate(() => {
      const shellElement = document.querySelector<HTMLElement>(
        '[data-layout-recipe="app-shell"]',
      );
      const gridElement = document.querySelector<HTMLElement>(
        '[data-layout-primitive="grid"]',
      );
      if (shellElement === null || gridElement === null) {
        throw new Error(
          "Expected personality-sensitive specimens are missing.",
        );
      }

      const shellStyle = getComputedStyle(shellElement);
      const gridStyle = getComputedStyle(gridElement);
      const gridItems = Array.from(gridElement.children)
        .slice(0, 5)
        .map((element) => {
          const style = getComputedStyle(element);
          return {
            columnEnd: style.gridColumnEnd,
            columnStart: style.gridColumnStart,
            rowEnd: style.gridRowEnd,
            rowStart: style.gridRowStart,
          };
        });

      return {
        grid: {
          columnGap: gridStyle.columnGap,
          columns: gridStyle.gridTemplateColumns,
          display: gridStyle.display,
          items: gridItems,
          rowGap: gridStyle.rowGap,
        },
        shell: {
          areas: shellStyle.gridTemplateAreas,
          columnGap: shellStyle.columnGap,
          columns: shellStyle.gridTemplateColumns,
          display: shellStyle.display,
          rowGap: shellStyle.rowGap,
          rows: shellStyle.gridTemplateRows,
        },
      };
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

  const initialDom = await readDomSignature();
  const initialTabOrder = await readWorkbenchTabOrder(page, shell);

  const configuredLayout = await root.getAttribute("data-ly-layout");
  expect(configuredLayout).not.toBeNull();
  await root.evaluate((element) => element.removeAttribute("data-ly-layout"));
  await expect(root).not.toHaveAttribute("data-ly-layout");
  const unpersonalizedGeometry = await readGeometry();
  await root.evaluate((element, layout) => {
    if (layout !== null) element.setAttribute("data-ly-layout", layout);
  }, configuredLayout);

  const geometryByPersonality: Record<
    string,
    Awaited<ReturnType<typeof readGeometry>>
  > = {};

  for (const personality of layoutPersonalities) {
    await layoutSelect.selectOption(personality);
    await expect(root).toHaveAttribute("data-ly-layout", personality);
    await expect(page.locator("[data-ly-layout]")).toHaveCount(1);

    const geometry = await readGeometry();
    geometryByPersonality[personality] = geometry;
    expect(
      geometry,
      `${personality} matched the unpersonalized geometry: ${JSON.stringify(
        unpersonalizedGeometry,
      )}`,
    ).not.toEqual(unpersonalizedGeometry);
    expect(await readDomSignature()).toEqual(initialDom);
    expect(await readWorkbenchTabOrder(page, shell)).toEqual(initialTabOrder);
  }

  await testInfo.attach("layout-personality-geometry.json", {
    body: JSON.stringify(
      { personalities: geometryByPersonality, unpersonalizedGeometry },
      null,
      2,
    ),
    contentType: "application/json",
  });
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

test("UI, native, and interaction laboratories stay overflow-free and error-free with every disclosure open", async ({
  page,
}) => {
  const runtimeErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  for (const viewport of [
    { width: 305, height: 568 },
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("./");
    await page
      .locator("#ui-native details, #interactions details")
      .evaluateAll((details) => {
        for (const detail of details)
          (detail as HTMLDetailsElement).open = true;
      });

    await expect(
      page.getByRole("heading", { name: /UI laboratory/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /native laboratory/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /interaction laboratory/i }),
    ).toBeVisible();

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  }

  expect(runtimeErrors).toEqual([]);
});

test("UI laboratory applies every manifest preset, theme, and mode with computed paint", async ({
  page,
}) => {
  const root = page.locator(".experience.ly-root");
  const uiSelect = page.getByLabel(/02.*Visual style/);
  const themeSelect = page.getByLabel(/03.*Palette/);
  const paintSpecimen = page.locator('[data-specimen="ui-paint-signature"]');
  const prefixes = uiManifest.presets.map(({ prefix }) => prefix);

  await expect(
    page.getByRole("heading", { name: /UI laboratory/i }),
  ).toBeVisible();
  await expect
    .poll(() =>
      uiSelect
        .locator("option")
        .evaluateAll((options) =>
          options.map((option) => (option as HTMLOptionElement).value),
        ),
    )
    .toEqual(uiManifest.presets.map(({ id }) => id));
  await expect
    .poll(() =>
      themeSelect
        .locator("option")
        .evaluateAll((options) =>
          options.map((option) => (option as HTMLOptionElement).value),
        ),
    )
    .toEqual(uiManifest.themes);

  const presetSignatures = new Map<string, string>();
  for (const preset of uiManifest.presets) {
    await uiSelect.selectOption(preset.id);
    await expect(root).toHaveAttribute("data-ui", preset.id);
    await expect(paintSpecimen).toHaveClass(
      new RegExp(`(?:^|\\s)${preset.prefix}-card(?:\\s|$)`),
    );

    const wrongPrefixClasses = await page
      .locator("#ui-native [class]")
      .evaluateAll(
        (elements, manifestPrefixes) =>
          elements.flatMap((element) =>
            [...element.classList].filter((className) =>
              manifestPrefixes.some(
                (prefix) =>
                  prefix !== manifestPrefixes[0] &&
                  className.startsWith(`${prefix}-`),
              ),
            ),
          ),
        [
          preset.prefix,
          ...prefixes.filter((prefix) => prefix !== preset.prefix),
        ],
      );
    expect(
      wrongPrefixClasses,
      `${preset.id} leaked an inactive prefix`,
    ).toEqual([]);

    await page.waitForTimeout(180);
    presetSignatures.set(preset.id, await readPaintSignature(paintSpecimen));

    const renderedExtras = await page
      .locator("#ui-native [data-ui-extra]")
      .evaluateAll((elements) =>
        elements.map((element) => element.getAttribute("data-ui-extra")),
      );
    const extraKey = preset.id as keyof typeof uiManifest.classApi.presetExtras;
    expect(renderedExtras).toEqual(uiManifest.classApi.presetExtras[extraKey]);
  }
  expect(new Set(presetSignatures.values()).size).toBe(
    uiManifest.presets.length,
  );

  await uiSelect.selectOption("minimal-saas");
  const themeSignatures = new Map<string, string>();
  for (const theme of uiManifest.themes) {
    await themeSelect.selectOption(theme);
    await expect(root).toHaveAttribute("data-theme", theme);
    await page.waitForTimeout(180);
    themeSignatures.set(theme, await readPaintSignature(paintSpecimen));
  }
  expect(new Set(themeSignatures.values()).size).toBe(uiManifest.themes.length);

  await themeSelect.selectOption("arctic-indigo");
  const modeSignatures = new Map<string, string>();
  for (const mode of uiManifest.modes) {
    const label = mode === "contrast" ? "High contrast" : mode;
    await page.getByRole("radio", { name: label, exact: false }).check();
    await expect(root).toHaveAttribute("data-mode", mode);
    await page.waitForTimeout(180);
    modeSignatures.set(mode, await readPaintSignature(paintSpecimen));
  }
  expect(new Set(modeSignatures.values()).size).toBe(uiManifest.modes.length);
});

test("UI laboratory renders the universal visual categories and standalone button pill", async ({
  page,
}) => {
  await page.locator("#ui-native details").evaluateAll((details) => {
    for (const detail of details) (detail as HTMLDetailsElement).open = true;
  });

  const categories = await page
    .locator("#ui-native [data-ui-category]")
    .evaluateAll((elements) => [
      ...new Set(
        elements.map((element) => element.getAttribute("data-ui-category")),
      ),
    ]);
  expect(categories).toEqual(uiCategories);

  const renderedSuffixes = await page
    .locator("#ui-native [data-ui-suffix]")
    .evaluateAll((elements) => [
      ...new Set(
        elements.map((element) => element.getAttribute("data-ui-suffix")),
      ),
    ]);
  expect(renderedSuffixes.toSorted()).toEqual(
    uiManifest.classApi.universalVisualSuffixes.toSorted(),
  );

  const invalidSuffixClasses = await page
    .locator("#ui-native [data-ui-suffix]")
    .evaluateAll((elements) =>
      elements
        .map((element) => {
          const suffix = element.getAttribute("data-ui-suffix");
          return {
            classes: [...element.classList],
            suffix,
          };
        })
        .filter(
          ({ classes, suffix }) =>
            suffix === null || !classes.includes(`saas-${suffix}`),
        ),
    );
  expect(invalidSuffixClasses).toEqual([]);

  const pill = page.getByRole("button", {
    name: "Run visual system review",
  });
  await expect(pill).toHaveClass(/\bsaas-button-pill\b/);
  await expect(pill).not.toHaveClass(/\binteractive-surface\b/);
  const pillGeometry = await pill.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      alignItems: style.alignItems,
      blockSize: bounds.height,
      display: style.display,
      justifyContent: style.justifyContent,
      paddingEnd: Number.parseFloat(style.paddingInlineEnd),
      paddingStart: Number.parseFloat(style.paddingInlineStart),
      textAlign: style.textAlign,
    };
  });
  expect(pillGeometry).toMatchObject({
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  });
  expect(["flex", "inline-flex"]).toContain(pillGeometry.display);
  expect(pillGeometry.blockSize).toBeGreaterThanOrEqual(44);
  expect(pillGeometry.paddingStart).toBeGreaterThan(0);
  expect(pillGeometry.paddingEnd).toBeGreaterThan(0);
});

test("UI laboratory positions all four tooltip directions from real anchors", async ({
  page,
}) => {
  await page.locator("#ui-native details").evaluateAll((details) => {
    for (const detail of details) (detail as HTMLDetailsElement).open = true;
  });

  for (const position of ["top", "right", "bottom", "left"] as const) {
    const anchor = page.locator(
      `[data-tooltip-position="${position}"][data-ui-tooltip-anchor]`,
    );
    const tooltip = anchor.getByRole("tooltip");
    await expect(anchor).toHaveCount(1);
    await expect(tooltip).toHaveClass(/\bsaas-tooltip\b/);
    await expect(tooltip).toHaveClass(
      new RegExp(`(?:^|\\s)saas-tooltip-${position}(?:\\s|$)`),
    );
    await expect(tooltip.locator(".saas-tooltip-arrow")).toHaveCount(1);

    const geometry = await anchor.evaluate((element, side) => {
      const anchorBounds = element.getBoundingClientRect();
      const tooltipElement =
        element.querySelector<HTMLElement>('[role="tooltip"]');
      if (tooltipElement === null) throw new Error(`Missing ${side} tooltip.`);
      const tooltipBounds = tooltipElement.getBoundingClientRect();
      return { anchorBounds, tooltipBounds };
    }, position);

    if (position === "top") {
      expect(geometry.tooltipBounds.bottom).toBeLessThanOrEqual(
        geometry.anchorBounds.top,
      );
    } else if (position === "right") {
      expect(geometry.tooltipBounds.left).toBeGreaterThanOrEqual(
        geometry.anchorBounds.right,
      );
    } else if (position === "bottom") {
      expect(geometry.tooltipBounds.top).toBeGreaterThanOrEqual(
        geometry.anchorBounds.bottom,
      );
    } else {
      expect(geometry.tooltipBounds.right).toBeLessThanOrEqual(
        geometry.anchorBounds.left,
      );
    }
  }
});

test("native laboratory exercises native controls, exposed parts, and validation states", async ({
  page,
}) => {
  await page.locator("#ui-native details").evaluateAll((details) => {
    for (const detail of details) (detail as HTMLDetailsElement).open = true;
  });
  await expect(
    page.getByRole("heading", { name: /native laboratory/i }),
  ).toBeVisible();

  const renderedInputTypes = await page
    .locator("#ui-native [data-native-type]")
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("data-native-type")),
    );
  expect(renderedInputTypes).toEqual(nativeInputTypes);
  await expect(page.locator("#ui-native datalist")).toHaveCount(1);
  await expect(page.locator("#ui-native select optgroup")).toHaveCount(2);
  await expect(page.locator("#ui-native textarea[placeholder]")).toHaveCount(1);
  await expect(
    page.getByText(/popup remains platform-owned/i).first(),
  ).toBeVisible();

  for (const state of nativeStates) {
    await expect(page.locator(`[data-native-state="${state}"]`)).toHaveCount(1);
  }
  await expect(
    page.locator('[data-native-state="indeterminate"]'),
  ).toHaveJSProperty("indeterminate", true);

  const userInvalid = page.locator('[data-native-state="user-invalid"]');
  const explicitInvalid = page.locator('[data-native-state="aria-invalid"]');
  const untouchedState = await userInvalid.evaluate((element) => ({
    borderColor: getComputedStyle(element).borderColor,
    invalid: element.matches(":invalid"),
    userInvalid: element.matches(":user-invalid"),
  }));
  expect(untouchedState.invalid).toBe(true);
  expect(untouchedState.userInvalid).toBe(false);
  expect(untouchedState.borderColor).not.toBe(
    await explicitInvalid.evaluate(
      (element) => getComputedStyle(element).borderColor,
    ),
  );

  await page.getByRole("button", { name: "Validate native field" }).click();
  await expect
    .poll(() =>
      userInvalid.evaluate((element) => element.matches(":user-invalid")),
    )
    .toBe(true);
  await expect
    .poll(() =>
      userInvalid.evaluate((element) => getComputedStyle(element).borderColor),
    )
    .toBe(
      await explicitInvalid.evaluate(
        (element) => getComputedStyle(element).borderColor,
      ),
    );

  const fileInput = page.locator('[data-native-type="file"]');
  const fileButtonPaint = await fileInput.evaluate((element) => {
    const style = getComputedStyle(element, "::file-selector-button");
    return {
      backgroundColor: style.backgroundColor,
      borderColor: style.borderColor,
      cursor: style.cursor,
    };
  });
  expect(fileButtonPaint.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(fileButtonPaint.borderColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(fileButtonPaint.cursor).toBe("pointer");

  const range = page.locator('[data-native-part~="range-track"]');
  const rangeParts = await range.evaluate((element) => ({
    thumb: getComputedStyle(element, "::-webkit-slider-thumb").appearance,
    track: getComputedStyle(element, "::-webkit-slider-runnable-track")
      .borderRadius,
  }));
  expect(rangeParts.thumb).not.toBe("");
  expect(rangeParts.track).not.toBe("");

  const summary = page.locator('[data-native-part~="summary-marker"]');
  const listItem = page.locator('[data-native-part~="list-marker"]');
  expect(
    await summary.evaluate(
      (element) => getComputedStyle(element, "::marker").color,
    ),
  ).not.toBe("");
  expect(
    await listItem.evaluate(
      (element) => getComputedStyle(element, "::marker").color,
    ),
  ).not.toBe("");

  await expect(page.locator("#ui-native progress")).toHaveCount(2);
  await expect(page.locator("#ui-native meter")).toHaveCount(3);
  await expect(page.locator("#ui-native output")).toContainText(/\d+/);

  const activeButton = page.locator('[data-native-state="active"]');
  const baseFilter = await activeButton.evaluate(
    (element) => getComputedStyle(element).filter,
  );
  const bounds = await activeButton.boundingBox();
  expect(bounds).not.toBeNull();
  if (bounds !== null) {
    await page.mouse.move(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
    );
    await page.mouse.down();
    expect(
      await activeButton.evaluate(
        (element) => getComputedStyle(element).filter,
      ),
    ).not.toBe(baseFilter);
    await page.mouse.up();
  }
});

test("native laboratory uses a real modal dialog and restores opener focus", async ({
  page,
}) => {
  await page.locator("#ui-native details").evaluateAll((details) => {
    for (const detail of details) (detail as HTMLDetailsElement).open = true;
  });
  const opener = page.getByRole("button", { name: "Open native dialog" });
  const dialog = page.locator('dialog[data-native-part~="dialog-backdrop"]');

  await opener.click();
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveJSProperty("open", true);
  expect(await dialog.evaluate((element) => element.matches(":modal"))).toBe(
    true,
  );
  expect(
    await dialog.evaluate(
      (element) => getComputedStyle(element, "::backdrop").backgroundColor,
    ),
  ).not.toBe("rgba(0, 0, 0, 0)");

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();

  await opener.click();
  await dialog.getByRole("button", { name: "Close native dialog" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  await expect(dialog).toHaveJSProperty("returnValue", "confirmed");

  await opener.click();
  await clickDialogBackdrop(page, dialog);
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  await expect(dialog).toHaveJSProperty("returnValue", "backdrop");
});

test("interaction laboratory exposes every variant, level, and public state hook", async ({
  page,
}) => {
  await expect(
    page.getByRole("heading", { name: /interaction laboratory/i }),
  ).toBeVisible();

  const variants = page.locator("[data-interaction-variant]");
  await expect(variants).toHaveCount(interactionVariants.length);
  expect(
    await variants.evaluateAll((elements) =>
      elements.map((element) => ({
        level: element.getAttribute("data-surface-level"),
        variant: element.getAttribute("data-surface-variant"),
      })),
    ),
  ).toEqual(interactionVariants.map((variant) => ({ level: "2", variant })));

  const levels = page.locator("[data-interaction-level]");
  await expect(levels).toHaveCount(interactionLevels.length);
  expect(
    await levels.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("data-surface-level")),
    ),
  ).toEqual(interactionLevels);

  const newInteractiveSurfaces = page.locator(
    "#ui-native .interactive-surface, #interactions .interactive-surface",
  );
  const incompleteSurfaces = await newInteractiveSurfaces.evaluateAll(
    (elements) =>
      elements
        .map((element) => ({
          classes: [...element.classList],
          label: element.textContent?.trim(),
          level: element.getAttribute("data-surface-level"),
          variant: element.getAttribute("data-surface-variant"),
        }))
        .filter(
          ({ classes, level, variant }) =>
            !classes.includes("site-action") ||
            level === null ||
            variant === null,
        ),
  );
  expect(incompleteSurfaces).toEqual([]);

  for (const state of interactionStates) {
    await expect(
      page.locator(`[data-interaction-state="${state}"]`),
    ).toHaveCount(1);
  }
  await expect(
    page.locator('[data-interaction-state="aria-pressed"]'),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.locator('[data-interaction-state="aria-selected"]'),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.locator('[data-interaction-state="aria-current"]'),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page.locator('[data-interaction-state="aria-busy"]'),
  ).toHaveAttribute("aria-busy", "true");
  await expect(
    page.locator('[data-interaction-state="aria-disabled"]'),
  ).toHaveAttribute("aria-disabled", "true");
  await expect(
    page.locator('[data-interaction-state="native-disabled"]'),
  ).toBeDisabled();
  await expect(
    page.locator('[data-interaction-state="is-active"]'),
  ).toHaveClass(/\bis-active\b/);
  await expect(
    page.locator('[data-interaction-state="is-loading"]'),
  ).toHaveClass(/\bis-loading\b/);
  await expect(
    page.locator('[data-interaction-state="is-disabled"]'),
  ).toHaveClass(/\bis-disabled\b/);

  await expect(page.locator("[data-guarded-activation-count]")).toHaveText("0");
  await expect(page.locator("[data-guarded-action]")).toHaveCount(4);
});

test("interaction laboratory makes real state-collision precedence observable", async ({
  page,
}) => {
  const target = page.locator('[data-interaction-state="collision"]');
  const winner = page.locator("[data-collision-winner]");
  const persistent = page.getByRole("radiogroup", {
    name: "Persistent collision state",
  });
  const supportsFineHover = await page.evaluate(
    () => matchMedia("(hover: hover) and (pointer: fine)").matches,
  );

  await expect(winner).toHaveText("base");
  const base = await readInteractionSignature(target);
  expect(base.transform).not.toBe("none");
  expect(base.scale).not.toBe("none");
  expect(base.rotate).not.toBe("none");

  await target.hover();
  await expect(winner).toHaveText(supportsFineHover ? "hover" : "base");
  const hovered = await readInteractionSignature(target);
  if (supportsFineHover) {
    expect(hovered.layerOpacity).toBeGreaterThan(base.layerOpacity);
    expect(hovered.translate).not.toBe(base.translate);
  } else {
    expect(hovered.layerOpacity).toBe(base.layerOpacity);
    expect(hovered.translate).toBe(base.translate);
  }
  expect(hovered.transform).toBe(base.transform);
  expect(hovered.scale).toBe(base.scale);
  expect(hovered.rotate).toBe(base.rotate);

  const bounds = await target.boundingBox();
  expect(bounds).not.toBeNull();
  if (bounds !== null) {
    await page.mouse.move(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
    );
    await page.mouse.down();
    await expect(winner).toHaveText("active");
    await expect
      .poll(async () => (await readInteractionSignature(target)).translate)
      .toBe(base.translate);
    await expect
      .poll(async () => (await readInteractionSignature(target)).layerOpacity)
      .toBe(base.layerOpacity);
    await page.mouse.up();
  }

  await persistent.getByRole("radio", { name: "Pressed" }).check();
  await target.hover();
  await expect(winner).toHaveText("pressed");
  const pressed = await readInteractionSignature(target);
  expect(pressed.layerOpacity).toBeGreaterThan(base.layerOpacity);

  await page.getByRole("checkbox", { name: "Busy" }).check();
  await expect(winner).toHaveText("busy");
  await expect(target).toHaveAttribute("aria-busy", "true");

  await page.getByRole("checkbox", { name: "Disabled" }).check();
  await expect(winner).toHaveText("disabled");
  await expect(target).toHaveAttribute("aria-disabled", "true");
  const disabled = await readInteractionSignature(target);
  expect(disabled.pointerEvents).toBe("none");
  expect(disabled.opacity).toBeLessThan(1);
  expect(disabled.layerOpacity).toBe(0);
  expect(disabled.translate).toBe("none");
  expect(disabled.boxShadow).toBe("none");
});

test("interaction laboratory keeps focus independent and honors reduced motion", async ({
  page,
}) => {
  await page.locator("#interactions details").evaluateAll((details) => {
    for (const detail of details) (detail as HTMLDetailsElement).open = true;
  });
  const pressed = page.locator('[data-interaction-state="aria-pressed"]');
  const beforeFocus = await readInteractionSignature(pressed);
  await pressed.focus();
  expect(
    await pressed.evaluate((element) => element.matches(":focus-visible")),
  ).toBe(true);
  const focused = await readInteractionSignature(pressed);
  expect(focused.outlineStyle).not.toBe("none");
  expect(focused.layerOpacity).toBe(beforeFocus.layerOpacity);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await page.locator("#interactions details").evaluateAll((details) => {
    for (const detail of details) (detail as HTMLDetailsElement).open = true;
  });
  const reducedPressed = page.locator(
    '[data-interaction-state="aria-pressed"]',
  );
  await reducedPressed.focus();
  const reduced = await readInteractionSignature(reducedPressed);
  expect(
    reduced.transitionDuration
      .split(",")
      .every((value) => Number.parseFloat(value) <= 0.001),
  ).toBe(true);
  expect(reduced.translate).toBe("none");
  expect(reduced.layerOpacity).toBeGreaterThan(0);
  expect(reduced.outlineStyle).not.toBe("none");
});

test("interaction laboratory uses system affordances in forced colors", async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.reload();
  await openTask4Details(page);

  const pressed = page.locator('[data-interaction-state="aria-pressed"]');
  const disabled = page.locator('[data-interaction-state="aria-disabled"]');
  await pressed.focus();
  await expect(pressed).toBeVisible();
  await expect(pressed).toBeFocused();
  expect(
    await pressed.evaluate((element) => element.matches(":focus-visible")),
  ).toBe(true);
  const pressedStyles = await readInteractionSignature(pressed);
  const disabledStyles = await readInteractionSignature(disabled);
  expect(pressedStyles.layerDisplay).toBe("none");
  expect(pressedStyles.boxShadow).toBe("none");
  expect(pressedStyles.outlineStyle).not.toBe("none");
  expect(disabledStyles.opacity).toBe(1);
  expect(disabledStyles.outlineStyle).not.toBe("none");
});

test("review contract composes copy typography on body text with meaningful paint", async ({
  page,
}) => {
  await openTask4Details(page);
  const copy = page.locator('[data-ui-suffix="copy"]');
  const baseline = page.locator("[data-typography-baseline]");
  await expect(copy).toHaveCount(1);
  await expect(copy).toHaveJSProperty("tagName", "P");
  await expect(baseline).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Copy token" }),
  ).not.toHaveClass(/\bsaas-copy\b/);

  const copyTypography = await copy.evaluate((element) => {
    const style = getComputedStyle(element);
    return { color: style.color, lineHeight: style.lineHeight };
  });
  const baselineTypography = await baseline.evaluate((element) => {
    const style = getComputedStyle(element);
    return { color: style.color, lineHeight: style.lineHeight };
  });
  expect(copyTypography.lineHeight).not.toBe(baselineTypography.lineHeight);
});

test("review contract proves native pseudo parts against package tokens and real file states", async ({
  page,
}) => {
  await openTask4Details(page);

  const range = page.locator('[data-native-part~="range-track"]');
  const trackRule = await readAuthorRule(
    page,
    "::-webkit-slider-runnable-track",
    ["background", "block-size", "border-radius"],
  );
  const thumbRule = await readAuthorRule(page, "::-webkit-slider-thumb", [
    "appearance",
    "background",
    "block-size",
    "border",
    "border-radius",
    "inline-size",
  ]);
  const trackToken = await resolveComputedValue(
    range,
    "var(--usk-native-track)",
    "background-color",
  );
  const thumbToken = await resolveComputedValue(
    range,
    "var(--usk-native-thumb)",
    "background-color",
  );
  const thumbBorderToken = await resolveComputedValue(
    range,
    "var(--usk-native-thumb-border)",
    "border-color",
  );
  expect(trackRule).toEqual({
    background: "var(--usk-native-track)",
    "block-size": "0.45rem",
    "border-radius": "999px",
  });
  expect(thumbRule).toEqual({
    appearance: "none",
    background: "var(--usk-native-thumb)",
    "block-size": "1.2rem",
    border:
      "var(--usk-native-border-width) solid var(--usk-native-thumb-border)",
    "border-radius": "999px",
    "inline-size": "1.2rem",
  });
  expect(trackToken).not.toBe(thumbToken);
  expect(thumbToken).not.toBe(thumbBorderToken);
  expect(
    await range.evaluate((element) => getComputedStyle(element).appearance),
  ).toBe("none");

  const indicatorToken = await resolveComputedValue(
    range,
    "var(--usk-native-indicator)",
    "color",
  );
  for (const locator of [
    page.locator('[data-native-part~="summary-marker"]'),
    page.locator('[data-native-part~="list-marker"]'),
  ]) {
    const markerColor = (await readPseudoSignature(locator, "::marker")).color;
    expect.soft(markerColor).toBe(indicatorToken);
    expect
      .soft(markerColor)
      .not.toBe(await readUnthemedPseudoProperty(locator, "::marker", "color"));
  }

  const fileStates = page.locator("[data-native-file-state]");
  await expect(fileStates).toHaveCount(5);
  expect(
    await fileStates.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("data-native-file-state")),
    ),
  ).toEqual(["enabled", "focus", "hover", "active", "disabled"]);

  const enabled = page.locator('[data-native-file-state="enabled"]');
  const focus = page.locator('[data-native-file-state="focus"]');
  const hover = page.locator('[data-native-file-state="hover"]');
  const active = page.locator('[data-native-file-state="active"]');
  const disabled = page.locator('[data-native-file-state="disabled"]');
  const primary = await resolveComputedValue(
    enabled,
    "var(--usk-native-primary)",
    "background-color",
  );
  const primaryHover = await resolveComputedValue(
    enabled,
    "var(--usk-native-primary-hover)",
    "background-color",
  );
  const focusRing = await resolveComputedValue(
    enabled,
    "var(--usk-native-focus-ring)",
    "box-shadow",
  );

  const enabledPaint = await readPseudoSignature(
    enabled,
    "::file-selector-button",
  );
  expect(enabledPaint.backgroundColor).toBe(primary);
  expect(enabledPaint.borderColor).toBe(primary);
  expect(enabledPaint.cursor).toBe("pointer");

  await focus.focus();
  expect(
    await focus.evaluate((element) => element.matches(":focus-visible")),
  ).toBe(true);
  expect(
    (await readPseudoSignature(focus, "::file-selector-button")).boxShadow,
  ).toBe(focusRing);

  await hover.hover();
  const hoverPaint = await readPseudoSignature(hover, "::file-selector-button");
  expect(hoverPaint.backgroundColor).toBe(primaryHover);
  expect(hoverPaint.borderColor).toBe(primaryHover);

  const activeBounds = await active.boundingBox();
  expect(activeBounds).not.toBeNull();
  if (activeBounds !== null) {
    const activePoint = {
      // The native chooser button occupies the inline-start portion of the control.
      x: activeBounds.x + Math.min(24, activeBounds.width / 2),
      y: activeBounds.y + activeBounds.height / 2,
    };
    const usesCoarsePointer = await page.evaluate(
      () => matchMedia("(pointer: coarse)").matches,
    );

    if (usesCoarsePointer) {
      const cdp = await page.context().newCDPSession(page);
      await cdp.send("DOM.enable");
      await cdp.send("CSS.enable");
      const { root } = await cdp.send("DOM.getDocument");
      const { nodeId } = await cdp.send("DOM.querySelector", {
        nodeId: root.nodeId,
        selector: '[data-native-file-state="active"]',
      });
      expect(nodeId).not.toBe(0);

      // Mobile Chromium does not expose a held native file control through
      // emulated touch, so force the browser pseudo-state and inspect its paint.
      await cdp.send("CSS.forcePseudoState", {
        nodeId,
        forcedPseudoClasses: ["active"],
      });
      try {
        await expect
          .poll(
            async () =>
              (await readPseudoSignature(active, "::file-selector-button"))
                .filter,
          )
          .toBe("brightness(0.96)");
      } finally {
        await cdp.send("CSS.forcePseudoState", {
          nodeId,
          forcedPseudoClasses: [],
        });
        await cdp.detach();
      }
    } else {
      await page.mouse.move(activePoint.x, activePoint.y);
      await page.mouse.down();
      try {
        await expect
          .poll(
            async () =>
              (await readPseudoSignature(active, "::file-selector-button"))
                .filter,
          )
          .toBe("brightness(0.96)");
      } finally {
        await page.mouse.move(0, 0);
        await page.mouse.up();
      }
    }
  }

  const disabledPaint = await readPseudoSignature(
    disabled,
    "::file-selector-button",
  );
  expect(disabledPaint.backgroundColor).toBe(
    await resolveComputedValue(
      disabled,
      "var(--usk-native-surface-soft)",
      "background-color",
    ),
  );
  expect(disabledPaint.borderColor).toBe(
    await resolveComputedValue(
      disabled,
      "var(--usk-native-border)",
      "border-color",
    ),
  );
  expect(disabledPaint.color).toBe(
    await resolveComputedValue(
      disabled,
      "var(--usk-native-text-muted)",
      "color",
    ),
  );
  expect(disabledPaint.cursor).toBe("not-allowed");
});

test("review contract gates the collision readout with actual hover capability", async ({
  page,
}) => {
  const target = page.locator('[data-interaction-state="collision"]');
  const winner = page.locator("[data-collision-winner]");
  const supportsFineHover = await page.evaluate(
    () => matchMedia("(hover: hover) and (pointer: fine)").matches,
  );

  await target.hover();
  await expect(winner).toHaveText(supportsFineHover ? "hover" : "base");

  const bounds = await target.boundingBox();
  expect(bounds).not.toBeNull();
  if (bounds !== null) {
    await page.mouse.move(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
    );
    await page.mouse.down();
    await expect(winner).toHaveText("active");
    await page.mouse.up();
    await expect(winner).toHaveText(supportsFineHover ? "hover" : "base");
  }
});

test("review contract uses one guarded activation path for enabled and disabled controls", async ({
  page,
}) => {
  await openTask4Details(page);
  const count = page.locator("[data-guarded-activation-count]");
  const enabled = page.locator('[data-guarded-action="enabled"]');
  await expect(count).toHaveText("0");
  await enabled.click();
  await expect(count).toHaveText("1");

  for (const state of [
    "native-disabled",
    "aria-disabled",
    "class-disabled",
  ] as const) {
    const control = page.locator(`[data-guarded-action="${state}"]`);
    await control.scrollIntoViewIfNeeded();
    const bounds = await control.boundingBox();
    expect(bounds).not.toBeNull();
    if (bounds !== null) {
      await page.mouse.click(
        bounds.x + bounds.width / 2,
        bounds.y + bounds.height / 2,
      );
    }
    await expect(count).toHaveText("1");

    await control.focus();
    const focused = await control.evaluate(
      (element) => document.activeElement === element,
    );
    if (state === "native-disabled") {
      expect(focused).toBe(false);
    } else {
      expect(focused).toBe(true);
      await page.keyboard.press("Enter");
      await expect(count).toHaveText("1");
    }

    await control.evaluate((element: HTMLElement) => element.click());
    await expect(count).toHaveText("1");
    await control.evaluate((element) =>
      element.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        }),
      ),
    );
    await expect(count).toHaveText("1");
  }
});

test("review contract proves active over persistent and busy over active paint", async ({
  page,
}) => {
  const target = page.locator('[data-interaction-state="collision"]');
  const winner = page.locator("[data-collision-winner]");
  const persistent = page.getByRole("radiogroup", {
    name: "Persistent collision state",
  });
  const busy = page.getByRole("checkbox", { name: "Busy" });
  const base = await readInteractionSignature(target);

  await persistent.getByRole("radio", { name: "Pressed" }).check();
  await expect(winner).toHaveText("pressed");
  await finishElementAnimations(target);
  await expect
    .poll(async () => (await readInteractionSignature(target)).layerOpacity)
    .toBeGreaterThan(base.layerOpacity);
  const pressed = await readInteractionSignature(target);

  const bounds = await target.boundingBox();
  expect(bounds).not.toBeNull();
  if (bounds !== null) {
    await page.mouse.move(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
    );
    await page.mouse.down();
    await expect(winner).toHaveText("active");
    await expect
      .poll(async () => (await readInteractionSignature(target)).translate)
      .toBe(base.translate);
    await expect
      .poll(async () => (await readInteractionSignature(target)).layerOpacity)
      .toBe(base.layerOpacity);
    await expect
      .poll(async () => (await readInteractionSignature(target)).boxShadow)
      .toBe(base.boxShadow);

    await busy.evaluate((element: HTMLInputElement) => element.click());
    await expect(winner).toHaveText("busy");
    await expect
      .poll(async () => (await readInteractionSignature(target)).translate)
      .toBe(pressed.translate);
    await expect
      .poll(async () => (await readInteractionSignature(target)).layerOpacity)
      .toBe(pressed.layerOpacity);
    await expect
      .poll(async () => (await readInteractionSignature(target)).boxShadow)
      .toBe(pressed.boxShadow);
    await page.mouse.up();
  }
});

test("review contract closes the modal through a real backdrop coordinate", async ({
  page,
}) => {
  await openTask4Details(page);
  const opener = page.getByRole("button", { name: "Open native dialog" });
  const dialog = page.locator('dialog[data-native-part~="dialog-backdrop"]');
  await opener.click();
  await expect(dialog).toBeVisible();
  await clickDialogBackdrop(page, dialog);
  await expect(dialog).not.toBeVisible();
  await expect(dialog).toHaveJSProperty("returnValue", "backdrop");
  await expect(opener).toBeFocused();
});

test("review contract formats camelCase and hyphenated manifest headings", async ({
  page,
}) => {
  await openTask4Details(page);
  for (const heading of [
    "Fully Themed",
    "Progressively Enhanced",
    "Platform Owned",
    "Non Rendered",
    "Standard parts",
    "Vendor Specific parts",
  ]) {
    await expect(
      page.getByRole("heading", { name: heading, exact: true }),
    ).toBeVisible();
  }
});

test("review contract establishes forced-color focus and resolved system outlines", async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.reload();
  await openTask4Details(page);

  const pressed = page.locator('[data-interaction-state="aria-pressed"]');
  const disabled = page.locator('[data-interaction-state="aria-disabled"]');
  await expect(pressed).toBeVisible();
  await pressed.focus();
  await expect(pressed).toBeFocused();
  expect(
    await pressed.evaluate((element) => element.matches(":focus-visible")),
  ).toBe(true);

  const pressedStyles = await readInteractionSignature(pressed);
  const disabledStyles = await readInteractionSignature(disabled);
  expect(pressedStyles.layerDisplay).toBe("none");
  expect(pressedStyles.boxShadow).toBe("none");
  expect(pressedStyles.outlineColor).toBe(
    await resolveComputedValue(pressed, "Highlight", "color"),
  );
  expect(disabledStyles.opacity).toBe(1);
  expect(disabledStyles.outlineColor).toBe(
    await resolveComputedValue(disabled, "GrayText", "color"),
  );
});

test("review contract renders distinct variant and level treatments", async ({
  page,
}) => {
  const variants = page.locator("[data-interaction-variant]");
  const variantSignatures = await variants.evaluateAll((elements) =>
    elements.map((element) => {
      const style = getComputedStyle(element);
      return [
        style.backgroundColor,
        style.borderColor,
        style.color,
        style.boxShadow,
      ].join("|");
    }),
  );
  expect(new Set(variantSignatures).size).toBe(interactionVariants.length);

  const levels = page.locator("[data-interaction-level]");
  expect(
    await levels.evaluateAll((elements) =>
      elements.map((element) => ({
        level: element.getAttribute("data-surface-level"),
        variant: element.getAttribute("data-surface-variant"),
      })),
    ),
  ).toEqual([
    { level: "1", variant: "subtle" },
    { level: "2", variant: "primary" },
    { level: "3", variant: "primary" },
  ]);
  const levelSignatures = await levels.evaluateAll((elements) =>
    elements.map((element) => {
      const style = getComputedStyle(element);
      return [style.backgroundColor, style.borderColor, style.boxShadow].join(
        "|",
      );
    }),
  );
  expect(new Set(levelSignatures).size).toBe(interactionLevels.length);
});
