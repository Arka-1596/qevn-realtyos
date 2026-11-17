
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CalendarDays,
  LogOut,
  UsersRound,
  Clock3,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import {
  getCurrentUser,
  getAdminDashboard,
  getAdminLeads,
  logout,
} from "@/lib/api/auth";

import type {
  AdminDashboardData,
  StaffLead,
  StaffUser,
} from "@/lib/api/auth";

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] = useState<StaffUser | null>(null);
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [leads, setLeads] = useState<StaffLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const currentUser = await getCurrentUser();

        if (!active) return;

        if (currentUser.role !== "ADMIN") {
          router.replace("/agent");
          return;
        }

        const [dashboard, leadResponse] = await Promise.all([
          getAdminDashboard(),
          getAdminLeads(),
        ]);

        if (!active) return;

        setUser(currentUser);
        setData(dashboard);
        setLeads(leadResponse.items);
        setError("");
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
            : "Unable to load the Admin workspace.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [router, refresh]);

  async function handleLogout() {
    setSigningOut(true);

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
      setSigningOut(false);
    }
  }

  const metrics = data
    ? [
        {
          title: "Total properties",
          value: data.total_properties,
          icon: Building2,
        },
        {
          title: "Published properties",
          value: data.active_properties,
          icon: Building2,
        },
        {
          title: "Total leads",
          value: data.total_leads,
          icon: UsersRound,
        },
        {
          title: "New enquiries",
          value: data.new_leads,
          icon: UsersRound,
        },
        {
          title: "Requested visits",
          value: data.requested_visits,
          icon: CalendarDays,
        },
        {
          title: "Follow-ups scheduled",
          value: data.upcoming_follow_ups,
          icon: Clock3,
        },
      ]
    : [];

  if (loading) {
    return (
      <div role="status" className="flex items-center gap-3 p-8">
        <LoaderCircle className="size-6 animate-spin text-[#638d29]" />
        Loading live CRM data...
      </div>
    );
  }

  if (error || !data || !user) {
    return (
      <div role="alert" className="rounded-2xl bg-white p-8">
        <h1 className="text-xl font-bold">
          Unable to load Admin dashboard
        </h1>
        <p className="mt-3 text-sm text-red-700">
          {error || "No dashboard data received."}
        </p>
        <button
          onClick={() => {
            setLoading(true);
            setError("");
            setRefresh((value) => value + 1);
          }}
          className="mt-5 min-h-11 rounded-xl bg-brand-lime px-5 font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="text-xs font-bold tracking-[0.15em] text-[#638d29]">
            REALTYOS / LIVE CRM
          </p>

          <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.05em] sm:text-5xl">
            Operations overview.
          </h1>

          <p className="mt-4 text-sm text-[#596254]">
            Welcome, {user.full_name}. Showing data from
            the connected RealtyOS backend.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setLoading(true);
              setRefresh((value) => value + 1);
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#cfd7c6] bg-white px-4 text-sm font-bold"
          >
            <RefreshCw className="size-4" />
            Refresh
          </button>

          <button
            onClick={handleLogout}
            disabled={signingOut}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-ink px-4 text-sm font-bold text-white disabled:opacity-50"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(({ title, value, icon: Icon }) => (
          <article
            key={title}
            className="rounded-2xl border border-[#dce2d6] bg-white p-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#596254]">
                {title}
              </span>
              <Icon className="size-5 text-[#638d29]" />
            </div>

            <p className="mt-6 text-4xl font-extrabold tracking-[-0.06em]">
              {value.toLocaleString("en-IN")}
            </p>
          </article>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <section className="min-w-0 rounded-2xl border border-[#dce2d6] bg-white p-5 sm:p-7">
          <h2 className="text-xl font-bold tracking-[-0.04em]">
            Recent enquiries
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            The five latest leads from your database.
          </p>

          {leads.length === 0 ? (
            <p className="mt-7 rounded-xl bg-[#f4f6eb] p-5 text-sm">
              No enquiries have been submitted yet.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e3e8dc] p-4"
                >
                  <div className="min-w-0">
                    <p className="font-bold">
                      {lead.full_name}
                    </p>
                    <p className="mt-1 break-all text-xs text-[#66715f]">
                      {lead.email}
                    </p>
                  </div>

                  <span className="rounded-full bg-[#eaf6d7] px-3 py-1.5 text-xs font-bold text-[#456621]">
                    {lead.status.replaceAll("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-[#20221f] p-6 text-white sm:p-7">
          <p className="text-xs font-bold tracking-[0.15em] text-brand-lime">
            PIPELINE OVERVIEW
          </p>

          <h2 className="mt-3 text-xl font-bold">
            Leads by status
          </h2>

          <div className="mt-7 space-y-4">
            {Object.entries(data.leads_by_status).length ? (
              Object.entries(data.leads_by_status).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between gap-3 border-b border-white/10 pb-3"
                  >
                    <span className="text-sm text-white/70">
                      {status.replaceAll("_", " ")}
                    </span>
                    <span className="font-bold text-brand-lime">
                      {count}
                    </span>
                  </div>
                ),
              )
            ) : (
              <p className="text-sm text-white/60">
                No lead activity recorded yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
