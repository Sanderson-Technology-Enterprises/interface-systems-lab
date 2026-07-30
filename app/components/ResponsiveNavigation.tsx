"use client";

import { useEffect, useRef, useState } from "react";

import { ExternalLinkIcon } from "./Icons";
import { UiIcon } from "./UiIcon";

const DESKTOP_NAVIGATION_QUERY = "(min-width: 78.0625rem)";
const PRIMARY_NAVIGATION_PANEL_ID = "primary-navigation-panel";

const navigationItems = [
  ["Home", "top"],
  ["Workbench", "workbench"],
  ["Layout", "layouts"],
  ["UI + native", "ui-native"],
  ["Icons", "icons"],
  ["Interactions", "interactions"],
  ["Integrate", "integrate"],
  ["Install", "install"],
  ["Libraries", "libraries"],
  ["Company", "company"],
] as const;

type ResponsiveNavigationProps = {
  companyUrl: string;
  repositoryUrl: string;
};

export function ResponsiveNavigation({
  companyUrl,
  repositoryUrl,
}: ResponsiveNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeFromOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !navigationRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    const closeFromEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setIsOpen(false);
      menuButtonRef.current?.focus();
    };

    document.addEventListener("pointerdown", closeFromOutside);
    document.addEventListener("keydown", closeFromEscape);
    return () => {
      document.removeEventListener("pointerdown", closeFromOutside);
      document.removeEventListener("keydown", closeFromEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    const desktopNavigation = window.matchMedia(DESKTOP_NAVIGATION_QUERY);
    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setIsOpen(false);
    };

    desktopNavigation.addEventListener("change", closeAtDesktop);
    return () => {
      desktopNavigation.removeEventListener("change", closeAtDesktop);
    };
  }, []);

  const closeNavigation = () => setIsOpen(false);

  return (
    <div className="site-navigation" ref={navigationRef}>
      <button
        ref={menuButtonRef}
        className="navigation-toggle interactive-surface site-action"
        data-surface-variant="subtle"
        data-surface-level="1"
        type="button"
        aria-controls={PRIMARY_NAVIGATION_PANEL_ID}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        onClick={() => setIsOpen((currentState) => !currentState)}
      >
        <UiIcon decorative name="menu" size="1.1em" />
        <span>Menu</span>
      </button>

      <div
        className="navigation-panel"
        id={PRIMARY_NAVIGATION_PANEL_ID}
        data-open={isOpen}
      >
        <nav className="primary-nav" aria-label="Primary navigation">
          {navigationItems.map(([label, id]) => (
            <a
              className="navigation-link interactive-surface site-action"
              data-surface-variant="subtle"
              data-surface-level="1"
              href={`#${id}`}
              key={id}
              onClick={closeNavigation}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="navigation-actions">
          <a
            className="interactive-surface site-action"
            data-surface-variant="accent"
            data-surface-level="2"
            href={companyUrl}
            target="_blank"
            rel="noreferrer noopener"
            onClick={closeNavigation}
          >
            Discover STE
            <ExternalLinkIcon />
            <span className="ly-visually-hidden"> (opens in a new tab)</span>
          </a>
          <a
            className="interactive-surface site-action"
            data-surface-variant="subtle"
            data-surface-level="1"
            href={repositoryUrl}
            target="_blank"
            rel="noreferrer noopener"
            onClick={closeNavigation}
          >
            GitHub
            <ExternalLinkIcon />
            <span className="ly-visually-hidden"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </div>
  );
}
