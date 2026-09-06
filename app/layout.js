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
    icon: '/logo.png',
    apple: '/logo.png',
  },
  themeColor: '#063D32',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}