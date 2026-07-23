import { NextResponse } from 'next/server';

function getSupabaseHeaders() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  return { 'Content-Type': 'application/json', 'apikey': key, 'Authorization': `Bearer ${key}` };
}
const baseUrl = () => (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '') + '/rest/v1/access_requests';

export async function GET() {
  try {
    const res = await fetch(`${baseUrl()}?select=*&order=submitted_at.desc`, { headers: getSupabaseHeaders() });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.message }, { status: res.status });
    const requests = (data || []).map((r: any) => ({
      id: r.id, fullName: r.full_name, phone: r.phone, email: r.email || '',
      paymentMethod: r.payment_method, transactionId: r.transaction_id,
      receiptSent: r.receipt_sent ?? false, status: r.status,
      submittedAt: r.submitted_at, approvedAt: r.approved_at, expiresAt: r.expires_at,
      accessDurationDays: r.access_duration_days,
    }));
    return NextResponse.json(requests);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status, accessDurationDays } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const updates: any = { status };
    if (status === 'approved') {
      updates.approved_at = new Date().toISOString();
      if (accessDurationDays) {
        const exp = new Date();
        exp.setDate(exp.getDate() + accessDurationDays);
        updates.expires_at = exp.toISOString();
        updates.access_duration_days = accessDurationDays;
      }
    }
    const res = await fetch(`${baseUrl()}?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', headers: { ...getSupabaseHeaders(), 'Prefer': 'return=representation' }, body: JSON.stringify(updates) });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.message }, { status: res.status });
    const r = data?.[0];
    if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({
      id: r.id, fullName: r.full_name, phone: r.phone, email: r.email || '',
      paymentMethod: r.payment_method, transactionId: r.transaction_id,
      receiptSent: r.receipt_sent ?? false, status: r.status,
      submittedAt: r.submitted_at, approvedAt: r.approved_at, expiresAt: r.expires_at,
      accessDurationDays: r.access_duration_days,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
