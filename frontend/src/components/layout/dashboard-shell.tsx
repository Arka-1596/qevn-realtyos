"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ArrowLeft,
  ArrowUpRight,
  Menu,
  ShieldAlert,
} from "lucide-react";

import { useState } from "react";
import type { ReactNode } from "react";

import { Brand } from "./brand";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  workspaceNavigation,
} from "@/lib/navigation";

import type {
  WorkspaceRole,
} from "@/lib/navigation";

type WorkspaceMenuProps = {
  role: WorkspaceRole;
  onNavigate?: () => void;
};

function WorkspaceMenu({
  role,
  onNavigate,
}: WorkspaceMenuProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={`${role} workspace navigation`}
      className="mt-7 flex flex-col gap-1.5"
    >
      {workspaceNavigation[role].map(
        ({ title, href, icon: Icon }) => {
          const contents = (
            <>
              <Icon
                aria-hidden="true"
                className="size-[19px] shrink-0"
                strokeWidth={1.8}
              />

              <span className="flex-1 text-left">
                {title}
              </span>
            </>
          );

          if (!href) {
            return (
              <span
                key={title}
                aria-disabled="true"
                title="Available in a later development stage"
                className="flex min-h-11 cursor-not-allowed items-center gap-3 rounded-xl px-3.5 text-sm text-white/35"
              >
                {contents}

                <span className="text-[10px] text-white/35">
                  SOON
                </span>
              </span>
            );
          }

          const active = pathname === href;

          return (
            <Link
              key={title}
              href={href}
              onClick={onNavigate}
              aria-current={
                active ? "page" : undefined
              }
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-brand-lime text-brand-ink"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {contents}
            </Link>
          );
        },
      )}
    </nav>
  );
}

type WorkspaceAsideProps = {
  role: WorkspaceRole;
  onNavigate?: () => void;
};

function WorkspaceAside({
  role,
  onNavigate,
}: WorkspaceAsideProps) {
  return (
    <div className="flex h-full flex-col bg-[#20221f] p-5 text-white sm:p-6">
      <Brand inverted />

      <div className="mt-10 flex items-center justify-between border-b border-white/15 pb-4 text-[10px] font-bold tracking-[0.17em] text-white/45">
        <span>
          {role === "admin"
            ? "ADMINISTRATION"
            : "AGENT WORKSPACE"}
        </span>

        <span>01 / UI</span>
      </div>

      <WorkspaceMenu
        role={role}
        onNavigate={onNavigate}
      />

      <div className="mt-auto space-y-4 pt-8">
        <div className="rounded-xl border border-white/15 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-lime">
            <ShieldAlert
              className="size-4"
              aria-hidden="true"
            />

            PRE-INTEGRATION
          </div>

          <p className="mt-2 text-xs leading-5 text-white/55">
            UI preview only. Authentication, role
            permissions and real records are not
            connected yet.
          </p>
        </div>

        <Link
          href="/"
          onClick={onNavigate}
          className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-white/70 hover:bg-white/10"
        >
          <ArrowLeft
            className="size-4"
            aria-hidden="true"
          />

          Back to public site
        </Link>
      </div>
    </div>
  );
}

type DashboardShellProps = {
  role: WorkspaceRole;
  children: ReactNode;
};

export function DashboardShell({
  role,
  children,
}: DashboardShellProps) {
  const roleName =
    role === "admin" ? "Admin" : "Agent";

  const [menuOpen, setMenuOpen] =
    useState(false);

  return (
    <div className="min-h-dvh bg-brand-cream text-brand-ink lg:grid lg:grid-cols-[minmax(240px,256px)_minmax(0,1fr)]">
      {/* DESKTOP SIDEBAR */}

      <aside
        className="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col"
        aria-label={`${roleName} sidebar`}
      >
        <WorkspaceAside role={role} />
      </aside>

      {/* MAIN WORKSPACE */}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex min-h-[74px] items-center justify-between gap-4 border-b border-brand-ink/10 bg-brand-cream/95 px-4 backdrop-blur-md sm:px-7 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            {/* MOBILE SIDEBAR */}

            <Sheet
              open={menuOpen}
              onOpenChange={setMenuOpen}
            >
              <SheetTrigger
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-brand-ink/20 bg-white lg:hidden"
                aria-label="Open workspace navigation"
              >
                <Menu
                  className="size-5"
                  aria-hidden="true"
                />
              </SheetTrigger>

              <SheetContent
                side="left"
                className="w-[min(90vw,340px)] border-r-0 bg-[#20221f] p-0 text-white"
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>
                    Workspace navigation
                  </SheetTitle>

                  <SheetDescription>
                    Navigate through the{" "}
                    {roleName.toLowerCase()} preview
                  </SheetDescription>
                </SheetHeader>

                <WorkspaceAside
                  role={role}
                  onNavigate={() =>
                    setMenuOpen(false)
                  }
                />
              </SheetContent>
            </Sheet>

            {/* WORKSPACE TITLE */}

            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold tracking-[0.13em] text-[#747c70]">
                REALTYOS / {roleName.toUpperCase()}
              </p>

              <p className="truncate text-sm font-bold sm:text-base">
                Workspace overview
              </p>
            </div>
          </div>

          {/* HEADER ACTIONS */}

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-[#d3dac9] bg-white px-3 py-2 text-[10px] font-bold tracking-wider text-[#5b6356] sm:inline-flex">
              STAGE 01 · UI PREVIEW
            </span>

            <Link
              href={
                role === "admin"
                  ? "/agent"
                  : "/admin"
              }
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-brand-ink/15 bg-white px-3 text-xs font-bold hover:bg-[#e9eee1] sm:px-4"
            >
              {role === "admin"
                ? "Agent preview"
                : "Admin preview"}

              <ArrowUpRight
                className="size-4"
                aria-hidden="true"
              />
            </Link>
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto w-full max-w-[1520px] px-4 py-7 sm:px-7 lg:px-9 lg:py-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}