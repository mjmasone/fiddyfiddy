import { NextResponse } from 'next/server';
import { getActivePublicRaffles, createRaffle } from '@/lib/knack';
import { requireAuth } from '@/lib/auth';
import { calculateMaxTickets } from '@/lib/utils';

// GET /api/raffles - List active public raffles
export async function GET() {
  try {
    const raffles = await getActivePublicRaffles();
    return NextResponse.json(raffles);
  } catch (error) {
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/raffles - Create a new raffle (auth required)
export async function POST(request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: true, message: auth.error },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    const required = ['raffle_name', 'beneficiary_name', 'beneficiary_type', 'beneficiary_venmo', 'ticket_price', 'ticket_prefix'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: true, message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Calculate max tickets
    const maxTickets = body.max_tickets 
      ? Math.min(body.max_tickets, calculateMaxTickets(body.ticket_price))
      : calculateMaxTickets(body.ticket_price);

    // Create raffle
    const raffleData = {
      organizer: auth.user.id,
      raffle_name: body.raffle_name,
      beneficiary_name: body.beneficiary_name,
      beneficiary_type: body.beneficiary_type,
      beneficiary_venmo: body.beneficiary_venmo.replace(/^@/, ''),
      ticket_price: parseFloat(body.ticket_price),
      max_tickets: maxTickets,
      tickets_sold: 0,
      status: 'Draft',
      draw_trigger: body.draw_trigger || 'Manual',
      draw_time: body.draw_time || null,
      draw_ticket_count: body.draw_ticket_count || null,
      is_public: body.is_public !== false,
      ticket_prefix: body.ticket_prefix.toUpperCase().slice(0, 10),
      organizer_venmo: auth.user.venmo_handle,
      owner_prime: 11, // Fixed at 11 - managed by Owner in Knack
      redraw_count: 0,
      payout_confirmed: false,
    };

    const raffle = await createRaffle(raffleData);

    return NextResponse.json({ success: true, raffle });
  } catch (error) {
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}
