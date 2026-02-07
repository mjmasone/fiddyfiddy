'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [params.id]);

  async function fetchReport() {
    try {
      const res = await fetch(`/api/raffles/${params.id}/report`);
      const data = await res.json();

      if (data.error) {
        setError(data.message);
        return;
      }

      setReport(data);
    } catch (e) {
      setError('Failed to load report');
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center max-w-md">
          <span className="text-6xl mb-4 block">📊</span>
          <h1 className="text-2xl font-bold mb-2">Report Error</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { raffle, organizer, winner, drawLog, tickets, summary } = report;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white">
            <span>←</span>
            <span>Dashboard</span>
          </Link>
          <button 
            onClick={() => window.print()} 
            className="btn btn-ghost text-sm"
          >
            🖨️ Print Report
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Report Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Raffle Report</h1>
          <p className="text-xl text-gray-400">{raffle.raffle_name || raffle.beneficiary_name}</p>
          <p className="text-gray-500 text-sm mt-2">
            Generated {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <p className="text-gray-400 text-sm">Tickets Sold</p>
            <p className="text-2xl font-bold">{summary.ticketsSold}</p>
          </div>
          <div className="card text-center">
            <p className="text-gray-400 text-sm">Gross Revenue</p>
            <p className="text-2xl font-bold">${summary.grossRevenue}</p>
          </div>
          <div className="card text-center">
            <p className="text-gray-400 text-sm">Jackpot</p>
            <p className="text-2xl font-bold text-emerald-400">${summary.jackpot}</p>
          </div>
          <div className="card text-center">
            <p className="text-gray-400 text-sm">Net to Beneficiary</p>
            <p className="text-2xl font-bold text-primary">${summary.netToBeneficiary}</p>
          </div>
        </div>

        {/* Organizer & Beneficiary Info */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Organizer */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">👤 Organizer</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Name</span>
                <span>{organizer?.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Email</span>
                <span>{organizer?.email || '—'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Venmo</span>
                <span>@{organizer?.venmo_handle || '—'}</span>
              </div>
            </div>
          </div>

          {/* Beneficiary */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">🎁 Beneficiary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Name</span>
                <span>{raffle.beneficiary_name}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Type</span>
                <span>{raffle.beneficiary_type}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Venmo</span>
                <span>@{raffle.beneficiary_venmo || '—'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Amount Due</span>
                <span className="font-bold text-primary">${summary.netToBeneficiary}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Winner */}
        {winner && (
          <div className="card mb-8">
            <h2 className="text-lg font-semibold mb-4">🏆 Winner</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Ticket Number</p>
                <p className="font-mono font-bold">{winner.ticket_number}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p>{winner.player_email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Venmo</p>
                <p>@{winner.player_venmo}</p>
              </div>
            </div>
          </div>
        )}

        {/* Draw Log */}
        {drawLog && drawLog.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-lg font-semibold mb-4">📋 Drawing Log</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Draw</th>
                  <th>Ticket</th>
                  <th>Result</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {drawLog.map((entry, i) => (
                  <tr key={i}>
                    <td>{entry.draw_number}</td>
                    <td className="font-mono">{entry.ticket_number}</td>
                    <td>
                      <span className={entry.result === 'Winner' ? 'text-emerald-400' : 'text-red-400'}>
                        {entry.result === 'Winner' ? '✓ Winner' : '✗ Invalid'}
                      </span>
                    </td>
                    <td className="text-gray-400">{entry.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Raffle Details */}
        <div className="card mb-8">
          <h2 className="text-lg font-semibold mb-4">📊 Raffle Details</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Ticket Price</span>
              <span>${raffle.ticket_price}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Max Tickets</span>
              <span>{raffle.max_tickets}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Draw Trigger</span>
              <span>{raffle.draw_trigger}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Status</span>
              <span className="badge badge-complete">{raffle.status}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Created</span>
              <span>{new Date(raffle.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Drawn</span>
              <span>{raffle.drawn_at ? new Date(raffle.drawn_at).toLocaleDateString() : '—'}</span>
            </div>
          </div>
        </div>

        {/* Ticket List */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">🎟️ All Tickets ({tickets.length})</h2>
          <div className="table-responsive">
            <table className="table text-sm">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Email</th>
                  <th>Venmo</th>
                  <th>Status</th>
                  <th>Paid To</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className={ticket.id === winner?.id ? 'bg-emerald-500/10' : ''}>
                    <td className="font-mono">
                      {ticket.ticket_number}
                      {ticket.id === winner?.id && <span className="ml-2">🏆</span>}
                    </td>
                    <td>{ticket.player_email}</td>
                    <td>@{ticket.player_venmo}</td>
                    <td>
                      <span className={`badge badge-${ticket.status.toLowerCase()}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td>{ticket.payment_recipient}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compliance Note */}
        <div className="info-box mt-8 text-sm">
          <p>
            <strong>Compliance Note:</strong> This raffle's jackpot was ${summary.jackpot} 
            (under the $600 IRS reporting threshold). No Form W-2G required.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>Report generated by Fiddyfiddy • fiddyfiddy.org</p>
        </div>
      </main>
    </div>
  );
}
