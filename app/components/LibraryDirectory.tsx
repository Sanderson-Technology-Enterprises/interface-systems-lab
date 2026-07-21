import { ECOSYSTEM_PACKAGES, type ResourceLink } from "../data/ecosystem";
import { ExternalLinkIcon } from "./Icons";

const resourceLabels: Record<ResourceLink, string> = {
  repository: "Repository",
  wiki: "Wiki",
  npm: "npm package",
  demo: "Live demo",
};

const resourceOrder: readonly ResourceLink[] = [
  "repository",
  "wiki",
  "npm",
  "demo",
];

export function LibraryDirectory() {
  return (
    <section
      className="section-band ly-section"
      id="libraries"
      aria-labelledby="libraries-title"
    >
      <div className="ly-wrapper">
        <div className="section-heading ly-split ly-gap-6 ly-items-end">
          <div>
            <p className="section-label">Library resources</p>
            <h2 id="libraries-title">One job per package</h2>
          </div>
          <p>
            Adopt one layer or all three. Every package remains independently
            useful, documented, and versioned.
          </p>
        </div>

        <ol className="library-list ly-stack ly-gap-0">
          {ECOSYSTEM_PACKAGES.map((pkg, index) => (
            <li
              className="ly-grid ly-cols-1 ly-md-cols-4 ly-gap-4 ly-py-6"
              key={pkg.name}
            >
              <span className="library-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="ly-stack ly-gap-2">
                <small className="eyebrow">{pkg.layer}</small>
                <h3>{pkg.name}</h3>
                <p className="muted-copy">{pkg.summary}</p>
              </div>
              <code>v{pkg.version}</code>
              <nav
                className="ly-cluster ly-gap-2"
                aria-label={`${pkg.displayName} resources`}
              >
                {resourceOrder.map((resource) => (
                  <a
                    className="interactive-surface site-action"
                    data-surface-variant="subtle"
                    data-surface-level="1"
                    key={resource}
                    href={pkg.links[resource]}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {resourceLabels[resource]}
                    <ExternalLinkIcon />
                    <span className="ly-visually-hidden">
                      {" "}
                      (opens in a new tab)
                    </span>
                  </a>
                ))}
              </nav>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
