import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";

type Env = Record<string, string | undefined>;

const getEnv = (key: string) => (process.env as Env)[key];

const SUPABASE_URL = getEnv("SUPABASE_URL") || getEnv("EXPO_PUBLIC_SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");

const AIRTABLE_API_KEY = getEnv("AIRTABLE_API_KEY");
const AIRTABLE_BASE_ID = getEnv("AIRTABLE_BASE_ID");

const N8N_BASE_URL = getEnv("N8N_BASE_URL");
const N8N_WEBHOOK_TOKEN = getEnv("N8N_WEBHOOK_TOKEN");

if (!SUPABASE_URL) {
  console.warn("[brain] SUPABASE_URL not set");
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("[brain] SUPABASE_SERVICE_ROLE_KEY not set (server-only)");
}

const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

async function requireUser(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return { ok: false as const, status: 401, message: "Missing bearer token" };
  if (!supabaseAdmin) return { ok: false as const, status: 500, message: "Server auth not configured" };

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    return { ok: false as const, status: 401, message: "Invalid token" };
  }
  return { ok: true as const, user: data.user };
}

export const brainRoutes = new Hono();

// HEALTH
brainRoutes.get("/health", (c) => c.json({ ok: true }));

// AIRTABLE (server-side proxy: NO KEYS in the mobile app)
brainRoutes.post("/airtable/query", async (c) => {
  const auth = await requireUser(c.req.raw);
  if (!auth.ok) return c.json({ ok: false, error: auth.message }, auth.status);

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return c.json({ ok: false, error: "Airtable not configured on server" }, 500);
  }

  const body = await c.req.json().catch(() => ({}));
  const tableName = body.tableName as string | undefined;
  const query = (body.query ?? {}) as Record<string, any>;

  if (!tableName) return c.json({ ok: false, error: "Missing tableName" }, 400);

  const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`);
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    url.searchParams.set(k, String(v));
  });

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) return c.json({ ok: false, error: json?.error ?? res.statusText, details: json }, res.status);

  return c.json({ ok: true, data: json });
});

brainRoutes.post("/airtable/create", async (c) => {
  const auth = await requireUser(c.req.raw);
  if (!auth.ok) return c.json({ ok: false, error: auth.message }, auth.status);

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return c.json({ ok: false, error: "Airtable not configured on server" }, 500);
  }

  const body = await c.req.json().catch(() => ({}));
  const tableName = body.tableName as string | undefined;
  const fields = (body.fields ?? {}) as Record<string, any>;
  if (!tableName) return c.json({ ok: false, error: "Missing tableName" }, 400);

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) return c.json({ ok: false, error: json?.error ?? res.statusText, details: json }, res.status);

  return c.json({ ok: true, data: json });
});

// N8N (server-side proxy)
brainRoutes.post("/n8n/execute", async (c) => {
  const auth = await requireUser(c.req.raw);
  if (!auth.ok) return c.json({ ok: false, error: auth.message }, auth.status);

  if (!N8N_BASE_URL) {
    return c.json({ ok: false, error: "n8n not configured on server" }, 500);
  }

  const body = await c.req.json().catch(() => ({}));
  const workflowId = body.workflowId as string | undefined;
  const payload = (body.data ?? {}) as Record<string, any>;
  if (!workflowId) return c.json({ ok: false, error: "Missing workflowId" }, 400);

  const url = `${N8N_BASE_URL.replace(/\/$/, "")}/${workflowId}`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (N8N_WEBHOOK_TOKEN) headers.Authorization = `Bearer ${N8N_WEBHOOK_TOKEN}`;

  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return c.json({ ok: false, error: res.statusText, details: json }, res.status);

  return c.json({ ok: true, data: json });
});
