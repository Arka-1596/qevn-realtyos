import Link from "next/link";

import {
  ArrowUpRight,
  BedDouble,
  MapPin,
  Ruler,
} from "lucide-react";

import type { Property } from "@/types/property";

import {
  formatArea,
  formatPrice,
  formatPropertyType,
  isDemoProperty,
  propertyLocation,
} from "@/lib/property-format";

import { PropertyVisual } from "./property-visual";

type PropertyCardProps = {
  property: Property;
};

export function PropertyCard({
  property,
}: PropertyCardProps) {
  const href = `/properties/${encodeURIComponent(
    property.slug,
  )}`;

  return (
    <article className="group min-w-0 overflow-hidden rounded-[1.4rem] border border-[#dce2d6] bg-white transition-[border-color,box-shadow] hover:border-[#aebd9c] hover:shadow-[0_15px_40px_rgba(19,19,19,0.06)]">
      <Link
        href={href}
        aria-label={`View details for ${property.title}`}
        className="block focus-visible:outline-offset-[-4px]"
      >
        <div className="relative">
          <PropertyVisual
            property={property}
            className="aspect-[4/3]"
          />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {isDemoProperty(property) && (
              <span className="rounded-full bg-[#cdff75] px-3 py-1.5 text-[10px] font-extrabold tracking-wider text-[#131313]">
                DEMO LISTING
              </span>
            )}

            <span className="rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-extrabold tracking-wider text-[#20221f]">
              {property.listing_type === "SALE"
                ? "FOR SALE"
                : "FOR RENT"}
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold tracking-[0.11em] text-[#638d29]">
                {formatPropertyType(
                  property.property_type,
                )}
              </p>

              <h2 className="mt-2 line-clamp-2 text-xl font-bold tracking-[-0.04em] text-[#131313]">
                {property.title}
              </h2>
            </div>

            <ArrowUpRight
              className="mt-1 size-5 shrink-0 text-[#638d29]"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 flex items-start gap-2 text-sm text-[#666d63]">
            <MapPin
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span>{propertyLocation(property)}</span>
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-[#e9ede4] py-4 text-xs font-semibold text-[#626b5f]">
            <span className="inline-flex items-center gap-1.5">
              <BedDouble
                className="size-4"
                aria-hidden="true"
              />
              {property.bhk} BHK
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Ruler
                className="size-4"
                aria-hidden="true"
              />
              {formatArea(property.area_sqft)}
            </span>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="text-lg font-extrabold tracking-[-0.04em] text-[#131313] sm:text-xl">
              {formatPrice(
                property.price,
                property.currency,
              )}
            </span>

            <span className="text-xs font-bold text-[#638d29]">
              View details
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}