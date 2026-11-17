
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ArrowUpRight } from "lucide-react";

import { getProperties } from "@/lib/api/properties";
import type { Property } from "@/types/property";

import { PropertyCard } from "./property-card";

import {
  LoadingState,
  ErrorState,
} from "@/components/ui/feedback-states";

export function HomeProperties() {
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getProperties(
      {
        page: 1,
        limit: 3,
        sort: "newest",
      },
      controller.signal,
    )
      .then((data) => {
        if (!controller.signal.aborted) {
          setItems(data.items);
          setError("");
        }
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not load current listings.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [retry]);

  function handleRetry() {
    setLoading(true);
    setError("");
    setItems([]);
    setRetry((current) => current + 1);
  }

  return (
    <section
      id="platform"
      className="scroll-mt-24 bg-white px-4 py-20 sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-[#638d29]">
              01 / PROPERTY DISCOVERY
            </p>

            <h2 className="mt-4 text-[clamp(2rem,4vw,3.8rem)] leading-[1.07] font-bold tracking-[-0.055em]">
              Explore the latest listings.
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-[#596254]">
              Displayed from the RealtyOS property API.
              Fictional assessment listings are marked as demos.
            </p>
          </div>

          <Link
            href="/properties"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#dce2d6] px-5 text-sm font-bold hover:bg-[#f4f6eb]"
          >
            Browse all properties

            <ArrowUpRight
              className="size-4"
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="mt-10">
          {loading ? (
            <LoadingState label="Loading property listings…" />
          ) : error ? (
            <ErrorState
              message={error}
              onRetry={handleRetry}
            />
          ) : items.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {items.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#dce2d6] bg-[#f8faf4] p-10 text-center">
              <p className="font-bold">
                No public listings available
              </p>

              <p className="mt-2 text-sm text-[#66715f]">
                Published properties will appear here
                when available from the backend.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
