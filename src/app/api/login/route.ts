import { NextResponse } from 'next/server';
import { getRequestByPhone } from '@/lib/serverStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required.' },
        { status: 400 }
      );
    }

    const req = getRequestByPhone(phone.trim());

    if (!req) {
      return NextResponse.json(
        { success: false, message: 'No access request found for this phone number' },
        { status: 404 }
      );
    }

    if (req.status === 'pending') {
      return NextResponse.json(
        { success: false, message: 'Your access request is still pending approval' },
        { status: 403 }
      );
    }

    if (req.status === 'rejected') {
      return NextResponse.json(
        { success: false, message: 'Your access request was rejected' },
        { status: 403 }
      );
    }

    // Status is 'approved' — check expiration
    if (req.expiresAt) {
      const expiresAt = new Date(req.expiresAt);
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { success: false, message: 'Your access has expired' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      phone: req.phone,
      fullName: req.fullName,
      expiresAt: req.expiresAt || null,
    });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
