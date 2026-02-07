import { NextResponse } from 'next/server';
import { getRaffleById, getDrawLogByRaffle, getSettings, getTicketsByRaffle } from '@/lib/knack';
import { requireAuth } from '@/lib/auth';

// GET /api/draw/[id]/status - Get drawing status for a raffle
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

    const settings = await getSettings();
    const drawLog = await getDrawLogByRaffle(params.id);
    const tickets = await getTicketsByRaffle(params.id);

    // Enrich draw log with ticket numbers
    const enrichedDrawLog = drawLog.map(entry => {
      const ticket = tickets.find(t => t.id === entry.ticket);
      return {
        ...entry,
        ticket_number: ticket?.ticket_number || 'Unknown',
      };
    });

    const maxRedraws = settings?.max_redraws || 3;
    const redraws = raffle.redraw_count || 0;

    return NextResponse.json({
      drawCount: drawLog.length,
      redraws,
      redrawsRemaining: maxRedraws - redraws,
      maxRedraws,
      needsEscalation: redraws >= maxRedraws,
      drawLog: enrichedDrawLog,
      minTicketsRequired: raffle.min_tickets_enabled ? (raffle.min_tickets || raffle.owner_prime || 11) : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}
