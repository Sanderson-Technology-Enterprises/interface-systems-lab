const basePath = "/interface-systems-lab";
const origin = "https://sanderson-technology-enterprises.github.io";
const productionUrl = `${origin}${basePath}/`;
const labPath = "/lab/";
const componentsPath = "/components/";

export const SITE = {
  basePath,
  origin,
  name: "Interface Systems Lab",
  title: "Interface Systems Lab | Accessible CSS Interface Systems",
  description:
    "Explore and combine layout-style-css, ui-style-kit-css, and interactive-surface-css in a live accessible interface workbench.",
  url: productionUrl,
  labPath,
  labUrl: new URL(labPath.replace(/^\/+/, ""), productionUrl).href,
  componentsPath,
  componentsUrl: new URL(componentsPath.replace(/^\/+/, ""), productionUrl)
    .href,
  repository:
    "https://github.com/Sanderson-Technology-Enterprises/interface-systems-lab",
  socialImage: `${productionUrl}interface-systems-lab-social-card.png`,
  socialImageAlt:
    "Interface Systems Lab social card with the text \u201c3 libraries, 1 interface, and 44,800 possibilities\u201d over layout, identity, and interaction.",
  brandLogoPath: "android-chrome-512x512.png",
  brandLogo: `${productionUrl}android-chrome-512x512.png`,
  brandLogoAlt: "Interface Systems Lab logo",
  owner: {
    name: "Sanderson Technology Enterprises",
    title: "Sanderson Technology Enterprises | Strategic Platform Development",
    slogan: "Strategic Platform Development",
    url: "https://sandersontechnologyenterprises.com/",
    github: "https://github.com/Sanderson-Technology-Enterprises",
    organizationId: "https://sandersontechnologyenterprises.com/#organization",
    logo: "https://sandersontechnologyenterprises.com/assets/icon-512.png",
    image:
      "https://sandersontechnologyenterprises.com/assets/social-preview.png",
    description:
      "Founder-led software studio building creator-owned web platforms, private content systems, admin dashboards, and operational workflows for adult entertainment businesses.",
  },
  customizedPlatforms: {
    name: "Customized Platforms",
    url: "https://customizedplatforms.com/",
  },
  productLine: "A Sanderson Technology Enterprises product",
  locale: "en_US",
} as const;

type VerificationEnvironment = Readonly<Record<string, string | undefined>>;

type VerificationMetadata = {
  google?: string;
  other?: Record<string, string>;
};

/** Prefixes local export assets only when a Pages base path is explicitly supplied. */
export function withBasePath(
  path: string,
  requestedBasePath = process.env.PAGES_BASE_PATH ?? "",
): string {
  const trimmedBasePath = requestedBasePath.trim();
  const normalizedBasePath = trimmedBasePath
    ? `/${trimmedBasePath.replace(/^\/+|\/+$/g, "")}`
    : "";
  const normalizedPath = path === "/" ? "/" : `/${path.replace(/^\/+/, "")}`;

  if (!normalizedBasePath || normalizedBasePath === "/") {
    return normalizedPath;
  }

  return normalizedPath === "/"
    ? `${normalizedBasePath}/`
    : `${normalizedBasePath}${normalizedPath}`;
}

/** Resolves metadata assets against the canonical site URL, never the host root. */
export function absoluteSiteAsset(path: string): string {
  return new URL(path.replace(/^\/+/, ""), SITE.url).href;
}

/** Omits optional ownership-verification tags until a real trimmed token exists. */
export function buildVerificationMetadata(
  environment: VerificationEnvironment = process.env,
): VerificationMetadata | undefined {
  const google = environment.GOOGLE_SITE_VERIFICATION?.trim();
  const bing = environment.BING_SITE_VERIFICATION?.trim();

  if (!google && !bing) return undefined;

  return {
    ...(google ? { google } : {}),
    ...(bing ? { other: { "msvalidate.01": bing } } : {}),
  };
}
