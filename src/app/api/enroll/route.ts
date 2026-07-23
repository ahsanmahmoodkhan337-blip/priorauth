import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, phone, email, paymentMethod, transactionId, receiptSent } = body;

    if (!fullName?.trim()) return NextResponse.json({ success: false, message: 'Full name required.' }, { status: 400 });
    if (!phone?.trim()) return NextResponse.json({ success: false, message: 'Phone required.' }, { status: 400 });
    if (!transactionId?.trim()) return NextResponse.json({ success: false, message: 'Transaction ID required.' }, { status: 400 });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
    
    const supabase = createClient(url, key);
    
    const { error } = await supabase.from('access_requests').insert({
      id: crypto.randomUUID(),
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email?.trim() || '',
      payment_method: paymentMethod || 'easypaisa',
      transaction_id: transactionId.trim(),
      receipt_sent: receiptSent === true,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json({ success: false, message: 'DB Error: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Submitted!' }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Error: ' + (e?.message || 'unknown') }, { status: 500 });
  }
}
