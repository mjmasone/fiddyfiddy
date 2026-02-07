import { NextResponse } from 'next/server';
import { getRaffleById, updateRaffle, deleteRaffle } from '@/lib/knack';
import { requireAuth } from '@/lib/auth';

// GET /api/raffles/[id] - Get single raffle
export async function GET(request, { params }) {
  try {
    // Check for debug mode (add ?debug=true to see raw Knack data)
    const url = new URL(request.url);
    const debug = url.searchParams.get('debug') === 'true';
    
    const raffle = await getRaffleById(params.id, debug);
    
    if (!raffle) {
      return NextResponse.json(
        { error: true, message: 'Raffle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(raffle);
  } catch (error) {
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/raffles/[id] - Update raffle (auth required)
export async function PUT(request, { params }) {
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

    // Check ownership (unless Owner role)
    if (auth.user.role !== 'Owner' && raffle.organizer !== auth.user.id) {
      return NextResponse.json(
        { error: true, message: 'Not authorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updated = await updateRaffle(params.id, body);

    return NextResponse.json({ success: true, raffle: updated });
  } catch (error) {
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/raffles/[id] - Cancel raffle (auth required)
export async function DELETE(request, { params }) {
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

    // Can't delete completed raffles
    if (raffle.status === 'Complete') {
      return NextResponse.json(
        { error: true, message: 'Cannot cancel completed raffle' },
        { status: 400 }
      );
    }

    // Mark as cancelled instead of deleting
    await updateRaffle(params.id, { status: 'Cancelled' });

    return NextResponse.json({ success: true, message: 'Raffle cancelled' });
  } catch (error) {
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}
