import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getRaffleById, updateRaffle, getTicketsByRaffle, getUserById } from '@/lib/knack';
import { sendRaffleCancellation } from '@/lib/sendgrid';

// POST /api/raffles/[id]/cancel - Cancel a raffle and notify players
export async function POST(request, { params }) {
  try {
    // Verify authentication
    const cookieStore = cookies();
    const token = cookieStore.get('fiddyfiddy_auth')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: true, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: true, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get reason from request body
    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: true, message: 'Cancellation reason is required' },
        { status: 400 }
      );
    }

    // Get raffle
    const raffle = await getRaffleById(params.id);
    if (!raffle) {
      return NextResponse.json(
        { error: true, message: 'Raffle not found' },
        { status: 404 }
      );
    }

    // Check ownership (owner can cancel any, organizer can cancel their own)
    const user = await getUserById(payload.userId);
    if (user.role !== 'Owner' && raffle.organizer !== payload.userId) {
      return NextResponse.json(
        { error: true, message: 'Not authorized to cancel this raffle' },
        { status: 403 }
      );
    }

    // Check if raffle can be cancelled (not already complete)
    if (raffle.status === 'Complete') {
      return NextResponse.json(
        { error: true, message: 'Cannot cancel a completed raffle' },
        { status: 400 }
      );
    }

    // Get all tickets for this raffle to notify players
    const tickets = await getTicketsByRaffle(params.id);

    // Update raffle status to Cancelled
    await updateRaffle(params.id, {
      status: 'Cancelled',
    });

    // Send cancellation emails to all players
    let emailResults = [];
    if (tickets.length > 0) {
      try {
        emailResults = await sendRaffleCancellation(
          tickets,
          raffle,
          reason.trim(),
          user.email
        );
      } catch (emailError) {
        console.error('Failed to send cancellation emails:', emailError);
        // Don't fail the request if emails fail
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Raffle cancelled successfully',
      playersNotified: tickets.length,
      emailResults,
    });

  } catch (error) {
    console.error('Cancel raffle error:', error);
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}
