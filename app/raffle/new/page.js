'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewRafflePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    raffle_name: '',
    raffle_date: today,
    beneficiary_name: '',
    beneficiary_type: 'Team',
    beneficiary_venmo: '',
    ticket_price: '5',
    ticket_prefix: '',
    draw_trigger: 'Manual',
    draw_time: '',
    draw_ticket_count: '',
    is_public: true,
  });

  // Auto-generate ticket prefix from raffle name and date
  useEffect(() => {
    if (formData.raffle_name && formData.raffle_date) {
      // Take first 3-4 chars of raffle name, add date
      const namePrefix = formData.raffle_name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 4);
      const dateStr = formData.raffle_date.replace(/-/g, '').slice(4); // MMDD
      const autoPrefix = `${namePrefix}${dateStr}`;
      setFormData(prev => ({ ...prev, ticket_prefix: autoPrefix }));
    }
  }, [formData.raffle_name, formData.raffle_date]);

  const maxTickets = Math.floor(1200 / parseFloat(formData.ticket_price || 1));
  const maxJackpot = (maxTickets * parseFloat(formData.ticket_price || 0) * 0.5).toFixed(2);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/raffles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.message);
        setLoading(false);
        return;
      }

      router.push(`/raffle/${data.raffle.id}/edit`);
    } catch (e) {
      setError('Failed to create raffle');
      setLoading(false);
    }
  }

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
        <h1 className="text-3xl font-bold mb-2">Create New Raffle</h1>
        <p className="text-gray-400 mb-8">Set up your 50/50 raffle</p>

        {error && (
          <div className="error-box mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Raffle Info */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Raffle Details</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm text-gray-400 mb-2">Raffle Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Game Day 50/50"
                    required
                    value={formData.raffle_name}
                    onChange={(e) => setFormData({ ...formData, raffle_name: e.target.value })}
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm text-gray-400 mb-2">Raffle Date</label>
                  <input
                    type="date"
                    className="input"
                    required
                    value={formData.raffle_date}
                    onChange={(e) => setFormData({ ...formData, raffle_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Ticket Prefix</label>
                <input
                  type="text"
                  className="input uppercase"
                  placeholder="Auto-generated"
                  maxLength={10}
                  required
                  value={formData.ticket_prefix}
                  onChange={(e) => setFormData({ ...formData, ticket_prefix: e.target.value.toUpperCase() })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tickets: {formData.ticket_prefix || 'PREFIX'}-{formData.raffle_date?.replace(/-/g, '') || 'YYYYMMDD'}-0001
                </p>
              </div>
            </div>
          </div>

          {/* Beneficiary Info */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Beneficiary</h2>
            <p className="text-sm text-gray-400 mb-4">Who receives the house portion (50%) at raffle close</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Beneficiary Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Tigers Baseball Team, Local Food Bank"
                  required
                  value={formData.beneficiary_name}
                  onChange={(e) => setFormData({ ...formData, beneficiary_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Beneficiary Type</label>
                <select
                  className="input"
                  value={formData.beneficiary_type}
                  onChange={(e) => setFormData({ ...formData, beneficiary_type: e.target.value })}
                  style={{ backgroundColor: '#1e1e3f' }}
                >
                  <option value="Team">Team</option>
                  <option value="Charity">Charity</option>
                  <option value="Individual">Individual</option>
                  <option value="Event">Event</option>
                  <option value="School">School</option>
                  <option value="Church">Church</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Beneficiary Venmo</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                  <input
                    type="text"
                    className="input pl-8"
                    placeholder="BeneficiaryVenmo"
                    required
                    value={formData.beneficiary_venmo}
                    onChange={(e) => setFormData({ ...formData, beneficiary_venmo: e.target.value.replace(/^@/, '') })}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  50% of ticket sales will be sent here after the drawing
                </p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Pricing</h2>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Ticket Price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  className="input pl-8"
                  min="1"
                  max="50"
                  step="1"
                  required
                  value={formData.ticket_price}
                  onChange={(e) => setFormData({ ...formData, ticket_price: e.target.value })}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">$1 - $50 per ticket</p>
            </div>

            <div className="info-box mt-4">
              <div className="flex justify-between mb-2">
                <span>Max tickets (to stay under $600 jackpot):</span>
                <span className="font-bold">{maxTickets}</span>
              </div>
              <div className="flex justify-between">
                <span>Maximum jackpot:</span>
                <span className="font-bold text-emerald-400">${maxJackpot}</span>
              </div>
            </div>
          </div>

          {/* Drawing */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Drawing</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Draw Trigger</label>
                <select
                  className="input"
                  value={formData.draw_trigger}
                  onChange={(e) => setFormData({ ...formData, draw_trigger: e.target.value })}
                  style={{ backgroundColor: '#1e1e3f' }}
                >
                  <option value="Manual">Manual (I'll draw when ready)</option>
                  <option value="Time">Scheduled time</option>
                  <option value="TicketCount">When ticket count reached</option>
                </select>
              </div>

              {formData.draw_trigger === 'Time' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Draw Date/Time</label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={formData.draw_time}
                    onChange={(e) => setFormData({ ...formData, draw_time: e.target.value })}
                  />
                </div>
              )}

              {formData.draw_trigger === 'TicketCount' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Draw at ticket count</label>
                  <input
                    type="number"
                    className="input"
                    min="1"
                    max={maxTickets}
                    placeholder={`1-${maxTickets}`}
                    value={formData.draw_ticket_count}
                    onChange={(e) => setFormData({ ...formData, draw_ticket_count: e.target.value })}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Visibility */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Visibility</h2>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
              />
              <div>
                <span className="font-medium">Show in public lobby</span>
                <p className="text-sm text-gray-400">Uncheck to keep raffle private (share link only)</p>
              </div>
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Link href="/dashboard" className="btn btn-ghost flex-1 text-center">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Raffle'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
