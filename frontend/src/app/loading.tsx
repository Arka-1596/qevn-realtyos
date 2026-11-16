import { LoadingState } from "@/components/ui/feedback-states";

export default function Loading() {
  return (
    <div className="mx-auto max-w-xl p-5 sm:p-10">
      <LoadingState label="Preparing RealtyOS…" />
    </div>
  );
}