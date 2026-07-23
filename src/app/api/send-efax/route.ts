import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// POST /api/send-efax
// Simulates sending an e-Fax for prior auth packet submission
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      recipientFax = '1-800-xxx-xxxx',
      recipientName = 'Aetna Prior Auth Department',
      documentType = 'Prior Authorization Packet',
      pages = 12,
      patientName = 'John Doe',
      paNumber = 'PA-2026-08421',
      senderName = 'Metropolitan Orthopedics',
    } = body;

    // Simulate fax transmission
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const result = {
      success: true,
      confirmationId: `FAX-${Date.now()}`,
      transmission: {
        from: senderName,
        to: recipientName,
        faxNumber: recipientFax,
        documentType,
        pages,
        patientName,
        paNumber,
        fileSize: `${(pages * 0.45).toFixed(1)} MB`,
      },
      status: 'delivered',
      sentAt: new Date().toISOString(),
      deliveredAt: new Date(Date.now() + 45000).toISOString(),
      transmissionTime: '45 seconds',
      receiptConfirmed: true,
      contents: [
        'HIPAA Cover Sheet (Page 1)',
        'Letter of Medical Necessity (Pages 2–4)',
        'Clinical Evidence Binder (Pages 5–9)',
        'LCD/NCD Policy Citations (Pages 10–11)',
        'Transmission Report (Page 12)',
      ],
      metadata: {
        encryption: 'TLS 1.3',
        protocol: 'T.38 FoIP',
        resolution: '300 DPI',
        baudRate: '14400',
        errorCorrection: 'ECM enabled',
      },
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to send e-Fax' },
      { status: 500 }
    );
  }
}
