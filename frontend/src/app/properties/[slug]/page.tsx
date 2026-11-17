
import type { Metadata } from "next";
import { Suspense } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

import { PropertyDetail } from "@/components/property/property-detail";
import { LoadingState } from "@/components/ui/feedback-states";

export const metadata: Metadata = {
  title: "Property Details",
  description:
    "Explore property details, submit an enquiry, or request a site visit through QEVN RealtyOS.",
};

export default function PropertyDetailsPage() {
  return (
    <>
      <SiteHeader />

      <main id="main-content">
        <Suspense
          fallback={
            <div className="mx-auto max-w-5xl px-4 py-20">
              <LoadingState label="Loading property details…" />
            </div>
          }
        >
          <PropertyDetail />
        </Suspense>
      </main>

      <SiteFooter />
    </>
  );
}
