import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { getUserByEmail, createUser } from '@/lib/knack';
import { sendNewOrganizerNotification } from '@/lib/sendgrid';

// POST /api/auth/register - Register new organizer
export async function POST(request) {
  try {
    const { email, password, name, venmo_handle, phone } = await request.json();

    // Validate required fields
    if (!email || !password || !name || !venmo_handle) {
      return NextResponse.json(
        { error: true, message: 'Email, password, name, and Venmo handle are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: true, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: true, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email.toLowerCase());
    if (existingUser) {
      return NextResponse.json(
        { error: true, message: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Clean venmo handle
    const cleanVenmo = venmo_handle.replace(/^@/, '');

    // Create user with Active status (auto-approved)
    const userData = {
      field_57: email.toLowerCase(),      // email
      field_58: hashedPassword,            // password
      field_59: 'Organizer',               // role
      field_60: name,                      // name
      field_61: cleanVenmo,                // venmo_handle
      field_62: phone || '',               // phone
      field_63: 'Active',                  // status - auto-approved
    };

    const user = await createUser(userData);

    // Send notification email to platform owner
    try {
      await sendNewOrganizerNotification({
        name,
        email: email.toLowerCase(),
        venmo_handle: cleanVenmo,
        phone: phone || null,
      });
    } catch (emailError) {
      console.error('Failed to send owner notification:', emailError);
      // Don't fail registration if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful! You can now log in.',
      user: {
        id: user.id,
        email: email.toLowerCase(),
        name,
        status: 'Active',
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}
