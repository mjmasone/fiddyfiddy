import { NextResponse } from 'next/server';
import { getRaffleById, getTicketById } from '@/lib/knack';
import { requireAuth } from '@/lib/auth';

// GET /api/raffles/[id]/payout-info - Get payout information
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

    // Get winning ticket
    if (!raffle.winning_ticket) {
      return NextResponse.json(
        { error: true, message: 'No winner selected yet' },
        { status: 400 }
      );
    }

    const winner = await getTicketById(raffle.winning_ticket);

    return NextResponse.json({
      raffle: {
        id: raffle.id,
        beneficiary_name: raffle.beneficiary_name,
        ticket_price: raffle.ticket_price,
        tickets_sold: raffle.tickets_sold,
        payout_confirmed: raffle.payout_confirmed,
      },
      winner: winner ? {
        id: winner.id,
        ticket_number: winner.ticket_number,
        player_email: winner.player_email,
        player_venmo: winner.player_venmo,
      } : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}
