import { Hono } from "hono";
import { cors } from "hono/cors";
import { createClient } from "@supabase/supabase-js";

const brain = new Hono();

brain.use("*", cors());

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://qhgmukwoennurwuvmbhy.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "";
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "";
const N8N_BASE_URL = process.env.N8N_BASE_URL || "";
const N8N_WEBHOOK_TOKEN = process.env.N8N_WEBHOOK_TOKEN || "";

async function validateAccessToken(authHeader: string | undefined): Promise<{ valid: boolean; userId?: string }> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("[Brain] Missing or invalid Authorization header");
    return { valid: false };
  }

  const token = authHeader.replace("Bearer ", "");
  
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("[Brain] SUPABASE_SERVICE_ROLE_KEY not set, skipping validation");
    return { valid: true };
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      console.log("[Brain] Token validation failed:", error?.message);
      return { valid: false };
    }

    console.log("[Brain] Token validated for user:", data.user.id);
    return { valid: true, userId: data.user.id };
  } catch (err) {
    console.error("[Brain] Token validation error:", err);
    return { valid: false };
  }
}

brain.get("/health", (c) => {
  return c.json({ 
    status: "ok", 
    service: "brain",
    timestamp: new Date().toISOString(),
  });
});

function jsonError(c: any, error: string, status: 400 | 401 | 403 | 404 | 500 | 502) {
  return c.json({ error }, status);
}

brain.post("/airtable/query", async (c) => {
  const auth = await validateAccessToken(c.req.header("Authorization"));
  if (!auth.valid) {
    return jsonError(c, "Unauthorized", 401);
  }

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error("[Brain] Airtable credentials not configured");
    return jsonError(c, "Airtable not configured", 500);
  }

  try {
    const body = await c.req.json();
    const { table, filterByFormula, maxRecords, view } = body;

    if (!table) {
      return jsonError(c, "Table name required", 400);
    }

    const params = new URLSearchParams();
    if (filterByFormula) params.append("filterByFormula", filterByFormula);
    if (maxRecords) params.append("maxRecords", String(maxRecords));
    if (view) params.append("view", view);

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}?${params}`;
    console.log("[Brain] Airtable query:", table);

    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Brain] Airtable error:", errorText);
      return jsonError(c, "Airtable request failed", 502);
    }

    const data = await response.json();
    return c.json(data);
  } catch (err) {
    console.error("[Brain] Airtable query error:", err);
    return jsonError(c, "Internal server error", 500);
  }
});

brain.post("/airtable/create", async (c) => {
  const auth = await validateAccessToken(c.req.header("Authorization"));
  if (!auth.valid) {
    return jsonError(c, "Unauthorized", 401);
  }

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error("[Brain] Airtable credentials not configured");
    return jsonError(c, "Airtable not configured", 500);
  }

  try {
    const body = await c.req.json();
    const { table, records } = body;

    if (!table || !records) {
      return jsonError(c, "Table name and records required", 400);
    }

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}`;
    console.log("[Brain] Airtable create:", table, "records:", records.length);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Brain] Airtable create error:", errorText);
      return jsonError(c, "Airtable request failed", 502);
    }

    const data = await response.json();
    return c.json(data);
  } catch (err) {
    console.error("[Brain] Airtable create error:", err);
    return jsonError(c, "Internal server error", 500);
  }
});

brain.post("/n8n/execute", async (c) => {
  const auth = await validateAccessToken(c.req.header("Authorization"));
  if (!auth.valid) {
    return jsonError(c, "Unauthorized", 401);
  }

  if (!N8N_BASE_URL) {
    console.error("[Brain] n8n not configured");
    return jsonError(c, "n8n not configured", 500);
  }

  try {
    const body = await c.req.json();
    const { webhookPath, payload } = body;

    if (!webhookPath) {
      return jsonError(c, "Webhook path required", 400);
    }

    const url = `${N8N_BASE_URL}${webhookPath}`;
    console.log("[Brain] n8n execute:", webhookPath);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (N8N_WEBHOOK_TOKEN) {
      headers["Authorization"] = `Bearer ${N8N_WEBHOOK_TOKEN}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload || {}),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Brain] n8n error:", errorText);
      return jsonError(c, "n8n request failed", 502);
    }

    const data = await response.json();
    return c.json(data);
  } catch (err) {
    console.error("[Brain] n8n execute error:", err);
    return jsonError(c, "Internal server error", 500);
  }
});

export default brain;
