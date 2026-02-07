import { NextResponse } from 'next/server';
import { getTicketById, updateTicket, getRaffleById } from '@/lib/knack';
import { sendTicketConfirmation } from '@/lib/sendgrid';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// POST /api/tickets/[id]/verify - Submit payment verification OR organizer action
export async function POST(request, { params }) {
  try {
    // Check content type to determine if it's a form submission or JSON
    const contentType = request.headers.get('content-type') || '';
    
    // Handle JSON body (organizer action)
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { action } = body;
      
      if (action === 'reject') {
        // Verify organizer is authenticated
        const cookieStore = cookies();
        const token = cookieStore.get('fiddyfiddy_auth')?.value;
        const payload = await verifyToken(token);
        
        if (!payload) {
          return NextResponse.json(
            { error: true, message: 'Unauthorized' },
            { status: 401 }
          );
        }
        
        // Get ticket
        const ticket = await getTicketById(params.id);
        if (!ticket) {
          return NextResponse.json(
            { error: true, message: 'Ticket not found' },
            { status: 404 }
          );
        }
        
        // Update ticket as rejected
        await updateTicket(params.id, {
          status: 'Rejected',
          verified_at: new Date().toISOString(),
        });
        
        return NextResponse.json({
          success: true,
          message: 'Ticket rejected',
          status: 'Rejected',
        });
      }
      
      // Unknown JSON action
      return NextResponse.json(
        { error: true, message: 'Invalid action' },
        { status: 400 }
      );
    }
    
    // Handle form data (player file upload)
    const formData = await request.formData();
    const txnId = formData.get('txnId');
    const screenshot = formData.get('screenshot');

    if (!txnId && !screenshot) {
      return NextResponse.json(
        { error: true, message: 'Please provide a transaction ID or screenshot' },
        { status: 400 }
      );
    }

    // Get ticket
    const ticket = await getTicketById(params.id);
    if (!ticket) {
      return NextResponse.json(
        { error: true, message: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Check if already verified
    if (ticket.status !== 'Pending' && ticket.status !== undefined) {
      // Allow re-submission if still pending
      if (ticket.status !== 'Pending') {
        return NextResponse.json(
          { error: true, message: 'Ticket already verified' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData = {
      verified_at: new Date().toISOString(),
    };

    // If transaction ID provided, auto-verify
    if (txnId) {
      updateData.venmo_txn_id = txnId;
      updateData.status = 'Verified'; // Auto-verified with txn ID
    }

    // Handle screenshot upload
    if (screenshot && screenshot.size > 0) {
      // For Knack, we need to upload the file
      // This is a simplified version - in production, upload to Knack or cloud storage
      // For now, we'll convert to base64 and note that screenshot was provided
      const bytes = await screenshot.arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      const mimeType = screenshot.type;
      
      // Store as data URL (for small files) or upload to storage
      // Note: Knack has file upload limits, may need external storage
      updateData.screenshot = `data:${mimeType};base64,${base64}`;
      
      // If only screenshot (no txn ID), keep as Pending for manual review
      if (!txnId) {
        updateData.status = 'Pending';
      }
    }

    // Update ticket
    await updateTicket(params.id, updateData);

    // Get raffle for confirmation email
    const raffle = await getRaffleById(ticket.raffle);

    // Send confirmation email
    try {
      await sendTicketConfirmation(
        { ...ticket, ...updateData },
        raffle
      );
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: txnId ? 'Payment verified' : 'Screenshot submitted for review',
      status: updateData.status,
    });

  } catch (error) {
    console.error('Verify ticket error:', error);
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}
