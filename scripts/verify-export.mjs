import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const exportRoot = path.join(repositoryRoot, "out");
const basePath = "/interface-systems-lab";
const siteUrl = "https://foscat.github.io/interface-systems-lab/";

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

async function readExportFile(relativePath, issues) {
  try {
    return await readFile(path.join(exportRoot, relativePath));
  } catch {
    issues.push(`Missing export file: ${relativePath}`);
    return Buffer.alloc(0);
  }
}

function requireText(haystack, needle, label, issues) {
  if (!haystack.includes(needle)) {
    issues.push(`Missing ${label}: ${needle}`);
  }
}

/** Validates the files that GitHub Pages will receive, rather than source intent. */
export async function collectExportIssues() {
  const issues = [];
  const index = (
    await readExportFile("index.html", issues)
  ).toString("utf8");
  const notFound = (
    await readExportFile("404.html", issues)
  ).toString("utf8");
  const robots = (
    await readExportFile("robots.txt", issues)
  ).toString("utf8");
  const sitemap = (
    await readExportFile("sitemap.xml", issues)
  ).toString("utf8");
  const manifest = (
    await readExportFile("manifest.webmanifest", issues)
  ).toString("utf8");
  const browserConfig = (
    await readExportFile("browserconfig.xml", issues)
  ).toString("utf8");
  const socialImage = await readExportFile(
    "interface-systems-lab-social-card.png",
    issues,
  );

  requireText(index, '<html lang="en">', "document language", issues);
  requireText(index, `<link rel="canonical" href="${siteUrl}"`, "canonical URL", issues);
  requireText(index, `property="og:url" content="${siteUrl}"`, "Open Graph URL", issues);
  requireText(index, `property="og:image" content="${siteUrl}interface-systems-lab-social-card.png"`, "Open Graph image", issues);
  requireText(index, 'name="twitter:card" content="summary_large_image"', "Twitter card", issues);
  requireText(index, 'type="application/ld+json"', "structured data", issues);
  requireText(index, `${basePath}/manifest.webmanifest`, "manifest path", issues);
  requireText(index, `${basePath}/_next/`, "Pages-prefixed application assets", issues);
  requireText(index, "Design every layer.", "primary page content", issues);
  requireText(
    notFound,
    "This interface is outside the system.",
    "custom 404 content",
    issues,
  );
  const notFoundRobotDirectives = [
    ...notFound.matchAll(/<meta name="robots" content="([^"]+)"/g),
  ].map((match) => match[1].toLowerCase());
  if (!notFoundRobotDirectives.some((value) => value.includes("noindex"))) {
    issues.push("Custom 404 is missing a noindex directive");
  }
  if (
    notFoundRobotDirectives.some(
      (value) => /(?:^|,\s*)index(?:,|$)/.test(value) && !value.includes("noindex"),
    )
  ) {
    issues.push("Custom 404 contains a conflicting index directive");
  }
  if (notFound.includes(`<link rel="canonical" href="${siteUrl}"`)) {
    issues.push("Custom 404 incorrectly canonicalizes to the home page");
  }

  const headingCount = (index.match(/<h1(?:\s|>)/g) ?? []).length;
  if (headingCount !== 1) {
    issues.push(`Expected one h1, found ${headingCount}`);
  }

  for (const url of resourceUrls) {
    requireText(index, `href="${url}"`, "library resource link", issues);
  }

  const unsafeRootAsset = /(?:href|src)="\/(?!interface-systems-lab(?:\/|"|#))[^"#]*"/g;
  const rootAssetMatches = index.match(unsafeRootAsset) ?? [];
  if (rootAssetMatches.length > 0) {
    issues.push(`Found unprefixed root assets: ${rootAssetMatches.join(", ")}`);
  }

  requireText(robots, "User-Agent: *", "robots rule", issues);
  requireText(robots, "Allow: /", "robots allow directive", issues);
  requireText(robots, `Sitemap: ${siteUrl}sitemap.xml`, "robots sitemap", issues);
  requireText(sitemap, `<loc>${siteUrl}</loc>`, "sitemap location", issues);

  if (manifest) {
    try {
      const parsedManifest = JSON.parse(manifest);
      for (const key of ["id", "start_url", "scope"]) {
        if (parsedManifest[key] !== `${basePath}/`) {
          issues.push(`Manifest ${key} is not Pages-aware`);
        }
      }
      for (const icon of parsedManifest.icons ?? []) {
        if (!icon.src.startsWith(`${basePath}/`)) {
          issues.push(`Manifest icon is not Pages-aware: ${icon.src}`);
        }
      }
    } catch {
      issues.push("manifest.webmanifest is not valid JSON");
    }
  }

  requireText(
    browserConfig,
    `${basePath}/mstile-150x150.png`,
    "Pages-aware Microsoft tile",
    issues,
  );

  if (socialImage.length >= 24) {
    const width = socialImage.readUInt32BE(16);
    const height = socialImage.readUInt32BE(20);
    if (width !== 1200 || height !== 630) {
      issues.push(`Social image must be 1200x630, found ${width}x${height}`);
    }
  }

  return issues;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const issues = await collectExportIssues();

  if (issues.length > 0) {
    console.error("GitHub Pages export verification failed:\n");
    for (const issue of issues) console.error(`- ${issue}`);
    process.exitCode = 1;
  } else {
    console.log("GitHub Pages export verified: SEO, base paths, and resources are production-ready.");
  }
}
