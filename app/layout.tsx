import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './components/ThemeProvider';

export const metadata: Metadata = {
  metadataBase: new URL('https://relay-post.vercel.app'),
  title: {
    default: 'RelayPos',
    template: '%s | RelayPost',
  },
  description: 'Scale your insights with AI-driven content discovery, dynamic analysis, and real-time curation across business, technology, and science.',
  keywords: [
    'RelayPost',
    'Digital Curator',
    'News Aggregator',
    'Automated Insights',
    'Technology News'
  ],
  authors: [{ name: 'RelayPost Team' }],
  creator: 'RelayPost',
  publisher: 'RelayPost',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'RelayPost | The Premier Digital Curator',
    description: 'Scale your insights with AI-driven content discovery, dynamic analysis, and real-time curation across business, technology, and science.',
    siteName: 'RelayPost',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RelayPost | The Premier Digital Curator',
    description: 'Scale your insights with AI-driven content discovery, dynamic analysis, and real-time curation across business, technology, and science.',
    creator: '@RelayPost',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-right" toastOptions={{
              style: {
                  background: '#1b233a',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
              }
          }} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
