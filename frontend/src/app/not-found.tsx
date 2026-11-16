import Link from "next/link";

import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-dvh flex-col items-center justify-center bg-brand-cream px-5 py-16 text-center"
    >
      <p className="text-xs font-bold tracking-widest text-[#527b2b]">
        404 / PAGE NOT FOUND
      </p>

      <h1 className="mt-5 text-4xl font-bold tracking-[-0.05em]">
        This address does not exist.
      </h1>

      <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
        This route may be scheduled for a later
        development stage.
      </p>

      <Link
        href="/"
        className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-ink px-5 text-sm font-bold text-white hover:bg-[#343a30]"
      >
        <ArrowLeft
          className="size-4"
          aria-hidden="true"
        />

        Back to RealtyOS
      </Link>
    </main>
  );
}