import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/hash
 * 
 * Utility endpoint to hash a password.
 * Use this to generate a hash, then paste it into Knack manually.
 * 
 * IMPORTANT: Remove or protect this endpoint in production!
 * 
 * Usage:
 *   curl -X POST http://localhost:3000/api/auth/hash \
 *     -H "Content-Type: application/json" \
 *     -d '{"password": "your_password"}'
 */
export async function POST(request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: true, message: 'Password required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: true, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(password, 10);

    return NextResponse.json({
      success: true,
      hash,
      instructions: 'Copy this hash and paste it into the password field in Knack for your user record.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}
