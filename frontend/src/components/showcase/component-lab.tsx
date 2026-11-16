"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ComponentLab() {
  const [input, setInput] = useState("");

  const [savedLabel, setSavedLabel] =
    useState<string | null>(null);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const next = input.trim();

    if (!next) {
      return;
    }

    setSavedLabel(next);
  }

  return (
    <div className="rounded-2xl border border-[#dce2d6] bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold tracking-[-0.025em]">
          Shared UI controls
        </h2>

        <span className="text-[10px] font-bold tracking-widest text-[#638d29]">
          LOCAL PREVIEW
        </span>
      </div>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        A real, local interaction to verify buttons,
        inputs and focus behavior. This does not
        write to the CRM.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="min-w-0 flex-1">
          <label
            htmlFor="stage1-label"
            className="mb-2 block text-xs font-bold"
          >
            Preview label
          </label>

          <Input
            id="stage1-label"
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            placeholder="Type a label"
            maxLength={70}
            className="min-h-11 border-[#cfd7c6]"
            required
          />
        </div>

        <Button
          type="submit"
          className="min-h-11 bg-brand-lime text-brand-ink hover:bg-[#d9ff94]"
        >
          Apply locally
        </Button>
      </form>

      {savedLabel ? (
        <p
          role="status"
          className="mt-4 flex items-center gap-2 rounded-xl bg-[#eef9dc] px-3 py-3 text-sm text-[#2e5421]"
        >
          <CheckCircle2
            className="size-4 shrink-0"
            aria-hidden="true"
          />

          Current local preview label:

          <strong className="break-all">
            {savedLabel}
          </strong>
        </p>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground">
          Submit a label to confirm the interaction works.
        </p>
      )}
    </div>
  );
}