import { apiRequest } from "./client";

import type { Property } from "@/types/property";

export type PendingAIAction = {
  confirmation_ref: string;
  type: "create_lead" | "request_site_visit";
  summary: Record<string, unknown>;
  expires_in_seconds: number;
};

export type AIChatResponse = {
  conversation_id: string;
  message: string;
  property_matches: Property[];
  pending_action: PendingAIAction | null;
};

export type AIConfirmationResponse = {
  success: boolean;
  action: string;
  lead_id?: string;
  visit_id?: string;
  status: string;
};

export function chatWithAI(
  message: string,
  conversationId: string | null,
): Promise<AIChatResponse> {
  return apiRequest<AIChatResponse>("/api/v1/ai/chat", {
    method: "POST",
    body: JSON.stringify({
      message,
      conversation_id: conversationId,
    }),
  });
}

export function confirmAIAction(
  confirmationRef: string,
): Promise<AIConfirmationResponse> {
  return apiRequest<AIConfirmationResponse>(
    "/api/v1/ai/actions/confirm",
    {
      method: "POST",
      body: JSON.stringify({
        confirmation_ref: confirmationRef,
      }),
    },
  );
}