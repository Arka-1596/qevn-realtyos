"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  Bath,
  BedDouble,
  MapPin,
  Ruler,
} from "lucide-react";

import {
  ErrorState,
  LoadingState,
} from "@/components/ui/feedback-states";

import { getPropertyBySlug } from "@/lib/api/properties";

import {
  formatArea,
  formatPrice,
  formatPropertyType,
  isDemoProperty,
  propertyLocation,
} from "@/lib/property-format";

import type { Property } from "@/types/property";

import { PropertyActions } from "./property-actions";
import { PropertyVisual } from "./property-visual";

export function PropertyDetail() {
  const { slug } = useParams<{ slug: string }>();

  const [property, setProperty] = useState<Property | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError("");
    setProperty(null);

    getPropertyBySlug(slug, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setProperty(result);
        }
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Unable to retrieve this property.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [slug, retry]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20">
        <LoadingState label="Loading property details…" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20">
        <ErrorState
          title="Property unavailable"
          message={error || "Property not found."}
          onRetry={() => setRetry((n) => n + 1)}
        />

        <Link
          href="/properties"
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold underline"
        >
          <ArrowLeft className="size-4" />
          Back to properties
        </Link>
      </div>
    );
  }

  const lat =
    property.latitude === null
      ? null
      : Number(property.latitude);

  const lon =
    property.longitude === null
      ? null
      : Number(property.longitude);

  const hasLocation =
    lat !== null &&
    lon !== null &&
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180;

  const mapUrl = hasLocation
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lon! - 0.01}%2C${lat! - 0.01}%2C${lon! + 0.01}%2C${lat! + 0.01}&layer=mapnik&marker=${lat}%2C${lon}`
    : "";

  return (
    <div className="mx-auto max-w-[1360px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <Link
        href="/properties"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#4c6540]"
      >
        <ArrowLeft className="size-4" />
        Back to properties
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-extrabold tracking-[0.15em] text-[#638d29]">
            {formatPropertyType(property.property_type)}
            {" / "}
            {property.listing_type}
          </p>

          <h1 className="mt-3 max-w-4xl text-[clamp(2.1rem,4.7vw,4.5rem)] leading-[1.08] font-bold tracking-[-0.06em]">
            {property.title}
          </h1>

          <p className="mt-4 flex items-center gap-2 text-sm text-[#596254]">
            <MapPin className="size-4" />
            {propertyLocation(property)}
          </p>

          {isDemoProperty(property) && (
            <p className="mt-4 inline-flex rounded-full bg-[#e5f5c9] px-3 py-2 text-xs font-bold text-[#3e5b28]">
              Fictional demonstration listing
            </p>
          )}
        </div>

        <div>
          <p className="text-xs font-bold text-[#65715f]">
            Listed price
          </p>

          <p className="mt-1 text-3xl font-extrabold tracking-[-0.05em]">
            {formatPrice(property.price, property.currency)}
          </p>
        </div>
      </div>

      <div className="mt-9 grid gap-4 lg:grid-cols-[1.5fr_0.5fr]">
        <PropertyVisual
          property={property}
          priority
          className="aspect-[4/3] rounded-2xl sm:aspect-[16/10]"
        />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          {[
            {
              label: "Bedrooms",
              value: `${property.bhk} BHK`,
              icon: BedDouble,
            },
            {
              label: "Bathrooms",
              value: String(property.bathrooms),
              icon: Bath,
            },
            {
              label: "Area",
              value: formatArea(property.area_sqft),
              icon: Ruler,
            },
            {
              label: "Availability",
              value: formatPropertyType(
                property.availability_status,
              ),
              icon: MapPin,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex min-w-0 flex-col justify-center rounded-xl border border-[#dce2d6] bg-white p-4"
            >
              <Icon className="size-5 text-[#638d29]" />

              <p className="mt-3 text-xs text-[#65715f]">
                {label}
              </p>

              <p className="mt-1 break-words font-bold">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-9 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-[#dce2d6] bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-bold tracking-[-0.04em]">
              About this property
            </h2>

            <p className="mt-5 whitespace-pre-line text-sm leading-8 text-[#566052] sm:text-base">
              {property.description}
            </p>

            <div className="mt-7 border-t border-[#e7ebe1] pt-6">
              <p className="text-xs font-bold text-[#65715f]">
                Furnishing
              </p>

              <p className="mt-2 font-semibold">
                {formatPropertyType(
                  property.furnished_status,
                )}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-[#dce2d6] bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-bold tracking-[-0.04em]">
              Property location
            </h2>

            {hasLocation ? (
              <>
                <iframe
                  title={`Map of ${property.title}`}
                  src={mapUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="mt-5 h-[300px] w-full rounded-xl border border-[#dce2d6]"
                />

                <a
                  href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[#4c6540] underline"
                >
                  Open larger map
                </a>
              </>
            ) : (
              <div className="mt-5 rounded-xl bg-[#f0f3ea] p-6">
                <MapPin className="size-7 text-[#638d29]" />

                <p className="mt-3 text-sm leading-7 text-[#566052]">
                  {propertyLocation(property)}
                </p>

                <p className="mt-2 text-xs text-[#74816e]">
                  Exact coordinates have not been provided.
                  No map marker is displayed.
                </p>
              </div>
            )}
          </section>
        </div>

        <div className="self-start lg:sticky lg:top-24">
          <PropertyActions property={property} />
        </div>
      </div>
    </div>
  );
}