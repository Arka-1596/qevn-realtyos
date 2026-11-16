import Link from "next/link";

import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Building2,
  Layers3,
  Workflow,
} from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

const capabilities = [
  {
    number: "01",
    icon: Building2,
    title: "Property discovery",
    copy:
      "A considered search and detail experience, ready to connect to your listings service in Stage 2.",
  },
  {
    number: "02",
    icon: Workflow,
    title: "Connected operations",
    copy:
      "A unified visual language for leads, visits and the teams responsible for them.",
  },
  {
    number: "03",
    icon: Bot,
    title: "Intelligent assistance",
    copy:
      "An AI concierge will sit inside the same system, with actions confirmed by the user.",
  },
];

const workflow = [
  {
    number: "01",
    title: "Discover",
    copy:
      "Buyers find the right listings through meaningful search and filters.",
  },
  {
    number: "02",
    title: "Connect",
    copy:
      "Every enquiry and visit request becomes a visible, actionable record.",
  },
  {
    number: "03",
    title: "Move forward",
    copy:
      "Administrators and agents work from one consistent operational interface.",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main id="main-content">
        {/* HERO */}

        <section className="relative overflow-hidden px-4 pb-14 pt-12 sm:px-6 sm:pt-18 lg:px-10 lg:pb-24 lg:pt-20">
          <div className="mx-auto grid max-w-[1360px] items-center gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:gap-14">
            <div>
              <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-brand-ink/15 bg-white px-3 py-2 text-[10px] font-extrabold tracking-[0.15em] text-brand-ink sm:text-xs">
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full bg-brand-green"
                />

                QEVN / REAL ESTATE AUTOMATION
              </p>

              <h1 className="max-w-[760px] text-[clamp(2.7rem,5.9vw,6rem)] leading-[1.03] font-bold tracking-[-0.073em] text-brand-ink">
                More clarity.
                <br />

                Every{" "}
                <span className="relative whitespace-nowrap">
                  property

                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-1 -z-10 h-[0.19em] bg-brand-lime sm:-bottom-2"
                  />
                </span>{" "}

                journey.
              </h1>

              <p className="mt-7 max-w-[560px] text-base leading-8 text-[#535a50] sm:text-lg">
                One carefully connected experience for property
                discovery, buyer conversations and the people
                moving deals forward.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  href="#platform"
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-brand-ink px-6 text-sm font-bold text-white transition-colors hover:bg-[#343a30]"
                >
                  Explore the platform

                  <ArrowUpRight
                    className="size-4"
                    aria-hidden="true"
                  />
                </Link>

                <Link
                  href="/admin"
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-brand-ink/15 bg-white px-6 text-sm font-bold transition-colors hover:bg-[#edf2e6]"
                >
                  Preview CRM shell

                  <ArrowRight
                    className="size-4"
                    aria-hidden="true"
                  />
                </Link>
              </div>

              <div className="mt-11 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-brand-ink/15 pt-5 text-[11px] font-bold tracking-[0.13em] text-[#6b7368]">
                <span>01 / FOUNDATION</span>
                <span>RESPONSIVE BY DESIGN</span>
                <span>API-READY ARCHITECTURE</span>
              </div>
            </div>

            {/* ABSTRACT ARCHITECTURAL VISUAL */}

            <div
              className="relative isolate min-h-[400px] overflow-hidden rounded-[1.55rem] bg-[#20221f] p-5 text-white sm:min-h-[510px] sm:p-8 lg:min-h-[590px]"
              aria-label="Abstract architectural representation of the RealtyOS platform"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, transparent calc(100% - 1px), #8e9d7b calc(100% - 1px)), linear-gradient(to bottom, transparent calc(100% - 1px), #8e9d7b calc(100% - 1px))",
                  backgroundSize: "52px 52px",
                }}
              />

              <div className="relative z-10 flex items-start justify-between gap-2 text-[10px] font-bold tracking-[0.14em] text-white/70 sm:text-xs">
                <span>Q/ REALTYOS</span>
                <span>ARCHITECTURE / 001</span>
              </div>

              <div
                aria-hidden="true"
                className="absolute inset-x-[9%] bottom-[17%] top-[21%] flex items-end gap-[3%] border-b border-white/35"
              >
                <div className="h-[64%] w-[24%] border border-white/35 bg-[#343b32] shadow-[12px_0_0_rgba(205,255,117,0.09)]" />

                <div className="relative h-[94%] w-[42%] border border-white/40 bg-[#465044]">
                  <div className="absolute inset-x-[12%] bottom-[7%] top-[8%] grid grid-cols-3 gap-[7%]">
                    {Array.from({
                      length: 15,
                    }).map((_, index) => (
                      <span
                        key={index}
                        className={
                          index % 5 === 2
                            ? "bg-brand-lime/80"
                            : "bg-[#20221f]/75"
                        }
                      />
                    ))}
                  </div>
                </div>

                <div className="h-[77%] w-[28%] border border-white/35 bg-[#31372f]" />
              </div>

              <div className="absolute right-[10%] top-[31%] z-10 rounded-full bg-brand-lime px-3 py-1.5 text-[10px] font-extrabold tracking-[0.12em] text-brand-ink">
                ONE CONNECTED SYSTEM
              </div>

              <div className="absolute inset-x-5 bottom-5 z-10 rounded-xl border border-white/15 bg-[#131713]/95 p-4 shadow-xl sm:inset-x-8 sm:bottom-8 sm:p-5">
                <div className="mb-3 flex justify-between text-[10px] font-bold tracking-[0.15em] text-white/55">
                  <span>OPERATIONAL FLOW</span>
                  <span>DESIGN CONCEPT</span>
                </div>

                <div className="flex items-center justify-between gap-2 text-xs font-semibold sm:text-sm">
                  <span>Discover</span>

                  <ArrowRight
                    className="size-4 text-brand-lime"
                    aria-hidden="true"
                  />

                  <span>Engage</span>

                  <ArrowRight
                    className="size-4 text-brand-lime"
                    aria-hidden="true"
                  />

                  <span>Operate</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PLATFORM SECTION */}

        <section
          id="platform"
          className="scroll-mt-28 border-y border-brand-ink/10 bg-white px-4 py-18 sm:px-6 lg:px-10 lg:py-24"
        >
          <div className="mx-auto max-w-[1360px]">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-extrabold tracking-[0.17em] text-[#638d29]">
                  01 / THE PLATFORM
                </p>

                <h2 className="mt-4 max-w-xl text-[clamp(2rem,4vw,3.9rem)] leading-[1.08] font-bold tracking-[-0.06em]">
                  Everything connected.
                  <br />
                  Nothing complicated.
                </h2>
              </div>

              <p className="max-w-md text-sm leading-7 text-[#565d51] sm:text-base">
                The foundation is in place. Each capability can
                be connected to your backend independently
                without changing the visual system.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {capabilities.map(
                ({
                  number,
                  icon: Icon,
                  title,
                  copy,
                }) => (
                  <article
                    key={number}
                    className="group flex min-h-[285px] flex-col justify-between rounded-2xl border border-[#dce2d6] bg-[#f8faf4] p-6 transition-colors hover:border-[#9ba88c] sm:p-7"
                  >
                    <div className="flex items-start justify-between">
                      <Icon
                        aria-hidden="true"
                        className="size-7"
                        strokeWidth={1.5}
                      />

                      <span className="text-xs font-bold text-[#879182]">
                        {number} / 03
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold tracking-[-0.035em]">
                        {title}
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-[#596254]">
                        {copy}
                      </p>
                    </div>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>

        {/* WORKFLOW SECTION */}

        <section
          id="workflow"
          className="scroll-mt-28 px-4 py-18 sm:px-6 lg:px-10 lg:py-24"
        >
          <div className="mx-auto max-w-[1360px]">
            <p className="text-xs font-extrabold tracking-[0.17em] text-[#638d29]">
              02 / OPERATING PRINCIPLE
            </p>

            <div className="mt-5 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <h2 className="max-w-3xl text-[clamp(2.1rem,4.4vw,4.3rem)] leading-[1.08] font-bold tracking-[-0.06em]">
                Built around actual work, not decorative
                dashboards.
              </h2>

              <ArrowDownRight
                className="hidden size-12 shrink-0 lg:block"
                strokeWidth={1.3}
                aria-hidden="true"
              />
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {workflow.map((step) => (
                <div
                  key={step.number}
                  className="border-t-2 border-brand-ink pt-5"
                >
                  <span className="text-xs font-extrabold tracking-widest text-[#6a7465]">
                    {step.number}
                  </span>

                  <h3 className="mt-5 text-2xl font-bold tracking-[-0.04em]">
                    {step.title}
                  </h3>

                  <p className="mt-3 max-w-sm text-sm leading-7 text-[#596254]">
                    {step.copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ENGINEERING SECTION */}

        <section
          id="engineering"
          className="scroll-mt-28 bg-brand-ink px-4 py-18 text-white sm:px-6 lg:px-10 lg:py-24"
        >
          <div className="mx-auto flex max-w-[1360px] flex-col justify-between gap-10 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-[0.18em] text-brand-lime">
                03 / THE FOUNDATION
              </p>

              <h2 className="mt-5 text-[clamp(2.1rem,4.5vw,4.3rem)] leading-[1.07] font-bold tracking-[-0.06em]">
                Crafted to grow alongside your backend.
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
                One token system, responsive shells,
                accessible navigation and a centralized API
                boundary. No fabricated listings, dashboard
                metrics or successful bookings.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/admin"
                className="inline-flex min-h-12 items-center justify-between gap-6 rounded-xl bg-brand-lime px-6 text-sm font-bold text-brand-ink hover:bg-[#ddff9d]"
              >
                Inspect Admin shell

                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4"
                />
              </Link>

              <Link
                href="/agent"
                className="inline-flex min-h-12 items-center justify-between gap-6 rounded-xl border border-white/25 px-6 text-sm font-bold text-white hover:bg-white/10"
              >
                Inspect Agent shell

                <Layers3
                  aria-hidden="true"
                  className="size-4"
                />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}