'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function TicketStatusPage() {
  const params = useParams();
  const [ticket, setTicket] = useState(null);
  const [raffle, setRaffle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTicket();
  }, [params.number]);

  async function fetchTicket() {
    try {
      const res = await fetch(`/api/tickets/by-number/${params.number}`);
      const data = await res.json();
      if (data.error) {
        setError(data.message);
      } else {
        setTicket(data.ticket);
        setRaffle(data.raffle);
      }
    } catch (e) {
      setError('Failed to load ticket');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center max-w-md">
          <span className="text-6xl mb-4 block">🎫</span>
          <h1 className="text-2xl font-bold mb-2">Ticket Not Found</h1>
          <p className="text-gray-400 mb-6">{error || 'This ticket number does not exist.'}</p>
          <Link href="/lobby" className="btn btn-primary">
            Browse Raffles
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = {
    Pending: {
      icon: '⏳',
      color: 'text-gray-400',
      badge: 'badge-pending',
      description: 'Awaiting payment verification',
    },
    Verified: {
      icon: '✅',
      color: 'text-blue-400',
      badge: 'badge-verified',
      description: 'Payment submitted, eligible for drawing',
    },
    Confirmed: {
      icon: '🎉',
      color: 'text-emerald-400',
      badge: 'badge-confirmed',
      description: 'Payment confirmed',
    },
    Invalid: {
      icon: '❌',
      color: 'text-red-400',
      badge: 'badge-invalid',
      description: 'Payment could not be verified',
    },
  };

  const status = statusConfig[ticket.status] || statusConfig.Pending;
  const isWinner = raffle?.winning_ticket === ticket.id;
  const jackpot = raffle ? ((raffle.tickets_sold || 0) * raffle.ticket_price * 0.5).toFixed(2) : '0.00';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/lobby" className="flex items-center gap-2 text-gray-400 hover:text-white">
            <span>←</span>
            <span>All Raffles</span>
          </Link>
          <Link href="/lobby" className="flex items-center gap-2">
            <span className="text-2xl">🎟️</span>
            <span className="font-bold text-lg">Fiddyfiddy</span>
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Winner Banner */}
        {isWinner && (
          <div className="success-box mb-6 text-center animate-pulse-glow">
            <span className="text-4xl block mb-2">🏆</span>
            <h2 className="text-2xl font-bold text-emerald-400">YOU WON!</h2>
            <p className="text-emerald-200">Prize: ${jackpot}</p>
          </div>
        )}

        {/* Ticket Card */}
        <div className={`card ${isWinner ? 'border-emerald-500' : ''}`}>
          <div className="text-center mb-6">
            <span className="text-6xl block mb-4">{isWinner ? '🏆' : '🎫'}</span>
            <p className="text-gray-400 text-sm mb-1">Ticket Number</p>
            <p className="text-3xl font-mono font-bold text-secondary">{ticket.ticket_number}</p>
          </div>

          {/* Status */}
          <div className="bg-white/5 rounded-lg p-4 mb-6 text-center">
            <span className={`text-4xl block mb-2 ${status.color}`}>{status.icon}</span>
            <span className={`badge ${status.badge} mb-2`}>{ticket.status}</span>
            <p className="text-gray-400 text-sm">{status.description}</p>
          </div>

          {/* Details */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Raffle</span>
              <span className="font-medium">{raffle?.beneficiary_name || 'Unknown'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Ticket Price</span>
              <span className="font-medium">${raffle?.ticket_price || '0'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Your Venmo</span>
              <span className="font-medium">@{ticket.player_venmo}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Raffle Status</span>
              <span className={`badge ${getRaffleStatusBadge(raffle?.status)}`}>
                {raffle?.status || 'Unknown'}
              </span>
            </div>
            {raffle?.status === 'Active' && (
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Current Jackpot</span>
                <span className="font-bold text-emerald-400">${jackpot}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {ticket.status === 'Pending' && (
          <div className="warning-box mt-6">
            <p className="text-sm">
              <strong>⚠️ Action Required:</strong> Your payment is pending verification. 
              The organizer will review your submission shortly.
            </p>
          </div>
        )}

        {ticket.status === 'Invalid' && (
          <div className="error-box mt-6">
            <p className="text-sm">
              <strong>Payment Not Verified:</strong> Your payment could not be confirmed. 
              If you believe this is an error, please contact the raffle organizer.
            </p>
          </div>
        )}

        <div className="mt-8">
          <Link href="/lobby" className="btn btn-ghost w-full text-center">
            Browse More Raffles
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Fiddyfiddy • Questions? Contact the raffle organizer.</p>
        </div>
      </footer>
    </div>
  );
}

function getRaffleStatusBadge(status) {
  const badges = {
    Draft: 'badge-draft',
    Active: 'badge-active',
    Drawing: 'badge-drawing',
    Complete: 'badge-complete',
    Cancelled: 'badge-cancelled',
  };
  return badges[status] || 'badge-draft';
}
