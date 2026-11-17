import { apiRequest } from "./client";

import type {
  Property,
  PropertyFilters,
  PropertyListResponse,
} from "@/types/property";

export function buildPropertyQuery(
  filters: PropertyFilters = {},
): string {
  const params = new URLSearchParams();

  const keys = [
    "keyword",
    "city",
    "min_price",
    "max_price",
    "property_type",
    "listing_type",
    "bhk",
    "sort",
  ] as const;

  for (const key of keys) {
    const value = filters[key];

    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }

  params.set("page", String(filters.page ?? 1));
  params.set("limit", String(filters.limit ?? 12));

  return params.toString();
}

export function getProperties(
  filters: PropertyFilters = {},
  signal?: AbortSignal,
): Promise<PropertyListResponse> {
  const query = buildPropertyQuery(filters);

  return apiRequest<PropertyListResponse>(
    `/api/v1/properties?${query}`,
    { signal },
  );
}

export function getPropertyBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<Property> {
  return apiRequest<Property>(
    `/api/v1/properties/${encodeURIComponent(slug)}`,
    { signal },
  );
}

export function createEnquiry(
  payload: {
    full_name: string;
    email: string;
    phone: string;
    property_id: string;
    message: string;
  },
): Promise<{
  id: string;
  status: string;
  success: boolean;
}> {
  return apiRequest("/api/v1/leads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createVisitRequest(
  payload: {
    property_id: string;
    full_name: string;
    email: string;
    phone: string;
    preferred_start_at: string;
    customer_notes: string;
  },
): Promise<{
  id: string;
  property_id: string;
  status: string;
  preferred_start_at: string;
}> {
  return apiRequest("/api/v1/site-visits", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}