import Link from "next/link";

import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Building2,
  CalendarDays,
  Workflow,
} from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

import { HomeProperties } from "@/components/property/home-properties";

const process = [
  {
    number: "01",
    title: "Discover",
    icon: Building2,
    description:
      "Search property listings through meaningful, connected filters.",
  },
  {
    number: "02",
    title: "Connect",
    icon: Bot,
    description:
      "Ask questions and submit enquiries that enter the CRM workflow.",
  },
  {
    number: "03",
    title: "Visit",
    icon: CalendarDays,
    description:
      "Request a site visit and allow the team to follow up.",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main id="main-content">
        {/* HERO */}

        <section className="px-4 pb-16 pt-12 sm:px-6 lg:px-10 lg:pb-24 lg:pt-20">
          <div className="mx-auto grid max-w-[1360px] items-center gap-12 lg:grid-cols-[1.04fr_0.96fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-brand-ink/15 bg-white px-4 py-2 text-[10px] font-extrabold tracking-[0.15em] sm:text-xs">
                <span className="size-2 rounded-full bg-brand-green" />
                QEVN / REAL ESTATE AUTOMATION
              </p>

              <h1 className="mt-9 text-[clamp(2.7rem,5.9vw,6rem)] leading-[1.03] font-bold tracking-[-0.073em]">
                Find a space.
                <br />
                Move with{" "}
                <span className="relative inline-block">
                  clarity.
                  <span className="absolute inset-x-0 -bottom-1 -z-10 h-3 bg-brand-lime sm:h-5" />
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-[#535a50] sm:text-lg">
                Explore properties, connect with the
                right people and arrange visits through
                one intelligent real estate platform.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/properties"
                  className="inline-flex min-h-12 items-center gap-3 rounded-xl bg-brand-ink px-6 text-sm font-bold text-white hover:bg-[#343a30]"
                >
                  Explore properties
                  <ArrowUpRight className="size-4" />
                </Link>

                <Link
                  href="#workflow"
                  className="inline-flex min-h-12 items-center gap-3 rounded-xl border border-brand-ink/15 bg-white px-6 text-sm font-bold"
                >
                  How it works
                  <ArrowRight className="size-4" />
                </Link>
              </div>

              {/* SEARCH ENTRY */}

              <form
                action="/properties"
                method="get"
                className="mt-10 rounded-2xl border border-[#dce2d6] bg-white p-4 shadow-[0_12px_35px_rgba(19,19,19,0.04)] sm:p-5"
              >
                <p className="mb-4 text-xs font-bold tracking-[0.12em] text-[#638d29]">
                  START YOUR PROPERTY SEARCH
                </p>

                <div className="grid gap-3 sm:grid-cols-[1fr_125px_auto]">
                  <div>
                    <label
                      htmlFor="home-city"
                      className="mb-1 block text-xs font-bold"
                    >
                      City
                    </label>

                    <input
                      id="home-city"
                      name="city"
                      placeholder="Kolkata"
                      className="min-h-12 w-full rounded-lg border border-[#dce2d6] bg-[#f8faf5] px-3 text-base sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="home-bhk"
                      className="mb-1 block text-xs font-bold"
                    >
                      BHK
                    </label>

                    <select
                      id="home-bhk"
                      name="bhk"
                      className="min-h-12 w-full rounded-lg border border-[#dce2d6] bg-[#f8faf5] px-3 text-sm"
                      defaultValue=""
                    >
                      <option value="">Any</option>
                      <option value="1">1 BHK</option>
                      <option value="2">2 BHK</option>
                      <option value="3">3 BHK</option>
                      <option value="4">4 BHK</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="mt-0 min-h-12 rounded-lg bg-brand-lime px-5 text-sm font-bold text-brand-ink sm:mt-[21px]"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>

            {/* ARCHITECTURAL VISUAL */}

            <div className="relative isolate min-h-[400px] overflow-hidden rounded-[1.6rem] bg-[#20221f] p-6 text-white sm:min-h-[540px] sm:p-8">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(#a0ad98 1px, transparent 1px), linear-gradient(90deg, #a0ad98 1px, transparent 1px)",
                  backgroundSize: "55px 55px",
                }}
              />

              <div className="relative z-10 flex justify-between gap-4 text-xs font-bold tracking-[0.13em] text-white/70">
                <span>Q/ REALTYOS</span>
                <span>ARCHITECTURE / 001</span>
              </div>

              <div
                aria-hidden="true"
                className="absolute inset-x-[10%] bottom-[20%] top-[22%] flex items-end gap-3"
              >
                <div className="h-[70%] w-1/4 border border-white/20 bg-[#333e32]" />

                <div className="grid h-full w-2/4 grid-cols-3 gap-3 border border-white/35 bg-[#495748] p-4">
                  {Array.from({ length: 15 }, (_, index) => (
                    <span
                      key={index}
                      className={
                        index % 5 === 2
                          ? "bg-brand-lime/80"
                          : "bg-[#222b22]"
                      }
                    />
                  ))}
                </div>

                <div className="h-[80%] w-1/4 border border-white/20 bg-[#303a30]" />
              </div>

              <div className="absolute inset-x-5 bottom-5 z-10 rounded-xl border border-white/15 bg-[#141914] p-5 sm:inset-x-8 sm:bottom-8">
                <div className="mb-3 flex justify-between text-[10px] font-bold tracking-[0.12em] text-white/60">
                  <span>CONNECTED OPERATIONS</span>
                  <span>REALTYOS</span>
                </div>

                <div className="flex items-center justify-between gap-2 text-xs font-semibold sm:text-sm">
                  <span>Discover</span>
                  <ArrowRight className="size-4 text-brand-lime" />
                  <span>Engage</span>
                  <ArrowRight className="size-4 text-brand-lime" />
                  <span>Operate</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LIVE PROPERTIES */}

        <HomeProperties />

        {/* WORKFLOW */}

        <section
          id="workflow"
          className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-10"
        >
          <div className="mx-auto max-w-[1360px]">
            <p className="text-xs font-bold tracking-[0.16em] text-[#638d29]">
              02 / HOW REALTYOS WORKS
            </p>

            <h2 className="mt-4 max-w-3xl text-[clamp(2rem,4vw,3.8rem)] leading-[1.08] font-bold tracking-[-0.06em]">
              Every step has a purpose.
            </h2>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {process.map(
                ({
                  number,
                  title,
                  description,
                  icon: Icon,
                }) => (
                  <article
                    key={number}
                    className="rounded-2xl border border-[#dce2d6] bg-white p-7"
                  >
                    <div className="flex items-center justify-between">
                      <Icon
                        className="size-6 text-[#638d29]"
                        aria-hidden="true"
                      />

                      <span className="text-xs font-bold text-[#8b9686]">
                        {number}
                      </span>
                    </div>

                    <h3 className="mt-10 text-2xl font-bold tracking-[-0.04em]">
                      {title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-[#596254]">
                      {description}
                    </p>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>

        {/* ENGINEERING / CLOSING */}

        <section
          id="engineering"
          className="scroll-mt-24 bg-brand-ink px-4 py-20 text-white sm:px-6 lg:px-10"
        >
          <div className="mx-auto flex max-w-[1360px] flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-[0.15em] text-brand-lime">
                03 / INTELLIGENT OPERATIONS
              </p>

              <h2 className="mt-5 text-[clamp(2.1rem,4.3vw,4.1rem)] leading-[1.08] font-bold tracking-[-0.06em]">
                Property discovery,
                connected to real workflows.
              </h2>

              <p className="mt-5 text-sm leading-7 text-white/65 sm:text-base">
                RealtyOS links property records, buyer
                enquiries and viewing requests through
                the same backend API. Administrator, Agent
                and AI interfaces are being integrated
                separately.
              </p>
            </div>

            <div>
              <Link
                href="/properties"
                className="inline-flex min-h-12 items-center gap-3 rounded-xl bg-brand-lime px-6 text-sm font-bold text-brand-ink hover:bg-[#ddff9d]"
              >
                Find your next space
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}