
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";

import {
  ArrowLeft,
  Gauge,
  Menu,
  UsersRound,
  CalendarDays,
  Building2,
} from "lucide-react";

import { Brand } from "./brand";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";

type Role = "admin" | "agent";

const menus = {
  admin: [
    { label: "Overview", icon: Gauge, href: "/admin" },
    { label: "Properties", icon: Building2, href: null },
    { label: "Leads", icon: UsersRound, href: null },
    { label: "Site visits", icon: CalendarDays, href: null },
  ],
  agent: [
    { label: "Overview", icon: Gauge, href: "/agent" },
    { label: "My leads", icon: UsersRound, href: null },
    { label: "My visits", icon: CalendarDays, href: null },
  ],
};

function Sidebar({
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

      <p className="mt-12 border-b border-white/15 pb-4 text-[11px] font-bold tracking-[0.16em] text-white/50">
        {role === "admin" ? "ADMIN WORKSPACE" : "AGENT WORKSPACE"}
      </p>

      <nav className="mt-6 space-y-2" aria-label="Workspace navigation">
        {menus[role].map(({ label, icon: Icon, href }) =>
          href ? (
            <Link
              key={label}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              onClick={close}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-4 text-sm font-bold ${
                pathname === href
                  ? "bg-brand-lime text-brand-ink"
                  : "text-white/70 hover:bg-white/10"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ) : (
            <span
              key={label}
              aria-disabled="true"
              className="flex min-h-11 items-center gap-3 rounded-xl px-4 text-sm text-white/35"
            >
              <Icon className="size-4" />
              <span className="flex-1">{label}</span>
              <span className="text-[10px]">SOON</span>
            </span>
          ),
        )}
      </nav>

      <Link
        href="/"
        onClick={close}
        className="mt-auto flex min-h-11 items-center gap-3 text-sm text-white/70 hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Back to marketplace
      </Link>
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
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-brand-cream text-brand-ink lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
      <aside className="hidden lg:sticky lg:top-0 lg:block lg:h-dvh">
        <Sidebar role={role} />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex min-h-[74px] items-center gap-4 border-b border-[#dce2d6] bg-brand-cream/95 px-4 backdrop-blur-md sm:px-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label="Open workspace navigation"
              className="inline-flex size-11 items-center justify-center rounded-xl border bg-white lg:hidden"
            >
              <Menu className="size-5" />
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-[min(90vw,340px)] border-none bg-[#20221f] p-0"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Workspace navigation</SheetTitle>
                <SheetDescription>
                  Navigate through RealtyOS.
                </SheetDescription>
              </SheetHeader>

              <Sidebar
                role={role}
                close={() => setOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <div>
            <p className="text-[10px] font-bold tracking-[0.15em] text-[#638d29]">
              QEVN / REALTYOS
            </p>
            <p className="text-sm font-bold">
              {role === "admin" ? "Administration" : "Agent workspace"}
            </p>
          </div>

          <span className="ml-auto rounded-full bg-[#e9f5d6] px-3 py-2 text-[10px] font-bold text-[#456621]">
            LIVE CRM
          </span>
        </header>

        <main
          id="main-content"
          className="mx-auto max-w-[1520px] px-4 py-8 sm:px-8 lg:py-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
