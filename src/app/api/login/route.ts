import { NextResponse } from 'next/server';
export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    if (!phone?.trim()) return NextResponse.json({ success: false, message: 'Phone required' }, { status: 400 });
    
    return NextResponse.json({ success: true, message: 'Use client-side login', phone: phone.trim() });
  } catch {
    return NextResponse.json({ success: false, message: 'Error' }, { status: 500 });
  }
}
