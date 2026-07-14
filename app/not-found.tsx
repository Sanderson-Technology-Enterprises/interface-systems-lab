import type { Metadata } from "next";

import { withBasePath } from "./lib/site";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The requested Interface Systems Lab page does not exist.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
};

export default function NotFound() {
  return (
    <main className="not-found ly-root ly-page">
      <div className="ly-wrapper ly-wrapper--readable ly-section ly-stack">
        <p className="not-found-code">404</p>
        <h1>This interface is outside the system.</h1>
        <p>
          The requested page does not exist. Return to the lab to explore the
          live CSS ecosystem.
        </p>
        <a
          className="interactive-surface"
          data-surface-variant="primary"
          href={withBasePath("/")}
        >
          Return to Interface Systems Lab
        </a>
      </div>
    </main>
  );
}
