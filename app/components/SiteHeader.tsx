import { SITE, withBasePath } from "../lib/site";
import { ResponsiveNavigation } from "./ResponsiveNavigation";

type SiteHeaderProps = {
  companyUrl: string;
};

export function SiteHeader({ companyUrl }: SiteHeaderProps) {
  return (
    <header className="site-header ly-header ly-header--sticky">
      <div className="site-header-inner ly-wrapper">
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

        <ResponsiveNavigation
          companyUrl={companyUrl}
          repositoryUrl={SITE.repository}
        />
      </div>
    </header>
  );
}
