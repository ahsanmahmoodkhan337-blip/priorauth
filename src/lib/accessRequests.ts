'use client';

export interface AccessRequest {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  paymentMethod: 'bank-islami' | 'easypaisa' | 'paypal';
  transactionId: string;
  receiptSent: boolean;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string; // ISO date
  approvedAt?: string;
  expiresAt?: string; // ISO date for time-limited access
  accessDurationDays?: number;
}

const STORAGE_KEY = 'medhero_access_requests';

function readRequests(): AccessRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeRequests(requests: AccessRequest[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

export function getAccessRequests(): AccessRequest[] {
  return readRequests();
}

export function saveAccessRequest(req: AccessRequest): void {
  const requests = readRequests();
  requests.push(req);
  writeRequests(requests);
}

export function updateAccessRequest(
  id: string,
  updates: Partial<AccessRequest>
): void {
  const requests = readRequests();
  const index = requests.findIndex((r) => r.id === id);
  if (index === -1) return;
  requests[index] = { ...requests[index], ...updates };
  writeRequests(requests);
}

export function getAccessRequestById(id: string): AccessRequest | undefined {
  const requests = readRequests();
  return requests.find((r) => r.id === id);
}
