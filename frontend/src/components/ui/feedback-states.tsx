"use client";

import {
  AlertCircle,
  Inbox,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-[#d1d9c7] bg-white px-5 py-9 text-center">
      <span className="mb-4 rounded-xl bg-[#f0f3e9] p-3">
        <Inbox
          className="size-6 text-[#596751]"
          aria-hidden="true"
        />
      </span>

      <h3 className="text-base font-bold">
        {title}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({
  label = "Loading…",
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-36 flex-col items-center justify-center gap-3 rounded-xl border border-[#dce2d6] bg-white p-5 text-sm text-muted-foreground"
    >
      <LoaderCircle
        className="size-6 animate-spin text-[#668f24] motion-reduce:animate-none"
        aria-hidden="true"
      />

      <span>{label}</span>
    </div>
  );
}

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex min-h-36 flex-col justify-center gap-3 rounded-xl border border-[#eccbc7] bg-[#fff8f6] p-5"
    >
      <div className="flex items-center gap-2 font-bold text-[#862820]">
        <AlertCircle
          className="size-5"
          aria-hidden="true"
        />

        <span>{title}</span>
      </div>

      <p className="text-sm leading-6 text-[#75423c]">
        {message}
      </p>

      {onRetry && (
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={onRetry}
            className="border-[#d4a7a2] bg-white"
          >
            <RotateCcw
              className="mr-2 size-4"
              aria-hidden="true"
            />

            Retry
          </Button>
        </div>
      )}
    </div>
  );
}