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

export interface RoleRecord {
  id: string;
  name: string;
  description?: string;
}

export interface UserRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string | null;
  isActive: boolean;
  createdAt?: string;
}

export async function listLeads(): Promise<LeadRecord[]> {
  const res = await internalClient.get<LeadRecord[]>("/crm/leads");
  return res.data || [];
}

export async function listRoles(): Promise<RoleRecord[]> {
  const res = await internalClient.get<RoleRecord[]>("/users/roles");
  return res.data || [];
}

export async function createRole(payload: { name: string; description?: string }): Promise<RoleRecord> {
  const res = await internalClient.post<RoleRecord>("/users/roles", payload);
  return res.data;
}

export async function listUsers(): Promise<UserRecord[]> {
  const res = await internalClient.get<UserRecord[]>("/users");
  return res.data || [];
}

export async function createUser(payload: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roleName: string;
}): Promise<UserRecord> {
  const res = await internalClient.post<UserRecord>("/users", payload);
  return res.data;
}
