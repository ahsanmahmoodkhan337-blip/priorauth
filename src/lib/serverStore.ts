import fs from 'fs';
import path from 'path';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// Types (shared with client-side accessRequests.ts for compatibility)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Internal Supabase row shape (snake_case from DB)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// JSON File Store (fallback)
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'accessRequests.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readFile(): AccessRequest[] {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
    return [];
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeFile(requests: AccessRequest[]): void {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(requests, null, 2), 'utf-8');
}

// ---------------------------------------------------------------------------
// Exported store functions (Supabase-first, JSON fallback)
// ---------------------------------------------------------------------------

export async function getAllRequests(): Promise<AccessRequest[]> {
  if (isSupabaseConfigured()) {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('access_requests')
          .select('*')
          .order('submitted_at', { ascending: false });

        if (!error && data) {
          return (data as AccessRequestRow[]).map(rowToRequest);
        }
        console.warn('[serverStore] Supabase getAllRequests failed, falling back to JSON:', error?.message);
      } catch (err) {
        console.warn('[serverStore] Supabase getAllRequests error, falling back to JSON:', err);
      }
    }
  }

  // JSON fallback
  const requests = readFile();
  requests.sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
  return requests;
}

export async function saveRequest(req: AccessRequest): Promise<void> {
  if (isSupabaseConfigured()) {
    const client = getSupabase();
    if (client) {
      try {
        const { error } = await client
          .from('access_requests')
          .insert(requestToRow(req));

        if (!error) return;
        console.warn('[serverStore] Supabase saveRequest failed, falling back to JSON:', error.message);
      } catch (err) {
        console.warn('[serverStore] Supabase saveRequest error, falling back to JSON:', err);
      }
    }
  }

  // JSON fallback
  const requests = readFile();
  requests.push(req);
  writeFile(requests);
}

export async function updateRequest(
  id: string,
  updates: Partial<AccessRequest>
): Promise<AccessRequest | null> {
  if (isSupabaseConfigured()) {
    const client = getSupabase();
    if (client) {
      try {
        const updateRow: Record<string, unknown> = {};
        if (updates.status !== undefined) updateRow.status = updates.status;
        if (updates.approvedAt !== undefined) updateRow.approved_at = updates.approvedAt;
        if (updates.expiresAt !== undefined) updateRow.expires_at = updates.expiresAt;
        if (updates.accessDurationDays !== undefined) updateRow.access_duration_days = updates.accessDurationDays;
        if (updates.receiptSent !== undefined) updateRow.receipt_sent = updates.receiptSent;

        const { data, error } = await client
          .from('access_requests')
          .update(updateRow)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return rowToRequest(data as AccessRequestRow);
        }
        console.warn('[serverStore] Supabase updateRequest failed, falling back to JSON:', error?.message);
      } catch (err) {
        console.warn('[serverStore] Supabase updateRequest error, falling back to JSON:', err);
      }
    }
  }

  // JSON fallback
  const requests = readFile();
  const index = requests.findIndex((r) => r.id === id);
  if (index === -1) return null;
  requests[index] = { ...requests[index], ...updates };
  writeFile(requests);
  return requests[index];
}

export async function getRequestByPhone(phone: string): Promise<AccessRequest | null> {
  if (isSupabaseConfigured()) {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('access_requests')
          .select('*')
          .eq('phone', phone)
          .maybeSingle();

        if (!error && data) {
          return rowToRequest(data as AccessRequestRow);
        }
        if (!error && !data) return null; // Not found in Supabase
        console.warn('[serverStore] Supabase getRequestByPhone failed, falling back to JSON:', error?.message);
      } catch (err) {
        console.warn('[serverStore] Supabase getRequestByPhone error, falling back to JSON:', err);
      }
    }
  }

  // JSON fallback
  const requests = readFile();
  return requests.find((r) => r.phone === phone) || null;
}
