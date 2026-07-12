import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Start free. Upgrade when you need the Pro Features. Choose between Monthly and Annual billing plans with RelayPost.',
  openGraph: {
    title: 'Pricing | RelayPost',
    description: 'Start free. Upgrade when you need the intelligence layer.',
    url: '/pricing',
    images: ['/pricing/opengraph-image'],
  }
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
