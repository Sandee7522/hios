"use client"

import { getAuthToken, getUserRole } from "./auth";

/**
 * Lightweight wrapper around fetch for authenticated, role-aware API calls.
 *
 * - Automatically attaches the JWT access token from cookies.
 * - Optionally enforces that only specific roles can call a given endpoint.
 * - Normalizes common error handling so calling code stays clean and reusable.
 */
export async function requestWithAuth(url, options = {}) {
  const {
    method = "GET",
    body,
    allowedRoles, // e.g. ['admin'] or ['admin', 'instructor']
  } = options;

  const token = getAuthToken();
  const role = getUserRole();

  // 1) Basic auth check – no token means not logged in
  if (!token) {
    throw new Error("You are not authenticated. Please log in first.");
  }

  // 2) Optional role-based guard for permission-safe access
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role)) {
      throw new Error("You do not have permission to perform this action.");
    }
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Try to parse JSON but don't crash if body is empty
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

