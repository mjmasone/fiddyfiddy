import { NextResponse } from 'next/server';
import { getTicketById, updateTicket } from '@/lib/knack';

// GET /api/tickets/[id] - Get single ticket
export async function GET(request, { params }) {
  try {
    const ticket = await getTicketById(params.id);
    
    if (!ticket) {
      return NextResponse.json(
        { error: true, message: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Don't expose sensitive fields
    return NextResponse.json({
      id: ticket.id,
      ticket_number: ticket.ticket_number,
      player_email: ticket.player_email,
      player_venmo: ticket.player_venmo,
      status: ticket.status,
      created_at: ticket.created_at,
    });
  } catch (error) {
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}
