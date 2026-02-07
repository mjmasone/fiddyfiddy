'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('Pending'); // Pending, Active, Suspended, all

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();

      if (data.error) {
        if (data.message === 'Not authorized') {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
        return;
      }

      setUser(data.currentUser);
      setUsers(data.users);
    } catch (e) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(userId, newStatus) {
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        // Update local state
        setUsers(users.map(u => 
          u.id === userId ? { ...u, status: newStatus } : u
        ));
      }
    } catch (e) {
      console.error('Failed to update user:', e);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  const filteredUsers = filter === 'all' 
    ? users 
    : users.filter(u => u.status === filter);

  const pendingCount = users.filter(u => u.status === 'Pending').length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🎟️</span>
            <span className="font-bold text-lg">Fiddyfiddy</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">
              Dashboard
            </Link>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-gray-400">Approve and manage organizers</p>
          </div>
          {pendingCount > 0 && (
            <div className="badge badge-drawing text-lg px-4 py-2">
              {pendingCount} Pending Approval
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['Pending', 'Active', 'Suspended', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-primary text-white'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {status === 'all' ? 'All Users' : status}
              {status === 'Pending' && pendingCount > 0 && (
                <span className="ml-2 bg-amber-500 text-dark px-2 py-0.5 rounded-full text-xs">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="card text-center py-12">
            <span className="text-4xl block mb-4">👥</span>
            <p className="text-gray-400">No {filter === 'all' ? '' : filter.toLowerCase()} users found</p>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Venmo</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="font-medium">{u.name}</td>
                      <td className="text-gray-400">{u.email}</td>
                      <td>@{u.venmo_handle}</td>
                      <td>
                        <span className={`badge ${u.role === 'Owner' ? 'badge-complete' : 'badge-active'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(u.status)}`}>
                          {u.status}
                        </span>
                      </td>
                      <td>
                        {u.role !== 'Owner' && (
                          <div className="flex gap-2">
                            {u.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(u.id, 'Active')}
                                  disabled={actionLoading === u.id}
                                  className="btn btn-success text-xs py-1 px-3"
                                >
                                  {actionLoading === u.id ? '...' : 'Approve'}
                                </button>
                                <button
                                  onClick={() => handleStatusChange(u.id, 'Suspended')}
                                  disabled={actionLoading === u.id}
                                  className="btn btn-danger text-xs py-1 px-3"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {u.status === 'Active' && (
                              <button
                                onClick={() => handleStatusChange(u.id, 'Suspended')}
                                disabled={actionLoading === u.id}
                                className="btn btn-danger text-xs py-1 px-3"
                              >
                                Suspend
                              </button>
                            )}
                            {u.status === 'Suspended' && (
                              <button
                                onClick={() => handleStatusChange(u.id, 'Active')}
                                disabled={actionLoading === u.id}
                                className="btn btn-success text-xs py-1 px-3"
                              >
                                Reactivate
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="info-box mt-8">
          <h3 className="font-semibold mb-2">📋 Status Meanings</h3>
          <ul className="text-sm space-y-1 text-gray-300">
            <li><strong className="text-amber-400">Pending:</strong> Can create raffles and sell tickets, but cannot execute drawings</li>
            <li><strong className="text-emerald-400">Active:</strong> Full access to all features</li>
            <li><strong className="text-red-400">Suspended:</strong> Cannot log in or access any features</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

function getStatusBadge(status) {
  switch (status) {
    case 'Pending': return 'badge-drawing';
    case 'Active': return 'badge-active';
    case 'Suspended': return 'badge-cancelled';
    default: return 'badge-draft';
  }
}
