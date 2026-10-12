'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PayButton } from './PayButton';
import { StoreAuth } from './StoreAuth';
import { storeApi, type StoreUser, type StoreOrder } from '@/lib/store-client';
import { formatMoney, ratePrice, rateTitle } from '@/lib/format';
import type { Service } from '@/lib/types';

interface Estimate { currency: string; total: number; items: { id: string; title: string; units: number; pricing: { total: number } }[] }
export function Checkout({ service }: { service: Service }) {
  const [user, setUser] = useState<StoreUser | null>(null);
  const [ready, setReady] = useState(false);
  const [rateIndex, setRateIndex] = useState(0);
  const rate = service.pricing[rateIndex];
  const [units, setUnits] = useState(rate?.minUnits || 1);
  const [milestones, setMilestones] = useState<string[]>([]);
  const [quote, setQuote] = useState<{ total: number; currency: string } | null>(null);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { storeApi<StoreUser>('auth/me').then(setUser).catch(() => null).finally(() => setReady(true)); }, []);
  useEffect(() => {
    if (!rate) return;
    let active = true;
    storeApi<{ total: number; currency: string }>('estimate/price', 'POST', { items: [{ serviceId: service.id, model: rate.model, units, milestoneKeys: milestones }] })
      .then(value => { if (active) { setQuote(value); setError(''); } })
      .catch(e => { if (active) { setQuote(null); setError(e.message); } });
    return () => { active = false; };
  }, [service.id, rate, units, milestones]);
  async function action(work: () => Promise<void>) { setBusy(true); setError(''); try { await work(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }
  if (!rate) return <div className="store-panel"><h2>A scope built around you</h2><Link className="store-button" href="/contact">Discuss your project →</Link></div>;
  return <div className="store-checkout">
    <div><span className="store-eyebrow">{order ? '02 / PAYMENT' : '01 / CHECKOUT'}</span><h1>Make your next move.</h1><p className="store-muted">{service.title}</p>
      {order && user ? <section className="store-panel store-form">
        <h2>Your order is ready</h2>
        <p>Order {order.orderNumber}</p><strong className="store-total">{formatMoney(order.total, order.currency)}</strong>
        <p className="store-muted">You will pay by card on the secure page of our payment partner and come back here once it is done.</p>
        <PayButton order={order} user={user} />
        <Link className="store-link" href="/account">Pay later from My orders →</Link>
      </section> : <>
        {!estimate && <section className="store-panel store-form"><h2>Make it your own</h2>
          <label>Plan<select value={rateIndex} onChange={e => { const index = Number(e.target.value); setRateIndex(index); setUnits(service.pricing[index].minUnits || 1); setMilestones([]); setQuote(null); }}>
            {service.pricing.map((r, i) => <option value={i} key={i}>{rateTitle(r)} · {ratePrice(r, service.currency)}</option>)}
          </select></label>
          <label>{rate.model === 'hourly' || rate.model === 'mixed' ? 'Number of hours' : rate.model === 'retainer' ? 'Number of periods' : 'Number of projects'}<input type="number" min={rate.minUnits || 1} max={rate.maxUnits || undefined} value={units} onChange={e => { setUnits(Number(e.target.value)); setQuote(null); }} /></label>
          {rate.milestones.map(m => <label className="store-check" key={m.key}><input type="checkbox" checked={m.required || milestones.includes(m.key)} disabled={m.required} onChange={e => { setMilestones(e.target.checked ? [...milestones, m.key] : milestones.filter(key => key !== m.key)); setQuote(null); }} />{m.title} · {formatMoney(m.amount, service.currency)}{m.required ? ' (included)' : ''}</label>)}
          <p className="store-muted">Calculated using the current service rates.</p><strong className="store-total">{quote ? formatMoney(quote.total, quote.currency) : 'Calculating…'}</strong>
        </section>}
        {!ready ? <p>Checking your account…</p> : !user ? <StoreAuth onLogin={setUser} /> : !estimate ? <button className="store-button" disabled={busy || !quote || units < (rate.minUnits || 1)} onClick={() => action(async () => { setEstimate(await storeApi<Estimate>('estimate/items', 'POST', { serviceId: service.id, model: rate.model, units, milestoneKeys: milestones })); })}>{busy ? 'Saving…' : 'Continue to checkout →'}</button> :
        <form className="store-panel store-form" onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); void action(async () => { setOrder(await storeApi<StoreOrder>('orders', 'POST', { phone: form.get('phone'), company: form.get('company'), note: form.get('note') })); }); }}>
          <h2>Your order</h2><p className="store-muted">{user.name} · {user.email}</p>
          {estimate.items.map(item => <div className="store-row" key={item.id}><span>{item.title} × {item.units}</span><strong>{formatMoney(item.pricing.total, estimate.currency)}</strong><button type="button" className="store-link" disabled={busy} aria-label={`Remove ${item.title}`} onClick={() => action(async () => { setEstimate(await storeApi<Estimate>(`estimate/items/${item.id}`, 'DELETE')); })}>×</button></div>)}
          <label>Phone<input name="phone" type="tel" maxLength={40} autoComplete="tel" /></label><label>Company<input name="company" maxLength={120} autoComplete="organization" /></label><label>About your project<textarea name="note" maxLength={2000} rows={3} /></label>
          <div className="store-row"><span>Total</span><strong className="store-total">{formatMoney(estimate.total, estimate.currency)}</strong></div>
          <p className="store-muted text-sm">Creating the order does not charge you — you pay on the next step. Review our <Link href="/legal/terms-of-service" className="underline">Terms of Service</Link>, <Link href="/legal/refund-cancellation" className="underline">Refund & Cancellation</Link> and <Link href="/legal/privacy-policy" className="underline">Privacy Policy</Link>.</p>
          <button className="store-button" disabled={busy || !estimate.items.length}>{busy ? 'Creating order…' : 'Create order & continue to payment →'}</button><button type="button" className="store-link" disabled={busy} onClick={() => action(async () => { setEstimate(await storeApi<Estimate>('estimate/refresh', 'POST')); })}>Refresh prices</button>
          <Link className="store-link" href="/services">Add another service →</Link>
        </form>}
      </>}{error && <p role="alert" className="store-error">{error}</p>}
    </div><aside className="store-panel store-summary"><span className="store-eyebrow">YOUR NEXT CHAPTER</span><h2>{service.title}</h2><p className="store-muted">{service.summary}</p><ul>{service.features.map(feature => <li key={feature}>↗ {feature}</li>)}</ul><div className="store-row"><span>Delivery</span><span>{service.deliveryTime || 'Agreed together'}</span></div><p className="store-muted">Your ambition. Our engineering. One shared goal.</p></aside>
  </div>;
}
