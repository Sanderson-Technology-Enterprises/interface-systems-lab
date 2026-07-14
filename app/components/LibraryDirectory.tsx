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
    <section className="library-section ly-section" id="libraries" aria-labelledby="libraries-title">
      <div className="ly-wrapper ly-wrapper--xl">
        <div className="section-heading">
          <div>
            <p className="section-label">Library resources</p>
            <h2 id="libraries-title">One job per package</h2>
          </div>
          <p>
            Adopt one layer or all three. Every package remains independently
            useful, documented, and versioned.
          </p>
        </div>

        <ol className="library-list">
          {ECOSYSTEM_PACKAGES.map((pkg, index) => (
            <li key={pkg.name}>
              <span className="library-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="library-identity">
                <small>{pkg.layer}</small>
                <h3>{pkg.name}</h3>
                <p>{pkg.summary}</p>
              </div>
              <code>v{pkg.version}</code>
              <nav aria-label={`${pkg.displayName} resources`}>
                {resourceOrder.map((resource) => (
                  <a
                    key={resource}
                    href={pkg.links[resource]}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {resourceLabels[resource]}
                    <ExternalLinkIcon />
                    <span className="sr-only"> (opens in a new tab)</span>
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
