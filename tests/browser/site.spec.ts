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

const configurationStorageKey = "interface-systems-lab:configuration:v1";
const companyUrl = "https://sandersontechnologyenterprises.com";
const canonicalUrl =
  "https://sanderson-technology-enterprises.github.io/interface-systems-lab/";
const corporateOrganizationId = `${companyUrl}/#organization`;
const repositoryUrl =
  "https://github.com/Sanderson-Technology-Enterprises/interface-systems-lab";
const socialImageUrl = `${canonicalUrl}interface-systems-lab-social-card.png`;
const socialImageAlt =
  "Interface Systems Lab graphic showing 3 libraries, 1 interface, and 5,280 possibilities across layout, identity, and interaction.";
const websiteId = `${canonicalUrl}#website`;
const webpageId = `${canonicalUrl}#webpage`;
const applicationId = `${canonicalUrl}#application`;
const packagesId = `${canonicalUrl}#packages`;
const requiredSectionIds = [
  "top",
  "workbench",
  "layouts",
  "ui-native",
  "interactions",
  "integrate",
  "install",
  "libraries",
  "company",
] as const;

type ExpectedConfiguration = {
  layout: string;
  ui: string;
  theme: string;
  mode: string;
};

type StructuredDataNode = {
  "@id"?: string;
  "@type"?: string;
  [key: string]: unknown;
};

const defaultConfiguration: ExpectedConfiguration = {
  layout: "bento",
  ui: "minimal-saas",
  theme: "midnight-gold",
  mode: "dark",
};

type RgbColor = {
  red: number;
  green: number;
  blue: number;
};

function parseComputedRgb(value: string): RgbColor {
  const components = value.match(/[\d.]+/g)?.map(Number);
  if (components === undefined || components.length < 3) {
    throw new Error(`Unable to parse computed color: ${value}`);
  }

  const [rawRed, rawGreen, rawBlue, alpha = 1] = components;
  if (
    rawRed === undefined ||
    rawGreen === undefined ||
    rawBlue === undefined ||
    alpha !== 1
  ) {
    throw new Error(`Expected an opaque computed color, received: ${value}`);
  }

  // Chromium serializes color-mix() results as normalized color(srgb) channels.
  const channelScale = value.startsWith("color(srgb ") ? 255 : 1;
  const red = rawRed * channelScale;
  const green = rawGreen * channelScale;
  const blue = rawBlue * channelScale;

  return { red, green, blue };
}

function relativeLuminance(color: RgbColor): number {
  const linearize = (channel: number) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  return (
    0.2126 * linearize(color.red) +
    0.7152 * linearize(color.green) +
    0.0722 * linearize(color.blue)
  );
}

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(parseComputedRgb(foreground));
  const backgroundLuminance = relativeLuminance(parseComputedRgb(background));
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

async function expectRootConfiguration(
  page: Page,
  configuration: ExpectedConfiguration,
) {
  const root = page.locator(".experience.ly-root");

  await expect(root).toHaveAttribute("data-ly-layout", configuration.layout);
  await expect(root).toHaveAttribute("data-ui", configuration.ui);
  await expect(root).toHaveAttribute("data-theme", configuration.theme);
  await expect(root).toHaveAttribute("data-mode", configuration.mode);
  await expect(root).not.toHaveAttribute("data-layout", /.+/);
}

async function readStoredConfiguration(page: Page) {
  return page.evaluate((storageKey) => {
    const value = window.localStorage.getItem(storageKey);
    return value === null ? null : (JSON.parse(value) as unknown);
  }, configurationStorageKey);
}

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

async function readStructuredData(page: Page): Promise<StructuredDataNode[]> {
  const nodes = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) =>
      scripts.flatMap((script) => {
        const value = JSON.parse(script.textContent ?? "{}") as {
          "@graph"?: Record<string, unknown>[];
        };
        return value["@graph"] ?? [value];
      }),
    );

  return nodes as StructuredDataNode[];
}

test("exported 404 retains branded ecosystem paint @cross-engine", async ({
  page,
}) => {
  const response = await page.goto("./missing-interface-proof");
  expect(response?.status()).toBe(404);

  const root = page.locator("main.not-found");
  await expect(root).toHaveAttribute(
    "data-ly-layout",
    defaultConfiguration.layout,
  );
  await expect(root).toHaveAttribute("data-ui", defaultConfiguration.ui);
  await expect(root).toHaveAttribute("data-theme", defaultConfiguration.theme);
  await expect(root).toHaveAttribute("data-mode", defaultConfiguration.mode);

  const returnAction = page.getByRole("link", {
    name: "Return to Interface Systems Lab",
  });
  const paint = await root.evaluate((element) => {
    const action = element.querySelector<HTMLElement>("a");
    if (action === null) {
      throw new Error("Expected the themed 404 return action.");
    }

    const rootStyle = getComputedStyle(element);
    const actionStyle = getComputedStyle(action);
    return {
      actionBackground: actionStyle.backgroundColor,
      actionColor: actionStyle.color,
      actionHeight: action.getBoundingClientRect().height,
      actionPaddingEnd: Number.parseFloat(actionStyle.paddingInlineEnd),
      actionPaddingStart: Number.parseFloat(actionStyle.paddingInlineStart),
      rootBackground: rootStyle.backgroundColor,
      rootColor: rootStyle.color,
      themeToken: rootStyle.getPropertyValue("--usk-bg-rgb").trim(),
    };
  });

  await expect(returnAction).toHaveAttribute("href", "/interface-systems-lab/");
  expect(paint.themeToken).not.toBe("");
  expect(paint.rootBackground).not.toBe("rgba(0, 0, 0, 0)");
  expect(paint.actionBackground).not.toBe("rgba(0, 0, 0, 0)");
  expect(
    contrastRatio(paint.rootColor, paint.rootBackground),
  ).toBeGreaterThanOrEqual(4.5);
  expect(
    contrastRatio(paint.actionColor, paint.actionBackground),
  ).toBeGreaterThanOrEqual(4.5);
  expect(paint.actionHeight).toBeGreaterThanOrEqual(44);
  expect(paint.actionPaddingStart).toBeGreaterThan(0);
  expect(paint.actionPaddingEnd).toBeGreaterThan(0);
});

test("shell scopes the complete experience and balances developer and company paths", async ({
  page,
}) => {
  const runtimeErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await page.reload();

  const experience = page.locator(".experience.ly-root");
  await expect(experience).toHaveCount(1);
  await expectRootConfiguration(page, defaultConfiguration);
  await expect(experience.locator(":scope > .site-header")).toHaveCount(1);
  await expect(experience.locator(":scope > main")).toHaveCount(1);
  await expect(experience.locator(":scope > .site-footer")).toHaveCount(1);
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);

  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toHaveAttribute("href", "#main-content");
  await skipLink.focus();
  await expect(skipLink).toBeFocused();

  const navigation = page.getByRole("navigation", {
    name: "Primary navigation",
  });
  for (const id of requiredSectionIds) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
    await expect(navigation.locator(`a[href="#${id}"]`)).toHaveCount(1);
  }
  const companyRegion = page.getByRole("region", {
    name: "Build with the system or with its studio.",
  });
  await expect(companyRegion).toHaveAttribute("id", "company");
  await expect(companyRegion.locator("h3")).toHaveCount(2);

  const developerAction = page.locator('[data-hero-action="developer"]');
  const companyAction = page.locator('[data-hero-action="company"]');
  await expect(developerAction).toHaveAttribute("href", "#workbench");
  await expect(companyAction).toHaveAttribute("href", companyUrl);
  const actionGeometry = await Promise.all(
    [developerAction, companyAction].map((action) =>
      action.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          alignItems: style.alignItems,
          background: style.backgroundColor,
          blockSize: bounds.height,
          color: style.color,
          justifyContent: style.justifyContent,
          paddingInlineEnd: Number.parseFloat(style.paddingInlineEnd),
          paddingInlineStart: Number.parseFloat(style.paddingInlineStart),
          textAlign: style.textAlign,
        };
      }),
    ),
  );

  for (const action of actionGeometry) {
    expect(action.blockSize).toBeGreaterThanOrEqual(44);
    expect(action.justifyContent).toBe("center");
    expect(action.paddingInlineStart).toBeGreaterThan(0);
    expect(action.paddingInlineEnd).toBeGreaterThan(0);
    expect(action.textAlign).toBe("center");
  }
  expect(
    Math.abs(actionGeometry[0]!.blockSize - actionGeometry[1]!.blockSize),
  ).toBeLessThanOrEqual(1);
  expect(actionGeometry[0]!.background).toBe(actionGeometry[1]!.background);
  expect(actionGeometry[0]!.color).toBe(actionGeometry[1]!.color);

  for (const [scope, accessibleName] of [
    [".site-header", /Sanderson/i],
    [".hero", /Visit Sanderson Technology Enterprises/i],
    ["#company", /Work with Sanderson Technology Enterprises/i],
    [".site-footer", /Sanderson Technology Enterprises/i],
  ] as const) {
    const corporateLink = page
      .locator(scope)
      .getByRole("link", { name: accessibleName });
    await expect(corporateLink).toHaveCount(1);
    await expect(corporateLink).toHaveAttribute("href", companyUrl);
    await expect(corporateLink).toHaveAttribute(
      "rel",
      /^(?=.*\bnoreferrer\b)(?=.*\bnoopener\b).+$/,
    );
  }

  for (const [selector, asset] of [
    [".brand-logo", "favicon-48x48.png"],
    [".footer-logo", "android-chrome-192x192.png"],
  ] as const) {
    const image = page.locator(selector);
    await expect(image).toHaveAttribute("src", new RegExp(`${asset}$`));
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate(
          (element: HTMLImageElement) =>
            element.complete &&
            element.naturalWidth > 0 &&
            element.naturalHeight > 0,
        ),
      )
      .toBe(true);
  }

  expect(runtimeErrors).toEqual([]);
});

test("shell keeps observatory controls clear of the interface core", async ({
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

    const geometry = await page
      .locator(".observatory-stage")
      .evaluate((stage) => {
        const core = stage.querySelector<HTMLElement>(".observatory-core");
        const controls = Array.from(
          stage.querySelectorAll<HTMLElement>(".observatory-orbit"),
        );
        if (core === null) throw new Error("Observatory core is missing.");

        const stageBounds = stage.getBoundingClientRect();
        const coreBounds = core.getBoundingClientRect();
        return controls.map((control) => {
          const bounds = control.getBoundingClientRect();
          const overlapsCore =
            bounds.left < coreBounds.right &&
            bounds.right > coreBounds.left &&
            bounds.top < coreBounds.bottom &&
            bounds.bottom > coreBounds.top;

          return {
            label: control.textContent?.trim() ?? "",
            overlapsCore,
            withinStage:
              bounds.left >= stageBounds.left &&
              bounds.right <= stageBounds.right &&
              bounds.top >= stageBounds.top &&
              bounds.bottom <= stageBounds.bottom,
          };
        });
      });

    expect({ geometry, width: viewport.width }).toEqual({
      geometry: [
        { label: "Structure", overlapsCore: false, withinStage: true },
        { label: "Identity", overlapsCore: false, withinStage: true },
        { label: "Behavior", overlapsCore: false, withinStage: true },
      ],
      width: viewport.width,
    });
  }
});

test("shell keeps anchored content clear of persistent regions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("./");
  await expect
    .poll(() =>
      page
        .locator(".site-header")
        .evaluate((element) => getComputedStyle(element).position),
    )
    .toBe("sticky");
  await expect
    .poll(() =>
      page
        .locator(".configuration-shell")
        .evaluate((element) => getComputedStyle(element).position),
    )
    .toBe("static");

  await page.locator("#layouts").scrollIntoViewIfNeeded();
  const desktopFlowGeometry = await page.evaluate(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    const shell = document.querySelector<HTMLElement>(".configuration-shell");
    const console = document.querySelector<HTMLElement>(
      ".configuration-console",
    );
    if (header === null || shell === null || console === null) {
      throw new Error("Expected sticky configuration landmarks are missing.");
    }

    const headerBounds = header.getBoundingClientRect();
    const consoleBounds = console.getBoundingClientRect();
    return {
      consoleBottom: consoleBounds.bottom,
      headerBottom: headerBounds.bottom,
    };
  });
  expect(desktopFlowGeometry.consoleBottom).toBeLessThanOrEqual(
    desktopFlowGeometry.headerBottom,
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await page.evaluate(() => document.fonts.ready.then(() => true));
  await page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Workbench" })
    .click();
  await expect
    .poll(() => page.evaluate(() => window.location.hash))
    .toBe("#workbench");
  const mobileGeometry = await page.evaluate(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    const console = document.querySelector<HTMLElement>(
      ".configuration-console",
    );
    const consoleShell = document.querySelector<HTMLElement>(
      ".configuration-shell",
    );
    const heading = document.querySelector<HTMLElement>("#workbench-title");
    const brandOwner = document.querySelector<HTMLElement>(".brand-owner");
    const brandTitle = document.querySelector<HTMLElement>(".brand-title");
    const navigation = document.querySelector<HTMLElement>(".primary-nav");
    const navigationCue =
      document.querySelector<HTMLElement>(".primary-nav-cue");
    if (
      header === null ||
      console === null ||
      consoleShell === null ||
      heading === null ||
      brandOwner === null ||
      brandTitle === null ||
      navigation === null
    ) {
      throw new Error("Expected shell landmarks are missing.");
    }

    const headerBounds = header.getBoundingClientRect();
    const headingBounds = heading.getBoundingClientRect();
    const navigationBounds = navigation.getBoundingClientRect();
    const navigationLinkBounds = Array.from(
      navigation?.querySelectorAll("a") ?? [],
      (link) => link.getBoundingClientRect(),
    );
    const navigationLinkTextFits = Array.from(
      navigation?.querySelectorAll<HTMLElement>("a") ?? [],
    ).every((link) => link.clientWidth >= link.scrollWidth);
    const headerActions = Array.from(
      document.querySelectorAll<HTMLElement>(".header-links a"),
    );
    const brandOwnerStyle = getComputedStyle(brandOwner);
    return {
      brandOwnerFullyVisible:
        brandOwnerStyle.overflow !== "hidden" &&
        brandOwnerStyle.textOverflow !== "ellipsis" &&
        brandOwner.scrollWidth <= brandOwner.clientWidth &&
        brandOwner.scrollHeight <= brandOwner.clientHeight + 1,
      brandTitleFontSize: Number.parseFloat(
        getComputedStyle(brandTitle).fontSize,
      ),
      consolePosition: getComputedStyle(console).position,
      consoleShellPosition: getComputedStyle(consoleShell).position,
      headerActionsVisible:
        headerActions.length === 2 &&
        headerActions.every((action) => {
          const bounds = action.getBoundingClientRect();
          return bounds.width > 0 && bounds.height >= 44;
        }),
      headerHeight: headerBounds.height,
      headerBottom: headerBounds.bottom,
      headerPosition: getComputedStyle(header).position,
      headingTop: headingBounds.top,
      navigationHeight: navigationBounds.height,
      navigationLinksSeparated: navigationLinkBounds.every(
        (bounds, index) =>
          index === 0 ||
          (navigationLinkBounds[index - 1]?.right ?? bounds.left) <=
            bounds.left,
      ),
      navigationLinkTextFits,
      navigationCueText: navigationCue?.textContent?.trim() ?? "",
      navigationCueVisible:
        navigationCue !== null &&
        navigationCue.getBoundingClientRect().width > 0 &&
        navigationCue.getBoundingClientRect().height > 0,
      navigationScrollable: navigation.scrollWidth > navigation.clientWidth,
      navigationScrollbarWidth: getComputedStyle(navigation).scrollbarWidth,
    };
  });

  expect(mobileGeometry.headerActionsVisible).toBe(true);
  expect(mobileGeometry.brandOwnerFullyVisible).toBe(true);
  expect(mobileGeometry.brandTitleFontSize).toBeGreaterThanOrEqual(12);
  expect(mobileGeometry.headerHeight).toBeLessThanOrEqual(150);
  expect(mobileGeometry.navigationHeight).toBeLessThanOrEqual(48);
  expect(mobileGeometry.navigationLinkTextFits).toBe(true);
  expect(mobileGeometry.navigationLinksSeparated).toBe(true);
  expect(mobileGeometry.navigationCueText).toBe("Scroll for more →");
  expect(mobileGeometry.navigationCueVisible).toBe(true);
  expect(mobileGeometry.navigationScrollable).toBe(true);
  expect(mobileGeometry.navigationScrollbarWidth).toBe("thin");
  expect(["fixed", "sticky"]).not.toContain(mobileGeometry.consolePosition);
  expect(mobileGeometry.consoleShellPosition).toBe("static");
  expect(mobileGeometry.headerPosition).toBe("static");
  expect(mobileGeometry.headingTop).toBeGreaterThanOrEqual(
    Math.max(0, mobileGeometry.headerBottom),
  );
});

test("configuration console yields scroll space in short desktop viewports @cross-engine", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("./");

  const shell = page.locator(".configuration-shell");
  await expect
    .poll(() => shell.evaluate((element) => getComputedStyle(element).position))
    .toBe("static");

  await page.locator("#interactions").scrollIntoViewIfNeeded();
  const geometry = await page.evaluate(() => {
    const console = document.querySelector<HTMLElement>(
      ".configuration-console",
    );
    const target = document.querySelector<HTMLElement>("#interactions");
    if (console === null || target === null) {
      throw new Error("Expected short-viewport landmarks are missing.");
    }

    return {
      consoleBottom: console.getBoundingClientRect().bottom,
      targetBottom: target.getBoundingClientRect().bottom,
      targetTop: target.getBoundingClientRect().top,
      viewportHeight: window.innerHeight,
    };
  });
  expect(geometry.consoleBottom).toBeLessThanOrEqual(0);
  expect(geometry.targetBottom).toBeGreaterThan(0);
  expect(geometry.targetTop).toBeLessThan(geometry.viewportHeight);
});

test("primary navigation keeps anchored sections below the sticky header @cross-engine", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const width of [768, 1024, 1248, 1440]) {
    await test.step(`${width}px viewport`, async () => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("./");
      await page.evaluate(() => document.fonts.ready.then(() => true));

      const anchorContract = await page.evaluate(() => {
        const body = document.body;
        const header = document.querySelector<HTMLElement>(".site-header");
        const navigation = document.querySelector<HTMLElement>(".primary-nav");
        const target = document.querySelector<HTMLElement>("#interactions");
        if (header === null || navigation === null || target === null) {
          throw new Error(
            "Expected sticky-header anchor landmarks are missing.",
          );
        }

        return {
          bodyFontFamily: getComputedStyle(body).fontFamily,
          headerBorderWidth: Number.parseFloat(
            getComputedStyle(header).borderBottomWidth,
          ),
          headerHeight: header.getBoundingClientRect().height,
          navigationFontFamily: getComputedStyle(navigation).fontFamily,
          targetScrollMargin: Number.parseFloat(
            getComputedStyle(target).scrollMarginBlockStart,
          ),
        };
      });
      expect(anchorContract.headerBorderWidth).toBeGreaterThanOrEqual(1);
      expect(anchorContract.bodyFontFamily).toMatch(/Geist/i);
      expect(anchorContract.navigationFontFamily).toMatch(/Geist/i);
      expect(anchorContract.targetScrollMargin).toBeGreaterThanOrEqual(
        anchorContract.headerHeight + 16,
      );

      await page
        .getByRole("navigation", { name: "Primary navigation" })
        .getByRole("link", { name: "Interactions" })
        .click();
      await expect
        .poll(() => page.evaluate(() => window.location.hash))
        .toBe("#interactions");

      const geometry = await page.evaluate(() => {
        const header = document.querySelector<HTMLElement>(".site-header");
        const target = document.querySelector<HTMLElement>("#interactions");
        const shell = document.querySelector<HTMLElement>(
          ".configuration-shell",
        );
        const console = document.querySelector<HTMLElement>(
          ".configuration-console",
        );
        if (
          header === null ||
          target === null ||
          shell === null ||
          console === null
        ) {
          throw new Error(
            "Expected sticky shell and anchor landmarks are missing.",
          );
        }

        return {
          consoleBottom: console.getBoundingClientRect().bottom,
          headerBottom: header.getBoundingClientRect().bottom,
          shellPosition: getComputedStyle(shell).position,
          targetTop: target.getBoundingClientRect().top,
        };
      });

      expect(geometry.targetTop).toBeGreaterThanOrEqual(geometry.headerBottom);
      expect(geometry.targetTop).toBeGreaterThanOrEqual(
        geometry.consoleBottom + 16,
      );
      expect(geometry.shellPosition).toBe("static");
    });
  }
});

test("mobile header tab order follows its visual rows", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");

  const header = page.locator(".site-header");
  const visualContract = await header.evaluate((element) => {
    const brand = element.querySelector<HTMLElement>(".brand");
    const actions = element.querySelector<HTMLElement>(".header-links");
    const navigation = element.querySelector<HTMLElement>(".primary-nav");
    const actionLinks = Array.from(
      actions?.querySelectorAll<HTMLElement>("a") ?? [],
    );
    const navigationLinks = Array.from(
      navigation?.querySelectorAll<HTMLElement>("a") ?? [],
    );
    if (brand === null || actions === null || navigation === null) {
      throw new Error("Expected header regions are missing.");
    }

    const signature = (focusable: HTMLElement) =>
      [
        focusable.tagName,
        focusable.getAttribute("aria-label") ??
          focusable.textContent?.trim().replace(/\s+/g, " ") ??
          "",
        focusable.getAttribute("href") ?? "",
      ].join("|");
    const brandBounds = brand.getBoundingClientRect();
    const actionBounds = actions.getBoundingClientRect();
    const navigationBounds = navigation.getBoundingClientRect();
    const navigationLinkBounds = navigationLinks.map((link) =>
      link.getBoundingClientRect(),
    );
    const focusables = [brand, ...actionLinks, ...navigationLinks];
    const visualOrder = focusables
      .map((focusable) => ({
        bounds: focusable.getBoundingClientRect(),
        focusable,
      }))
      .sort((first, second) => {
        const firstRow =
          first.bounds.bottom <= navigationBounds.top + 1 ? 0 : 1;
        const secondRow =
          second.bounds.bottom <= navigationBounds.top + 1 ? 0 : 1;
        return firstRow - secondRow || first.bounds.left - second.bounds.left;
      })
      .map(({ focusable }) => signature(focusable));

    return {
      actionTargetsValid:
        actionLinks.length === 2 &&
        actionLinks.every((link) => {
          const bounds = link.getBoundingClientRect();
          return bounds.width > 0 && bounds.height >= 44;
        }),
      headerHeight: element.getBoundingClientRect().height,
      navigationIsOneRow: navigationLinkBounds.every(
        (bounds) => Math.abs(bounds.top - navigationLinkBounds[0]!.top) <= 1,
      ),
      navigationScrollable: navigation.scrollWidth > navigation.clientWidth,
      pageHasNoInlineOverflow:
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
      topRowIsLeftToRight:
        actionLinks.length === 2 &&
        brandBounds.left <= actionLinks[0]!.getBoundingClientRect().left &&
        actionLinks[0]!.getBoundingClientRect().right <=
          actionLinks[1]!.getBoundingClientRect().left,
      navigationFollowsTopRow:
        navigationBounds.top >=
        Math.max(brandBounds.bottom, actionBounds.bottom),
      visualOrder,
    };
  });

  // Starting on the brand isolates header traversal from the independent skip-link contract.
  await header
    .getByRole("link", { name: "Interface Systems Lab home" })
    .focus();
  const tabOrder: string[] = [];
  for (let index = 0; index < visualContract.visualOrder.length; index += 1) {
    tabOrder.push(
      await page.evaluate(() => {
        const active = document.activeElement;
        if (!(active instanceof HTMLElement)) return "";
        return [
          active.tagName,
          active.getAttribute("aria-label") ??
            active.textContent?.trim().replace(/\s+/g, " ") ??
            "",
          active.getAttribute("href") ?? "",
        ].join("|");
      }),
    );
    if (index < visualContract.visualOrder.length - 1) {
      await page.keyboard.press("Tab");
    }
  }

  expect(tabOrder).toEqual(visualContract.visualOrder);
  expect(visualContract).toMatchObject({
    actionTargetsValid: true,
    navigationFollowsTopRow: true,
    navigationIsOneRow: true,
    navigationScrollable: true,
    pageHasNoInlineOverflow: true,
    topRowIsLeftToRight: true,
  });
  expect(visualContract.headerHeight).toBeLessThanOrEqual(150);
});

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
    /favicon-48x48\.png$/,
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
    page.getByRole("heading", { name: /Layout laboratory/i }),
  ).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    canonicalUrl,
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    canonicalUrl,
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    socialImageUrl,
  );
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
    "content",
    socialImageAlt,
  );
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
    "content",
    socialImageUrl,
  );
  await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute(
    "content",
    socialImageAlt,
  );
  for (const [selector, asset] of [
    ['link[rel="shortcut icon"]', "favicon.ico"],
    ['link[rel="icon"][sizes="any"]', "favicon.ico"],
    ['link[rel="icon"][sizes="32x32"]', "favicon-32x32.png"],
    ['link[rel="icon"][sizes="16x16"]', "favicon-16x16.png"],
    ['link[rel="apple-touch-icon"]', "apple-touch-icon.png"],
  ] as const) {
    await expect(page.locator(selector)).toHaveAttribute(
      "href",
      `${canonicalUrl}${asset}`,
    );
  }
  for (const [name, expected] of [
    ["google-site-verification", process.env.GOOGLE_SITE_VERIFICATION?.trim()],
    ["msvalidate.01", process.env.BING_SITE_VERIFICATION?.trim()],
  ] as const) {
    const tag = page.locator(`meta[name="${name}"]`);
    if (expected) {
      await expect(tag).toHaveCount(1);
      await expect(tag).toHaveAttribute("content", expected);
    } else {
      await expect(tag).toHaveCount(0);
    }
  }

  const structuredData = await readStructuredData(page);
  const node = (type: string) =>
    structuredData.filter((candidate) => candidate["@type"] === type);
  for (const type of [
    "Organization",
    "WebSite",
    "WebPage",
    "SoftwareApplication",
    "ItemList",
  ]) {
    expect(node(type), type).toHaveLength(1);
  }
  const organization = node("Organization")[0]!;
  expect(organization).toMatchObject({
    "@id": corporateOrganizationId,
    description:
      "Founder-led software studio building creator-owned web platforms, private content systems, admin dashboards, and operational workflows for adult entertainment businesses.",
    image:
      "https://sandersontechnologyenterprises.com/assets/social-preview.png",
    legalName: "Sanderson Technology Enterprises",
    logo: "https://sandersontechnologyenterprises.com/assets/icon-512.png",
    name: "Sanderson Technology Enterprises",
    sameAs: ["https://github.com/Sanderson-Technology-Enterprises"],
    slogan: "Strategic Platform Development",
    url: companyUrl,
  });
  expect(node("SoftwareApplication")[0]).toMatchObject({
    "@id": applicationId,
    codeRepository: repositoryUrl,
    isAccessibleForFree: true,
    logo: `${canonicalUrl}android-chrome-512x512.png`,
    operatingSystem: "Any",
    publisher: { "@id": corporateOrganizationId },
    url: canonicalUrl,
  });
  expect(node("WebSite")[0]).toMatchObject({
    "@id": websiteId,
    publisher: { "@id": corporateOrganizationId },
    url: canonicalUrl,
  });
  expect(node("WebPage")[0]).toMatchObject({
    "@id": webpageId,
    isPartOf: { "@id": websiteId },
    publisher: { "@id": corporateOrganizationId },
    url: canonicalUrl,
  });
  expect(node("ItemList")[0]).toMatchObject({
    "@id": packagesId,
    url: canonicalUrl,
    itemListElement: [
      {
        item: {
          codeRepository: "https://github.com/Foscat/Layout-Style-CSS",
          name: "layout-style-css",
          programmingLanguage: "CSS",
          url: "https://www.npmjs.com/package/layout-style-css",
          version: "2.1.0",
        },
      },
      {
        item: {
          codeRepository: "https://github.com/Foscat/ui-style-kit-css",
          name: "ui-style-kit-css",
          programmingLanguage: "CSS",
          url: "https://www.npmjs.com/package/ui-style-kit-css",
          version: "2.1.0",
        },
      },
      {
        item: {
          codeRepository: "https://github.com/Foscat/Interactive-Surface-CSS",
          name: "interactive-surface-css",
          programmingLanguage: "CSS",
          url: "https://www.npmjs.com/package/interactive-surface-css",
          version: "1.5.0",
        },
      },
    ],
    numberOfItems: 3,
  });

  for (const [name, version] of [
    ["layout-style-css", "2.1.0"],
    ["ui-style-kit-css", "2.1.0"],
    ["interactive-surface-css", "1.5.0"],
  ]) {
    const packageEntry = page.locator(`[data-package="${name}"]`);
    await expect(packageEntry.getByRole("heading", { name })).toBeAttached();
    await expect(
      packageEntry.getByText(`v${version}`, { exact: true }),
    ).toBeAttached();
  }

  for (const url of resourceUrls) {
    await expect(page.locator(`a[href="${url}"]`).first()).toBeAttached();
  }

  await page.screenshot({
    path: `.tmp/observatory-${testInfo.project.name}.png`,
    fullPage: true,
  });
  expect(runtimeErrors).toEqual([]);
});

test(
  "representative configurations remain healthy across engines",
  { tag: "@cross-engine" },
  async ({ page }) => {
    const runtimeErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(message.text());
    });
    page.on("pageerror", (error) => runtimeErrors.push(error.message));

    const configurations: ExpectedConfiguration[] = [
      defaultConfiguration,
      {
        layout: "split-screen",
        ui: "maximalist",
        theme: "cyber-lime",
        mode: "contrast",
      },
    ];

    for (const configuration of configurations) {
      const query = new URLSearchParams(configuration).toString();
      await page.goto(`./?${query}`);
      await expectRootConfiguration(page, configuration);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        canonicalUrl,
      );
      for (const section of [
        ".site-header",
        "#workbench",
        "#layouts",
        "#ui-native",
        "#interactions",
        "#integrate",
        "#install",
        "#company",
        ".site-footer",
      ]) {
        await expect(page.locator(section)).toBeVisible();
      }
      await expect(
        page.locator("#company").getByRole("link", {
          name: /Work with Sanderson Technology Enterprises/i,
        }),
      ).toBeVisible();

      const paint = await page.locator(".experience").evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          background: style.backgroundColor,
          backgroundImage: style.backgroundImage,
          color: style.color,
        };
      });
      expect(
        paint.background !== "rgba(0, 0, 0, 0)" ||
          paint.backgroundImage !== "none",
      ).toBe(true);
      expect(paint.color).not.toBe("rgba(0, 0, 0, 0)");

      const developerAction = page.locator('[data-hero-action="developer"]');
      const companyAction = page.locator('[data-hero-action="company"]');
      await developerAction.focus();
      await page.keyboard.press("Tab");
      await expect(companyAction).toBeFocused();
      const focusStyle = await companyAction.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          focusVisible: element.matches(":focus-visible"),
          outlineStyle: style.outlineStyle,
          outlineWidth: Number.parseFloat(style.outlineWidth),
        };
      });
      expect(focusStyle.focusVisible).toBe(true);
      expect(focusStyle.outlineStyle).not.toBe("none");
      expect(focusStyle.outlineWidth).toBeGreaterThanOrEqual(2);
      await expectNoHorizontalOverflow(page);
    }

    expect(runtimeErrors).toEqual([]);
  },
);

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
    "data-ly-layout",
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

  const copy = page.getByRole("button", { name: "Copy configuration" });
  await expect(copy).toHaveAccessibleName("Copy configuration");
  await copy.click();
  await expect(copy).toHaveText("Copied");
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain('data-ly-layout="bauhaus"');
});

test("one atomic polite region announces configuration, observatory, and install feedback", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const liveRegion = page.locator('[aria-live="polite"][aria-atomic="true"]');

  await expect(liveRegion).toHaveCount(1);

  await page.getByLabel(/01.*Layout/).selectOption("bauhaus");
  await expect(liveRegion).toHaveText("Layout changed to Bauhaus.");

  await page
    .getByRole("group", { name: "Interface layer selector" })
    .getByRole("button", { name: "Identity" })
    .click();
  await expect(liveRegion).toHaveText(
    "Identity layer selected: UI Style Kit CSS.",
  );

  await page
    .getByRole("button", {
      name: "Copy Install all three code for The canonical all-three stack",
    })
    .click();
  await expect(liveRegion).toHaveText(
    "Install all three code for The canonical all-three stack copied to the clipboard.",
  );
});

test("the polite region re-announces repeated identical feedback", async ({
  page,
}) => {
  const liveRegion = page.locator(".configuration-status");
  const randomize = page.getByRole("button", {
    name: "Randomize configuration",
  });
  const message = "A randomized interface configuration is ready.";

  await randomize.click();
  await expect(liveRegion).toHaveText(message);
  await liveRegion.evaluate((element) => {
    const changes: string[] = [];
    element.dataset.observedChanges = JSON.stringify(changes);
    new MutationObserver(() => {
      changes.push(element.textContent ?? "");
      element.dataset.observedChanges = JSON.stringify(changes);
    }).observe(element, {
      characterData: true,
      childList: true,
      subtree: true,
    });
  });

  await randomize.click();
  await expect
    .poll(() =>
      liveRegion.evaluate((element) =>
        JSON.parse(element.dataset.observedChanges ?? "[]"),
      ),
    )
    .not.toEqual([]);
  await expect(liveRegion).toHaveText(message);
});

test("install copy feedback restarts its timer", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  await page
    .getByRole("button", {
      name: "Copy Install all three code for The canonical all-three stack",
    })
    .click();
  let copyButton = page.getByRole("button", {
    name: "Copied Install all three code for The canonical all-three stack",
  });
  await expect(copyButton).toBeVisible();

  await page.waitForTimeout(900);
  await copyButton.click();
  await page.waitForTimeout(1_000);
  copyButton = page.getByRole("button", {
    name: "Copied Install all three code for The canonical all-three stack",
  });
  await expect(copyButton).toBeVisible();

  await page.waitForTimeout(900);
  await expect(
    page.getByRole("button", {
      name: "Copy Install all three code for The canonical all-three stack",
    }),
  ).toBeVisible();
});

test("install clipboard failure uses the shared feedback region", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new DOMException("Clipboard unavailable", "NotAllowedError");
        },
      },
    });
  });
  await page.goto("./");

  await page
    .getByRole("button", {
      name: "Copy Install all three code for The canonical all-three stack",
    })
    .click();
  const retryCopy = page.getByRole("button", {
    name: "Retry copy Install all three code for The canonical all-three stack",
  });
  await expect(retryCopy).toHaveText("Retry copy");
  await expect(retryCopy).toHaveAccessibleName(
    "Retry copy Install all three code for The canonical all-three stack",
  );
  await expect(page.locator(".configuration-status")).toHaveText(
    "Clipboard access failed. Copy the visible Install all three code for The canonical all-three stack manually.",
  );
});

test("configuration query overrides storage and persists across reloads", async ({
  page,
}) => {
  await page.evaluate(
    ({ storageKey, configuration }) => {
      window.localStorage.setItem(storageKey, JSON.stringify(configuration));
    },
    {
      storageKey: configurationStorageKey,
      configuration: {
        layout: "cyberpunk",
        ui: "bauhaus",
        theme: "ocean-steel",
        mode: "light",
      },
    },
  );

  const configured: ExpectedConfiguration = {
    layout: "mondrian",
    ui: "retro-glass",
    theme: "rose-quartz",
    mode: "contrast",
  };
  await page.goto(
    "./?layout=mondrian&ui=retro-glass&theme=rose-quartz&mode=contrast",
  );

  await expectRootConfiguration(page, configured);
  await expect.poll(() => readStoredConfiguration(page)).toEqual(configured);
  expect(new URL(page.url()).search).toBe(
    "?layout=mondrian&ui=retro-glass&theme=rose-quartz&mode=contrast",
  );

  await page.goto("./");
  expect(new URL(page.url()).search).toBe("");
  await expectRootConfiguration(page, configured);
  await expect.poll(() => readStoredConfiguration(page)).toEqual(configured);

  await page.reload();
  expect(new URL(page.url()).search).toBe("");
  await expectRootConfiguration(page, configured);
});

test("configuration hydration recovers from invalid query and storage data", async ({
  page,
}) => {
  await page.evaluate((storageKey) => {
    window.localStorage.setItem(storageKey, "{malformed json");
  }, configurationStorageKey);
  await page.goto("./?layout=invalid&ui=invalid&theme=invalid&mode=invalid");

  await expectRootConfiguration(page, defaultConfiguration);
  await expect(page.locator(".configuration-console")).toBeVisible();
  await expect(page.getByLabel(/01.*Layout/)).toHaveValue("bento");
  await expect(page.getByLabel(/02.*Visual style/)).toHaveValue("minimal-saas");
  await expect(page.getByLabel(/03.*Palette/)).toHaveValue("midnight-gold");
  await expect(page.getByRole("radio", { name: "Dark" })).toBeChecked();
});

test("configuration controls update URL and storage, while reset removes both", async ({
  page,
}) => {
  await page.getByLabel(/01.*Layout/).selectOption("split-screen");
  await page.getByLabel(/02.*Visual style/).selectOption("y2k");
  await page.getByLabel(/03.*Palette/).selectOption("arctic-indigo");
  await page.getByRole("radio", { name: "High contrast" }).check();

  const configured: ExpectedConfiguration = {
    layout: "split-screen",
    ui: "y2k",
    theme: "arctic-indigo",
    mode: "contrast",
  };
  await expectRootConfiguration(page, configured);
  await expect.poll(() => readStoredConfiguration(page)).toEqual(configured);
  expect(new URL(page.url()).search).toBe(
    "?layout=split-screen&ui=y2k&theme=arctic-indigo&mode=contrast",
  );

  await page.getByRole("button", { name: "Reset configuration" }).click();
  await expectRootConfiguration(page, defaultConfiguration);
  await expect.poll(() => readStoredConfiguration(page)).toBeNull();
  expect(new URL(page.url()).search).toBe("");
  await expect(page.locator(".configuration-status")).toHaveText(
    "Configuration reset to the defaults.",
  );
});

test("configuration randomize persists a catalog-valid combination", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0.999_999;
  });
  await page.reload();

  const randomize = page.getByRole("button", {
    name: "Randomize configuration",
  });
  await randomize.click();

  const configured: ExpectedConfiguration = {
    layout: "split-screen",
    ui: "retro-glass",
    theme: "arctic-indigo",
    mode: "contrast",
  };
  await expectRootConfiguration(page, configured);
  await expect.poll(() => readStoredConfiguration(page)).toEqual(configured);
  expect(new URL(page.url()).search).toBe(
    "?layout=split-screen&ui=retro-glass&theme=arctic-indigo&mode=contrast",
  );
});

test("semantic surfaces declare documented levels and maintain AA contrast", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(
    "./?layout=split-screen&ui=retro-glass&theme=arctic-indigo&mode=contrast",
  );
  await expectRootConfiguration(page, {
    layout: "split-screen",
    ui: "retro-glass",
    theme: "arctic-indigo",
    mode: "contrast",
  });

  const actions = await page
    .locator(
      '.interactive-surface[data-surface-variant]:not(:disabled):not([aria-disabled="true"])',
    )
    .evaluateAll((elements) =>
      elements
        .filter((element) => {
          const style = getComputedStyle(element);
          const bounds = element.getBoundingClientRect();
          return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            bounds.width > 0 &&
            bounds.height > 0
          );
        })
        .map((element) => {
          const style = getComputedStyle(element);
          return {
            background: style.backgroundColor,
            foreground: style.color,
            label:
              element.getAttribute("aria-label") ??
              element.textContent?.trim() ??
              element.tagName.toLowerCase(),
            interactionLevel: element.getAttribute("data-interaction-level"),
            interactionVariant: element.getAttribute(
              "data-interaction-variant",
            ),
            level: element.getAttribute("data-surface-level"),
            variant: element.getAttribute("data-surface-variant"),
          };
        }),
    );

  const expectedLevelByVariant: Record<string, string> = {
    accent: "2",
    danger: "2",
    primary: "2",
    secondary: "2",
    subtle: "1",
    warning: "2",
  };
  const levelViolations = actions
    .filter(({ interactionLevel, interactionVariant, level, variant }) => {
      if (interactionVariant !== null) return level !== "2";
      if (interactionLevel !== null) return level !== interactionLevel;
      return variant === null || level !== expectedLevelByVariant[variant];
    })
    .map(({ label, level, variant }) => ({ label, level, variant }));
  const contrastViolations = actions
    .map(({ background, foreground, label, variant }) => ({
      label,
      ratio: contrastRatio(foreground, background),
      variant,
    }))
    .filter(({ ratio }) => ratio < 4.5);
  const semanticViolations = actions
    .filter(
      ({ label, variant }) =>
        label === "Randomize configuration" && variant !== "primary",
    )
    .map(({ label, variant }) => ({ label, variant }));

  expect(actions.length).toBeGreaterThan(0);
  expect({ contrastViolations, levelViolations, semanticViolations }).toEqual({
    contrastViolations: [],
    levelViolations: [],
    semanticViolations: [],
  });
});

test("configuration copy and share announce success and clear transient labels", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(
    "./?layout=mondrian&ui=retro-glass&theme=rose-quartz&mode=contrast",
  );
  await page.clock.install();

  const copy = page.getByRole("button", { name: "Copy configuration" });
  await copy.click();
  await expect.poll(async () =>
    (await page.evaluate(() => navigator.clipboard.readText())).replace(
      /\r\n/g,
      "\n",
    ),
  ).toBe(`<main
  class="ly-root"
  data-ly-layout="mondrian"
  data-ui="retro-glass"
  data-theme="rose-quartz"
  data-mode="contrast"
></main>`);
  await expect(page.locator(".configuration-status")).toHaveText(
    "Configuration markup copied to the clipboard.",
  );
  await expect(copy).toHaveText("Copied");

  await page.clock.fastForward(1_800);
  await expect(copy).toHaveText("Copy configuration");

  const share = page.getByRole("button", { name: "Share configuration" });
  const expectedShareUrl =
    `${new URL(page.url()).origin}${new URL(page.url()).pathname}` +
    "?layout=mondrian&ui=retro-glass&theme=rose-quartz&mode=contrast";
  await share.click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(expectedShareUrl);
  await expect(page.locator(".configuration-status")).toHaveText(
    "Share link copied to the clipboard.",
  );
  await expect(share).toHaveText("Link copied");

  await page.clock.fastForward(1_800);
  await expect(share).toHaveText("Share configuration");
});

test("configuration copy and share expose selected fallback text on clipboard failure", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new DOMException("Clipboard unavailable", "NotAllowedError");
        },
      },
    });
  });
  await page.goto(
    "./?layout=mondrian&ui=retro-glass&theme=rose-quartz&mode=contrast",
  );

  await page.getByRole("button", { name: "Copy configuration" }).click();
  const fallback = page.getByLabel("Configuration text for manual copy");
  const markup = `<main
  class="ly-root"
  data-ly-layout="mondrian"
  data-ui="retro-glass"
  data-theme="rose-quartz"
  data-mode="contrast"
></main>`;
  await expect(fallback).toBeVisible();
  await expect(fallback).toHaveValue(markup);
  await expect(page.locator(".configuration-status")).toHaveText(
    "Clipboard access failed. Select the configuration markup to copy it manually.",
  );
  await expect
    .poll(() =>
      fallback.evaluate((element: HTMLTextAreaElement) => ({
        end: element.selectionEnd,
        start: element.selectionStart,
      })),
    )
    .toEqual({ start: 0, end: markup.length });

  await page.getByRole("button", { name: "Share configuration" }).click();
  const expectedShareUrl =
    `${new URL(page.url()).origin}${new URL(page.url()).pathname}` +
    "?layout=mondrian&ui=retro-glass&theme=rose-quartz&mode=contrast";
  await expect(fallback).toHaveValue(expectedShareUrl);
  await expect(page.locator(".configuration-status")).toHaveText(
    "Clipboard access failed. Select the share link to copy it manually.",
  );
  await expect
    .poll(() =>
      fallback.evaluate((element: HTMLTextAreaElement) => ({
        end: element.selectionEnd,
        start: element.selectionStart,
      })),
    )
    .toEqual({ start: 0, end: expectedShareUrl.length });
});

test("fits the viewport and honors reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.reload();

  const defaultRunnerMotion = await page
    .locator(".orbit-runner")
    .evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element);
        const duration = style.animationDuration;
        const numericDuration = Number.parseFloat(duration) || 0;
        return {
          animationCount: element.getAnimations().length,
          duration,
          durationMs: duration.endsWith("ms")
            ? numericDuration
            : numericDuration * 1_000,
          name: style.animationName,
        };
      }),
    );
  expect(defaultRunnerMotion.length).toBeGreaterThan(0);
  expect(
    defaultRunnerMotion.every(
      ({ animationCount, durationMs, name }) =>
        name !== "none" && durationMs > 0 && animationCount > 0,
    ),
  ).toBe(true);

  await page.emulateMedia({ reducedMotion: "reduce" });

  await expectNoHorizontalOverflow(page);

  const reducedRunnerMotion = await page
    .locator(".orbit-runner")
    .evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element);
        const duration = style.animationDuration;
        const numericDuration = Number.parseFloat(duration) || 0;
        return {
          animationCount: element.getAnimations().length,
          duration,
          durationMs: duration.endsWith("ms")
            ? numericDuration
            : numericDuration * 1_000,
          name: style.animationName,
        };
      }),
    );
  expect(reducedRunnerMotion.length).toBe(defaultRunnerMotion.length);
  expect(
    reducedRunnerMotion.every(
      ({ animationCount, durationMs, name }) =>
        name === "none" && durationMs <= 1 && animationCount === 0,
    ),
  ).toBe(true);
  await expect(
    page.getByRole("navigation", { name: "Primary navigation" }),
  ).toBeVisible();
});

test("stays responsive across mobile portrait, mobile landscape, tablet, and desktop sizes", async ({
  page,
}) => {
  const viewports = [
    // A classic 15px scrollbar leaves a 305px content box in a 320px window.
    { width: 305, height: 568 },
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
      page.getByRole("heading", { name: /Layout laboratory/i }),
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
