
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { apiRequest } from "@/lib/api/client";
import {
  getCurrentUser,
  getCsrfToken,
} from "@/lib/api/auth";
import type {
  StaffLead,
  StaffUser,
} from "@/lib/api/auth";

type PropertyItem = {
  id: string;
  slug: string;
  title: string;
  images: Array<{ id: string; image_url: string }>;
};

type Activity = {
  action_type: string;
  previous_value: string | null;
  new_value: string | null;
  created_at: string;
};

export default function AdminOperationsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [agents, setAgents] = useState<StaffUser[]>([]);
  const [leads, setLeads] = useState<StaffLead[]>([]);
  const [properties, setProperties] = useState<PropertyItem[]>([]);

  const [agentName, setAgentName] = useState("");
  const [agentEmail, setAgentEmail] = useState("");
  const [agentPassword, setAgentPassword] = useState("");

  const [leadId, setLeadId] = useState("");
  const [agentId, setAgentId] = useState("");

  const [propertyId, setPropertyId] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const [activity, setActivity] = useState<Activity[]>([]);
  const [activityLeadId, setActivityLeadId] = useState("");

  const refresh = useCallback(async () => {
    const [staff, leadResponse, propertyResponse] =
      await Promise.all([
        apiRequest<StaffUser[]>("/api/v1/admin/agents"),
        apiRequest<{ items: StaffLead[] }>(
          "/api/v1/admin/leads?page=1&limit=100",
        ),
        apiRequest<{ items: PropertyItem[] }>(
          "/api/v1/admin/properties?page=1&limit=50",
        ),
      ]);

    setAgents(staff);
    setLeads(leadResponse.items);
    setProperties(propertyResponse.items);
  }, []);

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const user = await getCurrentUser();

        if (!active) return;

        if (user.role !== "ADMIN") {
          router.replace(
            user.role === "AGENT" ? "/agent" : "/login",
          );
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

  async function execute(
    operation: () => Promise<unknown>,
    successMessage: string,
  ) {
    setWorking(true);
    setError("");
    setNotice("");

    try {
      await operation();
      await refresh();
      setNotice(successMessage);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Operation failed.",
      );
    } finally {
      setWorking(false);
    }
  }

  async function createAgent(event: React.FormEvent) {
    event.preventDefault();

    if (agentPassword.length < 12) {
      setError("Agent password must contain 12 characters.");
      return;
    }

    await execute(
      () =>
        apiRequest("/api/v1/admin/agents", {
          method: "POST",
          headers: {
            "X-CSRF-Token": getCsrfToken(),
          },
          body: JSON.stringify({
            full_name: agentName.trim(),
            email: agentEmail.trim(),
            password: agentPassword,
          }),
        }),
      "Agent account created successfully.",
    );

    setAgentPassword("");
  }

  async function assignLead(event: React.FormEvent) {
    event.preventDefault();

    if (!leadId || !agentId) {
      setError("Select a lead and an Agent.");
      return;
    }

    await execute(
      () =>
        apiRequest(
          `/api/v1/admin/leads/${encodeURIComponent(leadId)}`,
          {
            method: "PATCH",
            headers: {
              "X-CSRF-Token": getCsrfToken(),
            },
            body: JSON.stringify({
              assigned_agent_id: agentId,
            }),
          },
        ),
      "Lead assigned successfully.",
    );
  }

  async function uploadPhoto(event: React.FormEvent) {
    event.preventDefault();

    if (!photo || !propertyId) {
      setError("Select a property and a photo.");
      return;
    }

    if (photo.size > 5 * 1024 * 1024) {
      setError("Maximum image size is 5 MB.");
      return;
    }

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(
        photo.type,
      )
    ) {
      setError("Please use JPEG, PNG or WebP.");
      return;
    }

    const data = new FormData();
    data.append("file", photo);

    await execute(
      () =>
        apiRequest(
          `/api/v1/admin/properties/${encodeURIComponent(propertyId)}/images`,
          {
            method: "POST",
            headers: {
              "X-CSRF-Token": getCsrfToken(),
            },
            body: data,
          },
        ),
      "Photo uploaded to Cloudinary and linked to the property.",
    );
  }

  async function viewActivity(id: string) {
    setError("");
    setActivityLeadId(id);

    try {
      const records = await apiRequest<Activity[]>(
        `/api/v1/admin/leads/${encodeURIComponent(id)}/activity`,
      );
      setActivity(records);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to load lead activity.",
      );
    }
  }

  const inputClass =
    "w-full min-h-11 rounded-xl border border-[#ccd5c3] bg-white px-3 text-sm";

  const buttonClass =
    "min-h-11 rounded-xl bg-[#20221f] px-5 font-bold text-white disabled:opacity-50";

  if (loading) {
    return <main className="p-8">Loading Admin operations...</main>;
  }

  return (
    <main className="space-y-7 pb-12">
      <div>
        <Link
          href="/admin"
          className="text-sm font-semibold text-[#527b2b] underline"
        >
          Back to Admin dashboard
        </Link>

        <p className="mt-5 text-xs font-bold tracking-[0.16em] text-[#638d29]">
          QEVN REALTYOS / ADMIN OPERATIONS
        </p>

        <h1 className="mt-3 text-3xl font-extrabold">
          Manage your property business.
        </h1>

        <p className="mt-2 text-sm text-[#596254]">
          Live Agent accounts, enquiries, assignments and photos.
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

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-bold">Create an Agent</h2>

          <form onSubmit={createAgent} className="mt-5 space-y-3">
            <label className="block text-sm font-semibold">
              Full name
              <input
                required
                minLength={2}
                className={`${inputClass} mt-1`}
                value={agentName}
                onChange={(event) => setAgentName(event.target.value)}
              />
            </label>

            <label className="block text-sm font-semibold">
              Email
              <input
                required
                type="email"
                className={`${inputClass} mt-1`}
                value={agentEmail}
                onChange={(event) => setAgentEmail(event.target.value)}
              />
            </label>

            <label className="block text-sm font-semibold">
              Password
              <input
                required
                type="password"
                minLength={12}
                className={`${inputClass} mt-1`}
                value={agentPassword}
                onChange={(event) => setAgentPassword(event.target.value)}
              />
            </label>

            <button className={buttonClass} disabled={working}>
              Create Agent account
            </button>
          </form>

          <h3 className="mt-6 font-bold">
            Existing Agents ({agents.length})
          </h3>

          <div className="mt-3 space-y-2">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="rounded-lg bg-[#f3f6ee] p-3 text-sm"
              >
                <strong>{agent.full_name}</strong>
                <p className="break-all text-[#596254]">
                  {agent.email}
                </p>
                <p className="text-xs">
                  {agent.is_active ? "Active" : "Inactive"}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-bold">Assign a customer lead</h2>

          <form onSubmit={assignLead} className="mt-5 space-y-4">
            <label className="block text-sm font-semibold">
              Select enquiry
              <select
                className={`${inputClass} mt-1`}
                value={leadId}
                onChange={(event) => setLeadId(event.target.value)}
              >
                <option value="">Choose a lead</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.full_name} — {lead.status}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold">
              Assign to
              <select
                className={`${inputClass} mt-1`}
                value={agentId}
                onChange={(event) => setAgentId(event.target.value)}
              >
                <option value="">Choose an Agent</option>
                {agents
                  .filter((agent) => agent.is_active)
                  .map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.full_name}
                    </option>
                  ))}
              </select>
            </label>

            <button className={buttonClass} disabled={working}>
              Assign lead
            </button>
          </form>

          <h3 className="mt-6 font-bold">
            Recent leads ({leads.length})
          </h3>

          <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="rounded-lg bg-[#f3f6ee] p-3 text-sm"
              >
                <strong>{lead.full_name}</strong>
                <p className="text-[#596254]">
                  {lead.status} · {lead.email}
                </p>
                <p className="text-xs text-[#596254]">
                  Assigned:{" "}
                  {agents.find(
                    (agent) => agent.id === lead.assigned_agent_id,
                  )?.full_name ?? "Not assigned"}
                </p>

                <button
                  type="button"
                  className="mt-2 text-xs font-bold text-[#527b2b] underline"
                  onClick={() => void viewActivity(lead.id)}
                >
                  View activity log
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-bold">
            Upload property photographs
          </h2>

          <p className="mt-2 text-sm text-[#596254]">
            Upload your own or licensed photographs. For fictional
            listings, these are illustrative images only.
          </p>

          <form onSubmit={uploadPhoto} className="mt-5 space-y-4">
            <select
              className={inputClass}
              value={propertyId}
              onChange={(event) => setPropertyId(event.target.value)}
              aria-label="Choose property"
            >
              <option value="">Select a property</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.title}
                </option>
              ))}
            </select>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={inputClass}
              onChange={(event) =>
                setPhoto(event.target.files?.[0] ?? null)
              }
            />

            <button className={buttonClass} disabled={working}>
              Upload to Cloudinary
            </button>
          </form>

          <div className="mt-5 space-y-3">
            {properties.map((property) => (
              <div
                key={property.id}
                className="rounded-lg bg-[#f3f6ee] p-3 text-sm"
              >
                <p className="font-bold">{property.title}</p>
                <p>{property.images.length} uploaded images</p>

                <Link
                  href={`/properties/${property.slug}`}
                  className="text-[#527b2b] underline"
                >
                  Open public listing
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-bold">Lead activity log</h2>

          <p className="mt-2 text-sm text-[#596254]">
            {activityLeadId
              ? `Showing actions for lead ${activityLeadId}`
              : "Select View activity log on a lead."}
          </p>

          <div className="mt-5 max-h-96 space-y-3 overflow-y-auto">
            {activity.map((entry, index) => (
              <article
                key={`${entry.created_at}-${index}`}
                className="rounded-xl border p-4 text-sm"
              >
                <p className="font-bold">{entry.action_type}</p>
                <p className="mt-1 text-xs text-[#596254]">
                  {new Date(entry.created_at).toLocaleString("en-IN")}
                </p>

                {entry.previous_value && (
                  <p className="mt-2 break-words">
                    From: {entry.previous_value}
                  </p>
                )}

                {entry.new_value && (
                  <p className="mt-1 break-words">
                    To: {entry.new_value}
                  </p>
                )}
              </article>
            ))}

            {activityLeadId && activity.length === 0 && (
              <p>No recorded activity.</p>
            )}
          </div>
        </section>
      </div>

      <button
        type="button"
        disabled={working}
        onClick={() => void refresh()}
        className="min-h-11 rounded-xl border px-5 font-bold"
      >
        Refresh all records
      </button>
    </main>
  );
}
