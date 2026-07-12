import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from './components/ThemeProvider';
import { GoogleAnalytics } from '@next/third-parties/google';

export const metadata: Metadata = {
  metadataBase: new URL('https://relay-post.vercel.app'),
  applicationName: 'RelayPost',
  appleWebApp: {
    title: 'RelayPost',
    statusBarStyle: 'default',
    capable: true,
  },
  verification: {
    google: '39eC-3uLPsyxpmG-CvFLWTAO9DheJfC_kXXIPYFO2ck',
  },
  other: {
    'google-adsense-account': 'ca-pub-8090657364719041',
  },
  title: {
    default: 'RelayPost',
    template: '%s | RelayPost',
  },
  description: 'Discover trending news and in-depth articles. Scale your insights with advanced content discovery, dynamic analysis, and real-time curation across business, technology, and science.',
  keywords: [
    'RelayPost',
    'Digital Publisher',
    'News Aggregator',
    'Automated Insights',
    'Technology News',
    'Business News',
    'Science Discoveries',
    'Real-time News Curation',
    'Content Discovery Platform',
    'Smart News Reader',
    'Tech Trends',
    'Industry Insights',
    'Personalized News Feed',
    'Trending Articles',
    'In-depth Articles',
    'Article Discovery',
    'Latest Articles',
    'Research Articles'
  ],
  authors: [{ name: 'RelayPost Team' }],
  creator: 'RelayPost',
  publisher: 'RelayPost',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'RelayPost | The Premier Digital Publisher',
    description: 'Discover trending news and in-depth articles. Scale your insights with advanced content discovery, dynamic analysis, and real-time curation across business, technology, and science.',
    siteName: 'RelayPost',
    images: [
      {
        url: '/fallback_article.png',
        width: 1200,
        height: 630,
        alt: 'RelayPost Default Image',
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RelayPost | The Premier Digital Publisher',
    description: 'Discover trending news and in-depth articles. Scale your insights with advanced content discovery, dynamic analysis, and real-time curation across business, technology, and science.',
    creator: '@RelayPost',
    images: ['/fallback_article.png'],
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
          <Analytics />
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
        </ThemeProvider>
      </body>
    </html>
  );
}

