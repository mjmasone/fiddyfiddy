'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

export default function FlyerPage() {
  const { id } = useParams();
  const [raffle, setRaffle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRaffle() {
      try {
        const res = await fetch(`/api/raffles/${id}`);
        if (!res.ok) throw new Error('Failed to load raffle');
        const data = await res.json();
        setRaffle(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRaffle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading flyer...</p>
      </div>
    );
  }

  if (error || !raffle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400">{error || 'Raffle not found'}</p>
      </div>
    );
  }

  const raffleUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/r/${id}`;
  const charityName = raffle.raffle_name || raffle.beneficiary_name || 'Raffle';
  const ticketPrice = raffle.ticket_price ? `$${raffle.ticket_price}` : '';

  return (
    <>
      {/* Screen-only header with navigation */}
      <header className="border-b border-white/10 print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white">
            <span>←</span>
            <span>Dashboard</span>
          </Link>
          <div className="flex gap-2">
            <Link href={`/raffle/${id}/edit`} className="btn btn-ghost text-sm">
              📋 Details
            </Link>
            <button
              onClick={() => window.print()}
              className="btn btn-primary text-sm"
            >
              🖨️ Print Flyer
            </button>
          </div>
        </div>
      </header>

      {/* Printable flyer — designed for 8.5 x 11 */}
      <div className="flyer-page">
        {/* Charity / Beneficiary Name */}
        <div className="flyer-header">
          <h1 className="flyer-charity-name">{charityName}</h1>
          <div className="flyer-divider"></div>
          <h2 className="flyer-subtitle">50/50 RAFFLE</h2>
        </div>

        {/* QR Code — hero element */}
        <div className="flyer-qr-section">
          <div className="flyer-qr-wrapper">
            <QRCodeSVG
              value={raffleUrl}
              size={280}
              level="H"
              includeMargin={true}
              bgColor="#FFFFFF"
              fgColor="#000000"
            />
          </div>
          <p className="flyer-scan-cta">SCAN TO PLAY</p>
        </div>

        {/* Instructions */}
        <div className="flyer-instructions">
          <div className="flyer-step">
            <span className="flyer-step-num">1</span>
            <span>Scan the QR code with your phone camera</span>
          </div>
          <div className="flyer-step">
            <span className="flyer-step-num">2</span>
            <span>Pay {ticketPrice ? ticketPrice + ' per ticket ' : ''}via Venmo</span>
          </div>
          <div className="flyer-step">
            <span className="flyer-step-num">3</span>
            <span>Get your ticket instantly — win half the pot!</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flyer-footer">
          <p className="flyer-brand">
            Powered by <strong>Fiddyfiddy</strong> • fiddyfiddy.org
          </p>
        </div>
      </div>

      {/* Print + screen styles */}
      <style jsx>{`
        /* ---- SCREEN PREVIEW ---- */
        .flyer-page {
          max-width: 8.5in;
          min-height: 11in;
          margin: 2rem auto;
          background: #fff;
          color: #111;
          padding: 0.75in;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          border: 1px solid #333;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }

        .flyer-header {
          text-align: center;
          width: 100%;
        }

        .flyer-charity-name {
          font-size: 2.4rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          line-height: 1.15;
          color: #000;
          margin: 0 0 0.4rem 0;
        }

        .flyer-divider {
          width: 3in;
          height: 4px;
          background: #000;
          margin: 0.5rem auto;
        }

        .flyer-subtitle {
          font-size: 1.6rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #000;
          margin: 0.4rem 0 0 0;
        }

        /* ---- QR SECTION ---- */
        .flyer-qr-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-grow: 1;
          justify-content: center;
        }

        .flyer-qr-wrapper {
          border: 6px solid #000;
          padding: 0.15in;
          background: #fff;
          line-height: 0;
        }

        .flyer-scan-cta {
          margin-top: 0.6rem;
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: 0.2em;
          color: #000;
        }

        /* ---- INSTRUCTIONS ---- */
        .flyer-instructions {
          width: 100%;
          max-width: 5.5in;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 0.5in;
        }

        .flyer-step {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 1.1rem;
          color: #222;
        }

        .flyer-step-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          background: #000;
          color: #fff;
          font-weight: 700;
          font-size: 1rem;
          flex-shrink: 0;
        }

        /* ---- FOOTER ---- */
        .flyer-footer {
          text-align: center;
          width: 100%;
          border-top: 2px solid #ccc;
          padding-top: 0.4rem;
        }

        .flyer-brand {
          font-size: 0.8rem;
          color: #888;
          margin: 0;
        }

        /* ---- PRINT OVERRIDES ---- */
        @media print {
          @page {
            size: 8.5in 11in;
            margin: 0;
          }

          body {
            background: #fff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .flyer-page {
            border: none;
            margin: 0;
            padding: 0.75in;
            min-height: 100vh;
            width: 100%;
            max-width: 100%;
          }

          .flyer-qr-wrapper {
            border-width: 5px;
          }
        }
      `}</style>
    </>
  );
}
