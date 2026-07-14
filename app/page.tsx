"use client";

import { useEffect, useMemo, useState } from "react";

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

const labelFor = (items: readonly (readonly [string, string])[], value: string) =>
  items.find(([key]) => key === value)?.[1] ?? value;

export default function Home() {
  const [lab, setLab] = useState<LabState>(defaults);
  const [saved, setSaved] = useState(false);
  const [copyState, setCopyState] = useState("Copy configuration");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    window.localStorage.setItem("interface-lab-preferences", JSON.stringify(lab));
  }, [lab]);

  const configMarkup = useMemo(
    () =>
      `<main class="ly-root" data-layout="${lab.layout}" data-ui="${lab.ui}" data-theme="${lab.theme}" data-mode="${lab.mode}">`,
    [lab],
  );

  const update = (key: keyof LabState, value: string) => {
    setLab((current) => ({ ...current, [key]: value }));
    setNotice(`${key === "ui" ? "Visual style" : key} changed to ${value}.`);
  };

  const randomize = () => {
    const pick = (items: readonly (readonly [string, string])[]) =>
      items[Math.floor(Math.random() * items.length)][0];

    const next = {
      layout: pick(layouts),
      ui: pick(uiStyles),
      theme: pick(themes),
      mode: pick(modes),
    };
    setLab(next);
    setNotice("A new interface direction is ready.");
  };

  const reset = () => {
    setLab(defaults);
    setNotice("The showcase has been reset to Midnight Gold.");
  };

  const copyConfig = async () => {
    try {
      await navigator.clipboard.writeText(configMarkup);
      setCopyState("Copied");
      setNotice("Configuration copied to the clipboard.");
      window.setTimeout(() => setCopyState("Copy configuration"), 1800);
    } catch {
      setCopyState("Select code to copy");
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
        <div className="ly-wrapper ly-wrapper--xl header-inner">
          <a className="brand" href="#top" aria-label="Interface Systems Lab home">
            <span className="brand-mark" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>
              <strong>Interface</strong>
              <small>Systems Lab</small>
            </span>
          </a>

          <nav aria-label="Primary navigation">
            <a href="#workbench">Workbench</a>
            <a href="#layers">The system</a>
            <a href="#contact">Start a project</a>
          </nav>
          <span className="version-chip" aria-label="Three current package releases">
            3 packages · CSS only
          </span>
        </div>
      </header>

      <main id="main-content">
        <section className="hero ly-wrapper ly-wrapper--xl ly-section" id="top">
          <div className="hero-copy ly-stack">
            <p className="eyebrow"><span /> Live design-system showcase</p>
            <h1>
              One interface.<br />
              <em>5,280 directions.</em>
            </h1>
            <p className="hero-lede">
              Three focused CSS libraries separate structure, visual identity, and interaction—so a client experience can change character without a rebuild.
            </p>
            <div className="ly-button-group hero-actions">
              <a
                className="interactive-surface size-lg"
                data-surface-variant="primary"
                data-surface-level="2"
                href="#workbench"
              >
                Open the workbench <span aria-hidden="true">↘</span>
              </a>
              <a
                className="interactive-surface size-lg"
                data-surface-variant="subtle"
                data-surface-level="1"
                href="#layers"
              >
                See how it works
              </a>
            </div>
          </div>

          <aside className="hero-instrument" aria-label="System capability summary">
            <div className="instrument-head">
              <span>System range</span>
              <span className="live-dot">Live</span>
            </div>
            <dl>
              <div><dt>Layout personalities</dt><dd>16</dd></div>
              <div><dt>Visual systems</dt><dd>11</dd></div>
              <div><dt>Color palettes</dt><dd>10</dd></div>
              <div><dt>Display modes</dt><dd>03</dd></div>
            </dl>
            <div className="signal-bars" aria-hidden="true">
              {Array.from({ length: 18 }, (_, index) => <i key={index} />)}
            </div>
            <p>Swap every layer independently. Keep the markup, accessibility model, and component behavior consistent.</p>
          </aside>
        </section>

        <section className="workbench-section ly-section" id="workbench" aria-labelledby="workbench-title">
          <div className="ly-wrapper ly-wrapper--xl">
            <div className="section-heading">
              <div>
                <p className="eyebrow"><span /> Try it yourself</p>
                <h2 id="workbench-title">The client-ready workbench</h2>
              </div>
              <p>Change any control. The product shell, native elements, and interactive states update together.</p>
            </div>

            <form className="control-deck" aria-label="Interface configuration" onSubmit={(event) => event.preventDefault()}>
              <label>
                <span>01 · Layout</span>
                <select value={lab.layout} onChange={(event) => update("layout", event.target.value)}>
                  {layouts.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                </select>
              </label>
              <label>
                <span>02 · Visual style</span>
                <select value={lab.ui} onChange={(event) => update("ui", event.target.value)}>
                  {uiStyles.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                </select>
              </label>
              <label>
                <span>03 · Palette</span>
                <select value={lab.theme} onChange={(event) => update("theme", event.target.value)}>
                  {themes.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                </select>
              </label>
              <fieldset>
                <legend>04 · Mode</legend>
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
              <div className="control-actions">
                <button className="interactive-surface" data-surface-variant="primary" type="button" onClick={randomize}>
                  Surprise me
                </button>
                <button className="interactive-surface" data-surface-variant="subtle" type="button" onClick={reset}>
                  Reset
                </button>
              </div>
            </form>

            <div className="active-config" aria-label="Active configuration">
              <span><b>Layout</b>{labelFor(layouts, lab.layout)}</span>
              <span><b>Style</b>{labelFor(uiStyles, lab.ui)}</span>
              <span><b>Palette</b>{labelFor(themes, lab.theme)}</span>
              <span><b>Mode</b>{labelFor(modes, lab.mode)}</span>
              <span className="live-status">Applied live</span>
            </div>

            <div className="product-preview ly-app-shell" aria-label="Interactive client portal example">
              <aside className="ly-app-sidebar preview-sidebar">
                <div className="preview-logo" aria-hidden="true">A</div>
                <p><strong>Atelier One</strong><small>Client workspace</small></p>
                <nav aria-label="Example portal navigation">
                  <a className="interactive-surface" data-surface-variant="subtle" aria-current="page" href="#preview-dashboard">Overview</a>
                  <a className="interactive-surface" data-surface-variant="subtle" href="#preview-projects">Projects</a>
                  <a className="interactive-surface" data-surface-variant="subtle" href="#preview-insights">Insights</a>
                </nav>
                <div className="preview-person">
                  <span aria-hidden="true">MK</span>
                  <p><strong>Maya King</strong><small>Creative director</small></p>
                </div>
              </aside>

              <header className="ly-app-header preview-header">
                <div>
                  <small>Monday, July 13</small>
                  <strong>Good afternoon, Maya.</strong>
                </div>
                <button className="interactive-surface icon-only" data-surface-variant="subtle" aria-label="Open notifications">
                  <span aria-hidden="true">●</span>
                </button>
              </header>

              <div className="ly-app-main preview-main" id="preview-dashboard">
                <div className="preview-title">
                  <div>
                    <p className="eyebrow">Workspace overview</p>
                    <h3>Your week at a glance</h3>
                  </div>
                  <button className="interactive-surface" data-surface-variant="primary" onClick={() => setNotice("A new project action was demonstrated.")}>New project</button>
                </div>

                <div className="ly-card-grid metric-grid" id="preview-insights">
                  <article className="metric-card">
                    <small>Active projects</small><strong>08</strong><span>+2 this month</span>
                  </article>
                  <article className="metric-card">
                    <small>On-time delivery</small><strong>96%</strong><span>Above target</span>
                  </article>
                  <article className="metric-card">
                    <small>Client rating</small><strong>4.9</strong><span>From 24 reviews</span>
                  </article>
                </div>

                <div className="preview-lower" id="preview-projects">
                  <article className="project-card">
                    <div className="card-topline">
                      <span>Featured project</span><span className="status-pill">In progress</span>
                    </div>
                    <h4>Northstar brand system</h4>
                    <p>Identity refresh, digital guidelines, and launch-ready component foundations.</p>
                    <div className="progress-meta"><span>Progress</span><strong>72%</strong></div>
                    <progress value="72" max="100">72%</progress>
                    <div className="ly-button-group card-actions">
                      <button className="interactive-surface" data-surface-variant="primary" data-surface-level="2" onClick={() => setNotice("Project details opened in the demonstration.")}>View project</button>
                      <button
                        className="interactive-surface icon-only"
                        data-surface-variant="subtle"
                        aria-label={saved ? "Remove project from shortlist" : "Save project to shortlist"}
                        aria-pressed={saved}
                        onClick={() => { setSaved((value) => !value); setNotice(saved ? "Project removed from shortlist." : "Project saved to shortlist."); }}
                      >
                        <span aria-hidden="true">{saved ? "★" : "☆"}</span>
                      </button>
                    </div>
                  </article>

                  <aside className="state-lab">
                    <p className="eyebrow">Interaction states</p>
                    <h4>Hover. Focus. Press.</h4>
                    <p>Try Tab, Shift + Tab, Enter, and Space. Focus stays visible; touch targets remain generous; reduced-motion preferences are respected.</p>
                    <div className="surface-row">
                      <button className="interactive-surface size-sm" data-surface-variant="secondary">Secondary</button>
                      <button className="interactive-surface size-sm" data-surface-variant="warning">Warning</button>
                      <button className="interactive-surface size-sm" disabled>Disabled</button>
                    </div>
                  </aside>
                </div>
              </div>
            </div>

            <div className="code-strip">
              <div>
                <small>Four attributes. One shared contract.</small>
                <code tabIndex={0}>{configMarkup}</code>
              </div>
              <button className="interactive-surface" data-surface-variant="subtle" type="button" onClick={copyConfig}>{copyState}</button>
            </div>
          </div>
        </section>

        <section className="system-section ly-wrapper ly-wrapper--xl ly-section" id="layers" aria-labelledby="layers-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><span /> Clear ownership</p>
              <h2 id="layers-title">Three layers. No tangled CSS.</h2>
            </div>
            <p>Each package has one job, making the system easier to customize, test, and maintain.</p>
          </div>

          <ol className="layer-list">
            <li className="interactive-surface" data-surface-level="1">
              <span className="layer-index">01</span>
              <div><small>Structure</small><h3>layout-style-css</h3></div>
              <p>Responsive shells, wrappers, grids, panes, and 16 switchable layout personalities.</p>
              <code>data-layout=&quot;bento&quot;</code>
            </li>
            <li className="interactive-surface" data-surface-level="2">
              <span className="layer-index">02</span>
              <div><small>Identity</small><h3>ui-style-kit-css</h3></div>
              <p>Eleven visual systems, ten palettes, native-element coverage, and light, dark, or contrast modes.</p>
              <code>data-ui=&quot;bauhaus&quot;</code>
            </li>
            <li className="interactive-surface" data-surface-level="3">
              <span className="layer-index">03</span>
              <div><small>Behavior</small><h3>interactive-surface-css</h3></div>
              <p>Consistent hover, focus-visible, active, pressed, and disabled states across every brand direction.</p>
              <code>class=&quot;interactive-surface&quot;</code>
            </li>
          </ol>

          <div className="outcomes">
            <article><span aria-hidden="true">↗</span><h3>Faster brand fit</h3><p>Explore credible directions with clients before committing to expensive component rewrites.</p></article>
            <article><span aria-hidden="true">⌘</span><h3>Accessible by design</h3><p>Semantic HTML, visible focus, forced-color support, reduced motion, and 44px icon targets are part of the baseline.</p></article>
            <article><span aria-hidden="true">◎</span><h3>Calmer maintenance</h3><p>Change geometry, paint, or behavior independently while keeping a stable component contract.</p></article>
          </div>
        </section>

        <section className="contact-section" id="contact" aria-labelledby="contact-title">
          <div className="ly-wrapper ly-wrapper--xl contact-inner">
            <p className="eyebrow"><span /> Built for real client work</p>
            <h2 id="contact-title">Your brand should feel custom.<br />Your system should stay dependable.</h2>
            <p>Use this foundation for marketing sites, client portals, dashboards, creator platforms, or any product that needs a distinct identity without duplicated UI logic.</p>
            <a
              className="interactive-surface size-lg"
              data-surface-variant="primary"
              data-surface-level="3"
              href="mailto:admin@sandersontechnologyenterprises.com?subject=Interface%20system%20project"
            >
              Start a conversation <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="ly-wrapper ly-wrapper--xl">
          <p><strong>Interface Systems Lab</strong><span>Built with layout-style-css 1.1.2, ui-style-kit-css 2.0.3, and interactive-surface-css 1.3.0.</span></p>
          <div>
            <a href="https://github.com/Foscat/layout-style-css">Layout</a>
            <a href="https://github.com/Foscat/ui-style-kit-css">UI Kit</a>
            <a href="https://github.com/Foscat/Interactive-Surface-CSS">Surfaces</a>
          </div>
        </div>
      </footer>

      <p className="sr-only" aria-live="polite" aria-atomic="true">{notice}</p>
    </div>
  );
}
