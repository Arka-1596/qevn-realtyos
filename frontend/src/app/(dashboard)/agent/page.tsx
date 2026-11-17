
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  LoaderCircle,
  LogOut,
  UsersRound,
} from "lucide-react";

import {
  getAgentLeads,
  getAgentVisits,
  getCurrentUser,
  logout,
} from "@/lib/api/auth";

import type {
  StaffLead,
  StaffVisit,
  StaffUser,
} from "@/lib/api/auth";

export default function AgentPage() {
  const router = useRouter();

  const [user, setUser] = useState<StaffUser | null>(null);
  const [leads, setLeads] = useState<StaffLead[]>([]);
  const [visits, setVisits] = useState<StaffVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const current = await getCurrentUser();

        if (!active) return;

        if (current.role !== "AGENT") {
          router.replace("/admin");
          return;
        }

        const [assignedLeads, assignedVisits] = await Promise.all([
          getAgentLeads(),
          getAgentVisits(),
        ]);

        if (!active) return;

        setUser(current);
        setLeads(assignedLeads);
        setVisits(assignedVisits);
      } catch (reason) {
        if (!active) return;

        const status =
          typeof reason === "object" &&
          reason !== null &&
          "status" in reason
            ? reason.status
            : null;

        if (status === 401 || status === 403) {
          router.replace("/login");
          return;
        }

        setError(
          reason instanceof Error
            ? reason.message
            : "Unable to load assigned work.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    try {
      await logout();
      router.replace("/login");
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Sign-out failed.",
      );
    }
  }

  if (loading) {
    return (
      <div role="status" className="flex items-center gap-3 p-8">
        <LoaderCircle className="size-6 animate-spin" />
        Loading assigned work...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div role="alert" className="rounded-xl bg-white p-6 text-red-700">
        {error || "Unable to access Agent workspace."}
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.15em] text-[#638d29]">
            AGENT / MY WORKSPACE
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.05em] sm:text-5xl">
            Welcome, {user.full_name}.
          </h1>
          <p className="mt-3 text-sm text-[#596254]">
            Your assigned leads and upcoming site visits.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-ink px-5 text-sm font-bold text-white"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            title: "Assigned leads",
            count: leads.length,
            icon: UsersRound,
          },
          {
            title: "Assigned site visits",
            count: visits.length,
            icon: CalendarDays,
          },
        ].map(({ title, count, icon: Icon }) => (
          <div
            key={title}
            className="rounded-2xl border border-[#dce2d6] bg-white p-6"
          >
            <Icon className="size-6 text-[#638d29]" />
            <p className="mt-6 text-sm font-semibold text-[#596254]">
              {title}
            </p>
            <p className="mt-2 text-4xl font-extrabold">
              {count}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-[#dce2d6] bg-white p-6">
        <h2 className="text-xl font-bold">
          My leads
        </h2>

        {leads.length ? (
          <div className="mt-5 space-y-3">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="flex flex-wrap justify-between gap-3 rounded-xl border border-[#e3e8dc] p-4"
              >
                <div>
                  <p className="font-bold">
                    {lead.full_name}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {lead.email}
                  </p>
                </div>
                <span className="text-xs font-bold text-[#638d29]">
                  {lead.status.replaceAll("_", " ")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-muted-foreground">
            No leads have been assigned to your account.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-[#dce2d6] bg-white p-6">
        <h2 className="text-xl font-bold">
          My visits
        </h2>

        {visits.length ? (
          <div className="mt-5 space-y-3">
            {visits.map((visit) => (
              <div
                key={visit.id}
                className="flex flex-wrap justify-between gap-3 rounded-xl border border-[#e3e8dc] p-4"
              >
                <p className="text-sm font-semibold">
                  {new Date(
                    visit.preferred_start_at,
                  ).toLocaleString("en-IN")}
                </p>
                <span className="text-xs font-bold text-[#638d29]">
                  {visit.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-muted-foreground">
            No site visits have been assigned.
          </p>
        )}
      </section>
    </div>
  );
}
