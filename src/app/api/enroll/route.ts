import { NextResponse } from 'next/server';
import { saveRequest, type AccessRequest } from '@/lib/serverStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, phone, email, paymentMethod, transactionId, receiptSent } = body;

    // Validate required fields
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return NextResponse.json(
        { success: false, message: 'Full name is required.' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required.' },
        { status: 400 }
      );
    }

    if (!transactionId || typeof transactionId !== 'string' || !transactionId.trim()) {
      return NextResponse.json(
        { success: false, message: 'Transaction ID is required.' },
        { status: 400 }
      );
    }

    const newRequest: AccessRequest = {
      id: crypto.randomUUID(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: (email && typeof email === 'string') ? email.trim() : '',
      paymentMethod: paymentMethod || 'easypaisa',
      transactionId: transactionId.trim(),
      receiptSent: receiptSent === true,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    await saveRequest(newRequest);

    return NextResponse.json(
      { success: true, message: 'Access request submitted successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Enroll API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
