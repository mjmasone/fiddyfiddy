import { NextResponse } from 'next/server';
import { getRaffleById, updateRaffle, createTransaction, getTicketById } from '@/lib/knack';
import { requireAuth } from '@/lib/auth';

// POST /api/raffles/[id]/confirm-payout - Confirm payout has been sent
export async function POST(request, { params }) {
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

    // Check raffle status
    if (raffle.status !== 'Complete') {
      return NextResponse.json(
        { error: true, message: 'Raffle drawing not complete' },
        { status: 400 }
      );
    }

    if (raffle.payout_confirmed) {
      return NextResponse.json(
        { error: true, message: 'Payout already confirmed' },
        { status: 400 }
      );
    }

    // Get winner info
    const winner = raffle.winning_ticket ? await getTicketById(raffle.winning_ticket) : null;
    const jackpot = (raffle.tickets_sold * raffle.ticket_price * 0.5);

    // Update raffle
    await updateRaffle(params.id, {
      payout_confirmed: true,
      payout_confirmed_at: new Date().toISOString(),
    });

    // Create transaction record
    if (winner) {
      await createTransaction({
        raffle: params.id,
        ticket: raffle.winning_ticket,
        type: 'JackpotPayout',
        amount: jackpot,
        from_venmo: raffle.organizer_venmo,
        to_venmo: winner.player_venmo,
        status: 'Confirmed',
        confirmed_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payout confirmed',
    });
  } catch (error) {
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}
