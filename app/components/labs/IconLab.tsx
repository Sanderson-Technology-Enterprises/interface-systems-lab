"use client";

import { getPack, type IconFrame, type IconName } from "ui-style-kit-icons";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { getUiPrefix } from "../../data/catalog";
import { UiIcon } from "../UiIcon";
import { useLabConfiguration } from "../LabExperience";

const ICON_FRAMES = [
  "auto",
  "soft",
  "none",
] as const satisfies readonly IconFrame[];

const ICON_SPECIMENS = [
  ["dashboard", "Dashboard"],
  ["browser", "Browser"],
  ["palette", "Visual identity"],
  ["layers", "Layers"],
  ["activity", "Activity"],
  ["shield", "Security"],
  ["database", "Data"],
  ["credit-card", "Commerce"],
  ["message", "Communication"],
  ["warning", "Feedback"],
  ["terminal", "Developer tools"],
  ["rocket", "Delivery"],
] as const satisfies readonly (readonly [IconName, string])[];

export function IconLab() {
  const { configuration } = useLabConfiguration();
  const [frame, setFrame] = useState<IconFrame>("auto");
  const [errorMessage, setErrorMessage] = useState("");
  const sectionRef = useRef<HTMLElement | null>(null);
  const pack = getPack(configuration.ui);
  const uiPrefix = getUiPrefix(configuration.ui);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleError = () => {
      setErrorMessage(
        "One or more icon assets could not load. Text labels remain available.",
      );
    };
    section.addEventListener("usk-icon-error", handleError);
    // Custom elements may upgrade before React effects subscribe to their events.
    if (section.querySelector("usk-icon[data-error]")) handleError();
    return () => {
      section.removeEventListener("usk-icon-error", handleError);
    };
  }, []);

  const handleFrameChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selected = ICON_FRAMES.find(
      (candidate) => candidate === event.target.value,
    );
    if (selected) setFrame(selected);
  };

  return (
    <section
      ref={sectionRef}
      className="icon-lab section-band ly-section"
      id="icons"
      data-icon-lab
      aria-labelledby="icons-title"
    >
      <div className="ly-wrapper ly-stack ly-gap-6">
        <div className="section-heading ly-split ly-gap-6 ly-items-end">
          <div className="ly-stack ly-gap-2">
            <p className="section-label">Iconography laboratory</p>
            <h2 id="icons-title">One meaning, styled for every interface.</h2>
          </div>
          <p>
            Visual Style selects the artwork pack automatically. Palette and
            mode then supply color and contrast without changing semantics.
          </p>
        </div>

        <div className="icon-lab-toolbar ly-cluster ly-gap-4">
          <p>
            Active pack: <strong data-active-icon-pack>{pack.label}</strong>
          </p>
          <label>
            <span>Icon frame</span>
            <select value={frame} onChange={handleFrameChange}>
              {ICON_FRAMES.map((value) => (
                <option value={value} key={value}>
                  {value === "auto"
                    ? "Authored"
                    : `${value.charAt(0).toUpperCase()}${value.slice(1)}`}
                </option>
              ))}
            </select>
          </label>
          <button
            className={`${uiPrefix}-button icon-frame-action`}
            type="button"
            onClick={() => setFrame("auto")}
          >
            <UiIcon decorative frame={frame} name="palette" size="1.25em" />
            Restore authored frame
          </button>
        </div>

        <div className="icon-specimen-grid ly-grid ly-gap-4">
          {ICON_SPECIMENS.map(([name, label]) => (
            <article
              className={`icon-specimen ${uiPrefix}-card ly-stack ly-gap-2 ly-pad-4`}
              data-icon-specimen={name}
              key={name}
            >
              <UiIcon decorative frame={frame} name={name} size="3rem" />
              <strong>{label}</strong>
              <code>{name}</code>
            </article>
          ))}
        </div>

        <div className="icon-accessibility-proof ly-cluster ly-gap-4">
          <UiIcon
            frame={frame}
            label={`${pack.label} palette icon`}
            name="palette"
            size="3rem"
          />
          <p>
            Standalone meaningful icons announce a label; icons beside visible
            text are decorative.
          </p>
        </div>

        <p className="muted-copy">
          Bauhaus intentionally uses the neutral System pack. Retrofuturism uses
          Synthwave artwork.
        </p>
        <p className="ly-visually-hidden" aria-live="polite">
          {errorMessage}
        </p>
      </div>
    </section>
  );
}
