import {
  Building2,
  CalendarDays,
  Gauge,
  House,
  Settings2,
  UsersRound,
  UserRoundCog,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

export type WorkspaceRole = "admin" | "agent";

export type WorkspaceNavigationItem = {
  title: string;
  href: string | null;
  icon: LucideIcon;
};

/*
 * null means the destination is not available yet.
 *
 * In later stages, replace null with the actual route.
 * This avoids clickable links leading to unfinished pages.
 */

export const workspaceNavigation: Record<
  WorkspaceRole,
  WorkspaceNavigationItem[]
> = {
  admin: [
    {
      title: "Overview",
      href: "/admin",
      icon: Gauge,
    },
    {
      title: "Properties",
      href: null,
      icon: Building2,
    },
    {
      title: "Leads",
      href: null,
      icon: UsersRound,
    },
    {
      title: "Site visits",
      href: null,
      icon: CalendarDays,
    },
    {
      title: "Agents",
      href: null,
      icon: UserRoundCog,
    },
    {
      title: "Settings",
      href: null,
      icon: Settings2,
    },
  ],

  agent: [
    {
      title: "Overview",
      href: "/agent",
      icon: Gauge,
    },
    {
      title: "My leads",
      href: null,
      icon: UsersRound,
    },
    {
      title: "My visits",
      href: null,
      icon: CalendarDays,
    },
  ],
};

export const publicHomeNavigation = {
  title: "Public website",
  href: "/",
  icon: House,
};