import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// POST /api/send-doc-signature-sms
// Simulates sending an SMS signature link to a doctor
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      phone = '+1 (555) 123-4567',
      addendum = 'Medical necessity addendum text...',
      providerName = 'Dr. Sarah Chen, MD',
    } = body;

    // Simulate SMS sending
    await new Promise((resolve) => setTimeout(resolve, 800));

    const result = {
      success: true,
      messageId: `SMS-${Date.now()}`,
      to: phone,
      providerName,
      addendumPreview: addendum.slice(0, 100) + '...',
      status: 'delivered',
      sentAt: new Date().toISOString(),
      secureLink: `https://medhero-secure.sign/${Math.random().toString(36).slice(2, 10)}`,
      expiresIn: '72 hours',
      metadata: {
        carrier: 'T-Mobile',
        deliveryReceipt: 'confirmed',
        messageLength: addendum.length,
        segments: Math.ceil(addendum.length / 160),
      },
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to send SMS signature request' },
      { status: 500 }
    );
  }
}
