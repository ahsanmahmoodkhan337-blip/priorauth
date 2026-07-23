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
    id: row.id, fullName: row.full_name, phone: row.phone, email: row.email ?? '',
    paymentMethod: row.payment_method as AccessRequest['paymentMethod'],
    transactionId: row.transaction_id, receiptSent: row.receipt_sent ?? false,
    status: row.status as AccessRequest['status'], submittedAt: row.submitted_at,
    approvedAt: row.approved_at ?? undefined, expiresAt: row.expires_at ?? undefined,
    accessDurationDays: row.access_duration_days ?? undefined,
  };
}

function requestToRow(req: AccessRequest): Record<string, unknown> {
  return {
    id: req.id, full_name: req.fullName, phone: req.phone, email: req.email,
    payment_method: req.paymentMethod, transaction_id: req.transactionId,
    receipt_sent: req.receiptSent, status: req.status, submitted_at: req.submittedAt,
    approved_at: req.approvedAt ?? null, expires_at: req.expiresAt ?? null,
    access_duration_days: req.accessDurationDays ?? null,
  };
}

let memoryStore: AccessRequest[] = [];
try {
  const d = path.join(process.cwd(), 'data'), f = path.join(d, 'accessRequests.json');
  if (fs.existsSync(f)) { const r = JSON.parse(fs.readFileSync(f, 'utf-8')); if (Array.isArray(r)) memoryStore = r; }
} catch {}

function readStore() { return memoryStore; }
function writeStore(r: AccessRequest[]) {
  memoryStore = r;
  try { const d = path.join(process.cwd(), 'data'); if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); fs.writeFileSync(path.join(d, 'accessRequests.json'), JSON.stringify(r), 'utf-8'); } catch {}
}

export async function getAllRequests(): Promise<AccessRequest[]> {
  if (isSupabaseConfigured()) {
    const c = getSupabase();
    if (c) { try { const { data, error } = await c.from('access_requests').select('*').order('submitted_at', { ascending: false }); if (!error && data) return (data as AccessRequestRow[]).map(rowToRequest); } catch {} }
  }
  return [...readStore()].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

export async function saveRequest(req: AccessRequest): Promise<void> {
  if (isSupabaseConfigured()) {
    const c = getSupabase();
    if (c) { try { const { error } = await c.from('access_requests').insert(requestToRow(req)); if (!error) return; } catch {} }
  }
  const r = readStore(); r.push(req); writeStore(r);
}

export async function updateRequest(id: string, updates: Partial<AccessRequest>): Promise<AccessRequest | null> {
  if (isSupabaseConfigured()) {
    const c = getSupabase();
    if (c) { try { const row: any = {}; if (updates.status) row.status = updates.status; if (updates.approvedAt) row.approved_at = updates.approvedAt; if (updates.expiresAt) row.expires_at = updates.expiresAt; const { data, error } = await c.from('access_requests').update(row).eq('id', id).select().single(); if (!error && data) return rowToRequest(data as AccessRequestRow); } catch {} }
  }
  const r = readStore(); const i = r.findIndex(x => x.id === id); if (i === -1) return null; r[i] = { ...r[i], ...updates }; writeStore(r); return r[i];
}

export async function getRequestByPhone(phone: string): Promise<AccessRequest | null> {
  if (isSupabaseConfigured()) {
    const c = getSupabase();
    if (c) { try { const { data, error } = await c.from('access_requests').select('*').eq('phone', phone).maybeSingle(); if (!error && data) return rowToRequest(data as AccessRequestRow); if (!error && !data) return null; } catch {} }
  }
  return readStore().find(x => x.phone === phone) || null;
}
