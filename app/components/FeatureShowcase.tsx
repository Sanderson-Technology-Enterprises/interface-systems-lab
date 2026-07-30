import { ArrowRightIcon, ExternalLinkIcon } from "./Icons";

export function FeatureShowcase() {
  return (
    <section
      className="section-band ly-section"
      id="features"
      aria-labelledby="features-title"
    >
      <div className="ly-wrapper">
        <div className="section-heading">
          <p className="section-label">Library proof cards</p>
          <h2 id="features-title">Library proof cards</h2>
          <p>
            Each card keeps one package in focus while relying on the shared
            root attributes for the active layout, UI style, palette, and mode.
          </p>
        </div>

        <div className="proof-grid">
          <article className="proof-card ly-surface ly-pad-6 ly-stack ly-gap-4">
            <header className="ly-stack ly-gap-2">
              <small className="eyebrow">layout-style-css</small>
              <h3>Structure proof</h3>
              <code>ly-stack + ly-cluster + ly-frame</code>
            </header>
            <div className="proof-layout-sample">
              <div className="ly-frame ly-frame-4x3 ly-surface ly-pad-4">
                <strong>4:3 frame</strong>
              </div>
              <div className="ly-stack ly-gap-2">
                <span className="ly-surface ly-pad-4">Wrapper</span>
                <span className="ly-surface ly-pad-4">Stack</span>
                <span className="ly-surface ly-pad-4">Cluster</span>
              </div>
            </div>
          </article>

          <article className="proof-card ly-surface ly-pad-6 ly-stack ly-gap-4">
            <header className="ly-stack ly-gap-2">
              <small className="eyebrow">ui-style-kit-css</small>
              <h3>Identity proof</h3>
              <code>forms + table + native progress</code>
            </header>
            <form
              className="proof-form ly-stack ly-gap-4"
              aria-label="Identity proof sample"
              onSubmit={(event) => event.preventDefault()}
            >
              <label>
                <span>System preset</span>
                <select defaultValue="bento">
                  <option value="bento">Bento</option>
                  <option value="bauhaus">Bauhaus</option>
                  <option value="cyberpunk">Cyberpunk</option>
                </select>
              </label>
              <label>
                <span>Completion</span>
                <input type="range" min="0" max="100" defaultValue="72" />
              </label>
              <table>
                <caption>Identity token sample</caption>
                <tbody>
                  <tr>
                    <th scope="row">Theme</th>
                    <td>Active</td>
                  </tr>
                </tbody>
              </table>
            </form>
          </article>

          <article className="proof-card ly-surface ly-pad-6 ly-stack ly-gap-4">
            <header className="ly-stack ly-gap-2">
              <small className="eyebrow">interactive-surface-css</small>
              <h3>Behavior proof</h3>
              <code>hover + focus + pressed + disabled</code>
            </header>
            <div
              className="proof-actions ly-cluster ly-gap-2"
              aria-label="Behavior proof sample"
            >
              <button
                className="interactive-surface site-action"
                data-surface-variant="primary"
                data-surface-level="2"
                type="button"
              >
                Primary
                <ArrowRightIcon />
              </button>
              <button
                className="interactive-surface site-action"
                data-surface-variant="accent"
                data-surface-level="2"
                aria-pressed="true"
                type="button"
              >
                Pressed
              </button>
              <button
                className="interactive-surface site-action"
                data-surface-variant="subtle"
                data-surface-level="1"
                type="button"
                aria-label="Open proof action"
              >
                <ExternalLinkIcon />
              </button>
              <button
                className="interactive-surface site-action"
                type="button"
                disabled
              >
                Disabled
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
