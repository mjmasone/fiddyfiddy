import { NextResponse } from 'next/server';
import { getRaffleById, getTicketById, getSettings, getDrawLogByRaffle } from '@/lib/knack';
import { requireAuth } from '@/lib/auth';
import { processRedraw, selectRandomTicket } from '@/lib/drawing';

// POST /api/draw/[id]/redraw - Mark ticket invalid and draw new one
export async function POST(request, { params }) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: true, message: auth.error },
        { status: 401 }
      );
    }

    // Check if user is pending
    if (auth.user.status === 'Pending') {
      return NextResponse.json(
        { error: true, message: 'Your account is pending approval. You cannot redraw until approved.' },
        { status: 403 }
      );
    }

    const { ticketId, reason } = await request.json();

    if (!ticketId) {
      return NextResponse.json(
        { error: true, message: 'Ticket ID required' },
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

    // Check raffle status
    if (raffle.status !== 'Drawing') {
      return NextResponse.json(
        { error: true, message: 'Raffle is not in drawing state' },
        { status: 400 }
      );
    }

    // Check redraw limit
    const settings = await getSettings();
    const maxRedraws = settings?.max_redraws || 3;
    const currentRedraws = raffle.redraw_count || 0;

    if (currentRedraws >= maxRedraws) {
      return NextResponse.json(
        { error: true, message: 'Maximum redraws reached. Contact support.', needsEscalation: true },
        { status: 400 }
      );
    }

    const ticket = await getTicketById(ticketId);
    if (!ticket) {
      return NextResponse.json(
        { error: true, message: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Get draw log to determine draw number
    const drawLog = await getDrawLogByRaffle(params.id);
    const drawNumber = drawLog.length + 1;

    // Process redraw
    await processRedraw(raffle, ticket, drawNumber, reason || 'Payment not confirmed');

    // Select new ticket
    const newTicket = await selectRandomTicket(params.id);

    if (!newTicket) {
      return NextResponse.json(
        { error: true, message: 'No eligible tickets remaining' },
        { status: 400 }
      );
    }

    // Calculate new redraw count
    const newRedrawCount = currentRedraws + 1;
    const redrawsRemaining = maxRedraws - newRedrawCount;

    return NextResponse.json({
      success: true,
      newTicket: {
        id: newTicket.id,
        ticket_number: newTicket.ticket_number,
        player_email: newTicket.player_email,
        player_venmo: newTicket.player_venmo,
        venmo_txn_id: newTicket.venmo_txn_id,
        screenshot: newTicket.screenshot,
        status: newTicket.status,
      },
      drawNumber: drawNumber + 1,
      redrawsRemaining,
    });
  } catch (error) {
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}
