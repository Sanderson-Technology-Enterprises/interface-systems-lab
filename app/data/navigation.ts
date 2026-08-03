import { SITE } from "../lib/site";

export type NavigationItem = {
  readonly label: string;
  readonly href: string;
  readonly external?: boolean;
  readonly variant?: "accent" | "subtle";
};

export const HOME_NAVIGATION_ITEMS = [
  { label: "Packages", href: "#libraries" },
  { label: "Get started", href: "#get-started" },
  { label: "About", href: "#company" },
] as const satisfies readonly NavigationItem[];

export const HOME_NAVIGATION_ACTIONS = [
  { label: "Open lab", href: SITE.labPath, variant: "accent" },
  {
    label: "GitHub",
    href: SITE.repository,
    external: true,
    variant: "subtle",
  },
] as const satisfies readonly NavigationItem[];

export const LAB_NAVIGATION_ITEMS = [
  { label: "Top", href: "#top" },
  { label: "Workbench", href: "#workbench" },
  { label: "Layout", href: "#layouts" },
  { label: "UI & native", href: "#ui-native" },
  { label: "Icons", href: "#icons" },
  { label: "Interactions", href: "#interactions" },
  { label: "Integration", href: "#integrate" },
  { label: "Install", href: "#install" },
  { label: "Packages", href: "#libraries" },
] as const satisfies readonly NavigationItem[];

export const LAB_NAVIGATION_ACTIONS = [
  { label: "Back to overview", href: "/", variant: "accent" },
  {
    label: "GitHub",
    href: SITE.repository,
    external: true,
    variant: "subtle",
  },
] as const satisfies readonly NavigationItem[];
