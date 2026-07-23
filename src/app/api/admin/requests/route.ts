import { NextResponse } from 'next/server';
import { getAllRequests, updateRequest } from '@/lib/serverStore';

// GET /api/admin/requests — returns all requests sorted newest first
export async function GET() {
  try {
    const requests = getAllRequests();
    // Sort by submittedAt descending (newest first)
    requests.sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Admin GET requests error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch access requests.' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/requests — approve or reject a request
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, accessDurationDays } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Request ID is required.' },
        { status: 400 }
      );
    }

    if (status !== 'approved' && status !== 'rejected') {
      return NextResponse.json(
        { success: false, message: 'Status must be "approved" or "rejected".' },
        { status: 400 }
      );
    }

    if (status === 'approved') {
      const now = new Date();
      const days = typeof accessDurationDays === 'number' && accessDurationDays > 0
        ? accessDurationDays
        : 7;
      const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      const updated = updateRequest(id, {
        status: 'approved',
        approvedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        accessDurationDays: days,
      });

      if (!updated) {
        return NextResponse.json(
          { success: false, message: 'Request not found.' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, request: updated });
    }

    // Rejected
    const updated = updateRequest(id, { status: 'rejected' });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Request not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error('Admin PATCH requests error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
