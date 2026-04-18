import './globals.css'
import Script from 'next/script'
import ClientProviders from '../components/layout/ClientProviders'

export const metadata = {
  title: "AgroLink – India's Smart Farm Marketplace",
  description: 'Connecting Farmers and Consumers for Fair Agriculture. Buy fresh crops directly from farmers across India.',
  keywords: 'agritech, farm marketplace, India, farmers, crops, organic, direct farm',
  openGraph: {
    title: "AgroLink – India's Smart Farm Marketplace",
    description: 'Buy fresh crops directly from Indian farmers. No middlemen, fair prices.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//translate.google.com" />
      </head>
      <body>
        <div id="google_translate_element" />
        <ClientProviders>
          {children}
        </ClientProviders>
        <Script id="gt-init" strategy="afterInteractive">{`
          window.googleTranslateElementInit = function() {
            try {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                autoDisplay: false,
                gaTrack: false,
              }, 'google_translate_element');
            } catch(e) {}
          }
          window.addEventListener('error', function(e) {
            if (e.filename && e.filename.includes('translate.google')) {
              e.stopImmediatePropagation();
              e.preventDefault();
              return true;
            }
          }, true);
        `}</Script>
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
