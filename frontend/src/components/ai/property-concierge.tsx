"use client";

import { useRef, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ArrowUpRight,
  Bot,
  LoaderCircle,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  chatWithAI,
  confirmAIAction,
} from "@/lib/api/assistant";

import type {
  PendingAIAction,
} from "@/lib/api/assistant";

import {
  formatPrice,
  isDemoProperty,
} from "@/lib/property-format";

import type { Property } from "@/types/property";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  matches?: Property[];
  pending?: PendingAIAction | null;
};

const suggestions = [
  "Find 3BHK apartments in Kolkata.",
  "Show properties under ₹85 lakh.",
  "What properties are available in New Town?",
];

export function PropertyConcierge() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [conversationId, setConversationId] =
    useState<string | null>(null);

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [pending, setPending] =
    useState<PendingAIAction | null>(null);

  const sequence = useRef(0);

  function nextId(): number {
    sequence.current += 1;
    return sequence.current;
  }

  const hidden =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/agent" ||
    pathname.startsWith("/agent/");

  if (hidden) {
    return null;
  }

  async function sendMessage(message: string) {
    const clean = message.trim();

    if (!clean || busy || confirming) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: nextId(),
        role: "user",
        content: clean,
      },
    ]);

    setInput("");
    setBusy(true);

    try {
      const response = await chatWithAI(
        clean,
        conversationId,
      );

      setConversationId(response.conversation_id);

      setMessages((current) => [
        ...current,
        {
          id: nextId(),
          role: "assistant",
          content: response.message,
          matches: response.property_matches,
          pending: response.pending_action,
        },
      ]);

      setPending(response.pending_action);
    } catch (reason) {
      const text =
        reason instanceof Error
          ? reason.message
          : "The AI service is unavailable.";

      setMessages((current) => [
        ...current,
        {
          id: nextId(),
          role: "assistant",
          content:
            `${text} You can still browse properties and use the manual enquiry forms.`,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  async function confirmAction() {
    if (!pending || confirming) {
      return;
    }

    setConfirming(true);

    try {
      const result = await confirmAIAction(
        pending.confirmation_ref,
      );

      if (!result.success) {
        throw new Error(
          "The backend did not confirm the action.",
        );
      }

      setMessages((current) => [
        ...current,
        {
          id: nextId(),
          role: "assistant",
          content:
            `Action submitted successfully. Status: ${result.status}. ` +
            `Reference: ${result.lead_id ?? result.visit_id ?? "available in CRM"}. ` +
            (result.action === "request_site_visit"
              ? "The visit request is not yet a confirmed appointment."
              : ""),
        },
      ]);

      setPending(null);
    } catch (reason) {
      setMessages((current) => [
        ...current,
        {
          id: nextId(),
          role: "assistant",
          content:
            reason instanceof Error
              ? reason.message
              : "Unable to confirm the action.",
        },
      ]);
    } finally {
      setConfirming(false);
    }
  }

  function resetConversation() {
    if (busy || confirming) {
      return;
    }

    setMessages([]);
    setConversationId(null);
    setPending(null);
    setInput("");
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 inline-flex min-h-14 items-center gap-3 rounded-full bg-[#20221f] px-5 text-sm font-bold text-white shadow-xl hover:bg-[#343e31] sm:right-7"
        aria-label="Open AI Property Concierge"
      >
        <Sparkles className="size-5 text-brand-lime" />
        Ask RealtyOS
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex h-dvh w-full flex-col gap-0 border-l border-[#dce2d6] bg-brand-cream p-0 text-brand-ink sm:max-w-[460px]"
      >
        <SheetHeader className="border-b border-[#dce2d6] bg-white px-5 py-5 text-left">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-lime">
              <Bot className="size-5" />
            </span>

            Property Concierge
          </SheetTitle>

          <SheetDescription className="text-sm">
            AI assistance connected to RealtyOS.
            Recommendations use backend property records.
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          <div
            role="log"
            aria-label="AI conversation"
            aria-live="polite"
            className="flex-1 space-y-4 overflow-y-auto p-5"
          >
            <div className="rounded-xl border border-[#dce2d6] bg-white p-4">
              <p className="font-bold">
                Welcome to RealtyOS.
              </p>

              <p className="mt-2 text-sm leading-6 text-[#626b60]">
                Ask about available listings, budgets,
                locations and property details.
              </p>
            </div>

            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#66715f]">
                  SUGGESTED QUESTIONS
                </p>

                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => sendMessage(suggestion)}
                    disabled={busy}
                    className="block min-h-11 w-full rounded-xl border border-[#dce2d6] bg-white px-4 py-3 text-left text-sm hover:bg-[#edf3e5] disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-xl p-4 text-sm leading-7 ${
                  message.role === "user"
                    ? "ml-8 bg-[#20221f] text-white"
                    : "mr-3 border border-[#dce2d6] bg-white"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">
                  {message.content}
                </p>

                {message.matches &&
                  message.matches.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {message.matches.map((property) => (
                        <Link
                          key={property.id}
                          href={`/properties/${encodeURIComponent(property.slug)}`}
                          onClick={() => setOpen(false)}
                          className="block rounded-lg border border-[#dce2d6] bg-[#f8faf4] p-3 text-[#131313] hover:border-[#a6ba91]"
                        >
                          <p className="font-bold">
                            {property.title}
                          </p>

                          <p className="mt-1 text-xs text-[#596254]">
                            {property.locality}, {property.city}
                          </p>

                          <p className="mt-2 flex items-center justify-between font-bold">
                            {formatPrice(
                              property.price,
                              property.currency,
                            )}

                            <ArrowUpRight className="size-4" />
                          </p>

                          {isDemoProperty(property) && (
                            <p className="mt-2 text-[10px] font-bold text-[#638d29]">
                              FICTIONAL DEMONSTRATION LISTING
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}

                {message.pending &&
                  pending?.confirmation_ref ===
                    message.pending.confirmation_ref && (
                    <div className="mt-4 rounded-lg border border-[#dce2d6] bg-[#f3f6ed] p-3">
                      <p className="font-bold">
                        Action awaiting your approval
                      </p>

                      <p className="mt-2 text-xs text-[#596254]">
                        {message.pending.type === "create_lead"
                          ? "Create an enquiry"
                          : "Request a site visit"}
                      </p>

                      <div className="mt-3 space-y-1 break-words text-xs">
                        {Object.entries(
                          message.pending.summary,
                        ).map(([key, value]) => (
                          <p key={key}>
                            <strong>
                              {key.replaceAll("_", " ")}:
                            </strong>{" "}
                            {String(value ?? "—")}
                          </p>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={confirmAction}
                        disabled={confirming}
                        className="mt-4 min-h-11 w-full rounded-lg bg-brand-lime px-3 text-sm font-bold text-brand-ink disabled:opacity-50"
                      >
                        {confirming
                          ? "Confirming…"
                          : "Confirm and submit"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setPending(null)}
                        disabled={confirming}
                        className="mt-2 min-h-11 w-full rounded-lg border border-[#dce2d6] px-3 text-sm font-bold"
                      >
                        Cancel action
                      </button>
                    </div>
                  )}
              </div>
            ))}

            {busy && (
              <p
                role="status"
                className="flex items-center gap-2 text-sm text-[#596254]"
              >
                <LoaderCircle className="size-4 animate-spin" />
                RealtyOS is responding…
              </p>
            )}
          </div>

          <div className="border-t border-[#dce2d6] bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <Link
                href="/properties"
                onClick={() => setOpen(false)}
                className="text-xs font-bold text-[#527b2b] underline"
              >
                Browse properties
              </Link>

              <button
                type="button"
                onClick={resetConversation}
                disabled={busy || confirming}
                className="inline-flex min-h-10 items-center gap-2 text-xs font-bold text-[#596254]"
              >
                <RotateCcw className="size-4" />
                Reset chat
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage(input);
              }}
              className="flex gap-2"
            >
              <label
                htmlFor="ai-chat-input"
                className="sr-only"
              >
                Message the AI Property Concierge
              </label>

              <input
                id="ai-chat-input"
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                maxLength={1500}
                placeholder="Ask about a property..."
                disabled={busy || confirming}
                className="min-h-12 min-w-0 flex-1 rounded-xl border border-[#cfd7c6] px-3 text-base sm:text-sm"
              />

              <button
                type="submit"
                disabled={
                  busy || confirming || !input.trim()
                }
                aria-label="Send message"
                className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-lime disabled:opacity-50"
              >
                <Send className="size-5" />
              </button>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}