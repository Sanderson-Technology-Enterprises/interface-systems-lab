const productionBasePath = "/interface-systems-lab";

export const SITE = {
  name: "Interface Systems Lab",
  title: "Interface Systems Lab | Accessible CSS Interface Systems",
  description:
    "Explore and combine layout-style-css, ui-style-kit-css, and interactive-surface-css in a live accessible interface workbench.",
  url: "https://foscat.github.io/interface-systems-lab/",
  repository: "https://github.com/Foscat/interface-systems-lab",
  socialImage:
    "https://foscat.github.io/interface-systems-lab/interface-systems-lab-social-card.png",
  locale: "en_US",
} as const;

/** Keeps generated metadata assets aligned with the GitHub Pages project path. */
export function withBasePath(path: string): string {
  const basePath =
    process.env.PAGES_BASE_PATH ??
    (process.env.NODE_ENV === "development" ? "" : productionBasePath);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!basePath) {
    return normalizedPath;
  }

  return normalizedPath === "/"
    ? `${basePath}/`
    : `${basePath}${normalizedPath}`;
}
