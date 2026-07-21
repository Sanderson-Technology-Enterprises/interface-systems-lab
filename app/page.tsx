import { CombinedWorkbench, HeroActions } from "./components/CombinedWorkbench";
import { ExternalLinkIcon } from "./components/Icons";
import { InstallGuide } from "./components/InstallGuide";
import { InterfaceObservatory } from "./components/InterfaceObservatory";
import { LabControls } from "./components/LabControls";
import { LabExperience } from "./components/LabExperience";
import { LayoutLab } from "./components/labs/LayoutLab";
import { LibraryDirectory } from "./components/LibraryDirectory";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { SITE } from "./lib/site";

const companyUrl = "https://sandersontechnologyenterprises.com";

function CapabilityRunway() {
  return (
    <section
      className="capability-runway section-band ly-section"
      aria-labelledby="capability-runway-title"
    >
      <div className="ly-wrapper">
        <div className="section-heading ly-split ly-gap-6 ly-items-end">
          <div className="ly-stack ly-gap-2">
            <p className="section-label">Complete ecosystem path</p>
            <h2 id="capability-runway-title">
              Every layer has a focused proof.
            </h2>
          </div>
          <p>
            Layout is live now. The remaining anchored chapters establish the
            narrative path without pre-empting their dedicated capability labs.
          </p>
        </div>

        <div className="capability-preview ly-grid ly-grid--auto ly-gap-5">
          <section
            className="capability-preview-panel ly-stack ly-gap-3"
            id="ui-native"
            aria-labelledby="ui-native-title"
          >
            <p className="section-label">Identity</p>
            <h2 id="ui-native-title">UI and native elements</h2>
            <p>
              Preset paint, themes, modes, and native browser controls share the
              same root configuration without borrowing Layout geometry.
            </p>
          </section>

          <section
            className="capability-preview-panel ly-stack ly-gap-3"
            id="interactions"
            aria-labelledby="interactions-title"
          >
            <p className="section-label">Behavior</p>
            <h2 id="interactions-title">Interaction states</h2>
            <p>
              Hover, focus-visible, active, pressed, busy, and disabled remain
              one predictable mechanics layer across every visual preset.
            </p>
          </section>

          <section
            className="capability-preview-panel ly-stack ly-gap-3"
            id="integrate"
            aria-labelledby="integrate-title"
          >
            <p className="section-label">Adoption</p>
            <h2 id="integrate-title">Integration proofs</h2>
            <p>
              Package-by-package and combined examples lead into the pinned
              installation guide and resource directory below.
            </p>
          </section>
        </div>
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
      <div className="ly-wrapper">
        <div className="company-conversion ly-split ly-gap-6">
          <article className="conversion-path ly-stack ly-gap-4 ly-items-start">
            <p className="section-label">For developers</p>
            <h2 id="company-title">Adopt the system at your own pace.</h2>
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
            <h2>Turn interface ambition into a delivery system.</h2>
            <p>
              Sanderson Technology Enterprises helps teams connect product
              strategy, accessible interface design, and durable implementation.
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
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <SiteHeader companyUrl={companyUrl} />

      <main id="main-content">
        <section
          className="hero ly-wrapper ly-section ly-split ly-gap-8 ly-items-center"
          id="top"
        >
          <div className="hero-copy ly-stack ly-gap-5">
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
        <CapabilityRunway />
        <InstallGuide />
        <LibraryDirectory />
        <CompanySection />
      </main>

      <SiteFooter companyUrl={companyUrl} />
    </LabExperience>
  );
}
