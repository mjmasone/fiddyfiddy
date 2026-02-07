'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function DrawingPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [raffle, setRaffle] = useState(null);
  const [drawStatus, setDrawStatus] = useState(null);
  const [drawnTicket, setDrawnTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(null);
  const [viewingScreenshot, setViewingScreenshot] = useState(null);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  async function fetchData() {
    try {
      const [raffleRes, statusRes, dashRes] = await Promise.all([
        fetch(`/api/raffles/${params.id}`),
        fetch(`/api/draw/${params.id}/status`),
        fetch('/api/dashboard'),
      ]);

      const raffleData = await raffleRes.json();
      const statusData = await statusRes.json();
      const dashData = await dashRes.json();

      if (raffleData.error) {
        router.push('/dashboard');
        return;
      }

      setRaffle(raffleData);
      setDrawStatus(statusData);
      setUser(dashData.user);
    } catch (e) {
      setError('Failed to load raffle');
    } finally {
      setLoading(false);
    }
  }

  async function handleDraw() {
    setDrawing(true);
    setError(null);

    try {
      const res = await fetch(`/api/draw/${params.id}`, {
        method: 'POST',
      });

      const data = await res.json();

      if (data.error) {
        setError(data.message);
        setDrawing(false);
        return;
      }

      setDrawnTicket(data.ticket);
      setDrawStatus(prev => ({
        ...prev,
        drawCount: data.drawNumber,
        redrawsRemaining: prev.redrawsRemaining,
      }));
    } catch (e) {
      setError('Drawing failed');
    } finally {
      setDrawing(false);
    }
  }

  async function handleConfirm() {
    setConfirming(true);
    setError(null);

    try {
      const res = await fetch(`/api/draw/${params.id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: drawnTicket.id }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.message);
        setConfirming(false);
        return;
      }

      // Redirect to payout page
      router.push(`/raffle/${params.id}/payout`);
    } catch (e) {
      setError('Confirmation failed');
      setConfirming(false);
    }
  }

  async function handleRedraw() {
    setDrawing(true);
    setError(null);

    try {
      const res = await fetch(`/api/draw/${params.id}/redraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ticketId: drawnTicket.id,
          reason: 'Payment not confirmed',
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.message);
        setDrawing(false);
        return;
      }

      // Draw new ticket
      setDrawnTicket(data.newTicket);
      setDrawStatus(prev => ({
        ...prev,
        drawCount: data.drawNumber,
        redrawsRemaining: data.redrawsRemaining,
      }));
    } catch (e) {
      setError('Redraw failed');
    } finally {
      setDrawing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  const jackpot = ((raffle?.tickets_sold || 0) * (raffle?.ticket_price || 0) * 0.5).toFixed(2);
  const isPending = user?.status === 'Pending';
  const canDraw = (raffle?.status === 'Active' || raffle?.status === 'Drawing') && !isPending;
  const isComplete = raffle?.status === 'Complete';

  return (
    <div className="min-h-screen">
      {/* Pending User Warning */}
      {isPending && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-3 text-center">
          <p className="text-amber-200 text-sm">
            <strong>⏳ Account Pending:</strong> You cannot draw winners until your account is approved. Contact the Owner for approval.
          </p>
        </div>
      )}

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

      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Pending User Warning */}
        {user?.status === 'Pending' && (
          <div className="error-box mb-6 text-center">
            <p className="text-lg font-semibold mb-2">⏳ Account Pending Approval</p>
            <p className="text-sm">You cannot execute drawings until your account is approved. Please contact the platform owner.</p>
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Drawing</h1>
          <p className="text-gray-400">{raffle?.beneficiary_name}</p>
        </div>

        {/* Jackpot */}
        <div className="card text-center mb-6">
          <p className="text-gray-400 text-sm mb-1">Jackpot</p>
          <p className="jackpot-display">${jackpot}</p>
          <p className="text-gray-400 text-sm mt-2">
            {raffle?.tickets_sold || 0} tickets sold
          </p>
        </div>

        {error && (
          <div className="error-box mb-6">
            {error}
          </div>
        )}

        {/* Complete State */}
        {isComplete && (
          <div className="success-box text-center mb-6">
            <span className="text-4xl block mb-2">✅</span>
            <p className="font-semibold">Drawing Complete</p>
            <p className="text-sm mt-2">Winner has been notified.</p>
            <Link href={`/raffle/${params.id}/report`} className="btn btn-ghost mt-4 inline-block">
              View Report
            </Link>
          </div>
        )}

        {/* Pre-draw state */}
        {!drawnTicket && canDraw && !isComplete && (
          <div className="card text-center">
            <span className="text-6xl block mb-4">🎰</span>
            <h2 className="text-xl font-bold mb-4">Ready to Draw?</h2>
            
            {drawStatus?.minTicketsRequired && raffle.tickets_sold < drawStatus.minTicketsRequired && (
              <div className="warning-box mb-4">
                <p className="text-sm">
                  Minimum {drawStatus.minTicketsRequired} tickets required. 
                  Currently: {raffle.tickets_sold}
                </p>
              </div>
            )}

            <p className="text-gray-400 text-sm mb-6">
              A random ticket will be drawn from {raffle?.tickets_sold || 0} eligible tickets.
            </p>

            <button
              onClick={handleDraw}
              className="btn btn-primary w-full text-lg py-4"
              disabled={drawing || (drawStatus?.minTicketsRequired && raffle.tickets_sold < drawStatus.minTicketsRequired)}
            >
              {drawing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner" />
                  Drawing...
                </span>
              ) : (
                '🎲 Draw Winner'
              )}
            </button>
          </div>
        )}

        {/* Drawn Ticket */}
        {drawnTicket && !isComplete && (
          <div className="card animate-slide-up">
            <div className="text-center mb-6">
              <span className="text-5xl block mb-2">🎉</span>
              <h2 className="text-xl font-bold">Winner Drawn!</h2>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Ticket</span>
                <span className="font-mono font-bold">{drawnTicket.ticket_number}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Player</span>
                <span>{drawnTicket.player_email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Venmo</span>
                <span className="font-semibold">@{drawnTicket.player_venmo}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Txn ID</span>
                <span className="font-mono text-sm">{drawnTicket.venmo_txn_id || '—'}</span>
              </div>
            </div>

            {/* Screenshot */}
            {drawnTicket.screenshot && (
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">Payment Screenshot</p>
                <div 
                  className="bg-white/5 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => setViewingScreenshot(drawnTicket.screenshot)}
                >
                  <img 
                    src={drawnTicket.screenshot} 
                    alt="Payment screenshot"
                    className="max-h-48 mx-auto rounded"
                  />
                  <p className="text-center text-xs text-gray-500 mt-2">Tap to enlarge</p>
                </div>
              </div>
            )}

            {/* Verify Instructions */}
            <div className="info-box mb-6">
              <p className="text-sm">
                <strong>Verify this payment in your Venmo:</strong><br />
                Check your transaction history for a payment from @{drawnTicket.player_venmo}
                {drawnTicket.venmo_txn_id && (
                  <> with Txn ID: <code>{drawnTicket.venmo_txn_id}</code></>
                )}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleRedraw}
                className="btn btn-danger flex-1"
                disabled={drawing || confirming || drawStatus?.redrawsRemaining === 0}
              >
                {drawing ? 'Drawing...' : '✗ Redraw'}
              </button>
              <button
                onClick={handleConfirm}
                className="btn btn-success flex-1"
                disabled={drawing || confirming}
              >
                {confirming ? 'Confirming...' : '✓ Confirm Winner'}
              </button>
            </div>

            {/* Redraws remaining */}
            <p className="text-center text-gray-500 text-sm mt-4">
              Redraws remaining: {drawStatus?.redrawsRemaining ?? 3}
            </p>

            {drawStatus?.redrawsRemaining === 0 && (
              <div className="warning-box mt-4">
                <p className="text-sm">
                  Maximum redraws reached. Contact support if you need assistance.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Draw Log */}
        {drawStatus?.drawLog && drawStatus.drawLog.length > 0 && (
          <div className="card mt-6">
            <h3 className="font-semibold mb-3">Draw Log</h3>
            <div className="space-y-2 text-sm">
              {drawStatus.drawLog.map((entry, i) => (
                <div 
                  key={i}
                  className={`flex justify-between py-2 ${entry.result === 'Winner' ? 'text-emerald-400' : 'text-red-400'}`}
                >
                  <span>Draw {entry.draw_number}: {entry.ticket_number}</span>
                  <span>
                    {entry.result === 'Winner' ? '✓ Winner' : `✗ ${entry.reason || 'Invalid'}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 mt-6">
          <Link href={`/raffle/${params.id}/verify`} className="btn btn-ghost flex-1 text-center">
            ← Verify Tickets
          </Link>
        </div>
      </main>
    </div>
  );
}
