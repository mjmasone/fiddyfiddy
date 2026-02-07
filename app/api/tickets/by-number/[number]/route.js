import { NextResponse } from 'next/server';
import { getTicketByNumber, getRaffleById } from '@/lib/knack';

// GET /api/tickets/by-number/[number] - Get ticket by ticket number
export async function GET(request, { params }) {
  try {
    const ticketNumber = decodeURIComponent(params.number);
    const ticket = await getTicketByNumber(ticketNumber);
    
    if (!ticket) {
      return NextResponse.json(
        { error: true, message: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Get raffle info
    const raffle = await getRaffleById(ticket.raffle);

    return NextResponse.json({
      ticket: {
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        player_email: ticket.player_email,
        player_venmo: ticket.player_venmo,
        status: ticket.status,
        created_at: ticket.created_at,
      },
      raffle: raffle ? {
        id: raffle.id,
        beneficiary_name: raffle.beneficiary_name,
        ticket_price: raffle.ticket_price,
        tickets_sold: raffle.tickets_sold,
        status: raffle.status,
        winning_ticket: raffle.winning_ticket,
      } : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}
