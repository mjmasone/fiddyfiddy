'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function ConfirmTicketPage() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState(null);
  const [pendingInfo, setPendingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    txnId: '',
    screenshot: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmForm, setShowConfirmForm] = useState(false);

  useEffect(() => {
    // Get pending tickets from session storage
    const pending = sessionStorage.getItem('pendingTickets');
    if (pending) {
      setPendingInfo(JSON.parse(pending));
    }
    fetchTicket(params.ticket);
  }, [params.ticket]);

  async function fetchTicket(ticketParam) {
    try {
      // Check if it looks like a ticket number (contains dashes) vs a Knack ID
      const isTicketNumber = ticketParam.includes('-');
      
      let res;
      if (isTicketNumber) {
        // Fetch by ticket number
        res = await fetch(`/api/tickets/by-number/${ticketParam}`);
      } else {
        // Fetch by Knack record ID
        res = await fetch(`/api/tickets/${ticketParam}`);
      }
      
      const data = await res.json();
      if (data.error) {
        // If ID fetch failed, try by number as fallback
        if (!isTicketNumber) {
          const fallbackRes = await fetch(`/api/tickets/by-number/${ticketParam}`);
          const fallbackData = await fallbackRes.json();
          if (!fallbackData.error) {
            // by-number returns { ticket: {...}, raffle: {...} }
            setTicket(fallbackData.ticket);
            return;
          }
        }
        setError(data.message);
      } else {
        // Normalize response - by-number returns { ticket, raffle }, by-id returns ticket directly
        const ticketData = data.ticket || data;
        setTicket(ticketData);
      }
    } catch (e) {
      setError('Failed to load ticket');
    } finally {
      setLoading(false);
    }
  }

  function handlePayNow() {
    if (pendingInfo?.venmoUrl) {
      // Open Venmo in new tab so they can return here easily
      window.open(pendingInfo.venmoUrl, '_blank');
      setShowConfirmForm(true);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!formData.txnId && !formData.screenshot) {
      setError('Please provide either a Transaction ID or screenshot');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const submitData = new FormData();
      submitData.append('ticketId', ticket.id);
      if (formData.txnId) {
        submitData.append('txnId', formData.txnId);
      }
      if (formData.screenshot) {
        submitData.append('screenshot', formData.screenshot);
      }

      const res = await fetch(`/api/tickets/${ticket.id}/verify`, {
        method: 'POST',
        body: submitData,
      });

      const data = await res.json();

      if (data.error) {
        setError(data.message);
        setSubmitting(false);
        return;
      }

      // Clear session storage
      sessionStorage.removeItem('pendingTickets');
      setSubmitted(true);

    } catch (e) {
      setError('Failed to submit verification');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center max-w-md">
          <span className="text-6xl mb-4 block">😕</span>
          <h1 className="text-2xl font-bold mb-2">Ticket Not Found</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/lobby" className="btn btn-primary">
            Browse Raffles
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center max-w-md animate-slide-up">
          <span className="text-6xl mb-4 block">✅</span>
          <h1 className="text-2xl font-bold mb-2">Payment Submitted!</h1>
          <p className="text-gray-400 mb-6">
            Your ticket has been recorded. You'll receive a confirmation email shortly.
          </p>
          
          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <p className="text-gray-400 text-sm mb-1">Your Ticket Number</p>
            <p className="text-2xl font-mono font-bold text-secondary">{ticket.ticket_number}</p>
          </div>

          <div className="flex flex-col gap-3">
            <Link href={`/ticket/${ticket.ticket_number}`} className="btn btn-primary">
              Check Ticket Status
            </Link>
            <Link href="/lobby" className="btn btn-ghost">
              Browse More Raffles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/r/${params.id}`} className="flex items-center gap-2 text-gray-400 hover:text-white">
            <span>←</span>
            <span>Back to Raffle</span>
          </Link>
          <Link href="/lobby" className="flex items-center gap-2">
            <span className="text-2xl">🎟️</span>
            <span className="font-bold text-lg">Fiddyfiddy</span>
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">🎟️</span>
          <h1 className="text-2xl font-bold mb-2">Your Ticket is Reserved!</h1>
          <p className="text-gray-400">Complete your payment to confirm.</p>
        </div>

        {/* Ticket Info */}
        <div className="card mb-6 text-center">
          <p className="text-gray-400 text-sm mb-1">Your Ticket Number</p>
          <p className="text-2xl font-mono font-bold text-secondary">{ticket?.ticket_number}</p>
          {pendingInfo?.totalAmount && (
            <p className="text-gray-400 text-sm mt-2">
              Amount Due: <span className="font-bold text-white">${pendingInfo.totalAmount.toFixed(2)}</span>
            </p>
          )}
        </div>

        {/* Step 1: Pay via Venmo */}
        {!showConfirmForm && (
          <div className="card mb-6">
            <h2 className="text-lg font-semibold mb-4">Step 1: Pay with Venmo</h2>
            <p className="text-gray-400 text-sm mb-4">
              Click below to open Venmo and send payment. Then return here to confirm.
            </p>
            <button
              onClick={handlePayNow}
              className="btn btn-primary w-full text-lg py-4"
            >
              💸 Pay ${pendingInfo?.totalAmount?.toFixed(2) || '0.00'} via Venmo
            </button>
            <p className="text-center text-gray-500 text-xs mt-3">
              Already paid? <button onClick={() => setShowConfirmForm(true)} className="text-primary hover:underline">Skip to confirmation</button>
            </p>
          </div>
        )}

        {/* Step 2: Confirm Payment */}
        {showConfirmForm && (
          <>
            <div className="success-box mb-6 text-center">
              <span className="text-2xl block mb-2">💸</span>
              <p className="font-semibold">Venmo opened!</p>
              <p className="text-sm mt-1">After paying, confirm below.</p>
            </div>

            {error && (
              <div className="error-box mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="card">
              <h2 className="text-lg font-semibold mb-4">Step 2: Confirm Your Payment</h2>
              
              {/* Transaction ID */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">
                  Venmo Transaction ID <span className="text-secondary">(Preferred)</span>
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., 3847291847..."
                  value={formData.txnId}
                  onChange={(e) => setFormData({ ...formData, txnId: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Find this in your Venmo app: tap the payment → view transaction details
                </p>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-gray-500 text-sm">OR</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Screenshot Upload */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">
                  Upload Screenshot
                </label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="screenshot"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData({ ...formData, screenshot: file });
                      }
                    }}
                  />
                  <label htmlFor="screenshot" className="cursor-pointer">
                    {formData.screenshot ? (
                      <div>
                        <span className="text-emerald-400">✓ {formData.screenshot.name}</span>
                        <p className="text-xs text-gray-500 mt-1">Click to change</p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl block mb-2">📷</span>
                        <p className="text-gray-400">Click to upload screenshot</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-success w-full text-lg py-4"
                disabled={submitting || (!formData.txnId && !formData.screenshot)}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner" />
                    Submitting...
                  </span>
                ) : (
                  '✓ Confirm Payment'
                )}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
