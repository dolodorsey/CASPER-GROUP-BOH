/**
 * API Client for Kollective Brain (n8n Workflows + Airtable)
 * 
 * Centralizes all backend API calls to n8n workflows and Airtable.
 * Replace hardcoded URLs with environment variables for production readiness.
 */

import { brainClient } from "@/lib/brainClient";

// 🔒 SECURITY FIX:
// API KEYS MUST NEVER LIVE IN THE MOBILE APP.
// All Airtable + n8n calls are routed through the backend proxy (/api/brain/*).
// This file remains as a compatibility layer so existing imports don't break.

/**
 * n8n Client - Interface to your workflow automations
 */
export const n8nClient = {
  baseURL: "server-proxy",
  
  /**
   * Execute a webhook workflow
   * @param workflowId - The n8n workflow webhook ID or path
   * @param data - Payload to send to the workflow
   */
  async executeWorkflow(workflowId: string, data: Record<string, any>) {
    return brainClient.n8nExecute(workflowId, data);
  }
};

/**
 * Airtable Client - Interface to your Airtable base
 */
export const airtableClient = {
  baseId: "server-proxy",
  apiKey: "server-proxy",

  /**
   * Generic method to query Airtable
   * @param tableName - The name of your Airtable table
   * @param options - Query options (filter, sort, etc.)
   */
  async query(tableName: string, options?: Record<string, any>) {
    return brainClient.airtableQuery(tableName, options);
  },

  /**
   * Create a record in Airtable
   * @param tableName - The name of your Airtable table
   * @param fields - The fields to create
   */
  async create(tableName: string, fields: Record<string, any>) {
    return brainClient.airtableCreate(tableName, fields);
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
