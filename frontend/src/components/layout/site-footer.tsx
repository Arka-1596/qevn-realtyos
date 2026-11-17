import Link from "next/link";
import { Brand } from "./brand";

export function SiteFooter() {
  return (
    <footer className="bg-brand-ink px-4 py-12 text-white sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-[1360px] flex-col justify-between gap-9 border-b border-white/15 pb-9 md:flex-row">
        <div className="max-w-sm space-y-4">
          <Brand inverted />

          <p className="text-sm leading-relaxed text-white/60">
            An intelligent real estate marketplace and CRM
            developed as a QEVN technical assessment.
            Demonstration property records are not genuine
            real estate offers.
          </p>
        </div>

        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-start gap-5 text-sm font-semibold text-white/75"
        >
          <Link
            href="/properties"
            className="hover:text-white"
          >
            Properties
          </Link>

          <Link
            href="/#platform"
            className="hover:text-white"
          >
            Platform
          </Link>

          <Link
            href="/#workflow"
            className="hover:text-white"
          >
            How it works
          </Link>

          <Link
            href="/admin"
            className="hover:text-white"
          >
            Admin preview
          </Link>

          <Link
            href="/agent"
            className="hover:text-white"
          >
            Agent preview
          </Link>
        </nav>
      </div>

      <div className="mx-auto flex max-w-[1360px] flex-wrap justify-between gap-3 pt-6 text-xs text-white/50">
        <span>Qevn / RealtyOS</span>
        <span>Assessment prototype · Property marketplace</span>
      </div>
    </footer>
  );
}