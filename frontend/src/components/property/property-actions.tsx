"use client";

import { useState } from "react";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { CheckCircle2, LoaderCircle } from "lucide-react";

import {
  createEnquiry,
  createVisitRequest,
} from "@/lib/api/properties";

import type { Property } from "@/types/property";

const phone = z
  .string()
  .min(7, "Enter a valid phone number.")
  .max(20)
  .regex(
    /^\+?[0-9 ()-]+$/,
    "Use numbers and valid phone symbols only.",
  );

const enquirySchema = z.object({
  full_name: z.string().trim().min(2),
  email: z.email(),
  phone,
  message: z.string().max(2000),
});

const visitSchema = z.object({
  full_name: z.string().trim().min(2),
  email: z.email(),
  phone,
  preferred_start_at: z.string().refine(
    (value) => {
      const time = new Date(value).getTime();
      return Number.isFinite(time) && time > Date.now();
    },
    "Please select a future date and time.",
  ),
  customer_notes: z.string().max(2000),
});

type EnquiryValues = z.infer<typeof enquirySchema>;
type VisitValues = z.infer<typeof visitSchema>;

function FormField({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-bold text-[#343c30]"
      >
        {label}
      </label>

      {children}

      {error && (
        <p role="alert" className="mt-1 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "min-h-11 w-full rounded-lg border border-[#cfd7c6] bg-white px-3 text-base outline-offset-2 focus:border-[#668f24] sm:text-sm";

export function PropertyActions({
  property,
}: {
  property: Property;
}) {
  const [mode, setMode] = useState<"enquiry" | "visit">(
    "enquiry",
  );

  const [error, setError] = useState("");
  const [result, setResult] = useState("");

  const enquiry = useForm<EnquiryValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const visit = useForm<VisitValues>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      preferred_start_at: "",
      customer_notes: "",
    },
  });

  function changeMode(next: "enquiry" | "visit") {
    setMode(next);
    setResult("");
    setError("");
  }

  async function submitEnquiry(values: EnquiryValues) {
    setError("");
    setResult("");

    try {
      const response = await createEnquiry({
        ...values,
        property_id: property.id,
      });

      if (!response.success || !response.id) {
        throw new Error("The enquiry was not acknowledged.");
      }

      setResult(
        `Enquiry received. Reference: ${response.id}. Status: ${response.status}.`,
      );

      enquiry.reset();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The enquiry could not be submitted.",
      );
    }
  }

  async function submitVisit(values: VisitValues) {
    setError("");
    setResult("");

    try {
      const response = await createVisitRequest({
        property_id: property.id,
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        preferred_start_at: new Date(
          values.preferred_start_at,
        ).toISOString(),
        customer_notes: values.customer_notes,
      });

      if (!response.id) {
        throw new Error(
          "The visit request was not acknowledged.",
        );
      }

      setResult(
        `Visit request received. Reference: ${response.id}. Status: ${response.status}. This is not a confirmed appointment.`,
      );

      visit.reset();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The visit request could not be submitted.",
      );
    }
  }

  return (
    <section
      id="contact-property"
      className="scroll-mt-28 rounded-2xl border border-[#dce2d6] bg-white p-5 shadow-sm sm:p-6"
      aria-label="Enquire or request a visit"
    >
      <p className="text-[10px] font-bold tracking-[0.14em] text-[#638d29]">
        TAKE THE NEXT STEP
      </p>

      <h2 className="mt-2 text-xl font-bold tracking-[-0.04em]">
        Interested in this property?
      </h2>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Send an enquiry or request a viewing. Your details
        will be forwarded to the RealtyOS backend.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-[#eef1e9] p-1">
        <button
          type="button"
          onClick={() => changeMode("enquiry")}
          aria-pressed={mode === "enquiry"}
          className={`min-h-11 rounded-lg text-sm font-bold ${
            mode === "enquiry"
              ? "bg-brand-lime text-brand-ink"
              : "text-[#626b60]"
          }`}
        >
          Enquire
        </button>

        <button
          type="button"
          onClick={() => changeMode("visit")}
          aria-pressed={mode === "visit"}
          className={`min-h-11 rounded-lg text-sm font-bold ${
            mode === "visit"
              ? "bg-brand-lime text-brand-ink"
              : "text-[#626b60]"
          }`}
        >
          Request visit
        </button>
      </div>

      {mode === "enquiry" ? (
        <form
          onSubmit={enquiry.handleSubmit(submitEnquiry)}
          className="mt-6 space-y-4"
        >
          <FormField
            label="Full name"
            id="enquiry-name"
            error={enquiry.formState.errors.full_name?.message}
          >
            <input
              id="enquiry-name"
              autoComplete="name"
              className={inputClass}
              {...enquiry.register("full_name")}
            />
          </FormField>

          <FormField
            label="Email"
            id="enquiry-email"
            error={enquiry.formState.errors.email?.message}
          >
            <input
              id="enquiry-email"
              type="email"
              autoComplete="email"
              className={inputClass}
              {...enquiry.register("email")}
            />
          </FormField>

          <FormField
            label="Phone"
            id="enquiry-phone"
            error={enquiry.formState.errors.phone?.message}
          >
            <input
              id="enquiry-phone"
              type="tel"
              autoComplete="tel"
              className={inputClass}
              {...enquiry.register("phone")}
            />
          </FormField>

          <FormField
            label="Message"
            id="enquiry-message"
            error={enquiry.formState.errors.message?.message}
          >
            <textarea
              id="enquiry-message"
              rows={4}
              className={`${inputClass} py-3`}
              placeholder="Tell us what you'd like to know."
              {...enquiry.register("message")}
            />
          </FormField>

          <button
            type="submit"
            disabled={enquiry.formState.isSubmitting}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-ink px-5 text-sm font-bold text-white disabled:opacity-60"
          >
            {enquiry.formState.isSubmitting && (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            )}

            Send enquiry
          </button>
        </form>
      ) : (
        <form
          onSubmit={visit.handleSubmit(submitVisit)}
          className="mt-6 space-y-4"
        >
          <FormField
            label="Full name"
            id="visit-name"
            error={visit.formState.errors.full_name?.message}
          >
            <input
              id="visit-name"
              autoComplete="name"
              className={inputClass}
              {...visit.register("full_name")}
            />
          </FormField>

          <FormField
            label="Email"
            id="visit-email"
            error={visit.formState.errors.email?.message}
          >
            <input
              id="visit-email"
              type="email"
              autoComplete="email"
              className={inputClass}
              {...visit.register("email")}
            />
          </FormField>

          <FormField
            label="Phone"
            id="visit-phone"
            error={visit.formState.errors.phone?.message}
          >
            <input
              id="visit-phone"
              type="tel"
              autoComplete="tel"
              className={inputClass}
              {...visit.register("phone")}
            />
          </FormField>

          <FormField
            label="Preferred date and time"
            id="visit-date"
            error={
              visit.formState.errors.preferred_start_at?.message
            }
          >
            <input
              id="visit-date"
              type="datetime-local"
              className={inputClass}
              {...visit.register("preferred_start_at")}
            />
          </FormField>

          <FormField
            label="Additional notes"
            id="visit-notes"
            error={
              visit.formState.errors.customer_notes?.message
            }
          >
            <textarea
              id="visit-notes"
              rows={3}
              className={`${inputClass} py-3`}
              {...visit.register("customer_notes")}
            />
          </FormField>

          <button
            type="submit"
            disabled={visit.formState.isSubmitting}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-ink px-5 text-sm font-bold text-white disabled:opacity-60"
          >
            {visit.formState.isSubmitting && (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            )}

            Submit visit request
          </button>
        </form>
      )}

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}

      {result && (
        <p
          role="status"
          className="mt-4 flex items-start gap-2 break-words rounded-lg bg-[#eef9dc] p-3 text-sm leading-6 text-[#31531d]"
        >
          <CheckCircle2 className="mt-1 size-4 shrink-0" />
          {result}
        </p>
      )}

      <p className="mt-5 text-xs leading-5 text-[#727b6f]">
        For demonstration properties, submitted enquiries
        and visit requests are part of the assessment workflow.
        Do not treat demo listings as genuine property offers.
      </p>
    </section>
  );
}