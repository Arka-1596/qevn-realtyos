"use client";

import { ErrorState } from "@/components/ui/feedback-states";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl p-5 sm:p-10">
      <ErrorState
        title="This view could not load"
        message="Please try again. If the issue continues, return to the home page and check your connection."
        onRetry={reset}
      />
    </div>
  );
}