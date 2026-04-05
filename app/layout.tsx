import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Editorial Intelligence',
  description: 'Scale your insights with the Digital Curator',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Toaster position="top-right" toastOptions={{
            style: {
                background: '#1b233a',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
            }
        }} />
        {children}
      </body>
    </html>
  );
}
