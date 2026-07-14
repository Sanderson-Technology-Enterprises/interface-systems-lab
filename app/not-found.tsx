import { withBasePath } from "./lib/site";

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
