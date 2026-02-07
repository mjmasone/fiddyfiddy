import { NextResponse } from 'next/server';
import { getRaffleById } from '@/lib/knack';
import { generateQRCode } from '@/lib/utils';

// GET /api/raffles/[id]/qr - Generate QR code for raffle
export async function GET(request, { params }) {
  try {
    const raffle = await getRaffleById(params.id);
    
    if (!raffle) {
      return NextResponse.json(
        { error: true, message: 'Raffle not found' },
        { status: 404 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fiddyfiddy.org';
    const raffleUrl = `${siteUrl}/r/${params.id}`;

    const qrDataUrl = await generateQRCode(raffleUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff',
      },
    });

    return NextResponse.json({
      url: raffleUrl,
      qrCode: qrDataUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}
