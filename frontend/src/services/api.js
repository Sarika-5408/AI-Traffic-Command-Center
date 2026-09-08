/**
 * services/api.js
 *
 * Centralized fetch wrapper. All other services build on this so API base
 * URL, error handling and JSON parsing live in exactly one place.
 */

const BASE_URL = "/api";

async function request(path, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    // Network error, backend down, etc. Callers decide the fallback.
    console.error(`[api] ${path} failed:`, error.message);
    throw error;
  }
}

export const api = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
};
