import type { Metadata } from "next";

import { CombinedWorkbench } from "../components/CombinedWorkbench";
import { LabHeroActions } from "../components/HeroActions";
import { InstallGuide } from "../components/InstallGuide";
import { InterfaceObservatory } from "../components/InterfaceObservatory";
import { LabControls } from "../components/LabControls";
import { LabExperience } from "../components/LabExperience";
import { IconLab } from "../components/labs/IconLab";
import { InteractionLab } from "../components/labs/InteractionLab";
import { IntegrationLab } from "../components/labs/IntegrationLab";
import { LayoutLab } from "../components/labs/LayoutLab";
import { UiNativeLab } from "../components/labs/UiNativeLab";
import { LibraryDirectory } from "../components/LibraryDirectory";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import {
  LAB_NAVIGATION_ACTIONS,
  LAB_NAVIGATION_ITEMS,
} from "../data/navigation";
import { SITE } from "../lib/site";
import {
  buildLabStructuredData,
  serializeStructuredData,
} from "../lib/structured-data";

const labDescription =
  "Configure layout, visual style, palette, and mode, then inspect all four Interface Systems Lab packages on shared semantic markup.";

export const metadata: Metadata = {
  title: "Configurable CSS workbench",
  description: labDescription,
  alternates: { canonical: SITE.labUrl },
  openGraph: {
    type: "website",
    url: SITE.labUrl,
    title: `Configurable CSS workbench | ${SITE.name}`,
    description: labDescription,
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
    title: `Configurable CSS workbench | ${SITE.name}`,
    description: labDescription,
    images: [{ url: SITE.socialImage, alt: SITE.socialImageAlt }],
  },
};

const serializedLabStructuredData = serializeStructuredData(
  buildLabStructuredData(),
);

export default function Lab() {
  return (
    <LabExperience>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializedLabStructuredData }}
      />
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <SiteHeader
        actionItems={LAB_NAVIGATION_ACTIONS}
        brandHref="/"
        menuLabel="Lab sections"
        navigationItems={LAB_NAVIGATION_ITEMS}
        presentation="disclosure"
      />

      <main id="main-content">
        <section
          className="hero lab-hero ly-wrapper ly-section ly-split ly-gap-8 ly-items-center"
          id="top"
          aria-labelledby="lab-title"
        >
          <div className="hero-copy ly-stack ly-gap-6">
            <p className="section-label">Configurable package workbench</p>
            <h1 id="lab-title">Configure the system. Inspect every layer.</h1>
            <p className="lede">
              Change layout, visual style, palette, and mode, then inspect how
              all four packages behave on the same semantic markup.
            </p>
            <LabHeroActions />
          </div>

          <InterfaceObservatory />
        </section>

        <div className="configuration-shell ly-wrapper">
          <LabControls />
        </div>

        <CombinedWorkbench />
        <LayoutLab />
        <UiNativeLab />
        <IconLab />
        <InteractionLab />
        <IntegrationLab />
        <InstallGuide />
        <LibraryDirectory />
      </main>

      <SiteFooter companyUrl={SITE.owner.url} />
    </LabExperience>
  );
}
