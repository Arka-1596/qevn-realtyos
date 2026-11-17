
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { apiRequest } from "@/lib/api/client";
import {
  getCurrentUser,
  getAgentLeads,
  getAgentVisits,
  getCsrfToken,
} from "@/lib/api/auth";

import type {
  StaffLead,
  StaffVisit,
} from "@/lib/api/auth";

const transitions: Record<string, string[]> = {
  NEW: ["CONTACTED", "LOST"],
  CONTACTED: ["QUALIFIED", "LOST"],
  QUALIFIED: ["VISIT_SCHEDULED", "NEGOTIATION", "LOST"],
  VISIT_SCHEDULED: ["NEGOTIATION", "WON", "LOST"],
  NEGOTIATION: ["WON", "LOST"],
  WON: [],
  LOST: [],
};

export default function AgentActionsPage() {
  const router = useRouter();

  const [leads, setLeads] = useState<StaffLead[]>([]);
  const [visits, setVisits] = useState<StaffVisit[]>([]);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    const [leadRecords, visitRecords] = await Promise.all([
      getAgentLeads(),
      getAgentVisits(),
    ]);

    setLeads(leadRecords);
    setVisits(visitRecords);
  }, []);

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const user = await getCurrentUser();

        if (!active) return;

        if (user.role !== "AGENT") {
          router.replace("/login");
          return;
        }

        await refresh();
      } catch {
        if (active) router.replace("/login");
      } finally {
        if (active) setLoading(false);
      }
    }

    void initialize();

    return () => {
      active = false;
    };
  }, [router, refresh]);

  async function updateStatus(lead: StaffLead) {
    const status = selections[lead.id];

    if (!status) {
      setError("Please select a valid next status.");
      return;
    }

    setWorking(true);
    setError("");

    try {
      await apiRequest(
        `/api/v1/agent/leads/${encodeURIComponent(lead.id)}`,
        {
          method: "PATCH",
          headers: {
            "X-CSRF-Token": getCsrfToken(),
          },
          body: JSON.stringify({ status }),
        },
      );

      await refresh();
      setNotice(`Lead updated to ${status}.`);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Lead update failed.",
      );
    } finally {
      setWorking(false);
    }
  }

  async function addNote(lead: StaffLead) {
    const content = notes[lead.id]?.trim();

    if (!content) {
      setError("Write a note before saving.");
      return;
    }

    setWorking(true);
    setError("");

    try {
      await apiRequest(
        `/api/v1/agent/leads/${encodeURIComponent(lead.id)}/notes`,
        {
          method: "POST",
          headers: {
            "X-CSRF-Token": getCsrfToken(),
          },
          body: JSON.stringify({ content }),
        },
      );

      setNotes((current) => ({
        ...current,
        [lead.id]: "",
      }));
      setNotice("Follow-up note recorded in CRM activity.");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to save note.",
      );
    } finally {
      setWorking(false);
    }
  }

  if (loading) {
    return <main className="p-8">Loading assigned work...</main>;
  }

  return (
    <main className="space-y-7 pb-12">
      <Link
        href="/agent"
        className="text-sm font-semibold text-[#527b2b] underline"
      >
        Back to Agent dashboard
      </Link>

      <div>
        <p className="text-xs font-bold tracking-[0.16em] text-[#638d29]">
          QEVN REALTYOS / AGENT ACTIONS
        </p>

        <h1 className="mt-3 text-3xl font-extrabold">
          My assigned customers
        </h1>

        <p className="mt-3 text-sm text-[#596254]">
          Update the sales pipeline and record customer follow-ups.
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
          {error}
        </p>
      )}

      {notice && (
        <p role="status" className="rounded-xl bg-[#eaf6d7] p-4 text-[#31531d]">
          {notice}
        </p>
      )}

      <section className="space-y-4">
        {leads.map((lead) => {
          const allowed = transitions[lead.status] ?? [];

          return (
            <article
              key={lead.id}
              className="rounded-2xl border bg-white p-6"
            >
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">
                    {lead.full_name}
                  </h2>
                  <p className="mt-2 text-sm text-[#596254]">
                    {lead.email}
                  </p>
                  <p className="text-sm text-[#596254]">
                    {lead.phone}
                  </p>
                </div>

                <span className="self-start rounded-full bg-[#eaf6d7] px-3 py-2 text-sm font-bold">
                  {lead.status.replaceAll("_", " ")}
                </span>
              </div>

              {allowed.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <select
                    aria-label={`Next status for ${lead.full_name}`}
                    className="min-h-11 min-w-48 rounded-xl border px-3 text-sm"
                    value={selections[lead.id] ?? ""}
                    onChange={(event) =>
                      setSelections((current) => ({
                        ...current,
                        [lead.id]: event.target.value,
                      }))
                    }
                  >
                    <option value="">Next status</option>
                    {allowed.map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    disabled={working}
                    onClick={() => void updateStatus(lead)}
                    className="min-h-11 rounded-xl bg-[#20221f] px-5 font-bold text-white disabled:opacity-50"
                  >
                    Update status
                  </button>
                </div>
              )}

              <div className="mt-5 space-y-2">
                <label
                  htmlFor={`note-${lead.id}`}
                  className="block text-sm font-bold"
                >
                  Follow-up note
                </label>

                <textarea
                  id={`note-${lead.id}`}
                  className="min-h-24 w-full rounded-xl border p-3 text-sm"
                  maxLength={3000}
                  placeholder="Example: Spoke with customer and explained the property details."
                  value={notes[lead.id] ?? ""}
                  onChange={(event) =>
                    setNotes((current) => ({
                      ...current,
                      [lead.id]: event.target.value,
                    }))
                  }
                />

                <button
                  type="button"
                  disabled={working}
                  onClick={() => void addNote(lead)}
                  className="min-h-11 rounded-xl border px-5 font-bold disabled:opacity-50"
                >
                  Save note
                </button>
              </div>
            </article>
          );
        })}

        {leads.length === 0 && (
          <div className="rounded-xl bg-white p-7">
            No leads assigned. Ask the Admin to allocate an enquiry.
          </div>
        )}
      </section>

      <section className="rounded-2xl border bg-white p-6">
        <h2 className="text-xl font-bold">
          My assigned site visits
        </h2>

        {visits.length === 0 ? (
          <p className="mt-3 text-sm text-[#596254]">
            No site visits assigned yet.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {visits.map((visit) => (
              <div key={visit.id} className="rounded-lg bg-[#f3f6ee] p-4">
                <p className="font-bold">{visit.status}</p>
                <p className="text-sm">
                  {new Date(
                    visit.preferred_start_at,
                  ).toLocaleString("en-IN")}
                </p>
                <p className="break-all text-xs text-[#596254]">
                  Visit reference: {visit.id}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
