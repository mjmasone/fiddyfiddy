'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();

      if (data.error) {
        // Not authenticated, redirect to login
        router.push('/login');
        return;
      }

      setUser(data.user);
      setRaffles(data.raffles);
    } catch (e) {
      router.push('/login');
    } finally {
      setLoading(false);
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

  const activeRaffles = raffles.filter(r => r.status === 'Active');
  const draftRaffles = raffles.filter(r => r.status === 'Draft');
  const completedRaffles = raffles.filter(r => r.status === 'Complete' || r.status === 'Cancelled');

  return (
    <div className="min-h-screen">
      {/* Pending Status Banner */}
      {user?.status === 'Pending' && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-3 text-center">
          <p className="text-amber-200 text-sm">
            <strong>⏳ Account Pending:</strong> You can create raffles and sell tickets, but you cannot draw winners until your account is approved.
          </p>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🎟️</span>
            <span className="font-bold text-lg">Fiddyfiddy</span>
          </Link>
          <div className="flex items-center gap-4">
            {user?.role === 'Owner' && (
              <Link href="/admin/users" className="text-amber-400 hover:text-amber-300 text-sm font-medium">
                👥 Manage Users
              </Link>
            )}
            <span className="text-gray-400 text-sm">
              {user?.name || user?.email}
            </span>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-400">Manage your raffles</p>
          </div>
          <Link href="/raffle/new" className="btn btn-primary">
            + New Raffle
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card text-center">
            <p className="text-4xl font-bold text-emerald-400">{activeRaffles.length}</p>
            <p className="text-gray-400">Active</p>
          </div>
          <div className="card text-center">
            <p className="text-4xl font-bold text-amber-400">{draftRaffles.length}</p>
            <p className="text-gray-400">Drafts</p>
          </div>
          <div className="card text-center">
            <p className="text-4xl font-bold text-primary">{completedRaffles.length}</p>
            <p className="text-gray-400">Completed</p>
          </div>
        </div>

        {/* Active Raffles */}
        {activeRaffles.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="badge badge-active">Active</span>
              Raffles
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {activeRaffles.map(raffle => (
                <RaffleCard key={raffle.id} raffle={raffle} />
              ))}
            </div>
          </section>
        )}

        {/* Draft Raffles */}
        {draftRaffles.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="badge badge-draft">Draft</span>
              Raffles
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {draftRaffles.map(raffle => (
                <RaffleCard key={raffle.id} raffle={raffle} />
              ))}
            </div>
          </section>
        )}

        {/* Completed Raffles */}
        {completedRaffles.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="badge badge-complete">Completed</span>
              Raffles
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {completedRaffles.map(raffle => (
                <RaffleCard key={raffle.id} raffle={raffle} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {raffles.length === 0 && (
          <div className="card text-center py-16">
            <span className="text-6xl mb-4 block">🎯</span>
            <h3 className="text-xl font-semibold mb-2">No raffles yet</h3>
            <p className="text-gray-400 mb-6">Create your first raffle to start raising money!</p>
            <Link href="/raffle/new" className="btn btn-primary">
              Create Raffle
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function RaffleCard({ raffle }) {
  const jackpot = ((raffle.tickets_sold || 0) * raffle.ticket_price * 0.5).toFixed(2);
  const statusBadge = {
    Draft: 'badge-draft',
    Active: 'badge-active',
    Drawing: 'badge-drawing',
    Complete: 'badge-complete',
    Cancelled: 'badge-cancelled',
  }[raffle.status] || 'badge-draft';

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <Link href={`/raffle/${raffle.id}/edit`} className="font-bold text-lg hover:text-primary transition-colors">
            {raffle.raffle_name || raffle.beneficiary_name}
          </Link>
          {raffle.raffle_name && raffle.beneficiary_name && (
            <p className="text-gray-400 text-sm">{raffle.beneficiary_name}</p>
          )}
          <span className={`badge ${statusBadge} text-xs`}>{raffle.status}</span>
        </div>
        <span className="text-2xl font-bold text-emerald-400">${jackpot}</span>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm mb-4">
        <div>
          <p className="text-gray-400">Price</p>
          <p className="font-semibold">${raffle.ticket_price}</p>
        </div>
        <div>
          <p className="text-gray-400">Sold</p>
          <p className="font-semibold">{raffle.tickets_sold || 0}</p>
        </div>
        <div>
          <p className="text-gray-400">Max</p>
          <p className="font-semibold">{raffle.max_tickets}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {raffle.status === 'Draft' && (
          <>
            <Link href={`/raffle/${raffle.id}/edit`} className="btn btn-ghost flex-1 text-center text-sm">
              Edit
            </Link>
            <Link href={`/raffle/${raffle.id}/edit`} className="btn btn-success flex-1 text-center text-sm">
              Activate
            </Link>
          </>
        )}
        {raffle.status === 'Active' && (
          <>
            <Link href={`/raffle/${raffle.id}/edit`} className="btn btn-ghost flex-1 text-center text-sm">
              Details
            </Link>
            <Link href={`/raffle/${raffle.id}/flyer`} className="btn btn-ghost flex-1 text-center text-sm">
              Flyer
            </Link>
            <Link href={`/raffle/${raffle.id}/verify`} className="btn btn-ghost flex-1 text-center text-sm">
              Verify
            </Link>
            <Link href={`/raffle/${raffle.id}/draw`} className="btn btn-primary flex-1 text-center text-sm">
              Draw
            </Link>
          </>
        )}
        {raffle.status === 'Complete' && (
          <>
            <Link href={`/raffle/${raffle.id}/edit`} className="btn btn-ghost flex-1 text-center text-sm">
              Details
            </Link>
            <Link href={`/raffle/${raffle.id}/report`} className="btn btn-primary flex-1 text-center text-sm">
              Report
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
