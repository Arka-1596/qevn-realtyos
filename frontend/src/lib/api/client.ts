/**
 * QEVN RealtyOS API Client
 *
 * Stage 1: Integration foundation only.
 *
 * Future frontend components should import apiRequest
 * rather than implementing individual hardcoded fetch URLs.
 *
 * Authentication and authorization must be implemented
 * before accessing protected CRM endpoints.
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  path: `/${string}`,
  init: RequestInit = {},
): Promise<T> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(
      /\/+$/,
      "",
    );

  if (!baseUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not configured. No backend request was sent.",
    );
  }

  const headers = new Headers(init.headers);

  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  const response = await fetch(
    `${baseUrl}${path}`,
    {
      ...init,
      headers,
      credentials: "include",
      cache: init.cache ?? "no-store",
    },
  );

  if (!response.ok) {
    let message =
      `Request failed (${response.status}).`;

    try {
      const payload: unknown =
        await response.json();

      if (
        typeof payload === "object" &&
        payload !== null &&
        "message" in payload &&
        typeof payload.message === "string"
      ) {
        message = payload.message;
      }
    } catch {
      // Keep the generic error message if
      // the backend returns a non-JSON response.
    }

    throw new ApiError(
      response.status,
      message,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}