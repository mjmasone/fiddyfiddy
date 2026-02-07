'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function PayoutPage() {
  const params = useParams();
  const router = useRouter();
  const [raffle, setRaffle] = useState(null);
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  async function fetchData() {
    try {
      const res = await fetch(`/api/raffles/${params.id}/payout-info`);
      const data = await res.json();

      if (data.error) {
        router.push('/dashboard');
        return;
      }

      setRaffle(data.raffle);
      setWinner(data.winner);
      setConfirmed(data.raffle.payout_confirmed);
    } catch (e) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    setConfirming(true);
    setError(null);

    try {
      const res = await fetch(`/api/raffles/${params.id}/confirm-payout`, {
        method: 'POST',
      });

      const data = await res.json();

      if (data.error) {
        setError(data.message);
        setConfirming(false);
        return;
      }

      setConfirmed(true);
    } catch (e) {
      setError('Failed to confirm payout');
      setConfirming(false);
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

      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Payout Winner</h1>
          <p className="text-gray-400">{raffle?.beneficiary_name}</p>
        </div>

        {confirmed ? (
          <div className="card text-center animate-slide-up">
            <span className="text-6xl block mb-4">✅</span>
            <h2 className="text-xl font-bold text-emerald-400 mb-2">Payment Confirmed!</h2>
            <p className="text-gray-400 mb-6">
              Thank you for completing the payout. A report has been generated.
            </p>
            <Link href={`/raffle/${params.id}/report`} className="btn btn-primary">
              View Report
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="error-box mb-6">
                {error}
              </div>
            )}

            {/* Winner Info */}
            <div className="card mb-6">
              <h2 className="text-lg font-semibold mb-4">Winner Details</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Ticket</span>
                  <span className="font-mono font-bold">{winner?.ticket_number}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Email</span>
                  <span>{winner?.player_email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Venmo</span>
                  <span className="font-semibold text-secondary">@{winner?.player_venmo}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Jackpot Amount</span>
                  <span className="text-2xl font-bold text-emerald-400">${jackpot}</span>
                </div>
              </div>
            </div>

            {/* Pay Winner Button */}
            <a
              href={`venmo://paycharge?txn=pay&recipients=${winner?.player_venmo}&amount=${jackpot}&note=${encodeURIComponent(`Fiddyfiddy Winner - ${winner?.ticket_number}`)}`}
              className="btn btn-primary w-full text-lg py-4 mb-6 flex items-center justify-center gap-2"
            >
              💸 Pay Winner via Venmo - ${jackpot}
            </a>

            {/* Instructions */}
            <div className="card mb-6">
              <h2 className="text-lg font-semibold mb-4">Instructions</h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-300">
                <li>Click the button above to open Venmo (or open manually)</li>
                <li>Verify you're sending <strong>${jackpot}</strong> to <strong>@{winner?.player_venmo}</strong></li>
                <li>The note should say: <code className="bg-white/10 px-2 py-1 rounded text-sm">Fiddyfiddy Winner - {winner?.ticket_number}</code></li>
                <li>Complete the payment in Venmo</li>
                <li>Return here and click "Confirm Payment Sent"</li>
              </ol>
            </div>

            {/* Warning */}
            <div className="warning-box mb-6">
              <p className="text-sm">
                <strong>⏰ Deadline:</strong> You must complete this payout within <strong>48 hours</strong> of the drawing.
              </p>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirm}
              className="btn btn-success w-full text-lg py-4"
              disabled={confirming}
            >
              {confirming ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner" />
                  Confirming...
                </span>
              ) : (
                '✓ Confirm Payment Sent'
              )}
            </button>
          </>
        )}
      </main>
    </div>
  );
}
