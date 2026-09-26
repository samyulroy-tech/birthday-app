import {
  AdminConfig,
  Balloon,
  MediaItem,
  PublicConfig,
} from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

const TOKEN_KEY = "birthday_admin_token";

/* =========================================================
   TOKEN
========================================================= */

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
}

/* =========================================================
   HTTP REQUEST
========================================================= */

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = false
): Promise<T> {
  const headers = new Headers(options.headers);

  /*
   * JSON body ke liye Content-Type automatically set karo.
   * FormData ke liye Content-Type manually mat set karo.
   */
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  /* Admin authentication */
  if (auth) {
    const token = getToken();

    if (token) {
      headers.set(
        "Authorization",
        `Bearer ${token}`
      );
    }
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers,
    }
  );

  /* =======================================================
     ERROR
  ======================================================= */

  if (!response.ok) {
    let message =
      response.statusText ||
      "Request failed";

    try {
      const body = await response.json();

      if (
        body &&
        typeof body.detail === "string"
      ) {
        message = body.detail;
      }
    } catch {
      // Ignore invalid JSON error response
    }

    throw new Error(message);
  }

  /* =======================================================
     NO CONTENT
  ======================================================= */

  if (response.status === 204) {
    return undefined as T;
  }

  /* =======================================================
     JSON RESPONSE
  ======================================================= */

  return response.json() as Promise<T>;
}

/* =========================================================
   MEDIA URL
========================================================= */

export function resolveMediaUrl(
  url: string | null | undefined
): string {
  if (!url) {
    return "";
  }

  const value = url.trim();

  if (!value) {
    return "";
  }

  /*
   * Already absolute URL
   */
  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  /*
   * Relative backend URL
   *
   * Example:
   * /uploads/photos/image.jpg
   *
   * becomes:
   * http://localhost:8000/uploads/photos/image.jpg
   */
  if (value.startsWith("/")) {
    return `${API_URL}${value}`;
  }

  return `${API_URL}/${value}`;
}

/* =========================================================
   PUBLIC API
========================================================= */

export const publicApi = {
  /*
   * Public birthday configuration
   *
   * Backend response contains:
   *
   * recipient_name: "Priya"
   * birthday_date: "2026-09-26"
   * music_url: "https://youtu.be/..."
   */
  getConfig: () =>
    request<PublicConfig>(
      "/api/config"
    ),

  /*
   * Unlock password verification
   */
  verifyPassword: (
    password: string
  ) =>
    request<{ valid: boolean }>(
      "/api/verify-password",
      {
        method: "POST",
        body: JSON.stringify({
          password,
        }),
      }
    ),
};

/* =========================================================
   ADMIN API
========================================================= */

export const adminApi = {
  /* -------------------------------------------------------
     AUTH
  ------------------------------------------------------- */

  login: (
    username: string,
    password: string
  ) =>
    request<{ access_token: string }>(
      "/api/admin/login",
      {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
        }),
      }
    ),

  me: () =>
    request(
      "/api/admin/me",
      {},
      true
    ),

  /* -------------------------------------------------------
     CONFIG
  ------------------------------------------------------- */

  getConfig: () =>
    request<AdminConfig>(
      "/api/admin/config",
      {},
      true
    ),

  updateConfig: (
    payload: Partial<AdminConfig> & {
      unlock_password?: string;
    }
  ) =>
    request<AdminConfig>(
      "/api/admin/config",
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      true
    ),

  /* -------------------------------------------------------
     MEDIA
  ------------------------------------------------------- */

  listMedia: () =>
    request<MediaItem[]>(
      "/api/admin/media",
      {},
      true
    ),

  createMedia: (
    payload: Partial<MediaItem>
  ) =>
    request<MediaItem>(
      "/api/admin/media",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      true
    ),

  updateMedia: (
    id: string,
    payload: Partial<MediaItem>
  ) =>
    request<MediaItem>(
      `/api/admin/media/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      true
    ),

  deleteMedia: (
    id: string
  ) =>
    request<{ ok: boolean; deleted_id: string }>(
      `/api/admin/media/${id}`,
      {
        method: "DELETE",
      },
      true
    ),

  reorderMedia: (
    ids: string[]
  ) =>
    request<{ ok: boolean }>(
      "/api/admin/media/reorder",
      {
        method: "POST",
        body: JSON.stringify({
          ordered_ids: ids,
        }),
      },
      true
    ),

  /* -------------------------------------------------------
     BALLOONS
  ------------------------------------------------------- */

  listBalloons: () =>
    request<Balloon[]>(
      "/api/admin/balloons",
      {},
      true
    ),

  createBalloon: (
    payload: Partial<Balloon>
  ) =>
    request<Balloon>(
      "/api/admin/balloons",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      true
    ),

  updateBalloon: (
    id: string,
    payload: Partial<Balloon>
  ) =>
    request<Balloon>(
      `/api/admin/balloons/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      true
    ),

  deleteBalloon: (
    id: string
  ) =>
    request<{ ok: boolean }>(
      `/api/admin/balloons/${id}`,
      {
        method: "DELETE",
      },
      true
    ),

  /* -------------------------------------------------------
     UPLOAD
  ------------------------------------------------------- */

  upload: async (
    file: File
  ): Promise<{
    url: string;
    thumbnail_url?: string;
    media_type: "photo" | "video";
  }> => {
    const form = new FormData();

    form.append("file", file);

    const token = getToken();

    const headers: HeadersInit = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    /*
     * IMPORTANT:
     * FormData ke saath Content-Type manually set mat karo.
     * Browser khud multipart boundary set karega.
     */
    const response = await fetch(
      `${API_URL}/api/admin/upload`,
      {
        method: "POST",
        body: form,
        headers,
      }
    );

    if (!response.ok) {
      let message = "Upload failed";

      try {
        const body = await response.json();

        if (
          body &&
          typeof body.detail === "string"
        ) {
          message = body.detail;
        }
      } catch {
        // Ignore invalid JSON
      }

      throw new Error(message);
    }

    return response.json();
  },
};