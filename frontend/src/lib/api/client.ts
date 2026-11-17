export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getErrorMessage(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  if ("detail" in payload) {
    const detail = payload.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item: unknown) => {
          if (
            typeof item === "object" &&
            item !== null &&
            "msg" in item &&
            typeof item.msg === "string"
          ) {
            return item.msg;
          }

          return "Invalid request field";
        })
        .join("; ");
    }
  }

  if (
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }

  return null;
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
      "API base URL is missing. Configure NEXT_PUBLIC_API_BASE_URL.",
    );
  }

  const headers = new Headers(init.headers);

  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
      credentials: "include",
      cache: init.cache ?? "no-store",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    throw new ApiError(
      0,
      "Unable to reach the backend. Check that FastAPI is running and CORS is configured.",
    );
  }

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;

    try {
      const payload: unknown = await response.json();
      message = getErrorMessage(payload) ?? message;
    } catch {
      // Preserve generic error for non-JSON responses.
    }

    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}