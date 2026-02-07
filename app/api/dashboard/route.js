import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getRafflesByOrganizer } from '@/lib/knack';

export async function GET(request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: true, message: auth.error }, { status: 401 });
    }
    const raffles = await getRafflesByOrganizer(auth.user.id);
    return NextResponse.json({ user: { id: auth.user.id, email: auth.user.email, name: auth.user.name, role: auth.user.role, status: auth.user.status }, raffles });
  } catch (error) {
    return NextResponse.json({ error: true, message: error.message }, { status: 500 });
  }
}
