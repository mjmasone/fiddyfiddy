'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function RafflePage() {
  const params = useParams();
  const router = useRouter();
  const [raffle, setRaffle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    venmo: '',
    state: '',
    ageConfirmed: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchRaffle();
  }, [params.id]);

  async function fetchRaffle() {
    try {
      const res = await fetch(`/api/raffles/${params.id}`);
      const data = await res.json();
      if (data.error) {
        setError(data.message);
      } else {
        setRaffle(data);
      }
    } catch (e) {
      setError('Failed to load raffle');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      // Buy multiple tickets sequentially
      const tickets = [];
      for (let i = 0; i < quantity; i++) {
        const res = await fetch('/api/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            raffleId: params.id,
            email: formData.email,
            venmo: formData.venmo.replace(/^@/, ''),
            state: formData.state,
          }),
        });

        const data = await res.json();

        if (data.error) {
          setSubmitError(data.message);
          setSubmitting(false);
          return;
        }
        
        tickets.push(data);
      }

      // Store tickets for confirmation
      const ticketPrice = parseFloat(raffle.ticket_price) || 0;
      const totalAmount = ticketPrice * quantity;
      
      // Store pending tickets info
      sessionStorage.setItem('pendingTickets', JSON.stringify({
        tickets: tickets.map(t => ({
          ticketId: t.ticket.id,
          ticketNumber: t.ticket.ticket_number,
        })),
        raffleId: params.id,
        totalAmount: totalAmount,
        venmoUrl: tickets[0].venmoUrl.replace(/amount=[\d.]+/, `amount=${totalAmount}`),
      }));

      // Redirect to confirm page (first ticket)
      router.push(`/r/${params.id}/confirm/${tickets[0].ticket.id}`);

    } catch (e) {
      setSubmitError('Failed to create ticket');
      setSubmitting(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (error || !raffle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center max-w-md">
          <span className="text-6xl mb-4 block">😕</span>
          <h1 className="text-2xl font-bold mb-2">Raffle Not Found</h1>
          <p className="text-gray-400 mb-6">{error || 'This raffle does not exist or is no longer active.'}</p>
          <Link href="/lobby" className="btn btn-primary">
            Browse Raffles
          </Link>
        </div>
      </div>
    );
  }

  const ticketPrice = parseFloat(raffle.ticket_price) || 0;
  const ticketsRemaining = raffle.max_tickets - (raffle.tickets_sold || 0);
  const jackpot = ((raffle.tickets_sold || 0) * ticketPrice * 0.5).toFixed(2);
  const isSoldOut = ticketsRemaining <= 0;
  const isActive = raffle.status === 'Active';
  const maxPurchase = Math.min(10, ticketsRemaining);

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

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Share Button */}
        <div className="flex justify-center mb-4">
          <button
            onClick={copyLink}
            className="btn btn-ghost text-sm flex items-center gap-2"
          >
            {copied ? '✓ Link Copied!' : '🔗 Share Raffle Link'}
          </button>
        </div>

        {/* Raffle Info */}
        <div className="text-center mb-8">
          {raffle.logo ? (
            <img
              src={raffle.logo}
              alt={raffle.beneficiary_name}
              className="w-24 h-24 rounded-xl mx-auto mb-4 object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-primary/20 mx-auto mb-4 flex items-center justify-center text-5xl">
              🎯
            </div>
          )}
          <h1 className="text-3xl font-bold mb-2">{raffle.beneficiary_name}</h1>
          <span className="badge badge-active">{raffle.beneficiary_type}</span>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card text-center">
            <p className="text-gray-400 text-sm mb-1">Ticket Price</p>
            <p className="text-2xl font-bold">${ticketPrice}</p>
          </div>
          <div className="card text-center">
            <p className="text-gray-400 text-sm mb-1">Current Jackpot</p>
            <p className="jackpot-display text-3xl">${jackpot}</p>
          </div>
          <div className="card text-center">
            <p className="text-gray-400 text-sm mb-1">Tickets Left</p>
            <p className="text-2xl font-bold">{ticketsRemaining}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="card mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>{raffle.tickets_sold || 0} sold</span>
            <span>{raffle.max_tickets} max</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
              style={{ width: `${((raffle.tickets_sold || 0) / raffle.max_tickets) * 100}%` }}
            />
          </div>
        </div>
        {/* Urgency messaging - shows when 70%+ sold */}
        {(() => {
          const percentSold = ((raffle.tickets_sold || 0) / raffle.max_tickets) * 100;
          const threshold = 70; // TODO Phase 2: pull from raffle.urgency_threshold
          if (percentSold >= threshold && ticketsRemaining > 0) {
            return (
              <p className="text-gray-300 text-sm mt-2 text-center">
                🎟️ {ticketsRemaining} tickets remaining • Jackpot: ${jackpot}
              </p>
            );
          }
          return null;
        })()}

        {/* Purchase Form or Status */}
        {!isActive ? (
          <div className="card text-center">
            <span className="text-4xl mb-4 block">🔒</span>
            <h2 className="text-xl font-bold mb-2">Raffle Closed</h2>
            <p className="text-gray-400">This raffle is no longer accepting tickets.</p>
          </div>
        ) : isSoldOut ? (
          <div className="card text-center">
            <span className="text-4xl mb-4 block">🎉</span>
            <h2 className="text-xl font-bold mb-2">Sold Out!</h2>
            <p className="text-gray-400">All tickets have been purchased. Good luck to all players!</p>
          </div>
        ) : (
          <div className="card">
            <h2 className="text-xl font-bold mb-6 text-center">Get Your Tickets</h2>

            {submitError && (
              <div className="error-box mb-6">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Quantity Selector */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">How Many Tickets?</label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="btn btn-ghost w-12 h-12 text-2xl flex items-center justify-center"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="text-3xl font-bold min-w-[60px] text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(maxPurchase, quantity + 1))}
                    className="btn btn-ghost w-12 h-12 text-2xl flex items-center justify-center"
                    disabled={quantity >= maxPurchase}
                  >
                    +
                  </button>
                  <span className="text-gray-400 text-sm ml-2">
                    = <strong className="text-white">${(ticketPrice * quantity).toFixed(2)}</strong> total
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="your@email.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Venmo Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                  <input
                    type="text"
                    className="input pl-8"
                    placeholder="YourVenmoHandle"
                    required
                    value={formData.venmo}
                    onChange={(e) => setFormData({ ...formData, venmo: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">State</label>
                <select
                  className="input text-white"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  style={{ backgroundColor: '#1e1e3f' }}
                >
                  <option value="" style={{ backgroundColor: '#1e1e3f', color: 'white' }}>Select your state</option>
                  <StateOptions />
                </select>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="age"
                  className="checkbox mt-1"
                  required
                  checked={formData.ageConfirmed}
                  onChange={(e) => setFormData({ ...formData, ageConfirmed: e.target.checked })}
                />
                <label htmlFor="age" className="text-sm text-gray-400">
                  I confirm I am 18 years of age or older
                </label>
              </div>

              {/* Warning */}
              <div className="warning-box">
                <p className="text-sm">
                  <strong>⚠️ Important:</strong> Your ticket is only valid if your payment is confirmed before the drawing. 
                  If payment cannot be verified, your ticket will not be eligible and another ticket will be drawn.
                </p>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full text-lg py-4"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner" />
                    Processing...
                  </span>
                ) : (
                  `Buy ${quantity} Ticket${quantity > 1 ? 's' : ''} - $${(ticketPrice * quantity).toFixed(2)}`
                )}
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-4">
              You'll be redirected to Venmo to complete payment
            </p>
          </div>
        )}

        {/* Draw Info */}
        <div className="card mt-8">
          <h3 className="font-semibold mb-2">Drawing Information</h3>
          <p className="text-gray-400 text-sm">
            {raffle.draw_trigger === 'Time' && raffle.draw_time
              ? `Scheduled for ${new Date(raffle.draw_time).toLocaleString()}`
              : raffle.draw_trigger === 'TicketCount'
              ? `When ${raffle.draw_ticket_count} tickets are sold`
              : 'Organizer will draw manually'}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Fiddyfiddy • Must be 18+ • Not available in AL, HI, UT</p>
        </div>
      </footer>
    </div>
  );
}

function StateOptions() {
  const states = [
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
    { code: 'DC', name: 'District of Columbia' },
  ];

  return (
    <>
      {states.map((state) => (
        <option 
          key={state.code} 
          value={state.code} 
          style={{ backgroundColor: '#1e1e3f', color: 'white' }}
        >
          {state.name}
        </option>
      ))}
    </>
  );
}
