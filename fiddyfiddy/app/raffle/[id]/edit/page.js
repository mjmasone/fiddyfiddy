'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function EditRafflePage() {
  const params = useParams();
  const router = useRouter();
  const [raffle, setRaffle] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRaffle();
  }, [params.id]);

  async function fetchRaffle() {
    try {
      const [raffleRes, qrRes] = await Promise.all([
        fetch(`/api/raffles/${params.id}`),
        fetch(`/api/raffles/${params.id}/qr`),
      ]);

      const raffleData = await raffleRes.json();
      const qrData = await qrRes.json();

      if (raffleData.error) {
        router.push('/dashboard');
        return;
      }

      setRaffle(raffleData);
      setQrCode(qrData);
    } catch (e) {
      setError('Failed to load raffle');
    } finally {
      setLoading(false);
    }
  }

  async function handleActivate() {
    setSaving(true);
    try {
      const res = await fetch(`/api/raffles/${params.id}/activate`, {
        method: 'POST',
      });
      const data = await res.json();
      
      if (data.error) {
        setError(data.message);
      } else {
        router.push('/dashboard');
      }
    } catch (e) {
      setError('Failed to activate');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this raffle? This cannot be undone.')) {
      return;
    }
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/raffles/${params.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      
      if (data.error) {
        setError(data.message);
      } else {
        router.push('/dashboard');
      }
    } catch (e) {
      setError('Failed to delete');
    } finally {
      setDeleting(false);
    }
  }

  async function handleCancel() {
    if (!cancelReason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }
    
    setCancelling(true);
    setError(null);
    try {
      const res = await fetch(`/api/raffles/${params.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });
      const data = await res.json();
      
      if (data.error) {
        setError(data.message);
      } else {
        alert(`Raffle cancelled. ${data.playersNotified} player(s) have been notified.`);
        router.push('/dashboard');
      }
    } catch (e) {
      setError('Failed to cancel raffle');
    } finally {
      setCancelling(false);
    }
  }

  // Format price safely
  function formatPrice(price) {
    const num = parseFloat(price);
    if (isNaN(num)) return '$0';
    return '$' + num.toFixed(2).replace(/\.00$/, '');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  const ticketPrice = parseFloat(raffle?.ticket_price) || 0;
  const maxTickets = raffle?.max_tickets || Math.floor(1200 / (ticketPrice || 1));
  const maxJackpot = (maxTickets * ticketPrice * 0.5).toFixed(2);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
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

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{raffle?.raffle_name || raffle?.beneficiary_name}</h1>
            {raffle?.raffle_name && (
              <p className="text-gray-400">Beneficiary: {raffle?.beneficiary_name}</p>
            )}
            <span className={`badge badge-${raffle?.status?.toLowerCase()}`}>{raffle?.status}</span>
          </div>
        </div>

        {error && (
          <div className="error-box mb-6">
            {error}
          </div>
        )}

        {/* Share Section - Always show for Active raffles */}
        {(raffle?.status === 'Active' || raffle?.status === 'Draft') && qrCode && (
          <div className="card mb-6">
            <h2 className="text-lg font-semibold mb-4">📤 Share This Raffle</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* QR Code */}
              <div className="text-center">
                <img 
                  src={qrCode.qrCode} 
                  alt="QR Code"
                  className="mx-auto mb-2 rounded-lg bg-white p-2"
                  style={{ maxWidth: '180px' }}
                />
                <p className="text-xs text-gray-500">Scan to buy tickets</p>
              </div>
              
              {/* Share Links */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Player Link</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={qrCode.url} 
                      className="input text-sm flex-1"
                      onClick={(e) => e.target.select()}
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(qrCode.url);
                        alert('Link copied!');
                      }}
                      className="btn btn-primary text-sm px-3"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                {raffle?.status === 'Active' && (
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-sm text-gray-400 mb-2">Share via:</p>
                    <div className="flex gap-2">
                      <a 
                        href={`sms:?body=Join our raffle! ${qrCode.url}`}
                        className="btn btn-ghost text-sm flex-1 text-center"
                      >
                        💬 Text
                      </a>
                      <a 
                        href={`mailto:?subject=Join our 50/50 Raffle&body=Buy tickets here: ${qrCode.url}`}
                        className="btn btn-ghost text-sm flex-1 text-center"
                      >
                        ✉️ Email
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Raffle Info */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Raffle Details</h2>
          <div className="space-y-3">
            {raffle?.raffle_name && (
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Raffle Name</span>
                <span>{raffle?.raffle_name}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Beneficiary</span>
              <span>{raffle?.beneficiary_name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Type</span>
              <span>{raffle?.beneficiary_type}</span>
            </div>
            {raffle?.beneficiary_venmo && (
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Beneficiary Venmo</span>
                <span className="text-secondary">@{raffle?.beneficiary_venmo}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Ticket Price</span>
              <span>{formatPrice(ticketPrice)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Max Tickets</span>
              <span>{maxTickets}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Tickets Sold</span>
              <span className="font-bold">{raffle?.tickets_sold || 0}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Current Jackpot</span>
              <span className="font-bold text-emerald-400">
                ${((raffle?.tickets_sold || 0) * ticketPrice * 0.5).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Max Jackpot</span>
              <span className="text-emerald-400">${maxJackpot}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Draw Trigger</span>
              <span>{raffle?.draw_trigger}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Ticket Prefix</span>
              <span className="font-mono">{raffle?.ticket_prefix}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Visibility</span>
              <span>{raffle?.is_public ? 'Public' : 'Private'}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {raffle?.status === 'Draft' && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <Link href="/dashboard" className="btn btn-ghost flex-1 text-center">
                Cancel
              </Link>
              <button
                onClick={handleActivate}
                className="btn btn-success flex-1"
                disabled={saving}
              >
                {saving ? 'Activating...' : '🚀 Activate Raffle'}
              </button>
            </div>
            <button
              onClick={handleDelete}
              className="btn btn-danger w-full"
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : '🗑️ Delete Raffle'}
            </button>
          </div>
        )}

        {raffle?.status === 'Active' && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <Link href={`/raffle/${params.id}/verify`} className="btn btn-ghost flex-1 text-center">
                Verify Tickets
              </Link>
              <Link href={`/raffle/${params.id}/draw`} className="btn btn-primary flex-1 text-center">
                Go to Drawing
              </Link>
            </div>
            <button
              onClick={() => setShowCancelModal(true)}
              className="btn btn-ghost border border-red-500/30 text-red-400 hover:bg-red-500/10 w-full"
            >
              ❌ Cancel Raffle
            </button>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-red-400 mb-4">❌ Cancel Raffle</h3>
              
              <p className="text-gray-400 mb-4">
                Are you sure you want to cancel <strong>{raffle?.raffle_name || raffle?.beneficiary_name}</strong>?
              </p>
              
              <p className="text-gray-400 mb-4 text-sm">
                {raffle?.tickets_sold > 0 ? (
                  <span className="text-amber-400">
                    ⚠️ {raffle.tickets_sold} player(s) will be notified by email about this cancellation.
                  </span>
                ) : (
                  'No players have purchased tickets yet.'
                )}
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Reason for cancellation <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="input w-full h-24 resize-none"
                  placeholder="e.g., Event postponed, Not enough participation, Weather conditions..."
                  required
                />
              </div>
              
              {error && (
                <div className="error-box mb-4 text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                    setError(null);
                  }}
                  className="btn btn-ghost flex-1"
                  disabled={cancelling}
                >
                  Keep Raffle
                </button>
                <button
                  onClick={handleCancel}
                  className="btn btn-danger flex-1"
                  disabled={cancelling || !cancelReason.trim()}
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Raffle'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
