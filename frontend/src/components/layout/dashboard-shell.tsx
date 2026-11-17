
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";

import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  Gauge,
  Menu,
  UsersRound,
} from "lucide-react";

import { Brand } from "./brand";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type Role = "admin" | "agent";

const navigation = {
  admin: [
    {
      label: "Overview",
      href: "/admin",
      icon: Gauge,
    },
    {
      label: "Operations",
      href: "/admin/operations",
      icon: ClipboardList,
    },
  ],
  agent: [
    {
      label: "Overview",
      href: "/agent",
      icon: Gauge,
    },
    {
      label: "Manage Leads",
      href: "/agent/actions",
      icon: UsersRound,
    },
  ],
};

function WorkspaceSidebar({
  role,
  close,
}: {
  role: Role;
  close?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-[#20221f] p-6 text-white">
      <Brand inverted />

      <div className="mt-12 border-b border-white/15 pb-4">
        <p className="text-[11px] font-bold tracking-[0.16em] text-white/50">
          {role === "admin"
            ? "ADMIN WORKSPACE"
            : "AGENT WORKSPACE"}
        </p>
      </div>

      <nav
        aria-label="Workspace navigation"
        className="mt-6 flex flex-col gap-2"
      >
        {navigation[role].map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            (item.href !== "/admin" &&
              item.href !== "/agent" &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-bold transition-colors ${
                active
                  ? "bg-brand-lime text-brand-ink"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon
                className="size-5 shrink-0"
                aria-hidden="true"
              />

              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/15 pt-5">
        <Link
          href="/"
          onClick={close}
          className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft
            className="size-4"
            aria-hidden="true"
          />

          Back to marketplace
        </Link>
      </div>
    </div>
  );
}

export function DashboardShell({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = role === "admin";

  const isOperations =
    pathname.startsWith("/admin/operations");

  const isAgentActions =
    pathname.startsWith("/agent/actions");

  const heading = isAdmin
    ? isOperations
      ? "Operations"
      : "Administration"
    : isAgentActions
      ? "Manage Leads"
      : "Agent Workspace";

  const actionHref = isAdmin
    ? isOperations
      ? "/admin"
      : "/admin/operations"
    : isAgentActions
      ? "/agent"
      : "/agent/actions";

  const actionLabel = isAdmin
    ? isOperations
      ? "Overview"
      : "Open Operations"
    : isAgentActions
      ? "Overview"
      : "Manage Leads";

  return (
    <div className="min-h-dvh bg-brand-cream text-brand-ink lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
      {/* DESKTOP SIDEBAR */}

      <aside className="hidden lg:sticky lg:top-0 lg:block lg:h-dvh">
        <WorkspaceSidebar role={role} />
      </aside>

      {/* MAIN WORKSPACE */}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex min-h-[74px] items-center gap-3 border-b border-[#dce2d6] bg-brand-cream/95 px-4 backdrop-blur-md sm:px-8">
          {/* MOBILE SIDEBAR */}

          <Sheet
            open={menuOpen}
            onOpenChange={setMenuOpen}
          >
            <SheetTrigger
              aria-label="Open workspace navigation"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#dce2d6] bg-white lg:hidden"
            >
              <Menu
                className="size-5"
                aria-hidden="true"
              />
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-[min(90vw,340px)] border-none bg-[#20221f] p-0"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>
                  Workspace navigation
                </SheetTitle>

                <SheetDescription>
                  Navigate through the RealtyOS workspace.
                </SheetDescription>
              </SheetHeader>

              <WorkspaceSidebar
                role={role}
                close={() => setMenuOpen(false)}
              />
            </SheetContent>
          </Sheet>

          {/* PAGE TITLE */}

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold tracking-[0.13em] text-[#638d29]">
              QEVN / REALTYOS
            </p>

            <p className="truncate text-sm font-bold sm:text-base">
              {heading}
            </p>
          </div>

          {/* PRIMARY WORKSPACE ACTION */}

          <Link
            href={actionHref}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-lime px-3 text-xs font-bold text-brand-ink transition-colors hover:bg-[#ddff9d] sm:px-5 sm:text-sm"
          >
            {isAdmin && !isOperations && (
              <ClipboardList
                className="size-4"
                aria-hidden="true"
              />
            )}

            {actionLabel}

            <ArrowRight
              className="hidden size-4 sm:block"
              aria-hidden="true"
            />
          </Link>

          <span className="hidden shrink-0 rounded-full bg-[#e9f5d6] px-3 py-2 text-[10px] font-bold text-[#456621] xl:inline-flex">
            LIVE CRM
          </span>
        </header>

        {/* PAGE CONTENT */}

        <main
          id="main-content"
          className="mx-auto w-full max-w-[1520px] px-4 py-8 sm:px-8 lg:py-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
