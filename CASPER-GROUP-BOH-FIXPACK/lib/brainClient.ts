/**
 * Casper Brain Client (SECURE)
 *
 * ✅ Mobile app never holds Airtable/n8n API keys.
 * ✅ All sensitive calls go through the backend proxy: /api/brain/*
 * ✅ Backend validates Supabase access tokens before forwarding.
 */

import { supabase } from "@/lib/supabase";

const getApiBase = () => {
  const url = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  if (!url) {
    throw new Error("Missing EXPO_PUBLIC_RORK_API_BASE_URL");
  }
  return url;
};

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
}

export const brainClient = {
  async airtableQuery(tableName: string, query?: Record<string, any>) {
    const base = getApiBase();
    const headers = { ...(await authHeader()), "Content-Type": "application/json" };
    const res = await fetch(`${base}/api/brain/airtable/query`, {
      method: "POST",
      headers,
      body: JSON.stringify({ tableName, query: query ?? {} }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.ok) throw new Error(json?.error ?? res.statusText);
    return json.data;
  },

  async airtableCreate(tableName: string, fields: Record<string, any>) {
    const base = getApiBase();
    const headers = { ...(await authHeader()), "Content-Type": "application/json" };
    const res = await fetch(`${base}/api/brain/airtable/create`, {
      method: "POST",
      headers,
      body: JSON.stringify({ tableName, fields }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.ok) throw new Error(json?.error ?? res.statusText);
    return json.data;
  },

  async n8nExecute(workflowId: string, data: Record<string, any>) {
    const base = getApiBase();
    const headers = { ...(await authHeader()), "Content-Type": "application/json" };
    const res = await fetch(`${base}/api/brain/n8n/execute`, {
      method: "POST",
      headers,
      body: JSON.stringify({ workflowId, data }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.ok) throw new Error(json?.error ?? res.statusText);
    return json.data;
  },
};
