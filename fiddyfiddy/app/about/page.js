'use client';

import Link from 'next/link';

export default function AboutPage() {
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
            <Link href="/lobby" className="text-gray-400 hover:text-white text-sm">
              View Raffles
            </Link>
            <Link href="/login" className="btn btn-ghost text-sm">
              Organizer Login
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Digital 50/50 Raffles
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A quick and easy way to raise money for your team, event, or cause.
          </p>
        </section>

        {/* What is Fiddyfiddy */}
        <section className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">What is Fiddyfiddy?</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Fiddyfiddy is a digital 50/50 raffle platform designed for charity fundraising. 
            Players buy tickets, and when the raffle ends, one lucky winner takes home half 
            the pot while the other half goes to the beneficiary.
          </p>
          <p className="text-gray-300 leading-relaxed">
            No cash handling, no paper tickets. Just share a link, collect payments via Venmo, 
            and draw a winner — all from your phone.
          </p>
        </section>

        {/* How It Works */}
        <section className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">How It Works</h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg">Organizer Creates a Raffle</h3>
                <p className="text-gray-400">Set ticket price, max tickets, and beneficiary info. Get a shareable link and QR code.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg">Players Buy Tickets</h3>
                <p className="text-gray-400">Scan the QR code or click the link, enter your info, and pay via Venmo. Instant ticket delivery via email.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg">Drawing Time</h3>
                <p className="text-gray-400">The organizer draws a random winner. The winner gets 50% of the pot via Venmo.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                ✓
              </div>
              <div>
                <h3 className="font-semibold text-lg">Everyone Wins</h3>
                <p className="text-gray-400">The beneficiary receives 50% of the pot for their cause. Players have fun and support a good cause.</p>
              </div>
            </div>
          </div>
        </section>

        {/* For Organizers */}
        <section className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">For Organizers</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Running a fundraiser? Fiddyfiddy makes it easy:
          </p>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              <span>No transaction fees — Venmo P2P is free</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Automatic jackpot calculations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Jackpots capped at $600 to keep things simple (no IRS forms needed)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Easy sharing via QR code, text, or email</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Transparent random drawing</span>
            </li>
          </ul>
          
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <Link href="/register" className="btn btn-primary">
              🚀 Start Your Own Raffle
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg text-secondary">Is this legal?</h3>
              <p className="text-gray-400 mt-1">
                50/50 raffles are legal in most states when run for charitable purposes. 
                Check your local regulations. A few states (AL, HI, UT) prohibit raffles entirely.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg text-secondary">Why is the jackpot capped at $600?</h3>
              <p className="text-gray-400 mt-1">
                Winnings under $600 don't require IRS Form W-2G reporting, which keeps things 
                simple for everyone. No paperwork, no hassle.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg text-secondary">How do payments work?</h3>
              <p className="text-gray-400 mt-1">
                Players pay the organizer directly via Venmo. The organizer pays the winner via 
                Venmo after the drawing. Fiddyfiddy doesn't handle any money directly.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg text-secondary">What if the winner doesn't respond?</h3>
              <p className="text-gray-400 mt-1">
                Organizers can redraw a new winner if the original winner doesn't respond 
                within a reasonable time (usually 48 hours).
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg text-secondary">How much does it cost?</h3>
              <p className="text-gray-400 mt-1">
                Fiddyfiddy takes a small percentage from each raffle to keep the platform running. 
                Contact us for details on pricing.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="card text-center">
          <h2 className="text-2xl font-bold mb-4">Questions?</h2>
          <p className="text-gray-400 mb-6">
            We're here to help. Reach out anytime.
          </p>
          <div className="space-y-2">
            <p>
              <strong className="text-secondary">Email:</strong>{' '}
              <a href="mailto:info@fiddyfiddy.org" className="text-white hover:text-primary">
                info@fiddyfiddy.org
              </a>
            </p>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10">
            <Link href="/register" className="btn btn-primary mr-4">
              🚀 Start Your Raffle
            </Link>
            <Link href="/lobby" className="btn btn-ghost">
              🎟️ Browse Raffles
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Fiddyfiddy. All rights reserved.</p>
          <p className="mt-2">
            <Link href="/lobby" className="hover:text-white">Raffles</Link>
            {' · '}
            <Link href="/about" className="hover:text-white">About</Link>
            {' · '}
            <Link href="/register" className="hover:text-white">Organizers</Link>
            {' · '}
            <Link href="/login" className="hover:text-white">Login</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
