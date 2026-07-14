import { ECOSYSTEM_PACKAGES } from "../data/ecosystem";

export function InterfaceObservatory() {
  return (
    <figure className="observatory" aria-labelledby="observatory-caption">
      <figcaption id="observatory-caption" className="sr-only">
        Interface Observatory: structure, identity, and behavior orbit one
        semantic interface core.
      </figcaption>

      <div className="observatory-stage" aria-hidden="true">
        <span className="orbit orbit-layout">
          <i />
        </span>
        <span className="orbit orbit-identity">
          <i />
        </span>
        <span className="orbit orbit-behavior">
          <i />
        </span>
        <span className="observatory-core">
          <b>One</b>
          <small>interface core</small>
        </span>
      </div>

      <ol className="observatory-legend" aria-label="Interface Observatory layers">
        {ECOSYSTEM_PACKAGES.map((pkg, index) => (
          <li key={pkg.name}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <strong>{pkg.layer}</strong>
              <small>{pkg.name}</small>
            </div>
          </li>
        ))}
      </ol>
    </figure>
  );
}
