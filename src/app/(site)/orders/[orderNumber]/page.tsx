import { Suspense } from 'react';
import { Container } from '@/components/Container';
import { PaymentResult } from '@/components/PaymentResult';
export const metadata = { title: 'Payment', robots: { index: false } };
// Сюда WemoPay возвращает клиента после оплаты (WEMOPAY_RETURN_URL).
async function Result({ params }: { params: Promise<{ orderNumber: string }> }) {
  return <PaymentResult orderNumber={(await params).orderNumber} />;
}
export default function Page({ params }: { params: Promise<{ orderNumber: string }> }) {
  return <Container className="py-16"><Suspense fallback={<p>Loading your order…</p>}><Result params={params} /></Suspense></Container>;
}
