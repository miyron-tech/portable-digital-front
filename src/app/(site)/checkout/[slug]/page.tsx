import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Container } from '@/components/Container';
import { Checkout } from '@/components/Checkout';
import { getService } from '@/lib/api';
export const metadata = { title: 'Checkout', robots: { index: false } };
async function Details({ params }: { params: Promise<{ slug: string }> }) {
  const service = await getService((await params).slug);
  if (!service) notFound();
  return <Checkout service={service} />;
}
export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <Container className="py-16"><Suspense fallback={<p>Loading service…</p>}><Details params={params} /></Suspense></Container>;
}
