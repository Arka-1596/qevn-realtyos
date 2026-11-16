import Link from "next/link";

import {
  ArrowUpRight,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { EmptyState } from "@/components/ui/feedback-states";

export default function AgentOverviewPage() {
  return (
    <div className="space-y-7">
      {/* PAGE HEADING */}

      <div>
        <p className="text-[11px] font-bold tracking-[0.16em] text-[#618827]">
          AGENT / DESIGN FOUNDATION
        </p>

        <h1 className="mt-3 text-[clamp(2rem,3.4vw,3.3rem)] leading-tight font-bold tracking-[-0.055em]">
          A workspace for the next move.
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5c6556] sm:text-base">
          A simpler interface for assigned leads,
          follow-ups and site visits. Connected data
          and role authorization will be implemented
          after the backend contract is established.
        </p>
      </div>

      {/* AGENT MODULES */}

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-[#dce2d6] bg-white p-6">
          <UserRound
            className="size-7 text-[#527b2b]"
            aria-hidden="true"
          />

          <h2 className="mt-5 text-lg font-bold">
            Your assigned work
          </h2>

          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Future endpoint:{" "}
            <code className="break-all text-xs">
              GET /api/v1/agent/leads
            </code>
            . No synthetic assigned leads are shown.
          </p>
        </article>

        <article className="rounded-2xl border border-[#dce2d6] bg-white p-6">
          <ShieldCheck
            className="size-7 text-[#527b2b]"
            aria-hidden="true"
          />

          <h2 className="mt-5 text-lg font-bold">
            Role-aware by design
          </h2>

          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            This shell has an Agent-specific menu,
            but it is not yet security-protected.
            Real permission checks must come
            from the backend.
          </p>
        </article>
      </div>

      {/* EMPTY STATE */}

      <EmptyState
        title="Assigned leads will appear here"
        description="The Agent data view is intentionally empty until the secured backend endpoint is connected."
      />

      <Link
        href="/admin"
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#cdd6c3] bg-white px-5 text-sm font-bold hover:bg-[#eff3e8]"
      >
        Compare Admin shell

        <ArrowUpRight
          className="size-4"
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}