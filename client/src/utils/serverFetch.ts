import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function serverFetch(endpoint: string, options: RequestInit = {}) {
  let token: string | undefined;

  try {
    const cookieStore = cookies();
    token = cookieStore.get("accessToken")?.value;
  } catch (err) {
    // If called outside request context (e.g. build time static paths), cookies() will fail.
    console.warn("Could not retrieve cookies on the server context:", err);
  }

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Content-Type", "application/json");

  // Avoid SSL verification issues in development if needed
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    cache: "no-store", // Ensure dynamic SSR
  });

  if (!res.ok) {
    const errorText = await res.text();
    let message = "Something went wrong on the server";
    try {
      const errorJson = JSON.parse(errorText);
      message = errorJson.message || message;
    } catch {
      message = errorText || message;
    }
    throw new Error(message);
  }

  return res.json();
}
