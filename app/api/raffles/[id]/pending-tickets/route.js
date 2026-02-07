import { NextResponse } from 'next/server';
import { getRaffleById, getTicketsByRaffle } from '@/lib/knack';
import { requireAuth } from '@/lib/auth';

// GET /api/raffles/[id]/pending-tickets - Get all tickets for verification
export async function GET(request, { params }) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: true, message: auth.error },
        { status: 401 }
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

    // Get ALL tickets for this raffle (not just pending)
    const tickets = await getTicketsByRaffle(params.id);

    return NextResponse.json({
      tickets: tickets.map(t => ({
        id: t.id,
        ticket_number: t.ticket_number,
        sequence_number: t.sequence_number,
        player_email: t.player_email,
        player_venmo: t.player_venmo,
        venmo_txn_id: t.venmo_txn_id,
        screenshot: t.screenshot,
        status: t.status || 'Pending',
        payment_recipient: t.payment_recipient,
        created_at: t.created_at,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}
