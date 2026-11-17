"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
} from "lucide-react";

import {
  ErrorState,
  LoadingState,
} from "@/components/ui/feedback-states";

import { getProperties } from "@/lib/api/properties";

import type {
  PropertyFilters as PropertyQuery,
  PropertyListResponse,
  PropertySort,
} from "@/types/property";

import { PropertyCard } from "./property-card";
import { PropertyFilters } from "./property-filters";

function parsePositiveInteger(
  value: string | null,
  fallback: number,
): number {
  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : fallback;
}

export function PropertyExplorer() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const search = searchParams.toString();

  const [data, setData] =
    useState<PropertyListResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  const params = new URLSearchParams(search);

  const selectedSort: PropertySort =
    params.get("sort") === "price_asc"
      ? "price_asc"
      : params.get("sort") === "price_desc"
        ? "price_desc"
        : "newest";

  useEffect(() => {
    const controller = new AbortController();
    const current = new URLSearchParams(search);

    const filters: PropertyQuery = {
      keyword: current.get("keyword") ?? undefined,
      city: current.get("city") ?? undefined,
      min_price: current.get("min_price") ?? undefined,
      max_price: current.get("max_price") ?? undefined,
      property_type:
        current.get("property_type") ?? undefined,
      listing_type:
        current.get("listing_type") ?? undefined,
      bhk: current.get("bhk") ?? undefined,
      sort:
        current.get("sort") === "price_asc" ||
        current.get("sort") === "price_desc"
          ? (current.get("sort") as PropertySort)
          : "newest",
      page: parsePositiveInteger(
        current.get("page"),
        1,
      ),
      limit: 12,
    };

    setLoading(true);
    setError("");
    setData(null);

    getProperties(filters, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setData(result);
        }
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Unable to load properties.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [search, retry]);

  function updateQuery(
    name: string,
    value: string,
  ) {
    const next = new URLSearchParams(search);

    if (value) {
      next.set(name, value);
    } else {
      next.delete(name);
    }

    next.delete("page");

    router.push(
      `/properties${next.size ? `?${next}` : ""}`,
    );
  }

  function pageUrl(page: number): string {
    const next = new URLSearchParams(search);
    next.set("page", String(page));

    return `/properties?${next.toString()}`;
  }

  const totalPages = data
    ? Math.max(
        1,
        Math.ceil(data.total / data.limit),
      )
    : 1;

  return (
    <div className="mx-auto max-w-[1360px] px-4 py-10 sm:px-6 lg:px-10 lg:py-16">
      {/* PAGE HEADING */}

      <div className="mb-10">
        <p className="text-xs font-extrabold tracking-[0.16em] text-[#638d29]">
          PROPERTY DISCOVERY / 02
        </p>

        <h1 className="mt-4 text-[clamp(2.4rem,5vw,5rem)] leading-[1.05] font-bold tracking-[-0.065em]">
          Find a space that
          <br />
          feels right.
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-[#5c6556] sm:text-base">
          Explore available listings through the
          QEVN RealtyOS property database. Demonstration
          listings are explicitly identified.
        </p>
      </div>

      <div className="grid gap-7 lg:grid-cols-[270px_minmax(0,1fr)]">
        {/* FILTER PANEL */}

        <PropertyFilters search={search} />

        {/* RESULTS */}

        <section
          aria-label="Property search results"
          className="min-w-0"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-lg font-bold">
                {loading
                  ? "Searching properties"
                  : data
                    ? `${data.total} properties found`
                    : "Property results"}
              </p>

              <p className="mt-1 text-xs text-[#66715f]">
                Results are retrieved from FastAPI.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label
                htmlFor="property-sort"
                className="text-xs font-bold"
              >
                Sort
              </label>

              <select
                id="property-sort"
                value={selectedSort}
                onChange={(event) =>
                  updateQuery("sort", event.target.value)
                }
                className="min-h-11 rounded-xl border border-[#dce2d6] bg-white px-3 text-sm font-semibold"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">
                  Price: Low to High
                </option>
                <option value="price_desc">
                  Price: High to Low
                </option>
              </select>
            </div>
          </div>

          {loading ? (
            <LoadingState label="Finding properties…" />
          ) : error ? (
            <ErrorState
              title="Unable to load properties"
              message={error}
              onRetry={() =>
                setRetry((value) => value + 1)
              }
            />
          ) : data && data.items.length > 0 ? (
            <>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {data.items.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                  />
                ))}
              </div>

              {/* PAGINATION */}

              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#dce2d6] pt-6">
                <p className="text-sm text-[#66715f]">
                  Page {data.page} of {totalPages}
                </p>

                <div className="flex gap-2">
                  {data.page > 1 ? (
                    <Link
                      href={pageUrl(data.page - 1)}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#dce2d6] bg-white px-4 text-sm font-bold"
                    >
                      <ArrowLeft className="size-4" />
                      Previous
                    </Link>
                  ) : null}

                  {data.page < totalPages ? (
                    <Link
                      href={pageUrl(data.page + 1)}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-ink px-4 text-sm font-bold text-white"
                    >
                      Next
                      <ArrowRight className="size-4" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#cbd5c1] bg-white px-6 py-16 text-center">
              <Building2
                className="mx-auto size-10 text-[#6a8959]"
                aria-hidden="true"
              />

              <h2 className="mt-5 text-xl font-bold">
                No matching properties
              </h2>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-[#66715f]">
                Try adjusting your location, budget,
                or property preferences.
              </p>

              <Link
                href="/properties"
                className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-brand-lime px-5 text-sm font-bold"
              >
                Clear filters
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}