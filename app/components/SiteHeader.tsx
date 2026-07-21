import { ExternalLinkIcon } from "./Icons";
import { SITE } from "../lib/site";

const navigationItems = [
  ["Home", "top"],
  ["Workbench", "workbench"],
  ["Layout", "layouts"],
  ["UI + native", "ui-native"],
  ["Interactions", "interactions"],
  ["Integrate", "integrate"],
  ["Install", "install"],
  ["Libraries", "libraries"],
  ["Company", "company"],
] as const;

type SiteHeaderProps = {
  companyUrl: string;
};

export function SiteHeader({ companyUrl }: SiteHeaderProps) {
  return (
    <header className="site-header ly-header ly-header--sticky">
      <div className="site-header-inner ly-wrapper ly-cluster ly-gap-4 ly-justify-between">
        <a
          className="brand ly-cluster ly-gap-2"
          href="#top"
          aria-label="Interface Systems Lab home"
        >
          {/* A relative public path remains valid under the exported Pages project route. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="brand-logo"
            src="favicon-48x48.png"
            width="48"
            height="48"
            alt=""
            aria-hidden="true"
            decoding="async"
            fetchPriority="high"
          />
          <span className="brand-copy ly-stack ly-gap-1">
            <span className="brand-title">{SITE.name}</span>
            <span className="brand-owner">{SITE.productLine}</span>
          </span>
        </a>

        <nav
          className="primary-nav ly-cluster ly-gap-4"
          aria-label="Primary navigation"
        >
          {navigationItems.map(([label, id]) => (
            <a href={`#${id}`} key={id}>
              {label}
            </a>
          ))}
        </nav>

        <div className="header-links ly-cluster ly-gap-2">
          <a
            className="interactive-surface site-action"
            data-surface-variant="accent"
            data-surface-level="2"
            href={companyUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            Sanderson
            <ExternalLinkIcon />
            <span className="ly-visually-hidden"> (opens in a new tab)</span>
          </a>
          <a
            className="interactive-surface site-action"
            data-surface-variant="subtle"
            data-surface-level="1"
            href={SITE.repository}
            target="_blank"
            rel="noreferrer noopener"
          >
            GitHub
            <ExternalLinkIcon />
            <span className="ly-visually-hidden"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </header>
  );
}
