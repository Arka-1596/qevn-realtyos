
import { apiRequest } from "./client";

export type StaffUser = {
  id: string;
  full_name: string;
  email: string;
  role: "ADMIN" | "AGENT";
  is_active: boolean;
};

export type AdminDashboardData = {
  total_properties: number;
  active_properties: number;
  total_leads: number;
  new_leads: number;
  leads_by_status: Record<string, number>;
  requested_visits: number;
  confirmed_visits: number;
  upcoming_follow_ups: number;
  recent_leads: Array<{
    id: string;
    full_name: string;
    status: string;
  }>;
};

export type StaffLead = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  property_id: string | null;
  status: string;
  assigned_agent_id: string | null;
  created_at: string;
};

export type StaffVisit = {
  id: string;
  property_id: string;
  status: string;
  preferred_start_at: string;
  assigned_agent_id?: string | null;
};

export function login(
  email: string,
  password: string,
): Promise<StaffUser> {
  return apiRequest<StaffUser>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getCurrentUser(): Promise<StaffUser> {
  return apiRequest<StaffUser>("/api/v1/auth/me");
}

export function getAdminDashboard(): Promise<AdminDashboardData> {
  return apiRequest<AdminDashboardData>(
    "/api/v1/admin/dashboard",
  );
}

export function getAdminLeads(): Promise<{
  items: StaffLead[];
  total: number;
  page: number;
  limit: number;
}> {
  return apiRequest("/api/v1/admin/leads?page=1&limit=5");
}

export function getAgentLeads(): Promise<StaffLead[]> {
  return apiRequest("/api/v1/agent/leads");
}

export function getAgentVisits(): Promise<StaffVisit[]> {
  return apiRequest("/api/v1/agent/visits");
}

export function getCsrfToken(): string {
  if (typeof document === "undefined") {
    throw new Error("CSRF token requires a browser session.");
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith("qevn_csrf="));

  if (!cookie) {
    throw new Error("CSRF cookie missing. Sign in again.");
  }

  return decodeURIComponent(cookie.slice("qevn_csrf=".length));
}

export function logout(): Promise<{ success: boolean }> {
  return apiRequest("/api/v1/auth/logout", {
    method: "POST",
    headers: {
      "X-CSRF-Token": getCsrfToken(),
    },
  });
}
