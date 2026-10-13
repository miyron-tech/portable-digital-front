'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PayButton } from './PayButton';
import { StoreAuth } from './StoreAuth';
import { storeApi, StoreError, termsLine, type StoreOrder, type StorePayment, type StoreUser } from '@/lib/store-client';
import { formatMoney } from '@/lib/format';

const POLL_MS = 3000;
const POLL_LIMIT = 40;

type View = 'loading' | 'paid' | 'processing' | 'failed' | 'unpaid' | 'missing' | 'refunded' | 'error';

/**
 * Сюда WemoPay возвращает клиента после оплаты. Вебхук может прийти чуть позже
 * возврата, поэтому статус опрашиваем с `sync=1`: бэкенд тогда перечитывает его
 * у провайдера сам и не ждёт вебхука.
 */
export function PaymentResult({ orderNumber }: { orderNumber: string }) {
  const [user, setUser] = useState<StoreUser | null>(null);
  const [ready, setReady] = useState(false);
  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [payment, setPayment] = useState<StorePayment | null>(null);
  const [view, setView] = useState<View>('loading');
  const [timedOut, setTimedOut] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => { storeApi<StoreUser>('auth/me').then(setUser).catch(() => null).finally(() => setReady(true)); }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let polls = 0;

    async function check() {
      try {
        const [nextOrder, nextPayment] = await Promise.all([
          storeApi<StoreOrder>(`orders/${orderNumber}`),
          storeApi<StorePayment>(`payments/status/${orderNumber}?sync=1`).catch(e => {
            if (e instanceof StoreError && e.status === 404) return null;
            throw e;
          }),
        ]);
        if (!active) return;
        setOrder(nextOrder);
        setPayment(nextPayment);
        const status = nextPayment?.status;
        // Заказ дальше «ждёт оплату» (оплачен, в работе, готов) — значит, деньги пришли.
        const orderPaid = ['paid', 'in_progress', 'in_review', 'completed'].includes(nextOrder.status);
        let next: View;
        if (status === 'refunded') next = 'refunded';
        else if (orderPaid || status === 'paid') next = 'paid';
        else if (!status || status === 'created') next = 'unpaid';
        else if (status === 'declined' || status === 'cancelled') next = 'failed';
        else next = 'processing';
        setView(next);
        // Сразу после возврата провайдер может ещё не сменить состояние: пару
        // раз перепроверяем и «не оплачено», прежде чем показать кнопку.
        if (next === 'processing' || (status === 'created' && polls < 5)) {
          if (++polls < POLL_LIMIT) timer = setTimeout(check, POLL_MS);
          else setTimedOut(true);
        }
      } catch (e) {
        if (active) setView(e instanceof StoreError && e.status === 404 ? 'missing' : 'error');
      }
    }
    void check();
    return () => { active = false; clearTimeout(timer); };
  }, [user, orderNumber, retry]);

  if (!ready) return <p>Loading your order…</p>;
  if (!user) return <div className="store-auth-wrap"><StoreAuth onLogin={setUser} /></div>;
  if (view === 'missing') return <section className="store-panel"><h2>Order not found</h2><p className="store-muted">We could not find order {orderNumber} in your account.</p><Link className="store-link" href="/account">My orders →</Link></section>;
  if (view === 'error') return <section className="store-panel store-form"><h2>We could not check your payment.</h2><p className="store-muted">Please try again in a moment.</p><button className="store-secondary" onClick={() => { setView('loading'); setRetry(n => n + 1); }}>Try again</button><Link className="store-link" href="/account">Back to your account →</Link></section>;
  if (view === 'loading' || !order) return <p>Checking your payment…</p>;

  const copy: Record<Exclude<View, 'loading' | 'missing' | 'error'>, { eyebrow: string; title: string; text: string }> = {
    paid: { eyebrow: 'PAYMENT RECEIVED', title: 'You are all set.', text: 'Thank you — your payment is confirmed. We will be in touch within one business day to kick things off.' },
    processing: { eyebrow: 'PAYMENT IN PROGRESS', title: 'Confirming your payment…', text: timedOut ? 'This is taking longer than usual. You can safely leave this page — the order updates on its own once the payment is confirmed.' : 'This usually takes a few seconds. Please keep this page open.' },
    failed: { eyebrow: 'PAYMENT NOT COMPLETED', title: 'The payment did not go through.', text: 'You can try again with the same or another card. Contact us if you see an unexpected charge.' },
    unpaid: { eyebrow: 'AWAITING PAYMENT', title: 'Your order is waiting.', text: 'Complete the payment to confirm your order.' },
    refunded: { eyebrow: 'REFUND RECORDED', title: 'Your payment has been refunded.', text: 'Contact the team in your project conversation if you have questions about the refund.' },
  };
  const { eyebrow, title, text } = copy[view];

  return (
    <div className="store-checkout">
      <div>
        <span className="store-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <section className="store-panel store-form">
          <div className="store-row"><h2>Order {order.orderNumber}</h2><strong className="store-total">{formatMoney(order.total, order.currency)}</strong></div>
          <p>{order.items.map(item => `${item.title} × ${item.units}`).join(', ')}</p>
          <p className="store-muted" role="status">{text}</p>
          {(view === 'failed' || view === 'unpaid') && <PayButton order={order} user={user} label={view === 'failed' ? `Try again · ${formatMoney(order.total, order.currency)} →` : undefined} />}
          {termsLine(order) && <p className="store-muted">{termsLine(order)}</p>}
          {payment?.paidAt && <p className="store-muted">Paid on {new Date(payment.paidAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>}
          <Link className="store-link" href="/account">My orders →</Link>
        </section>
      </div>
    </div>
  );
}
