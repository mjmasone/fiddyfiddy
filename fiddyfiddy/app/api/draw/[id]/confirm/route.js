import { NextResponse } from 'next/server';
import { getRaffleById, getTicketById, getUserById, getDrawLogByRaffle } from '@/lib/knack';
import { requireAuth } from '@/lib/auth';
import { confirmWinner } from '@/lib/drawing';

// POST /api/draw/[id]/confirm - Confirm the winner
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
        { error: true, message: 'Your account is pending approval. You cannot confirm winners until approved.' },
        { status: 403 }
      );
    }

    const { ticketId } = await request.json();

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

    const ticket = await getTicketById(ticketId);
    if (!ticket) {
      return NextResponse.json(
        { error: true, message: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Get organizer info for notifications
    const organizer = await getUserById(raffle.organizer);

    // Get draw log to determine draw number
    const drawLog = await getDrawLogByRaffle(params.id);
    const drawNumber = drawLog.length + 1;

    // Confirm winner
    await confirmWinner(raffle, ticket, drawNumber, organizer);

    return NextResponse.json({
      success: true,
      message: 'Winner confirmed! Notifications sent.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}
