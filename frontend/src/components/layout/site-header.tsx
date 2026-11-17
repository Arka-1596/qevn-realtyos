"use client";

import Link from "next/link";

import {
  ArrowUpRight,
  Menu,
} from "lucide-react";

import { useEffect, useState } from "react";

import { Brand } from "./brand";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigation = [
  {
    label: "Properties",
    href: "/properties",
  },
  {
    label: "Platform",
    href: "/#platform",
  },
  {
    label: "How it works",
    href: "/#workflow",
  },
  {
    label: "Engineering",
    href: "/#engineering",
  },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 12);
    };

    update();

    window.addEventListener("scroll", update, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-brand-ink/10 bg-brand-cream/95 backdrop-blur-md transition-[box-shadow] duration-200 ${
        scrolled
          ? "shadow-[0_6px_24px_rgba(19,19,19,0.06)]"
          : ""
      }`}
    >
      <div
        className={`mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 transition-[padding] duration-200 sm:px-6 lg:px-10 ${
          scrolled ? "py-2" : "py-3"
        }`}
      >
        <Brand />

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-7 lg:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-sm text-sm font-semibold text-brand-ink/75 transition-colors hover:text-brand-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/agent"
            className="rounded-sm px-2 py-2 text-sm font-semibold hover:underline"
          >
            Agent preview
          </Link>

          <Link
            href="/properties"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-ink px-5 text-sm font-semibold text-white hover:bg-[#343a30]"
          >
            Explore properties

            <ArrowUpRight className="ml-2 size-4" />
          </Link>
        </div>

        <Sheet
          open={menuOpen}
          onOpenChange={setMenuOpen}
        >
          <SheetTrigger
            className="inline-flex size-11 items-center justify-center rounded-xl border border-brand-ink/20 bg-white text-brand-ink lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-[min(88vw,360px)] border-l border-brand-ink/10 bg-brand-cream p-6 text-brand-ink"
          >
            <SheetHeader className="p-0 text-left">
              <SheetTitle className="text-base font-bold">
                Qevn / RealtyOS
              </SheetTitle>

              <SheetDescription className="text-sm text-muted-foreground">
                Intelligent property discovery
              </SheetDescription>
            </SheetHeader>

            <nav
              aria-label="Mobile navigation"
              className="mt-10 flex flex-col gap-2"
            >
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center rounded-xl px-4 text-base font-semibold hover:bg-brand-ink/5"
                >
                  {item.label}
                </Link>
              ))}

              <div className="my-3 border-t border-brand-ink/15" />

              <Link
                href="/properties"
                onClick={() => setMenuOpen(false)}
                className="flex min-h-12 items-center justify-between rounded-xl bg-brand-lime px-4 font-semibold"
              >
                Explore properties

                <ArrowUpRight className="size-4" />
              </Link>

              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="flex min-h-12 items-center rounded-xl px-4 font-semibold hover:bg-brand-ink/5"
              >
                Admin preview
              </Link>

              <Link
                href="/agent"
                onClick={() => setMenuOpen(false)}
                className="flex min-h-12 items-center rounded-xl px-4 font-semibold hover:bg-brand-ink/5"
              >
                Agent preview
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}