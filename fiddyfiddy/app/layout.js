import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'Fiddyfiddy - Digital 50/50 Raffles',
  description: 'Quick and easy digital 50/50 raffles. Buy tickets with Venmo, win half the pot!',
  keywords: 'raffle, 50/50, fundraiser, digital raffle, venmo',
  openGraph: {
    title: 'Fiddyfiddy - Digital 50/50 Raffles',
    description: 'Quick and easy digital 50/50 raffles. Buy tickets with Venmo, win half the pot!',
    url: 'https://fiddyfiddy.org',
    siteName: 'Fiddyfiddy',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
      <head>
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className="text-white antialiased">
        {children}
      </body>
    </html>
  );
}
