import { NextResponse } from 'next/server';
import { getRaffleById, updateRaffle } from '@/lib/knack';
import { requireAuth } from '@/lib/auth';

// POST /api/raffles/[id]/activate - Activate a draft raffle
export async function POST(request, { params }) {
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

    // Check current status
    if (raffle.status !== 'Draft') {
      return NextResponse.json(
        { error: true, message: 'Only draft raffles can be activated' },
        { status: 400 }
      );
    }

    // Activate raffle
    await updateRaffle(params.id, {
      status: 'Active',
    });

    return NextResponse.json({
      success: true,
      message: 'Raffle activated',
    });
  } catch (error) {
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}
