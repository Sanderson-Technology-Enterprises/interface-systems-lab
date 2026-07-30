"use client";

import React from "react";
import type { IconFrame, IconName } from "ui-style-kit-icons";

import { withBasePath } from "../lib/site";

let iconElementRegistration: Promise<unknown> | undefined;

function registerIconElement(): Promise<unknown> {
  // Defer registration until React hydrates so the element cannot mutate SSR attributes first.
  iconElementRegistration ??= import("ui-style-kit-icons/element");
  return iconElementRegistration;
}

const ICON_ASSET_BASE = withBasePath(
  "/assets/ui-style-kit-icons/1.0.0/",
  process.env.NEXT_PUBLIC_PAGES_BASE_PATH ?? "",
);

type UiIconBaseProps = {
  className?: string;
  frame?: IconFrame;
  name: IconName;
  size?: string;
};

export type UiIconProps = UiIconBaseProps &
  (
    | {
        decorative: true;
        label?: never;
      }
    | {
        decorative?: false;
        label: string;
      }
  );

export function UiIcon({
  className,
  decorative,
  frame,
  label,
  name,
  size,
}: UiIconProps) {
  const classes = ["usk-icon", className].filter(Boolean).join(" ");

  React.useEffect(() => {
    void registerIconElement();
  }, []);

  return React.createElement("usk-icon", {
    "asset-base": ICON_ASSET_BASE,
    className: classes,
    frame,
    label: decorative ? undefined : label,
    name,
    size,
  });
}
