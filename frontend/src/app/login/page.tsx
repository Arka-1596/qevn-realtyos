
"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowLeft, LockKeyhole, LoaderCircle } from "lucide-react";

import { login } from "@/lib/api/auth";
import { Brand } from "@/components/layout/brand";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const user = await login(email.trim(), password);

      router.replace(user.role === "ADMIN" ? "/admin" : "/agent");
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to sign in.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      id="main-content"
      className="grid min-h-dvh bg-brand-cream lg:grid-cols-2"
    >
      <section className="flex flex-col px-5 py-7 sm:px-12 lg:px-16">
        <Brand />

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-14">
          <p className="text-xs font-bold tracking-[0.16em] text-[#638d29]">
            REALTYOS / STAFF ACCESS
          </p>

          <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.06em] sm:text-5xl">
            Welcome back.
          </h1>

          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Sign in with your assigned Admin or Agent account
            to access the RealtyOS workspace.
          </p>

          <form
            onSubmit={handleLogin}
            className="mt-9 space-y-5"
          >
            <div>
              <label
                htmlFor="staff-email"
                className="mb-2 block text-sm font-bold"
              >
                Email address
              </label>

              <input
                id="staff-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@company.com"
                className="min-h-12 w-full rounded-xl border border-[#cfd7c6] bg-white px-4 text-base sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="staff-password"
                className="mb-2 block text-sm font-bold"
              >
                Password
              </label>

              <input
                id="staff-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-h-12 w-full rounded-xl border border-[#cfd7c6] bg-white px-4 text-base sm:text-sm"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 p-3 text-sm text-red-800"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-ink px-5 font-bold text-white hover:bg-[#343a30] disabled:opacity-60"
            >
              {loading && (
                <LoaderCircle
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              {loading ? "Signing in..." : "Sign in to RealtyOS"}
            </button>
          </form>

          <Link
            href="/"
            className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#596254]"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Return to marketplace
          </Link>
        </div>
      </section>

      <aside className="hidden flex-col justify-between bg-[#20221f] p-14 text-white lg:flex">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-lime text-brand-ink">
          <LockKeyhole size={27} />
        </div>

        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-brand-lime">
            ONE CONNECTED OPERATING SYSTEM
          </p>
          <h2 className="mt-5 max-w-lg text-5xl font-bold leading-[1.08] tracking-[-0.06em]">
            Every property.
            Every lead.
            One place.
          </h2>
          <p className="mt-6 max-w-md leading-7 text-white/60">
            A secure workspace for real estate teams,
            lead qualification, property operations and
            appointment management.
          </p>
        </div>

        <span className="text-xs tracking-widest text-white/40">
          QEVN / REALTYOS
        </span>
      </aside>
    </main>
  );
}
