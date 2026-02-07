import { NextResponse } from 'next/server';
import { getRaffleById, updateRaffle, getSettings } from '@/lib/knack';
import { requireAuth } from '@/lib/auth';
import { executeDraw, checkMinimumTickets } from '@/lib/drawing';

// POST /api/draw/[id] - Execute a drawing
export async function POST(request, { params }) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: true, message: auth.error },
        { status: 401 }
      );
    }

    // Check if user is pending - they cannot execute drawings
    if (auth.user.status === 'Pending') {
      return NextResponse.json(
        { error: true, message: 'Your account is pending approval. You cannot execute drawings until approved.' },
        { status: 403 }
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
    if (raffle.status !== 'Active' && raffle.status !== 'Drawing') {
      return NextResponse.json(
        { error: true, message: 'Raffle is not active' },
        { status: 400 }
      );
    }

    // Check minimum tickets
    const minCheck = checkMinimumTickets(raffle);
    if (!minCheck.canDraw) {
      return NextResponse.json(
        { error: true, message: minCheck.message },
        { status: 400 }
      );
    }

    // Update raffle status to Drawing
    if (raffle.status === 'Active') {
      await updateRaffle(params.id, { status: 'Drawing' });
    }

    // Get settings
    const settings = await getSettings();

    // Execute draw
    const result = await executeDraw(raffle, settings);

    if (!result.success) {
      return NextResponse.json(
        { error: true, message: result.error, needsEscalation: result.needsEscalation },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      ticket: {
        id: result.ticket.id,
        ticket_number: result.ticket.ticket_number,
        player_email: result.ticket.player_email,
        player_venmo: result.ticket.player_venmo,
        venmo_txn_id: result.ticket.venmo_txn_id,
        screenshot: result.ticket.screenshot,
        status: result.ticket.status,
      },
      drawNumber: result.drawNumber,
    });
  } catch (error) {
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}
