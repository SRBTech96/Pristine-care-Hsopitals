import { internalClient } from "./internal-api";

export interface LeadRecord {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  source?: string;
  status: string;
  interestedIn?: string;
  notes?: string;
  createdAt: string;
}

export async function listLeads(): Promise<LeadRecord[]> {
  const res = await internalClient.get<LeadRecord[]>("/crm/leads");
  return res.data || [];
}
