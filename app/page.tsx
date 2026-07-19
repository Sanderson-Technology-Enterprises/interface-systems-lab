"use client";

import { useMemo, useState } from "react";

import {
  ArrowRightIcon,
  ExternalLinkIcon,
  SparkIcon,
} from "./components/Icons";
import { FeatureShowcase } from "./components/FeatureShowcase";
import { InstallGuide } from "./components/InstallGuide";
import { InterfaceObservatory } from "./components/InterfaceObservatory";
import { LibraryDirectory } from "./components/LibraryDirectory";
import { ECOSYSTEM_PACKAGES } from "./data/ecosystem";
import { SITE } from "./lib/site";

const layouts = [
  ["minimal-saas", "Minimal SaaS"],
  ["bento", "Bento"],
  ["maximalist", "Maximalist"],
  ["bauhaus", "Bauhaus"],
  ["tactile", "Tactile"],
  ["neumorphism", "Neumorphism"],
  ["retrofuturism", "Retrofuturism"],
  ["brutalism", "Brutalism"],
  ["cyberpunk", "Cyberpunk"],
  ["y2k", "Y2K"],
  ["retro-glass", "Retro Glass"],
  ["f-pattern", "F-Pattern"],
  ["z-pattern", "Z-Pattern"],
  ["split-screen", "Split Screen"],
  ["mondrian", "Mondrian"],
  ["synthwave", "Synthwave"],
] as const;

const uiStyles = [
  ["minimal-saas", "Minimal SaaS"],
  ["bento", "Bento UI"],
  ["maximalist", "Maximalist"],
  ["bauhaus", "Bauhaus"],
  ["tactile", "Tactile"],
  ["neumorphism", "Neumorphism"],
  ["retrofuturism", "Retrofuturism"],
  ["brutalism", "Brutalism"],
  ["cyberpunk", "Cyberpunk"],
  ["y2k", "Y2K"],
  ["retro-glass", "Retro Glass"],
] as const;

const themes = [
  ["midnight-gold", "Midnight Gold"],
  ["ocean-steel", "Ocean Steel"],
  ["forest-moss", "Forest Moss"],
  ["sunset-ember", "Sunset Ember"],
  ["royal-plum", "Royal Plum"],
  ["graphite-cyan", "Graphite Cyan"],
  ["desert-sage", "Desert Sage"],
  ["rose-quartz", "Rose Quartz"],
  ["cyber-lime", "Cyber Lime"],
  ["arctic-indigo", "Arctic Indigo"],
] as const;

const modes = [
  ["light", "Light"],
  ["dark", "Dark"],
  ["contrast", "High contrast"],
] as const;

type LabState = {
  layout: string;
  ui: string;
  theme: string;
  mode: string;
};

const defaults: LabState = {
  layout: "bento",
  ui: "minimal-saas",
  theme: "midnight-gold",
  mode: "dark",
};

const labelFor = (
  items: readonly (readonly [string, string])[],
  value: string,
) => items.find(([key]) => key === value)?.[1] ?? value;

export default function Home() {
  const [lab, setLab] = useState<LabState>(defaults);
  const [saved, setSaved] = useState(false);
  const [copyState, setCopyState] = useState("Copy configuration");
  const [notice, setNotice] = useState("");

  const configMarkup = useMemo(
    () =>
      `<main class="ly-root" data-layout="${lab.layout}" data-ui="${lab.ui}" data-theme="${lab.theme}" data-mode="${lab.mode}">`,
    [lab],
  );

  const update = (key: keyof LabState, value: string) => {
    const label =
      key === "layout"
        ? labelFor(layouts, value)
        : key === "ui"
          ? labelFor(uiStyles, value)
          : key === "theme"
            ? labelFor(themes, value)
            : labelFor(modes, value);

    const labelName =
      key === "ui" ? "Visual style" : `${key[0].toUpperCase()}${key.slice(1)}`;

    setLab((current) => ({ ...current, [key]: value }));
    setNotice(`${labelName} changed to ${label}.`);
  };

  const randomize = () => {
    const pick = (items: readonly (readonly [string, string])[]) =>
      items[Math.floor(Math.random() * items.length)][0];

    setLab({
      layout: pick(layouts),
      ui: pick(uiStyles),
      theme: pick(themes),
      mode: pick(modes),
    });
    setNotice("A new interface direction is ready.");
  };

  const reset = () => {
    setLab(defaults);
    setNotice("The workbench has been reset to Midnight Gold.");
  };

  const copyConfig = async () => {
    try {
      await navigator.clipboard.writeText(configMarkup);
      setCopyState("Copied");
      setNotice("Configuration copied to the clipboard.");
      window.setTimeout(() => setCopyState("Copy configuration"), 1800);
    } catch {
      setCopyState("Select code to copy");
      setNotice("Clipboard access failed. Select the configuration manually.");
    }
  };

  return (
    <div
      className="experience ly-root ly-page"
      data-layout={lab.layout}
      data-ui={lab.ui}
      data-theme={lab.theme}
      data-mode={lab.mode}
    >
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="site-header ly-header ly-header--sticky">
        <div className="site-header-inner ly-wrapper ly-wrapper--xl">
          <a
            className="brand ly-cluster ly-gap-2"
            href="#top"
            aria-label="Interface Systems Lab home"
          >
            {/* Static export requires a relative public asset path under the GitHub Pages project route. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="brand-logo"
              src={SITE.brandLogoPath}
              width="48"
              height="48"
              alt=""
              aria-hidden="true"
              decoding="async"
              fetchPriority="high"
            />
            <span className="brand-copy">
              <span className="brand-title">{SITE.name}</span>
              <span className="brand-owner">{SITE.productLine}</span>
            </span>
          </a>

          <nav
            className="primary-nav ly-cluster ly-gap-4"
            aria-label="Primary navigation"
          >
            <a href="#workbench">Workbench</a>
            <a href="#install">Install</a>
            <a href="#libraries">Libraries</a>
            <a href="#architecture">Architecture</a>
            <a href={SITE.repository} target="_blank" rel="noreferrer noopener">
              GitHub
              <ExternalLinkIcon />
              <span className="ly-visually-hidden"> (opens in a new tab)</span>
            </a>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section className="hero ly-wrapper ly-wrapper--xl ly-section" id="top">
          <div className="hero-copy ly-stack ly-gap-5">
            <h1>
              Design every layer.
              <br />
              <em>Keep one interface.</em>
            </h1>
            <p className="lede">
              Combine structure, visual identity, and interaction without
              rebuilding your markup.
            </p>
            <div className="ly-button-group">
              <a
                className="interactive-surface size-lg"
                data-surface-variant="primary"
                data-surface-level="2"
                href="#workbench"
              >
                Open the workbench
                <ArrowRightIcon />
              </a>
              <a
                className="interactive-surface size-lg"
                data-surface-variant="subtle"
                data-surface-level="1"
                href={SITE.repository}
                target="_blank"
                rel="noreferrer noopener"
              >
                View on GitHub
                <ExternalLinkIcon />
                <span className="ly-visually-hidden">
                  {" "}
                  (opens in a new tab)
                </span>
              </a>
            </div>
          </div>

          <InterfaceObservatory />
        </section>

        <section
          className="section-band ly-section"
          id="workbench"
          aria-labelledby="workbench-title"
        >
          <div className="ly-wrapper ly-wrapper--xl">
            <div className="section-heading">
              <p className="section-label">Live workbench</p>
              <h2 id="workbench-title">The client-ready workbench</h2>
              <p>
                Change any control. The product shell, native elements, and
                interactive states update together.
              </p>
            </div>

            <form
              className="control-deck"
              aria-label="Interface configuration"
              onSubmit={(event) => event.preventDefault()}
            >
              <label>
                <span>01 / Layout</span>
                <select
                  value={lab.layout}
                  onChange={(event) => update("layout", event.target.value)}
                >
                  {layouts.map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>02 / Visual style</span>
                <select
                  value={lab.ui}
                  onChange={(event) => update("ui", event.target.value)}
                >
                  {uiStyles.map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>03 / Palette</span>
                <select
                  value={lab.theme}
                  onChange={(event) => update("theme", event.target.value)}
                >
                  {themes.map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <fieldset>
                <legend>04 / Mode</legend>
                <div className="mode-options">
                  {modes.map(([value, label]) => (
                    <label key={value}>
                      <input
                        type="radio"
                        name="mode"
                        value={value}
                        checked={lab.mode === value}
                        onChange={(event) => update("mode", event.target.value)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="control-actions ly-cluster ly-gap-2">
                <button
                  className="interactive-surface"
                  data-surface-variant="primary"
                  type="button"
                  onClick={randomize}
                >
                  <SparkIcon />
                  Surprise me
                </button>
                <button
                  className="interactive-surface"
                  data-surface-variant="subtle"
                  type="button"
                  onClick={reset}
                >
                  Reset
                </button>
              </div>
            </form>

            <div className="active-config" aria-label="Active configuration">
              <span>
                <b>Layout</b>
                {labelFor(layouts, lab.layout)}
              </span>
              <span>
                <b>Style</b>
                {labelFor(uiStyles, lab.ui)}
              </span>
              <span>
                <b>Palette</b>
                {labelFor(themes, lab.theme)}
              </span>
              <span>
                <b>Mode</b>
                {labelFor(modes, lab.mode)}
              </span>
              <span className="live-status">Applied live</span>
            </div>

            <div
              className="product-preview ly-surface"
              aria-label="Interactive client portal example"
            >
              <aside className="preview-sidebar ly-surface">
                <div className="preview-logo" aria-hidden="true">
                  A
                </div>
                <div>
                  <strong>Atelier One</strong>
                  <small className="muted-copy">Client workspace</small>
                </div>
                <nav aria-label="Example portal navigation">
                  <a
                    className="interactive-surface"
                    data-surface-variant="subtle"
                    aria-current="page"
                    href="#preview-dashboard"
                  >
                    Overview
                  </a>
                  <a
                    className="interactive-surface"
                    data-surface-variant="subtle"
                    href="#preview-projects"
                  >
                    Projects
                  </a>
                  <a
                    className="interactive-surface"
                    data-surface-variant="subtle"
                    href="#preview-insights"
                  >
                    Insights
                  </a>
                </nav>
              </aside>

              <section className="preview-main" id="preview-dashboard">
                <header className="preview-header">
                  <div>
                    <small className="muted-copy">Interface preview</small>
                    <h3>Atelier One workspace</h3>
                  </div>
                  <span className="preview-mode">
                    {labelFor(modes, lab.mode)} mode
                  </span>
                </header>

                <dl className="metric-rail" id="preview-insights">
                  <div>
                    <dt className="muted-copy">Active projects</dt>
                    <dd>08</dd>
                  </div>
                  <div>
                    <dt className="muted-copy">On-time delivery</dt>
                    <dd>96%</dd>
                  </div>
                  <div>
                    <dt className="muted-copy">Client rating</dt>
                    <dd>4.9</dd>
                  </div>
                </dl>

                <div className="preview-cards" id="preview-projects">
                  <article className="ly-surface ly-pad-5 ly-stack ly-gap-3">
                    <div className="meta-line">
                      <span>Featured project</span>
                      <span>72%</span>
                    </div>
                    <h4>Northstar brand system</h4>
                    <p className="muted-copy">
                      Identity refresh, digital guidelines, and component
                      foundations.
                    </p>
                    <progress value="72" max="100">
                      72%
                    </progress>
                    <div className="card-actions ly-cluster ly-gap-2">
                      <button
                        className="interactive-surface"
                        data-surface-variant="primary"
                        type="button"
                        onClick={() =>
                          setNotice(
                            "Project details opened in the demonstration.",
                          )
                        }
                      >
                        View project
                      </button>
                      <button
                        className="interactive-surface"
                        data-surface-variant="subtle"
                        type="button"
                        aria-label={
                          saved
                            ? "Remove project from shortlist"
                            : "Save project to shortlist"
                        }
                        aria-pressed={saved}
                        onClick={() => {
                          setSaved((value) => !value);
                          setNotice(
                            saved
                              ? "Project removed from shortlist."
                              : "Project saved to shortlist.",
                          );
                        }}
                      >
                        {saved ? "Saved" : "Save"}
                      </button>
                    </div>
                  </article>

                  <aside className="ly-surface ly-pad-5 ly-stack ly-gap-3">
                    <small className="eyebrow">Interaction states</small>
                    <h4>Hover. Focus. Press.</h4>
                    <p className="muted-copy">
                      Primary, secondary, warning, and disabled states inherit
                      the active style system.
                    </p>
                    <div className="state-actions ly-cluster ly-gap-2">
                      <button
                        className="interactive-surface size-sm"
                        data-surface-variant="secondary"
                        type="button"
                      >
                        Secondary
                      </button>
                      <button
                        className="interactive-surface size-sm"
                        data-surface-variant="warning"
                        type="button"
                      >
                        Warning
                      </button>
                      <button
                        className="interactive-surface size-sm"
                        type="button"
                        disabled
                      >
                        Disabled
                      </button>
                    </div>
                  </aside>
                </div>
              </section>
            </div>

            <div className="code-strip ly-surface ly-pad-4">
              <div>
                <small>Four attributes. One shared contract.</small>
                <code tabIndex={0}>{configMarkup}</code>
              </div>
              <button
                className="interactive-surface"
                data-surface-variant="subtle"
                type="button"
                onClick={copyConfig}
              >
                {copyState}
              </button>
            </div>
          </div>
        </section>

        <FeatureShowcase />
        <InstallGuide />
        <LibraryDirectory />

        <section
          className="section-band ly-section"
          id="architecture"
          aria-labelledby="architecture-title"
        >
          <div className="ly-wrapper ly-wrapper--xl">
            <div className="section-heading">
              <p className="section-label">Architecture</p>
              <h2 id="architecture-title">
                Three layers. One shared contract.
              </h2>
              <p>
                Each package owns one concern, so geometry, identity, and
                behavior can evolve independently.
              </p>
            </div>
            <ol className="architecture-list">
              {ECOSYSTEM_PACKAGES.map((pkg, index) => (
                <li
                  className="ly-surface ly-pad-5 ly-stack ly-gap-3"
                  key={pkg.name}
                >
                  <span className="package-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="ly-stack ly-gap-1">
                    <small className="eyebrow">{pkg.layer}</small>
                    <h3>{pkg.name}</h3>
                  </div>
                  <p className="muted-copy">{pkg.summary}</p>
                  <code>{pkg.attribute}</code>
                </li>
              ))}
            </ol>
            <div className="root-contract ly-surface ly-stack ly-gap-2 ly-pad-4">
              <small className="eyebrow">Root markup</small>
              <code>{configMarkup}</code>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner ly-wrapper ly-wrapper--xl">
          <div className="footer-brand ly-cluster ly-gap-3">
            {/* Static export requires a relative public asset path under the GitHub Pages project route. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="footer-logo"
              src={SITE.brandLogoPath}
              width="56"
              height="56"
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
            />
            <p>
              <strong>{SITE.name}</strong>
              <small className="muted-copy">{SITE.productLine}</small>
              <small className="muted-copy">
                One semantic interface. Three focused CSS layers.
              </small>
            </p>
          </div>
          <a
            className="ly-cluster ly-gap-1"
            href={SITE.repository}
            target="_blank"
            rel="noreferrer noopener"
          >
            GitHub repository
            <ExternalLinkIcon />
            <span className="ly-visually-hidden"> (opens in a new tab)</span>
          </a>
          <nav className="footer-package-links" aria-label="Package links">
            {ECOSYSTEM_PACKAGES.map((pkg) => (
              <a
                key={pkg.name}
                href={pkg.links.npm}
                target="_blank"
                rel="noreferrer noopener"
              >
                {pkg.name}
                <span className="ly-visually-hidden">
                  {" "}
                  on npm (opens in a new tab)
                </span>
              </a>
            ))}
          </nav>
        </div>
      </footer>

      <p className="ly-visually-hidden" aria-live="polite" aria-atomic="true">
        {notice}
      </p>
    </div>
  );
}
