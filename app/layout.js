import '../src/styles/global.css'
import Shell from './_layout/Shell'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { GoogleAnalytics } from '@next/third-parties/google'

export const metadata = {
  title: 'AGRENES · Fresh Ugandan Produce Delivered UK-Wide',
  description: 'Fresh Ugandan produce, air-freighted weekly to your door across the UK. Quality GAP & UNBS certified fruits, vegetables and staples.',
  keywords: 'ugandan food UK, matoke UK, african food delivery UK, ugandan groceries UK, african produce UK, matoke delivery, ugandan food shop, buy matoke online, kalo flour, bushera, groundnut paste, african grocery online UK',
  metadataBase: new URL('https://agrenesmarket.com'),
  openGraph: {
    type: 'website',
    siteName: 'AGRENES',
    title: 'AGRENES · Fresh Ugandan Produce Delivered UK-Wide',
    description: 'Fresh Ugandan produce, air-freighted weekly to your door across the UK. Quality GAP & UNBS certified fruits, vegetables and staples.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AGRENES — Fresh Ugandan Produce Delivered UK-Wide',
      },
    ],
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AGRENES · Fresh Ugandan Produce Delivered UK-Wide',
    description: 'Fresh Ugandan produce, air-freighted weekly to your door across the UK. GAP & UNBS certified.',
    images: ['/og-image.png'],
  },
      icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/manifest-icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  verification: {
    google: 'R_wgB9NSm_prsdJPupI_qr5oma8wtsPZnJ9XKZ8dMWo',
    other: {
      'msvalidate.01': 'FDE15C8374402CA0B506D4E346F3BC34',
    },
  }
}

export const viewport = {
  themeColor: '#063D32',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics gaId="G-FTZQ3S7CSN" />
      </body>
    </html>
  )
}