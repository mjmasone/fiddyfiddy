import { NextResponse } from 'next/server';
import { getRaffleById, getTicketById, getTicketsByRaffle, getDrawLogByRaffle, getUserById } from '@/lib/knack';
import { requireAuth } from '@/lib/auth';

// GET /api/raffles/[id]/report - Get full raffle report
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

    // Get organizer details
    let organizer = null;
    if (raffle.organizer) {
      try {
        organizer = await getUserById(raffle.organizer);
      } catch (e) {
        // Organizer might not exist, continue without it
      }
    }

    // Get all data
    const tickets = await getTicketsByRaffle(params.id);
    const drawLog = await getDrawLogByRaffle(params.id);
    const winner = raffle.winning_ticket ? await getTicketById(raffle.winning_ticket) : null;

    // Enrich draw log with ticket numbers
    const enrichedDrawLog = drawLog.map(entry => {
      const ticket = tickets.find(t => t.id === entry.ticket);
      return {
        draw_number: entry.draw_number,
        ticket_number: ticket?.ticket_number || 'Unknown',
        result: entry.result,
        reason: entry.reason,
        timestamp: entry.timestamp,
      };
    });

    // Calculate summary
    const ticketsSold = raffle.tickets_sold || 0;
    const grossRevenue = (ticketsSold * raffle.ticket_price).toFixed(2);
    const jackpot = (ticketsSold * raffle.ticket_price * 0.5).toFixed(2);
    
    // Calculate owner split
    const ownerPrime = raffle.owner_prime || 11;
    const ownerTickets = Math.floor(ticketsSold / ownerPrime);
    const ownerRevenue = (ownerTickets * raffle.ticket_price).toFixed(2);
    const netToBeneficiary = (parseFloat(grossRevenue) - parseFloat(jackpot) - parseFloat(ownerRevenue)).toFixed(2);

    return NextResponse.json({
      raffle: {
        id: raffle.id,
        raffle_name: raffle.raffle_name,
        beneficiary_name: raffle.beneficiary_name,
        beneficiary_type: raffle.beneficiary_type,
        beneficiary_venmo: raffle.beneficiary_venmo,
        ticket_price: raffle.ticket_price,
        max_tickets: raffle.max_tickets,
        tickets_sold: ticketsSold,
        status: raffle.status,
        draw_trigger: raffle.draw_trigger,
        created_at: raffle.created_at,
        drawn_at: raffle.drawn_at,
        payout_confirmed: raffle.payout_confirmed,
      },
      organizer: organizer ? {
        name: organizer.name,
        email: organizer.email,
        venmo_handle: organizer.venmo_handle,
      } : null,
      winner: winner ? {
        id: winner.id,
        ticket_number: winner.ticket_number,
        player_email: winner.player_email,
        player_venmo: winner.player_venmo,
      } : null,
      drawLog: enrichedDrawLog,
      tickets: tickets.map(t => ({
        id: t.id,
        ticket_number: t.ticket_number,
        player_email: t.player_email,
        player_venmo: t.player_venmo,
        status: t.status || 'Pending',
        payment_recipient: t.payment_recipient,
        created_at: t.created_at,
      })),
      summary: {
        ticketsSold,
        grossRevenue,
        jackpot,
        ownerRevenue,
        netToBeneficiary,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}
