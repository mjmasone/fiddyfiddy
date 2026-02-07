import { NextResponse } from 'next/server';
import { 
  getRaffleById, 
  updateRaffle, 
  createTicket, 
  countTicketsByRaffle,
  getSettings 
} from '@/lib/knack';
import { generateTicketNumber, isStateRestricted, isValidEmail } from '@/lib/utils';
import { generateTicketPaymentLink, validateVenmoHandle } from '@/lib/venmo';
import { sendTicketConfirmation } from '@/lib/sendgrid';

// POST /api/tickets - Create a new ticket
export async function POST(request) {
  try {
    const body = await request.json();
    const { raffleId, email, venmo, state } = body;

    // Validate required fields
    if (!raffleId || !email || !venmo || !state) {
      return NextResponse.json(
        { error: true, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: true, message: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate Venmo handle
    const cleanVenmo = validateVenmoHandle(venmo);
    if (!cleanVenmo) {
      return NextResponse.json(
        { error: true, message: 'Invalid Venmo handle' },
        { status: 400 }
      );
    }

    // Check state restriction
    if (isStateRestricted(state)) {
      return NextResponse.json(
        { error: true, message: 'Online raffles are not available in your state' },
        { status: 400 }
      );
    }

    // Get raffle
    const raffle = await getRaffleById(raffleId);
    if (!raffle) {
      return NextResponse.json(
        { error: true, message: 'Raffle not found' },
        { status: 404 }
      );
    }

    // Check raffle is active
    if (raffle.status !== 'Active') {
      return NextResponse.json(
        { error: true, message: 'This raffle is not currently accepting tickets' },
        { status: 400 }
      );
    }

    // Check if sold out
    const ticketsSold = raffle.tickets_sold || 0;
    if (ticketsSold >= raffle.max_tickets) {
      return NextResponse.json(
        { error: true, message: 'This raffle is sold out' },
        { status: 400 }
      );
    }

    // Get settings for owner venmo
    const settings = await getSettings();
    const ownerVenmo = settings?.owner_venmo || process.env.OWNER_VENMO;

    // Generate ticket number
    const sequenceNumber = ticketsSold + 1;
    const ticketNumber = generateTicketNumber(raffle.ticket_prefix, sequenceNumber);

    // Get payment recipient
    const payment = generateTicketPaymentLink(
      raffle,
      sequenceNumber,
      ticketNumber,
      ownerVenmo
    );

    // Create ticket - Verified by default (hybrid verification model)
    // Trust that payment will be made; verify only the winner at draw time
    const ticketData = {
      raffle: raffleId,
      ticket_number: ticketNumber,
      sequence_number: sequenceNumber,
      player_email: email.toLowerCase(),
      player_venmo: cleanVenmo,
      status: 'Verified', // Trust by default - organizer verifies winner only
      payment_recipient: payment.recipientType,
    };

    const ticket = await createTicket(ticketData);

    // Update raffle ticket count
    await updateRaffle(raffleId, {
      tickets_sold: sequenceNumber,
    });

    // Send ticket confirmation email immediately
    try {
      await sendTicketConfirmation(
        { ...ticketData, id: ticket.id },
        raffle
      );
    } catch (emailError) {
      console.error('Failed to send ticket email:', emailError);
      // Don't fail the request if email fails
    }

    // Return with Venmo URL
    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        ticket_number: ticketNumber,
        status: 'Verified',
      },
      venmoUrl: payment.url,
      confirmUrl: `/r/${raffleId}/confirm/${ticket.id}`,
    });

  } catch (error) {
    console.error('Create ticket error:', error);
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}
