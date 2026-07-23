import { NextResponse } from 'next/server';

function getHeaders() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  return { 'apikey': key, 'Authorization': `Bearer ${key}` };
}
const baseUrl = () => (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '') + '/rest/v1/access_requests';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    if (!phone?.trim()) return NextResponse.json({ success: false, message: 'Phone required' }, { status: 400 });

    const res = await fetch(`${baseUrl()}?select=*&phone=eq.${encodeURIComponent(phone.trim())}`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ success: false, message: 'Error looking up account' }, { status: 500 });

    const user = data?.[0];
    if (!user) return NextResponse.json({ success: false, message: 'No access request found for this phone number' }, { status: 404 });
    if (user.status === 'pending') return NextResponse.json({ success: false, message: 'Your request is still pending approval' }, { status: 403 });
    if (user.status === 'rejected') return NextResponse.json({ success: false, message: 'Your request was rejected' }, { status: 403 });
    if (user.expires_at && new Date(user.expires_at) < new Date()) return NextResponse.json({ success: false, message: 'Your access has expired' }, { status: 403 });

    return NextResponse.json({ success: true, phone: user.phone, fullName: user.full_name, expiresAt: user.expires_at });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Error: ' + e.message }, { status: 500 });
  }
}
