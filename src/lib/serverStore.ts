import fs from 'fs';
import path from 'path';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export interface AccessRequest {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  paymentMethod: 'bank-islami' | 'easypaisa' | 'paypal';
  transactionId: string;
  receiptSent: boolean;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
  expiresAt?: string;
  accessDurationDays?: number;
}

interface AccessRequestRow {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  payment_method: string;
  transaction_id: string;
  receipt_sent: boolean;
  status: string;
  submitted_at: string;
  approved_at: string | null;
  expires_at: string | null;
  access_duration_days: number | null;
}

function rowToRequest(row: AccessRequestRow): AccessRequest {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email ?? '',
    paymentMethod: row.payment_method as AccessRequest['paymentMethod'],
    transactionId: row.transaction_id,
    receiptSent: row.receipt_sent ?? false,
    status: row.status as AccessRequest['status'],
    submittedAt: row.submitted_at,
    approvedAt: row.approved_at ?? undefined,
    expiresAt: row.expires_at ?? undefined,
    accessDurationDays: row.access_duration_days ?? undefined,
  };
}

function requestToRow(req: AccessRequest): Record<string, unknown> {
  return {
    id: req.id,
    full_name: req.fullName,
    phone: req.phone,
    email: req.email,
    payment_method: req.paymentMethod,
    transaction_id: req.transactionId,
    receipt_sent: req.receiptSent,
    status: req.status,
    submitted_at: req.submittedAt,
    approved_at: req.approvedAt ?? null,
    expires_at: req.expiresAt ?? null,
    access_duration_days: req.accessDurationDays ?? null,
  };
}

let memoryStore: AccessRequest[] = [];

try {
  const DATA_DIR = path.join(process.cwd(), 'data');
  const DATA_FILE = path.join(DATA_DIR, 'accessRequests.json');
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) memoryStore = parsed;
  }
} catch {
  // Vercel read-only filesystem — use empty array
}

function readStore(): AccessRequest[] { return memoryStore; }

function writeStore(requests: AccessRequest[]): void {
  memoryStore = requests;
  try {
    const DATA_DIR = path.join(process.cwd(), 'data');
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(path.join(DATA_DIR, 'accessRequests.json'), JSON.stringify(requests, null, 2), 'utf-8');
  } catch {
    // Vercel: silently ignore filesystem errors
  }
}

export async function getAllRequests(): Promise<AccessRequest[]> {
  if (isSupabaseConfigured()) {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client.from('access_requests').select('*').order('submitted_at', { ascending: false });
        if (!error && data) return (data as AccessRequestRow[]).map(rowToRequest);
      } catch (err) { /* fallback */ }
    }
  }
  const requests = readStore();
  requests.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  return requests;
}

export async function saveRequest(req: AccessRequest): Promise<void> {
  if (isSupabaseConfigured()) {
    const client = getSupabase();
    if (client) {
      try {
        const { error } = await client.from('access_requests').insert(requestToRow(req));
        if (!error) return;
      } catch (err) { /* fallback */ }
    }
  }
  const requests = readStore();
  requests.push(req);
  writeStore(requests);
}

export async function updateRequest(id: string, updates: Partial<AccessRequest>): Promise<AccessRequest | null> {
  if (isSupabaseConfigured()) {
    const client = getSupabase();
    if (client) {
      try {
        const updateRow: Record<string, unknown> = {};
        if (updates.status !== undefined) updateRow.status = updates.status;
        if (updates.approvedAt !== undefined) updateRow.approved_at = updates.approvedAt;
        if (updates.expiresAt !== undefined) updateRow.expires_at = updates.expiresAt;
        const { data, error } = await client.from('access_requests').update(updateRow).eq('id', id).select().single();
        if (!error && data) return rowToRequest(data as AccessRequestRow);
      } catch (err) { /* fallback */ }
    }
  }
  const requests = readStore();
  const index = requests.findIndex((r) => r.id === id);
  if (index === -1) return null;
  requests[index] = { ...requests[index], ...updates };
  writeStore(requests);
  return requests[index];
}

export async function getRequestByPhone(phone: string): Promise<AccessRequest | null> {
  if (isSupabaseConfigured()) {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client.from('access_requests').select('*').eq('phone', phone).maybeSingle();
        if (!error && data) return rowToRequest(data as AccessRequestRow);
        if (!error && !data) return null;
      } catch (err) { /* fallback */ }
    }
  }
  const requests = readStore();
  return requests.find((r) => r.phone === phone) || null;
}
