import type { Metadata } from "next";

import { FeatureShowcase } from "./components/FeatureShowcase";
import { HomeHeroActions } from "./components/HeroActions";
import { ExternalLinkIcon } from "./components/Icons";
import { LegacyLabRedirect } from "./components/LegacyLabRedirect";
import { QuickStartCopy } from "./components/QuickStartCopy";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import {
  HOME_NAVIGATION_ACTIONS,
  HOME_NAVIGATION_ITEMS,
} from "./data/navigation";
import { NPM_INSTALL } from "./data/ecosystem";
import { DEFAULT_CONFIGURATION } from "./lib/configuration";
import { SITE, withBasePath } from "./lib/site";
import {
  buildHomeStructuredData,
  serializeStructuredData,
} from "./lib/structured-data";

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

const serializedHomeStructuredData = serializeStructuredData(
  buildHomeStructuredData(),
);

function QuickStartSection() {
  return (
    <section
      className="section-band ly-section"
      id="get-started"
      aria-labelledby="get-started-title"
    >
      <div className="ly-wrapper quick-start-layout ly-grid ly-gap-8">
        <div className="section-heading ly-stack ly-gap-4">
          <p className="section-label">Quick start</p>
          <h2 id="get-started-title">Install the complete stack.</h2>
          <p>
            Start with the pinned package set used by this site, then choose the
            imports that match your adoption path.
          </p>
          <a
            className="interactive-surface site-action ly-self-start"
            data-surface-variant="subtle"
            data-surface-level="1"
            href={withBasePath(`${SITE.labPath}#install`)}
          >
            View every installation option
          </a>
        </div>
        <QuickStartCopy command={NPM_INSTALL} />
      </div>
    </section>
  );
}

function LabInvitationSection() {
  return (
    <section
      className="section-band ly-section"
      id="lab"
      aria-labelledby="lab-title"
    >
      <div className="ly-wrapper lab-invitation ly-split ly-gap-8 ly-items-center">
        <div className="section-heading ly-stack ly-gap-4">
          <p className="section-label">Interactive lab</p>
          <h2 id="lab-title">Configure once. Inspect every layer.</h2>
          <p>
            Explore 5,280 supported configurations across layout, visual style,
            palette, and mode without changing the semantic markup.
          </p>
        </div>
        <a
          className="interactive-surface site-action"
          data-surface-variant="accent"
          data-surface-level="2"
          href={withBasePath(SITE.labPath)}
        >
          Open the configurable lab
        </a>
      </div>
    </section>
  );
}

function CompanySection() {
  return (
    <section
      className="company-section section-band ly-section"
      id="company"
      aria-labelledby="company-title"
    >
      <div className="ly-wrapper company-overview ly-split ly-gap-8 ly-items-start">
        <div className="section-heading ly-stack ly-gap-4">
          <p className="section-label">About the studio</p>
          <h2 id="company-title">
            Built in the open, backed by a focused software studio.
          </h2>
          <p>
            Interface Systems Lab is maintained by Sanderson Technology
            Enterprises as an open developer resource.
          </p>
        </div>
        <article className="conversion-path ly-stack ly-gap-4 ly-items-start">
          <p className="section-label">Secondary path</p>
          <h3>Need a specialized delivery partner?</h3>
          <p>
            STE builds creator-owned platforms, private systems, admin tools,
            and operational workflows for specialized businesses.
          </p>
          <a
            className="interactive-surface site-action"
            data-surface-variant="subtle"
            data-surface-level="1"
            href={companyUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            Discover Sanderson Technology Enterprises
            <ExternalLinkIcon />
            <span className="ly-visually-hidden"> (opens in a new tab)</span>
          </a>
        </article>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div
      className="experience home-experience ly-root ly-page"
      data-ly-layout={DEFAULT_CONFIGURATION.layout}
      data-ui={DEFAULT_CONFIGURATION.ui}
      data-theme={DEFAULT_CONFIGURATION.theme}
      data-mode={DEFAULT_CONFIGURATION.mode}
    >
      <LegacyLabRedirect />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializedHomeStructuredData }}
      />
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <SiteHeader
        actionItems={HOME_NAVIGATION_ACTIONS}
        brandHref="#top"
        menuLabel="Menu"
        navigationItems={HOME_NAVIGATION_ITEMS}
        presentation="responsive"
      />

      <main id="main-content">
        <section
          className="hero home-hero ly-wrapper ly-section ly-split ly-gap-8 ly-items-center"
          id="top"
          aria-labelledby="home-title"
        >
          <div className="hero-copy ly-stack ly-gap-6">
            <p className="section-label">Four focused interface libraries</p>
            <h1 id="home-title">
              Design every layer.
              <br />
              <em>Keep one interface.</em>
            </h1>
            <p className="lede">
              Build accessible interfaces with independent packages for layout,
              visual styling, icons, and interaction states.
            </p>
            <HomeHeroActions />
          </div>

          <aside
            className="home-system-summary ly-stack ly-gap-6"
            aria-label="System summary"
          >
            <div>
              <strong>4</strong>
              <span>independent packages</span>
            </div>
            <div>
              <strong>5,280</strong>
              <span>supported configurations</span>
            </div>
            <p>Structure · Identity · Iconography · Behavior</p>
          </aside>
        </section>

        <FeatureShowcase />
        <QuickStartSection />
        <LabInvitationSection />
        <CompanySection />
      </main>

      <SiteFooter companyUrl={companyUrl} />
    </div>
  );
}
