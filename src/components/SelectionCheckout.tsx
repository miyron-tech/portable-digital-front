'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelection } from './SelectionProvider';
import { StoreAuth } from './StoreAuth';
import { COUNTRY_CODES, PayButton } from './PayButton';
import { AcceptedCards } from './AcceptedCards';
import { DataNotice } from './DataNotice';
import { storeApi, StoreError, type StoreOrder, type StoreUser } from '@/lib/store-client';
import { formatMoney } from '@/lib/format';
import { LEGAL_VERSION } from '@/lib/legal';
import type { SelectionItem } from '@/lib/selection';

export function SelectionCheckout() {
  const cart = useSelection();
  const [user, setUser] = useState<StoreUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState('');
  const [details, setDetails] = useState(false);
  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submission = useRef(false);
  const [error, setError] = useState('');
  const countries = useMemo(() => {
    const names = new Intl.DisplayNames(['en'], { type: 'region' });
    return COUNTRY_CODES.map(code => ({ code, name: names.of(code) ?? code })).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  useEffect(() => {
    let active = true;
    storeApi<StoreUser>('auth/me').then(value => { if (active) setUser(value); }).catch(e => {
      if (active && !(e instanceof StoreError && e.status === 401)) setAuthError(e.message);
    }).finally(() => { if (active) setAuthReady(true); });
    return () => { active = false; };
  }, []);

  const selection = cart.selection;
  const hasChanges = selection?.items.some(item => item.priceChanged || !item.available);
  const [first, ...last] = user?.name.trim().split(/\s+/) ?? [];

  async function action(work: () => Promise<unknown>) {
    setError('');
    try { await work(); } catch (e) { setError((e as Error).message); }
  }

  if (order && user) return <>
    <span className="store-eyebrow">SECURE PAYMENT</span><h1 className="store-display">Your order is ready.</h1>
    <section className="store-panel store-form selection-empty">
      <h2>Order {order.orderNumber}</h2><p>{order.items.length} selected services</p>
      <strong className="store-total">{formatMoney(order.total, order.currency)}</strong>
      {error && <p role="alert" className="store-error">{error}</p>}
      <p className="store-muted">Your services are saved in this order. Continue to WemoPay to complete payment.</p>
      <PayButton order={order} user={user} />
      <Link href="/account" className="store-link">View my orders →</Link>
    </section>
  </>;

  return <>
    <span className="store-eyebrow">YOUR NEXT PROJECT</span><h1 className="store-display">Selected services.</h1>
    <p className="store-muted">Bring your services together, review the scope and pay in one order.</p>
    <ol className="selection-progress" aria-label="Checkout progress"><li aria-current={!details ? 'step' : undefined}>01 / Selected services</li><li aria-current={details ? 'step' : undefined}>02 / Your details</li><li>03 / Secure payment</li></ol>
    {cart.loading ? <p role="status">Loading your selection…</p> : cart.error && !selection ? <div className="store-panel"><p className="store-error" role="alert">{cart.error}</p><button className="store-button" onClick={() => action(cart.refresh)}>Retry loading selection</button></div> : !selection?.items.length ? <section className="store-panel selection-empty"><h2>Your next project starts here.</h2><p className="store-muted">Add services from the catalogue. You can choose several and customise their scope before checkout.</p><Link className="store-button" href="/services">Explore services →</Link><p className="store-muted mt-6">Already placed an order? <Link className="store-link" href="/account">View my orders</Link></p></section> :
    <div className="selection-layout">
      <div>
        <div className="selection-items" aria-label="Selected services">
          {selection.items.map(item => <SelectionRow key={`${item.id}:${item.units}`} item={item} currency={selection.currency} locked={details || submitting} />)}
        </div>
        {!details && <div className="selection-next"><Link className="store-secondary" href="/services">Add more services +</Link><button className="store-link" disabled={cart.busy} onClick={() => action(cart.refreshPrices)}>Refresh prices</button></div>}
        {hasChanges && <p className="selection-warning" role="alert">Some services have changed or are no longer available. Refresh prices to review the updated selection before continuing.</p>}
        {details && <section className="selection-billing">
          <button type="button" className="store-link mb-6" disabled={submitting} onClick={() => setDetails(false)}>← Edit selected services</button>
          {!authReady ? <p>Checking your account…</p> : authError ? <p className="store-error" role="alert">{authError}</p> : !user ? <>
            <p className="store-muted mb-6">Sign in or create an account to continue. Your selected services will stay with you.</p>
            <StoreAuth onLogin={value => { setUser(value); void action(cart.refresh); }} />
          </> : <form className="store-panel store-form" onSubmit={async event => {
            event.preventDefault();
            if (submission.current || cart.busy || hasChanges) return;
            submission.current = true; setSubmitting(true); setError('');
            const form = new FormData(event.currentTarget);
            const value = (key: string) => String(form.get(key) ?? '').trim();
            const billing = { addressLine1: value('addressLine1'), city: value('city'), postalCode: value('postalCode'), countryCode: value('countryCode') };
            try {
              const updated = await storeApi<StoreUser>('auth/me', 'PATCH', { firstName: value('firstName'), lastName: value('lastName'), billingAddress: billing });
              setUser(updated);
              const created = await cart.createOrder({ billing, phone: value('phone'), company: value('company'), note: value('note'), acceptTerms: form.get('acceptTerms') === 'on', termsVersion: LEGAL_VERSION });
              setOrder(created);
              const payment = await storeApi<{ redirectUrl: string | null }>('payments/initiate', 'POST', { orderNumber: created.orderNumber });
              if (!payment.redirectUrl) throw new Error('The payment page is unavailable. Your order is saved; please retry payment.');
              window.location.assign(payment.redirectUrl);
            } catch (e) {
              setError((e as Error).message);
              if (e instanceof StoreError && e.status === 401) setUser(null);
            } finally { setSubmitting(false); submission.current = false; }
          }}>
            <h2>Your billing details</h2>
            <p className="store-muted">These details are needed to prepare your payment.</p>
            <fieldset disabled={submitting}>
              <div className="store-form-grid"><label>First name<input name="firstName" required maxLength={40} defaultValue={first} autoComplete="given-name" /></label><label>Last name<input name="lastName" required maxLength={40} defaultValue={last.join(' ')} autoComplete="family-name" /></label></div>
              <label>Email<input type="email" value={user.email} readOnly autoComplete="email" /></label>
              <label>Address<input name="addressLine1" required maxLength={200} defaultValue={user.billingAddress?.addressLine1} autoComplete="address-line1" /></label>
              <div className="store-form-grid"><label>City<input name="city" required maxLength={100} defaultValue={user.billingAddress?.city} autoComplete="address-level2" /></label><label>Postcode<input name="postalCode" required maxLength={20} defaultValue={user.billingAddress?.postalCode} autoComplete="postal-code" /></label></div>
              <label>Country<select name="countryCode" aria-label="Country" required defaultValue={user.billingAddress?.countryCode ?? ''} autoComplete="country"><option value="" disabled>Select a country</option>{countries.map(country => <option key={country.code} value={country.code}>{country.name}</option>)}</select></label>
              <div className="store-form-grid"><label>Phone (optional)<input name="phone" type="tel" maxLength={40} autoComplete="tel" /></label><label>Company (optional)<input name="company" maxLength={120} autoComplete="organization" /></label></div>
              <label>Project notes (optional)<textarea name="note" maxLength={2000} rows={3} /></label>
              <DataNotice data="your contact and billing details" purpose="prepare your order and process payment with WemoPay" />
              <label className="store-check"><input type="checkbox" name="acceptTerms" required /> <span>I accept the <Link className="underline" href="/legal/terms-of-service" target="_blank">Terms of Service</Link> and <Link className="underline" href="/legal/refund-cancellation" target="_blank">Refund & Cancellation</Link> policy.</span></label>
              <p className="store-muted">Card details are entered on WemoPay’s secure payment page.</p>
              <AcceptedCards />
              <button className="store-button" disabled={submitting || cart.busy || !!hasChanges || !!cart.error}>{submitting ? 'Preparing secure payment…' : `Pay ${formatMoney(selection.total, selection.currency)} →`}</button>
            </fieldset>
          </form>}
        </section>}
        {(error || cart.error) && <p className="store-error" role="alert">{error || cart.error}</p>}
      </div>
      <aside className="store-panel selection-summary">
        <h2>Your selection</h2><p className="store-muted">{selection.items.length} service{selection.items.length === 1 ? '' : 's'} in one order</p>
        <div className="store-row"><span>Subtotal</span><strong>{formatMoney(selection.subtotal, selection.currency)}</strong></div>
        {selection.discountAmount > 0 && <div className="store-row"><span>Discount</span><strong>−{formatMoney(selection.discountAmount, selection.currency)}</strong></div>}
        <div className="store-row"><span>Total</span><strong className="store-total">{formatMoney(selection.total, selection.currency)}</strong></div>
        {!details && <button className="store-button" disabled={cart.busy || !!hasChanges || !!cart.error || selection.total <= 0} onClick={() => { setDetails(true); setError(''); }}>Continue to checkout →</button>}
        <p className="store-muted">Review your details, then pay securely with WemoPay.</p>
      </aside>
    </div>}
  </>;
}

function SelectionRow({ item, currency, locked }: { item: SelectionItem; currency: string; locked: boolean }) {
  const { update, remove, busy } = useSelection();
  const [units, setUnits] = useState(String(item.units));
  const [error, setError] = useState('');
  const unitLabel = item.model === 'hourly' || item.model === 'mixed' ? 'Hours' : item.model === 'retainer' ? 'Periods' : 'Projects';
  return <article className="selection-item">
    <div><h2><Link href={`/services/${item.slug}`}>{item.title}</Link></h2><p className="store-muted">{item.model} · {item.units} {unitLabel.toLowerCase()}</p>
      {item.milestones.length > 0 && <p className="store-muted">{item.milestones.map(m => m.title).join(' · ')}</p>}
      {!item.available ? <p className="selection-warning">No longer available</p> : item.priceChanged ? <p className="selection-warning">Price updated — please refresh your selection</p> : null}
      {!locked && <div className="selection-item-actions store-form">
        <label>{unitLabel}<input type="number" min={1} step={1} value={units} disabled={busy || !item.available} onChange={e => setUnits(e.target.value)} /></label>
        <button type="button" className="store-secondary" disabled={busy || !item.available || Number(units) === item.units || !Number.isInteger(Number(units)) || Number(units) < 1} onClick={async () => { setError(''); try { await update(item.id, Number(units)); } catch (e) { setError((e as Error).message); } }}>Update</button>
        <button type="button" className="store-link" disabled={busy} aria-label={`Remove ${item.title}`} onClick={async () => { setError(''); try { await remove(item.id); } catch (e) { setError((e as Error).message); } }}>Remove</button>
      </div>}
      {error && <p role="alert" className="store-error">{error}</p>}
    </div><strong className="selection-item-total">{formatMoney(item.pricing.total, currency)}</strong>
  </article>;
}
