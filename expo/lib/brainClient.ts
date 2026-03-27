import { supabase } from "./supabase";

const API_BASE_URL = process.env.EXPO_PUBLIC_RORK_API_BASE_URL || "";

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  
  if (!token) {
    console.warn("[BrainClient] No access token available");
    return {};
  }
  
  return { Authorization: `Bearer ${token}` };
}

async function brainFetch<T>(endpoint: string, body: object): Promise<T> {
  const authHeader = await getAuthHeader();
  
  const response = await fetch(`${API_BASE_URL}/api/brain${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export interface AirtableRecord<T = Record<string, unknown>> {
  id: string;
  createdTime: string;
  fields: T;
}

export interface AirtableQueryResult<T = Record<string, unknown>> {
  records: AirtableRecord<T>[];
  offset?: string;
}

export interface AirtableQueryOptions {
  table: string;
  filterByFormula?: string;
  maxRecords?: number;
  view?: string;
}

export async function queryAirtable<T = Record<string, unknown>>(
  options: AirtableQueryOptions
): Promise<AirtableQueryResult<T>> {
  console.log("[BrainClient] Querying Airtable:", options.table);
  return brainFetch<AirtableQueryResult<T>>("/airtable/query", options);
}

export interface AirtableCreateOptions<T = Record<string, unknown>> {
  table: string;
  records: { fields: T }[];
}

export async function createAirtableRecords<T = Record<string, unknown>>(
  options: AirtableCreateOptions<T>
): Promise<AirtableQueryResult<T>> {
  console.log("[BrainClient] Creating Airtable records:", options.table);
  return brainFetch<AirtableQueryResult<T>>("/airtable/create", options);
}

export interface N8nExecuteOptions {
  webhookPath: string;
  payload?: Record<string, unknown>;
}

export async function executeN8nWorkflow<T = unknown>(
  options: N8nExecuteOptions
): Promise<T> {
  console.log("[BrainClient] Executing n8n workflow:", options.webhookPath);
  return brainFetch<T>("/n8n/execute", options);
}

export async function checkBrainHealth(): Promise<{ status: string; service: string; timestamp: string }> {
  const response = await fetch(`${API_BASE_URL}/api/brain/health`);
  if (!response.ok) {
    throw new Error("Brain health check failed");
  }
  return response.json();
}

export async function n8nExecute<T = unknown>(
  webhookPath: string,
  payload?: Record<string, unknown>
): Promise<T> {
  return executeN8nWorkflow<T>({ webhookPath, payload });
}

export async function airtableQuery<T = Record<string, unknown>>(
  table: string,
  options?: Record<string, unknown>
): Promise<AirtableQueryResult<T>> {
  return queryAirtable<T>({
    table,
    filterByFormula: options?.filterByFormula as string | undefined,
    maxRecords: options?.maxRecords as number | undefined,
    view: options?.view as string | undefined,
  });
}

export async function airtableCreate<T = Record<string, unknown>>(
  table: string,
  fields: T
): Promise<AirtableQueryResult<T>> {
  return createAirtableRecords<T>({
    table,
    records: [{ fields }],
  });
}

export const brainClient = {
  queryAirtable,
  createAirtableRecords,
  executeN8nWorkflow,
  checkBrainHealth,
  n8nExecute,
  airtableQuery,
  airtableCreate,
};

export default brainClient;
