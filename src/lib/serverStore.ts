import fs from 'fs';
import path from 'path';

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
// Helpers
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
// Exported store functions
// ---------------------------------------------------------------------------

export function getAllRequests(): AccessRequest[] {
  return readFile();
}

export function saveRequest(req: AccessRequest): void {
  const requests = readFile();
  requests.push(req);
  writeFile(requests);
}

export function updateRequest(
  id: string,
  updates: Partial<AccessRequest>
): AccessRequest | null {
  const requests = readFile();
  const index = requests.findIndex((r) => r.id === id);
  if (index === -1) return null;
  requests[index] = { ...requests[index], ...updates };
  writeFile(requests);
  return requests[index];
}

export function getRequestByPhone(phone: string): AccessRequest | null {
  const requests = readFile();
  return requests.find((r) => r.phone === phone) || null;
}
