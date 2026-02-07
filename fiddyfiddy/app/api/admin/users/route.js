import { NextResponse } from 'next/server';
import { requireAuth, hasRole } from '@/lib/auth';
import { getAllUsers, updateUser } from '@/lib/knack';

// GET /api/admin/users - Get all users (Owner only)
export async function GET(request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: true, message: auth.error },
        { status: 401 }
      );
    }

    // Only Owners can access this
    if (!hasRole(auth.user, 'Owner')) {
      return NextResponse.json(
        { error: true, message: 'Not authorized' },
        { status: 403 }
      );
    }

    const users = await getAllUsers();

    return NextResponse.json({
      currentUser: {
        id: auth.user.id,
        email: auth.user.email,
        name: auth.user.name,
        role: auth.user.role,
      },
      users: users.map(u => ({
        id: u.id,
        email: u.field_57,
        name: u.field_60,
        venmo_handle: u.field_61,
        phone: u.field_62,
        role: u.field_59,
        status: u.field_63,
      })),
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users - Update user status (Owner only)
export async function PUT(request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: true, message: auth.error },
        { status: 401 }
      );
    }

    // Only Owners can update users
    if (!hasRole(auth.user, 'Owner')) {
      return NextResponse.json(
        { error: true, message: 'Not authorized' },
        { status: 403 }
      );
    }

    const { userId, status } = await request.json();

    if (!userId || !status) {
      return NextResponse.json(
        { error: true, message: 'userId and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['Pending', 'Active', 'Suspended'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: true, message: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update user status
    await updateUser(userId, { field_63: status });

    return NextResponse.json({
      success: true,
      message: `User status updated to ${status}`,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}
