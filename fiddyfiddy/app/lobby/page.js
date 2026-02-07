import Link from 'next/link';
import { getActivePublicRaffles } from '@/lib/knack';
import { formatCurrency, calculateTicketsRemaining } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LobbyPage() {
  let raffles = [];
  let error = null;

  try {
    raffles = await getActivePublicRaffles();
  } catch (e) {
    error = e.message;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/lobby" className="flex items-center gap-2">
            <span className="text-3xl">🎟️</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
              Fiddyfiddy
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-gray-400 hover:text-white text-sm hidden sm:inline">
              Learn More
            </Link>
            <Link href="/register" className="text-secondary hover:text-white text-sm font-medium">
              🚀 Run a Raffle
            </Link>
            <Link href="/login" className="btn btn-ghost text-sm">
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Digital 50/50 Raffles
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Buy a ticket. Win half the pot. Support a great cause.
        </p>
      </section>

      {/* Raffles Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="text-secondary">🎯</span>
          Active Raffles
        </h2>

        {error && (
          <div className="error-box mb-6">
            <p>Error loading raffles: {error}</p>
          </div>
        )}

        {!error && raffles.length === 0 && (
          <div className="card text-center py-16">
            <span className="text-6xl mb-4 block">🎫</span>
            <h3 className="text-xl font-semibold mb-2">No active raffles</h3>
            <p className="text-gray-400">Check back soon for new opportunities to win!</p>
          </div>
        )}

        {raffles.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {raffles.map((raffle) => (
              <RaffleCard key={raffle.id} raffle={raffle} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Fiddyfiddy. Digital 50/50 raffles made simple.</p>
          <p className="mt-2">
            Jackpots capped at $600 • Must be 18+ to play • Not available in AL, HI, UT
          </p>
          <p className="mt-4">
            <Link href="/about" className="hover:text-white">About</Link>
            {' · '}
            <Link href="/register" className="hover:text-white">Run a Raffle</Link>
            {' · '}
            <Link href="/login" className="hover:text-white">Organizer Login</Link>
            {' · '}
            <a href="mailto:info@fiddyfiddy.org" className="hover:text-white">Contact</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function RaffleCard({ raffle }) {
  const ticketsRemaining = calculateTicketsRemaining(
    raffle.max_tickets,
    raffle.tickets_sold || 0
  );
  const jackpot = ((raffle.tickets_sold || 0) * raffle.ticket_price * 0.5).toFixed(2);
  const percentSold = ((raffle.tickets_sold || 0) / raffle.max_tickets) * 100;

  return (
    <Link href={`/r/${raffle.id}`}>
      <div className="card card-hover h-full flex flex-col">
        {/* Logo/Icon */}
        <div className="flex items-center gap-4 mb-4">
          {raffle.logo ? (
            <img
              src={raffle.logo}
              alt={raffle.beneficiary_name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-2xl">
              🎯
            </div>
          )}
          <div>
            <h3 className="font-bold text-lg">{raffle.beneficiary_name}</h3>
            <span className="badge badge-active text-xs">{raffle.beneficiary_type}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-400 text-sm">Ticket Price</p>
            <p className="text-xl font-bold">{formatCurrency(raffle.ticket_price)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Current Jackpot</p>
            <p className="text-xl font-bold text-emerald-400">{formatCurrency(jackpot)}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>{raffle.tickets_sold || 0} sold</span>
            <span>{ticketsRemaining} left</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
              style={{ width: `${Math.min(percentSold, 100)}%` }}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-auto">
          <span className="btn btn-primary w-full text-center block">
            Play Now →
          </span>
        </div>
      </div>
    </Link>
  );
}
