import Image from "next/image";
import { Building2 } from "lucide-react";

import type { Property } from "@/types/property";

type PropertyVisualProps = {
  property: Property;
  priority?: boolean;
  className?: string;
};

export function PropertyVisual({
  property,
  priority = false,
  className = "",
}: PropertyVisualProps) {
  const cover =
    property.images.find((image) => image.is_cover) ??
    [...property.images].sort(
      (a, b) => a.sort_order - b.sort_order,
    )[0];

  const imageUrl = cover?.image_url;

  return (
    <div
      className={`relative isolate overflow-hidden bg-[#222820] ${className}`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={cover.alt_text || property.title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          role="img"
          aria-label={`Architectural placeholder for ${property.title}; no property photograph available`}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(#a0ad98 1px, transparent 1px), linear-gradient(90deg, #a0ad98 1px, transparent 1px)",
              backgroundSize: "45px 45px",
            }}
          />

          <div
            aria-hidden="true"
            className="absolute bottom-0 flex h-[70%] w-[62%] items-end gap-2 opacity-85"
          >
            <div className="h-[62%] w-1/3 border border-white/20 bg-[#344334]" />

            <div className="grid h-full w-2/3 grid-cols-3 gap-2 border border-white/30 bg-[#465748] p-3">
              {Array.from({ length: 15 }, (_, index) => (
                <span
                  key={index}
                  className={
                    index % 5 === 2
                      ? "bg-[#cdff75]/80"
                      : "bg-[#202a20]"
                  }
                />
              ))}
            </div>
          </div>

          <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-lg bg-[#131713]/90 px-3 py-2 text-[11px] font-semibold text-white">
            <Building2
              className="size-4 text-[#cdff75]"
              aria-hidden="true"
            />
            Image not available
          </span>
        </div>
      )}
    </div>
  );
}