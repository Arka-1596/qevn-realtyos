import type { Metadata } from "next";
import { Suspense } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

import { PropertyExplorer } from "@/components/property/property-explorer";

import { LoadingState } from "@/components/ui/feedback-states";

export const metadata: Metadata = {
  title: "Explore Properties",
  description:
    "Browse and filter properties through the QEVN RealtyOS marketplace.",
};

export default function PropertiesPage() {
  return (
    <>
      <SiteHeader />

      <main id="main-content">
        <Suspense
          fallback={
            <div className="mx-auto max-w-5xl px-4 py-20">
              <LoadingState label="Preparing property search…" />
            </div>
          }
        >
          <PropertyExplorer />
        </Suspense>
      </main>

      <SiteFooter />
    </>
  );
}