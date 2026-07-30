import type { Metadata } from "next";

import { CombinedWorkbench, HeroActions } from "./components/CombinedWorkbench";
import { ExternalLinkIcon } from "./components/Icons";
import { InstallGuide } from "./components/InstallGuide";
import { InterfaceObservatory } from "./components/InterfaceObservatory";
import { LabControls } from "./components/LabControls";
import { LabExperience } from "./components/LabExperience";
import { InteractionLab } from "./components/labs/InteractionLab";
import { IntegrationLab } from "./components/labs/IntegrationLab";
import { LayoutLab } from "./components/labs/LayoutLab";
import { UiNativeLab } from "./components/labs/UiNativeLab";
import { LibraryDirectory } from "./components/LibraryDirectory";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { ECOSYSTEM_PACKAGES } from "./data/ecosystem";
import { SITE } from "./lib/site";

const companyUrl = SITE.owner.url;

export const metadata: Metadata = {
  description: SITE.description,
  category: "technology",
  classification: "Developer tools",
  keywords: [
    "CSS design system",
    "CSS layout library",
    "accessible interface components",
    "layout-style-css",
    "ui-style-kit-css",
    "interactive-surface-css",
    "frontend development",
  ],
  alternates: { canonical: SITE.url },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: SITE.url,
    title: SITE.title,
    description: SITE.description,
    siteName: SITE.name,
    locale: SITE.locale,
    images: [
      {
        url: SITE.socialImage,
        width: 1200,
        height: 630,
        alt: SITE.socialImageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: [{ url: SITE.socialImage, alt: SITE.socialImageAlt }],
  },
};

const homeStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${SITE.url}#webpage`,
      name: SITE.title,
      url: SITE.url,
      description: SITE.description,
      isPartOf: { "@id": `${SITE.url}#website` },
      publisher: { "@id": SITE.owner.organizationId },
      inLanguage: "en-US",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE.url}#application`,
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      isAccessibleForFree: true,
      codeRepository: SITE.repository,
      publisher: { "@id": SITE.owner.organizationId },
      logo: SITE.brandLogo,
    },
    {
      "@type": "ItemList",
      "@id": `${SITE.url}#packages`,
      name: "Interface Systems Lab packages",
      url: SITE.url,
      numberOfItems: ECOSYSTEM_PACKAGES.length,
      itemListElement: ECOSYSTEM_PACKAGES.map((pkg, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "SoftwareSourceCode",
          name: pkg.name,
          description: pkg.summary,
          version: pkg.version,
          codeRepository: pkg.links.repository,
          url: pkg.links.npm,
          programmingLanguage:
            pkg.name === "ui-style-kit-icons" ? "JavaScript, SVG" : "CSS",
        },
      })),
    },
  ],
};

const serializedHomeStructuredData = JSON.stringify(homeStructuredData).replace(
  /</g,
  "\\u003c",
);

function CompanySection() {
  return (
    <section
      className="company-section section-band ly-section"
      id="company"
      aria-labelledby="company-title"
    >
      <div className="ly-wrapper">
        <div className="section-heading ly-stack ly-gap-4">
          <p className="section-label">Two paths forward</p>
          <h2 id="company-title">Build with the system or with its studio.</h2>
          <p>
            Explore the open CSS ecosystem directly, or bring Sanderson
            Technology Enterprises into a specialized delivery engagement.
          </p>
        </div>
        <div className="ly-split ly-gap-6">
          <article className="conversion-path ly-stack ly-gap-4 ly-items-start">
            <p className="section-label">For developers</p>
            <h3>Adopt the system at your own pace.</h3>
            <p>
              Start with one package or use the complete cascade. Every layer
              stays independently versioned, documented, and testable.
            </p>
            <a
              className="interactive-surface site-action"
              data-surface-variant="primary"
              data-surface-level="2"
              href={SITE.repository}
              target="_blank"
              rel="noreferrer noopener"
            >
              Review the source on GitHub
              <ExternalLinkIcon />
              <span className="ly-visually-hidden"> (opens in a new tab)</span>
            </a>
          </article>

          <article className="conversion-path ly-stack ly-gap-4 ly-items-start">
            <p className="section-label">For organizations</p>
            <h3>Turn interface ambition into a delivery system.</h3>
            <p>
              Sanderson Technology Enterprises builds creator-owned platforms,
              private systems, admin tools, and operational workflows for
              specialized businesses.
            </p>
            <a
              className="interactive-surface site-action"
              data-surface-variant="accent"
              data-surface-level="2"
              href={companyUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              Work with Sanderson Technology Enterprises
              <ExternalLinkIcon />
              <span className="ly-visually-hidden"> (opens in a new tab)</span>
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <LabExperience>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializedHomeStructuredData }}
      />
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <SiteHeader companyUrl={companyUrl} />

      <main id="main-content">
        <section
          className="hero ly-wrapper ly-section ly-split ly-gap-8 ly-items-center"
          id="top"
        >
          <div className="hero-copy ly-stack ly-gap-6">
            <h1>
              Design every layer.
              <br />
              <em>Keep one interface.</em>
            </h1>
            <p className="lede">
              Build responsive layout, accessible visual identity, and
              dependable interaction mechanics on one semantic interface.
            </p>
            <HeroActions companyUrl={companyUrl} />
          </div>

          <InterfaceObservatory />
        </section>

        <div className="configuration-shell ly-wrapper">
          <LabControls />
        </div>

        <CombinedWorkbench />
        <LayoutLab />
        <UiNativeLab />
        <InteractionLab />
        <IntegrationLab />
        <InstallGuide />
        <LibraryDirectory />
        <CompanySection />
      </main>

      <SiteFooter companyUrl={companyUrl} />
    </LabExperience>
  );
}
