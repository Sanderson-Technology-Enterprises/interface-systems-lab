import { ExternalLinkIcon } from "./Icons";
import { SITE, withBasePath } from "../lib/site";

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
          {/* The explicit helper keeps this rendered asset correct in local and Pages builds. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="brand-logo"
            src={withBasePath("/favicon-48x48.png")}
            width="48"
            height="48"
            alt=""
            aria-hidden="true"
            decoding="async"
            fetchPriority="high"
          />
          <span className="brand-copy ly-stack ly-gap-2">
            <span className="brand-title">{SITE.name}</span>
            <span className="brand-owner">{SITE.productLine}</span>
          </span>
        </a>

        <div className="header-links ly-cluster ly-gap-2">
          <a
            className="interactive-surface site-action"
            data-surface-variant="accent"
            data-surface-level="2"
            href={companyUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            Discover STE
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
        <span className="primary-nav-cue" aria-hidden="true">
          Scroll for more →
        </span>
      </div>
    </header>
  );
}
