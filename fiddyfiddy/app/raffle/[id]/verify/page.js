'use client';

import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function VerifyTicketsPage() {
  const params = useParams();
  const router = useRouter();
  const [raffle, setRaffle] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState(new Set());
  const [viewingScreenshot, setViewingScreenshot] = useState(null);
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  async function fetchData() {
    try {
      const [raffleRes, ticketsRes] = await Promise.all([
        fetch(`/api/raffles/${params.id}`),
        fetch(`/api/raffles/${params.id}/pending-tickets`),
      ]);

      const raffleData = await raffleRes.json();
      const ticketsData = await ticketsRes.json();

      if (raffleData.error) {
        router.push('/dashboard');
        return;
      }

      setRaffle(raffleData);
      setTickets(ticketsData.tickets || []);
    } catch (e) {
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  function toggleTicket(ticketId) {
    const newSelected = new Set(selectedTickets);
    if (newSelected.has(ticketId)) {
      newSelected.delete(ticketId);
    } else {
      newSelected.add(ticketId);
    }
    setSelectedTickets(newSelected);
  }

  function selectAll() {
    if (selectedTickets.size === tickets.length) {
      setSelectedTickets(new Set());
    } else {
      setSelectedTickets(new Set(tickets.map(t => t.id)));
    }
  }

  async function verifySelected() {
    if (selectedTickets.size === 0) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/raffles/${params.id}/verify-tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketIds: Array.from(selectedTickets) }),
      });

      const data = await res.json();
      if (!data.error) {
        // Refresh data
        await fetchData();
        setSelectedTickets(new Set());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function verifySingle(ticketId) {
    setActionLoading(ticketId);
    try {
      const res = await fetch(`/api/raffles/${params.id}/verify-tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketIds: [ticketId] }),
      });

      const data = await res.json();
      if (!data.error) {
        await fetchData();
        setExpandedTicket(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  }

  async function rejectSingle(ticketId) {
    if (!confirm('Reject this ticket? This will mark it as invalid and it will not be included in the drawing.')) {
      return;
    }
    
    setActionLoading(ticketId);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });

      const data = await res.json();
      if (!data.error) {
        await fetchData();
        setExpandedTicket(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  }

  function toggleExpand(ticketId) {
    setExpandedTicket(expandedTicket === ticketId ? null : ticketId);
  }

  function formatDate(dateString) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Screenshot Modal */}
      {viewingScreenshot && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingScreenshot(null)}
        >
          <div className="max-w-2xl max-h-[90vh] overflow-auto">
            <img 
              src={viewingScreenshot} 
              alt="Payment screenshot" 
              className="rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white">
            <span>←</span>
            <span>Dashboard</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🎟️</span>
            <span className="font-bold text-lg">Fiddyfiddy</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Verify Tickets</h1>
            <p className="text-gray-400">{raffle?.beneficiary_name}</p>
          </div>
          <Link href={`/raffle/${params.id}/draw`} className="btn btn-primary">
            Go to Drawing →
          </Link>
        </div>

        {tickets.length === 0 ? (
          <div className="card text-center py-16">
            <span className="text-6xl mb-4 block">✅</span>
            <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
            <p className="text-gray-400">No pending tickets to verify.</p>
          </div>
        ) : (
          <>
            {/* Actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-400">
                {tickets.length} pending ticket{tickets.length !== 1 ? 's' : ''}
                {selectedTickets.size > 0 && (
                  <span className="text-white ml-2">
                    ({selectedTickets.size} selected)
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="btn btn-ghost text-sm"
                >
                  {selectedTickets.size === tickets.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={verifySelected}
                  className="btn btn-success text-sm"
                  disabled={selectedTickets.size === 0 || saving}
                >
                  {saving ? 'Saving...' : `Verify ${selectedTickets.size > 0 ? `(${selectedTickets.size})` : ''}`}
                </button>
              </div>
            </div>

            {/* Tickets Table */}
            <div className="card overflow-hidden">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="w-12">
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={selectedTickets.size === tickets.length}
                          onChange={selectAll}
                        />
                      </th>
                      <th>Ticket</th>
                      <th>Player</th>
                      <th>Venmo</th>
                      <th>Purchased</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map(ticket => (
                      <Fragment key={ticket.id}>
                        <tr 
                          className={`cursor-pointer hover:bg-white/5 transition-colors ${expandedTicket === ticket.id ? 'bg-white/5' : ''}`}
                          onClick={() => toggleExpand(ticket.id)}
                        >
                          <td onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              className="checkbox"
                              checked={selectedTickets.has(ticket.id)}
                              onChange={() => toggleTicket(ticket.id)}
                            />
                          </td>
                          <td className="font-mono text-sm font-semibold">{ticket.ticket_number}</td>
                          <td className="text-sm">{ticket.player_email}</td>
                          <td className="text-sm">@{ticket.player_venmo}</td>
                          <td className="text-sm text-gray-400">{formatDate(ticket.created_at)}</td>
                          <td className="text-right">
                            <span className={`transition-transform inline-block ${expandedTicket === ticket.id ? 'rotate-180' : ''}`}>
                              ▼
                            </span>
                          </td>
                        </tr>
                        
                        {/* Expanded Row */}
                        {expandedTicket === ticket.id && (
                          <tr className="bg-white/5">
                            <td colSpan="6" className="p-0">
                              <div className="p-4 border-t border-white/10">
                                <div className="grid md:grid-cols-2 gap-6">
                                  {/* Left: Details */}
                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-sm text-gray-400 uppercase tracking-wide">Ticket Details</h4>
                                    
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <p className="text-gray-400">Ticket Number</p>
                                        <p className="font-mono font-semibold">{ticket.ticket_number}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-400">Status</p>
                                        <p><span className="badge badge-draft">Pending</span></p>
                                      </div>
                                      <div>
                                        <p className="text-gray-400">Player Email</p>
                                        <p>{ticket.player_email}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-400">Player Venmo</p>
                                        <p>@{ticket.player_venmo}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-400">Transaction ID</p>
                                        <p className="font-mono">{ticket.venmo_txn_id || <span className="text-gray-500">Not provided</span>}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-400">Purchased</p>
                                        <p>{formatDate(ticket.created_at)}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Right: Screenshot + Actions */}
                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-sm text-gray-400 uppercase tracking-wide">Payment Proof</h4>
                                    
                                    {ticket.screenshot ? (
                                      <div 
                                        className="cursor-pointer group"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setViewingScreenshot(ticket.screenshot);
                                        }}
                                      >
                                        <img 
                                          src={ticket.screenshot} 
                                          alt="Payment screenshot" 
                                          className="rounded-lg max-h-40 object-cover border border-white/10 group-hover:border-secondary transition-colors"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Click to enlarge</p>
                                      </div>
                                    ) : (
                                      <div className="bg-white/5 rounded-lg p-6 text-center">
                                        <span className="text-3xl block mb-2">📷</span>
                                        <p className="text-gray-400 text-sm">No screenshot uploaded</p>
                                      </div>
                                    )}
                                    
                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          verifySingle(ticket.id);
                                        }}
                                        disabled={actionLoading === ticket.id}
                                        className="btn btn-success flex-1"
                                      >
                                        {actionLoading === ticket.id ? 'Saving...' : '✓ Verify'}
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          rejectSingle(ticket.id);
                                        }}
                                        disabled={actionLoading === ticket.id}
                                        className="btn btn-ghost border border-red-500/30 text-red-400 hover:bg-red-500/10 flex-1"
                                      >
                                        ✗ Reject
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
