"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Filter,
  SlidersHorizontal,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PropertyFiltersProps = {
  search: string;
};

function FilterForm({
  search,
  onApplied,
}: {
  search: string;
  onApplied?: () => void;
}) {
  const router = useRouter();
  const params = new URLSearchParams(search);

  const [error, setError] = useState("");

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const next = new URLSearchParams();

    for (const [key, value] of data.entries()) {
      const normalized = String(value).trim();

      if (normalized) {
        next.set(key, normalized);
      }
    }

    const min = next.get("min_price");
    const max = next.get("max_price");

    if (
      min !== null &&
      max !== null &&
      Number(min) > Number(max)
    ) {
      setError(
        "Maximum budget must be greater than or equal to minimum budget.",
      );
      return;
    }

    setError("");
    onApplied?.();

    router.push(
      `/properties${next.size ? `?${next.toString()}` : ""}`,
    );
  }

  return (
    <form
      key={search}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor={`keyword-${onApplied ? "mobile" : "desktop"}`}
          className="mb-2 block text-xs font-bold"
        >
          Keyword or locality
        </label>

        <Input
          id={`keyword-${onApplied ? "mobile" : "desktop"}`}
          name="keyword"
          defaultValue={params.get("keyword") ?? ""}
          placeholder="New Town, Ballygunge..."
          className="min-h-11"
        />
      </div>

      <div>
        <label
          htmlFor={`city-${onApplied ? "mobile" : "desktop"}`}
          className="mb-2 block text-xs font-bold"
        >
          City
        </label>

        <Input
          id={`city-${onApplied ? "mobile" : "desktop"}`}
          name="city"
          defaultValue={params.get("city") ?? ""}
          placeholder="Kolkata"
          className="min-h-11"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor={`min-${onApplied ? "mobile" : "desktop"}`}
            className="mb-2 block text-xs font-bold"
          >
            Min price (₹)
          </label>

          <Input
            id={`min-${onApplied ? "mobile" : "desktop"}`}
            name="min_price"
            type="number"
            min="0"
            step="1"
            defaultValue={params.get("min_price") ?? ""}
            placeholder="0"
            className="min-h-11"
          />
        </div>

        <div>
          <label
            htmlFor={`max-${onApplied ? "mobile" : "desktop"}`}
            className="mb-2 block text-xs font-bold"
          >
            Max price (₹)
          </label>

          <Input
            id={`max-${onApplied ? "mobile" : "desktop"}`}
            name="max_price"
            type="number"
            min="0"
            step="1"
            defaultValue={params.get("max_price") ?? ""}
            placeholder="Any"
            className="min-h-11"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor={`type-${onApplied ? "mobile" : "desktop"}`}
          className="mb-2 block text-xs font-bold"
        >
          Property type
        </label>

        <select
          id={`type-${onApplied ? "mobile" : "desktop"}`}
          name="property_type"
          defaultValue={params.get("property_type") ?? ""}
          className="min-h-11 w-full rounded-lg border border-input bg-white px-3 text-sm"
        >
          <option value="">All types</option>
          <option value="APARTMENT">Apartment</option>
          <option value="HOUSE">House</option>
          <option value="VILLA">Villa</option>
          <option value="LAND">Land</option>
          <option value="COMMERCIAL">Commercial</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor={`listing-${onApplied ? "mobile" : "desktop"}`}
            className="mb-2 block text-xs font-bold"
          >
            Listing type
          </label>

          <select
            id={`listing-${onApplied ? "mobile" : "desktop"}`}
            name="listing_type"
            defaultValue={params.get("listing_type") ?? ""}
            className="min-h-11 w-full rounded-lg border border-input bg-white px-3 text-sm"
          >
            <option value="">All</option>
            <option value="SALE">Sale</option>
            <option value="RENT">Rent</option>
          </select>
        </div>

        <div>
          <label
            htmlFor={`bhk-${onApplied ? "mobile" : "desktop"}`}
            className="mb-2 block text-xs font-bold"
          >
            Bedrooms
          </label>

          <select
            id={`bhk-${onApplied ? "mobile" : "desktop"}`}
            name="bhk"
            defaultValue={params.get("bhk") ?? ""}
            className="min-h-11 w-full rounded-lg border border-input bg-white px-3 text-sm"
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5, 6].map((value) => (
              <option key={value} value={value}>
                {value} BHK
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="min-h-12 w-full bg-brand-lime font-bold text-brand-ink hover:bg-[#ddff9d]"
      >
        <Filter className="mr-2 size-4" />
        Apply filters
      </Button>

      <Link
        href="/properties"
        onClick={onApplied}
        className="flex min-h-11 items-center justify-center text-sm font-bold text-[#596452] underline underline-offset-4"
      >
        Clear all filters
      </Link>
    </form>
  );
}

export function PropertyFilters({
  search,
}: PropertyFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden">
        <Sheet
          open={mobileOpen}
          onOpenChange={setMobileOpen}
        >
          <SheetTrigger className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#dce2d6] bg-white px-5 text-sm font-bold">
            <SlidersHorizontal className="size-4" />
            Search filters
          </SheetTrigger>

          <SheetContent
            side="left"
            className="w-[min(92vw,390px)] overflow-y-auto bg-brand-cream p-5 text-brand-ink"
          >
            <SheetHeader className="px-0">
              <SheetTitle>Filter properties</SheetTitle>
              <SheetDescription>
                Find properties matching your requirements.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6">
              <FilterForm
                search={search}
                onApplied={() => setMobileOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <aside className="hidden self-start rounded-2xl border border-[#dce2d6] bg-white p-6 lg:sticky lg:top-24 lg:block">
        <h2 className="mb-6 flex items-center gap-2 text-lg font-bold">
          <SlidersHorizontal className="size-5" />
          Refine results
        </h2>

        <FilterForm search={search} />
      </aside>
    </>
  );
}