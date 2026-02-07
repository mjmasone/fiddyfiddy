import { NextResponse } from 'next/server';
import { authenticateUser, setAuthCookie } from '@/lib/auth';

// POST /api/auth/login
export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: true, message: 'Email and password required' },
        { status: 400 }
      );
    }

    const result = await authenticateUser(email, password);

    if (!result.success) {
      return NextResponse.json(
        { error: true, message: result.error },
        { status: 401 }
      );
    }

    // Set auth cookie
    setAuthCookie(result.token);

    return NextResponse.json({
      success: true,
      user: result.user,
    });
  } catch (error) {
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}
