import { NextResponse } from 'next/server';
import { getRaffleById, updateTicket } from '@/lib/knack';
import { requireAuth } from '@/lib/auth';

// POST /api/raffles/[id]/verify-tickets - Batch verify tickets
export async function POST(request, { params }) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: true, message: auth.error },
        { status: 401 }
      );
    }

    const { ticketIds } = await request.json();

    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      return NextResponse.json(
        { error: true, message: 'No tickets provided' },
        { status: 400 }
      );
    }

    const raffle = await getRaffleById(params.id);
    if (!raffle) {
      return NextResponse.json(
        { error: true, message: 'Raffle not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (auth.user.role !== 'Owner' && raffle.organizer !== auth.user.id) {
      return NextResponse.json(
        { error: true, message: 'Not authorized' },
        { status: 403 }
      );
    }

    // Verify each ticket
    const results = await Promise.all(
      ticketIds.map(async (ticketId) => {
        try {
          await updateTicket(ticketId, {
            status: 'Confirmed',
            verified_at: new Date().toISOString(),
          });
          return { id: ticketId, success: true };
        } catch (e) {
          return { id: ticketId, success: false, error: e.message };
        }
      })
    );

    const verified = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Verified ${verified} ticket(s)${failed > 0 ? `, ${failed} failed` : ''}`,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}
