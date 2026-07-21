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

type ExpectedConfiguration = {
  layout: string;
  ui: string;
  theme: string;
  mode: string;
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

  const [red, green, blue, alpha = 1] = components;
  if (
    red === undefined ||
    green === undefined ||
    blue === undefined ||
    alpha !== 1
  ) {
    throw new Error(`Expected an opaque computed color, received: ${value}`);
  }

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
    .getByRole("button", { name: "Copy Install all three code" })
    .click();
  await expect(liveRegion).toHaveText(
    "Install all three code copied to the clipboard.",
  );
});

test("install copy feedback restarts its timer", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  await page
    .getByRole("button", { name: "Copy Install all three code" })
    .click();
  let copyButton = page.getByRole("button", {
    name: "Copied Install all three code",
  });
  await expect(copyButton).toBeVisible();

  await page.waitForTimeout(900);
  await copyButton.click();
  await page.waitForTimeout(1_000);
  copyButton = page.getByRole("button", {
    name: "Copied Install all three code",
  });
  await expect(copyButton).toBeVisible();

  await page.waitForTimeout(900);
  await expect(
    page.getByRole("button", { name: "Copy Install all three code" }),
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
    .getByRole("button", { name: "Copy Install all three code" })
    .click();
  await expect(page.locator(".configuration-status")).toHaveText(
    "Clipboard access failed. Copy the visible Install all three code manually.",
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
    .filter(
      ({ level, variant }) =>
        variant === null || level !== expectedLevelByVariant[variant],
    )
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
