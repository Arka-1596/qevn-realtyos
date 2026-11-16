import {
  Building2,
  CalendarDays,
  Layers3,
  UsersRound,
} from "lucide-react";

import { ComponentLab } from "@/components/showcase/component-lab";

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/feedback-states";

const integrations = [
  {
    title: "Property inventory",
    endpoint: "GET /api/v1/admin/properties",
    icon: Building2,
    description:
      "Property management data will appear here after authentication and API integration.",
  },
  {
    title: "Lead management",
    endpoint: "GET /api/v1/admin/leads",
    icon: UsersRound,
    description:
      "Lead records, assignment and follow-up tools belong to the CRM implementation stage.",
  },
  {
    title: "Site visits",
    endpoint: "GET /api/v1/admin/visits",
    icon: CalendarDays,
    description:
      "Incoming appointment requests and schedules will be driven by real backend records.",
  },
];

export default function AdminOverviewPage() {
  return (
    <div className="space-y-7">
      {/* PAGE HEADING */}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-[0.16em] text-[#618827]">
            ADMIN / DESIGN FOUNDATION
          </p>

          <h1 className="mt-3 text-[clamp(2rem,3.4vw,3.3rem)] leading-tight font-bold tracking-[-0.055em]">
            A clearer command center.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5c6556] sm:text-base">
            The responsive application shell and shared
            component system are ready. No backend records
            or dashboard statistics are being simulated.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-[#c9d6b6] bg-[#eaf6d7] px-4 py-2 text-xs font-bold text-[#456621]">
          <Layers3
            className="size-4"
            aria-hidden="true"
          />

          Stage 01 complete when verified
        </span>
      </div>

      {/* INTEGRATION MODULES */}

      <div className="grid gap-4 md:grid-cols-3">
        {integrations.map(
          ({
            title,
            endpoint,
            description,
            icon: Icon,
          }) => (
            <article
              key={title}
              className="min-w-0 rounded-2xl border border-[#dce2d6] bg-white p-5 sm:p-6"
            >
              <Icon
                className="size-6 text-[#527b2b]"
                strokeWidth={1.6}
                aria-hidden="true"
              />

              <h2 className="mt-5 text-lg font-bold">
                {title}
              </h2>

              <p className="mt-2 min-h-20 text-sm leading-6 text-muted-foreground">
                {description}
              </p>

              <code className="mt-4 block break-all rounded-lg bg-[#f3f5ef] px-3 py-2 text-[11px] text-[#596254]">
                {endpoint}
              </code>
            </article>
          ),
        )}
      </div>

      {/* INTERACTIVE COMPONENTS AND FEEDBACK */}

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <ComponentLab />

        <div className="rounded-2xl border border-[#dce2d6] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-bold tracking-[-0.025em]">
            Feedback design patterns
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Reusable states for future real data
            fetching and mutation errors.
          </p>

          <div className="mt-5 grid gap-3">
            <LoadingState
              label="Example loading state — not fetching data"
            />

            <ErrorState
              title="Example error state"
              message="This is a visual demonstration, not an active API failure."
            />
          </div>
        </div>
      </div>

      {/* EMPTY DATA STATE */}

      <EmptyState
        title="No backend connection in Stage 1"
        description="This means the service has not been wired yet, not that the database contains zero properties or leads."
      />
    </div>
  );
}