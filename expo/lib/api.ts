/**
 * API Client for Kollective Brain (n8n Workflows + Airtable)
 * 
 * Centralizes all backend API calls to n8n workflows and Airtable.
 * Replace hardcoded URLs with environment variables for production readiness.
 */

const N8N_BASE_URL = process.env.EXPO_PUBLIC_N8N_BASE_URL;

// Warn if n8n is not configured
if (!N8N_BASE_URL) {
  console.warn('[API] N8N_BASE_URL not set. n8n workflows will not be available.');
}

/**
 * n8n Client - Interface to your workflow automations
 */
export const n8nClient = {
  baseURL: N8N_BASE_URL,
  
  /**
   * Execute a webhook workflow
   * @param workflowId - The n8n workflow webhook ID or path
   * @param data - Payload to send to the workflow
   */
  async executeWorkflow(workflowId: string, data: Record<string, any>) {
    if (!N8N_BASE_URL) {
      throw new Error('n8n not configured. Set EXPO_PUBLIC_N8N_BASE_URL in your .env');
    }

    const url = `${N8N_BASE_URL}/${workflowId}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`n8n workflow failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[n8n] Workflow execution failed:', error);
      throw error;
    }
  },
};

/**
 * Airtable Client - Interface to your Airtable base
 */
export const airtableClient = {
  baseId: undefined,
  apiKey: undefined,

  /**
   * Generic method to query Airtable
   * @param tableName - The name of your Airtable table
   * @param options - Query options (filter, sort, etc.)
   */
  async query(tableName: string, options?: Record<string, any>) {
    void tableName;
    void options;
    throw new Error('Direct Airtable access is disabled. Use an authenticated server-side function.');
  },

  /**
   * Create a record in Airtable
   * @param tableName - The name of your Airtable table
   * @param fields - The fields to create
   */
  async create(tableName: string, fields: Record<string, any>) {
    void tableName;
    void fields;
    throw new Error('Direct Airtable access is disabled. Use an authenticated server-side function.');
  },
};

/**
 * Example: Add your specific workflows here
 * 
 * export const workflows = {
 *   async processLead(leadData: any) {
 *     return n8nClient.executeWorkflow('webhook/process-lead', leadData);
 *   },
 *   
 *   async syncToAirtable(data: any) {
 *     return airtableClient.create('Leads', data);
 *   },
 * };
 */
