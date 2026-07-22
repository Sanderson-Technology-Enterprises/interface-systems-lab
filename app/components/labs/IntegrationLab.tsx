import fixtureCatalog from "../../data/integration-fixtures.json";
import { withBasePath } from "../../lib/site";

type FixtureDefinition = (typeof fixtureCatalog)[number];

function FixtureCard({ fixture }: { fixture: FixtureDefinition }) {
  return (
    <article
      className="integration-card ly-stack ly-gap-3"
      id={`fixture-${fixture.id}`}
      data-fixture-card={fixture.id}
    >
      <header className="ly-stack ly-gap-2">
        <div className="ly-cluster ly-gap-2">
          <p className="section-label">
            {fixture.deprecated ? "Deprecated" : "Isolated proof"}
          </p>
          <code>{fixture.packages.join(" + ")}</code>
        </div>
        <h3>{fixture.title}</h3>
        <p className="muted-copy">{fixture.summary}</p>
      </header>
      <iframe
        className="integration-frame"
        data-integration-fixture={fixture.id}
        loading="lazy"
        referrerPolicy="no-referrer"
        src={withBasePath(`/fixtures/generated/${fixture.id}.html`)}
        title={`${fixture.title} integration proof`}
      />
    </article>
  );
}

function FixtureGroup({
  group,
  label,
  fixtures,
}: {
  group: "one" | "pair" | "legacy";
  label: string;
  fixtures: FixtureDefinition[];
}) {
  return (
    <details className="integration-disclosure" data-integration-group={group}>
      <summary>{label}</summary>
      <div className="integration-grid ly-grid ly-grid--auto ly-gap-6">
        {fixtures.map((fixture) => (
          <FixtureCard fixture={fixture} key={fixture.id} />
        ))}
      </div>
    </details>
  );
}

export function IntegrationLab() {
  const canonical = fixtureCatalog.find(
    (fixture) => fixture.id === "all-canonical",
  );
  if (canonical === undefined) {
    throw new Error("The canonical integration fixture is missing.");
  }

  const fixturesFor = (group: FixtureDefinition["group"]) =>
    fixtureCatalog.filter((fixture) => fixture.group === group);

  return (
    <section
      className="integration-lab section-band ly-section"
      id="integrate"
      aria-labelledby="integrate-title"
    >
      <div className="ly-wrapper ly-stack ly-gap-7">
        <div className="section-heading ly-split ly-gap-6 ly-items-end">
          <div className="ly-stack ly-gap-2">
            <p className="section-label">Isolated integration laboratory</p>
            <h2 id="integrate-title">Prove every adoption boundary.</h2>
          </div>
          <p>
            Each iframe uses a fixed baseline configuration and local CSS copied
            from the pinned packages. That isolation keeps comparisons stable
            while the surrounding showcase changes personality, preset, theme,
            and mode.
          </p>
        </div>

        <div data-integration-group="all">
          <FixtureCard fixture={canonical} />
        </div>

        <div className="integration-disclosures ly-stack ly-gap-4">
          <FixtureGroup
            fixtures={fixturesFor("one")}
            group="one"
            label="Use one package at a time"
          />
          <FixtureGroup
            fixtures={fixturesFor("pair")}
            group="pair"
            label="Compose two independent layers"
          />
          <FixtureGroup
            fixtures={fixturesFor("legacy")}
            group="legacy"
            label="Deprecated migration-only compatibility"
          />
        </div>

        <nav
          className="integration-paths ly-split ly-gap-4"
          aria-label="Integration adoption paths"
        >
          <a
            className="interactive-surface site-action"
            data-surface-variant="primary"
            data-surface-level="2"
            href="#install"
          >
            Choose an installation path
          </a>
          <a
            className="interactive-surface site-action"
            data-surface-variant="accent"
            data-surface-level="2"
            href="#company"
          >
            Plan organizational adoption
          </a>
        </nav>
      </div>
    </section>
  );
}
