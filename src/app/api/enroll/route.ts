import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, phone, email, paymentMethod, transactionId, receiptSent } = body;

    if (!fullName?.trim()) return NextResponse.json({ success: false, message: 'Full name required.' }, { status: 400 });
    if (!phone?.trim()) return NextResponse.json({ success: false, message: 'Phone required.' }, { status: 400 });
    if (!transactionId?.trim()) return NextResponse.json({ success: false, message: 'Transaction ID required.' }, { status: 400 });

    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '');
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
    
    const res = await fetch(`${supabaseUrl}/rest/v1/access_requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        id: crypto.randomUUID(),
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email?.trim() || '',
        payment_method: paymentMethod || 'easypaisa',
        transaction_id: transactionId.trim(),
        receipt_sent: receiptSent === true,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ success: false, message: `Supabase ${res.status}: ${errText}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Submitted!' }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Error: ' + (e?.message || 'unknown') }, { status: 500 });
  }
}
