'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { storeApi, type StoreBilling, type StoreOrder } from '@/lib/store-client';
import type { Paginated, PricingModel, Service } from '@/lib/types';
import { formatMoney } from '@/lib/format';
import './order-editor.css';

type Line = { serviceId: string; model: PricingModel; units: number; extraHours: number; milestoneKeys: string[]; notes: string };
type Quote = { quoteToken: string; total: number; subtotal: number; discountAmount: number; currency: string; items: { title: string; pricing: { total: number } }[] };

export function OrderEditor({ order, onClose, onSaved }: { order: StoreOrder; onClose: () => void; onSaved: (order: StoreOrder) => void }) {
  const formId = useId();
  const [original] = useState(order);
  const [items, setItems] = useState<Line[]>(() => original.items.map(item => ({ serviceId: item.serviceId ?? '', model: (item.model ?? 'fixed') as PricingModel, units: item.units, extraHours: item.extraHours ?? 0, milestoneKeys: item.milestones?.map(m => m.key) ?? [], notes: item.notes ?? '' })));
  const [note, setNote] = useState(original.note ?? '');
  const [phone, setPhone] = useState(original.customer.phone ?? '');
  const [company, setCompany] = useState(original.customer.company ?? '');
  const [billing, setBilling] = useState<StoreBilling>({ addressLine1: original.billing?.addressLine1 ?? '', city: original.billing?.city ?? '', postalCode: original.billing?.postalCode ?? '', countryCode: original.billing?.countryCode ?? '' });
  const [services, setServices] = useState<Service[]>([]);
  const [catalogueError, setCatalogueError] = useState('');
  const [addId, setAddId] = useState('');
  const [quote, setQuote] = useState<{ key: string; value?: Quote; error?: string } | null>(null);
  const [quoteRetry, setQuoteRetry] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const payload = JSON.stringify({ revision: original.revision ?? 0, items, note, phone, company, billing: { ...billing, countryCode: billing.countryCode || undefined } });
  const [initial] = useState(payload);
  const dirty = initial !== payload;
  const currentQuote = quote?.key === payload ? quote : null;
  const valid = currentQuote?.value;

  useEffect(() => { dialog.current?.showModal(); }, []);
  useEffect(() => {
    if (!dirty) return;
    const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [dirty]);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const first = await storeApi<Paginated<Service>>('services?limit=50');
        const rest = await Promise.all(Array.from({ length: first.pages - 1 }, (_, i) => storeApi<Paginated<Service>>(`services?limit=50&page=${i + 2}`)));
        if (active) setServices([first, ...rest].flatMap(page => page.items).filter(service => service.currency === original.currency && service.pricing.length));
      } catch { if (active) setCatalogueError('Could not load services. Close the editor and try again.'); }
    }
    void load(); return () => { active = false; };
  }, [original.currency]);
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const value = await storeApi<Quote>(`orders/${original.orderNumber}/preview`, 'POST', JSON.parse(payload));
        if (active) setQuote({ key: payload, value });
      } catch (e) { if (active) setQuote({ key: payload, error: e instanceof Error ? e.message : 'Could not calculate the total.' }); }
    }, 350);
    return () => { active = false; clearTimeout(timer); };
  }, [original.orderNumber, payload, quoteRetry]);

  function close() { if (!busy && (!dirty || window.confirm('Discard your unsaved order changes?'))) onClose(); }
  function change(index: number, values: Partial<Line>) { setItems(lines => lines.map((line, i) => i === index ? { ...line, ...values } : line)); setError(''); }
  function add() {
    const service = services.find(s => s.id === addId); const rate = service?.pricing[0];
    if (!service || !rate) return;
    setItems(lines => [...lines, { serviceId: service.id, model: rate.model, units: rate.minUnits ?? 1, extraHours: 0, milestoneKeys: rate.milestones.map(m => m.key), notes: '' }]); setAddId('');
  }
  return <dialog ref={dialog} className="order-editor" aria-labelledby="edit-order-heading" onCancel={e => { e.preventDefault(); close(); }}>
    <form className="store-form" onSubmit={async event => {
      event.preventDefault(); if (!valid || busy || !dirty) return; setBusy(true); setError('');
      try { const updated = await storeApi<StoreOrder>(`orders/${original.orderNumber}`, 'PATCH', { ...JSON.parse(payload), quoteToken: valid.quoteToken }); onSaved(updated); }
      catch (e) { setError(e instanceof Error ? e.message : 'Could not save your changes.'); setQuote(null); setQuoteRetry(value => value + 1); }
      finally { setBusy(false); }
    }}>
      <div className="order-editor-heading"><div><p className="account-kicker">ORDER /{original.orderNumber}</p><h2 id="edit-order-heading">Edit order</h2></div><button type="button" className="store-secondary" onClick={close} disabled={busy} aria-label="Close editor">×</button></div>
      <p className="account-form-help">Review the updated total before saving. Services are recalculated at current catalogue prices; your order discount is retained.</p>
      <fieldset disabled={busy}>
        {items.map((line, index) => {
          const service = services.find(s => s.id === line.serviceId); const rate = service?.pricing.find(r => r.model === line.model);
          return <section className="order-editor-line" key={index}>
            <div className="order-editor-heading"><h3>{service?.title ?? original.items.find(i => i.serviceId === line.serviceId)?.title ?? 'Service'}</h3><button type="button" className="account-text-button" onClick={() => setItems(lines => lines.filter((_, i) => i !== index))}>Remove service</button></div>
            <div className="store-form-grid"><label>Pricing plan<select value={line.model} onChange={e => { const next = service?.pricing.find(r => r.model === e.target.value); if (next) change(index, { model: next.model, units: next.minUnits ?? 1, extraHours: 0, milestoneKeys: next.milestones.map(m => m.key) }); }}>{!rate && <option value={line.model}>{line.model} (unavailable)</option>}{service?.pricing.map(r => <option key={r.model} value={r.model}>{r.label ?? r.model}{r.period ? ` / ${r.period}` : ''}</option>)}</select></label>
              <label>{line.model === 'hourly' || line.model === 'mixed' ? 'Hours' : line.model === 'retainer' ? 'Periods' : 'Projects'}<input type="number" min={rate?.minUnits ?? 1} max={rate?.maxUnits ?? undefined} step={1} required value={line.units} onChange={e => change(index, { units: Number(e.target.value) })} /></label>
              {line.model === 'retainer' && <label>Extra hours<input type="number" min={0} step={1} required value={line.extraHours} onChange={e => change(index, { extraHours: Number(e.target.value) })} /></label>}
            </div>
            {!!rate?.milestones.length && <div className="order-editor-milestones">{rate.milestones.map(m => <label key={m.key}><input type="checkbox" checked={m.required || line.milestoneKeys.includes(m.key)} disabled={busy || m.required} onChange={e => change(index, { milestoneKeys: e.target.checked ? [...line.milestoneKeys, m.key] : line.milestoneKeys.filter(key => key !== m.key) })} />{m.title}{m.required ? ' (required)' : ''} · {formatMoney(m.amount, original.currency)}</label>)}</div>}
            <div><label htmlFor={`${formId}-notes-${index}`}>Service notes</label><textarea id={`${formId}-notes-${index}`} maxLength={1000} rows={2} value={line.notes} onChange={e => change(index, { notes: e.target.value })} /></div>
            {valid?.items[index] && <p className="order-editor-line-total">{formatMoney(valid.items[index].pricing.total, valid.currency)}</p>}
          </section>;
        })}
        {!items.length && <p>Add at least one service to keep this order.</p>}
        {catalogueError && <p className="store-error" role="alert">{catalogueError}</p>}
        <div className="order-editor-add"><label>Add a service<select value={addId} onChange={e => setAddId(e.target.value)}><option value="">Choose a service</option>{services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select></label><button type="button" className="store-secondary" disabled={!addId || items.length >= 50} onClick={add}>Add service</button></div>
        <div><label htmlFor={`${formId}-brief`}>Project brief</label><textarea id={`${formId}-brief`} rows={4} maxLength={2000} value={note} onChange={e => setNote(e.target.value)} /></div>
        <div className="store-form-grid"><label>Phone<input value={phone} maxLength={40} onChange={e => setPhone(e.target.value)} /></label><label>Company<input value={company} maxLength={120} onChange={e => setCompany(e.target.value)} /></label></div>
        <details><summary>Billing address</summary><div className="store-form-grid">{(['addressLine1', 'city', 'postalCode', 'countryCode'] as const).map(key => <label key={key}>{{ addressLine1: 'Street address', city: 'City', postalCode: 'Postal code', countryCode: 'Country code (2 letters)' }[key]}<input value={billing[key]} maxLength={key === 'countryCode' ? 2 : key === 'postalCode' ? 20 : key === 'city' ? 100 : 200} pattern={key === 'countryCode' ? '[A-Za-z]{2}' : undefined} onChange={e => setBilling(values => ({ ...values, [key]: key === 'countryCode' ? e.target.value.toUpperCase() : e.target.value }))} /></label>)}</div></details>
      </fieldset>
      <div className="order-editor-footer"><div className="order-editor-totals"><span>Previous total <strong>{formatMoney(original.total, original.currency)}</strong></span><span aria-live="polite">New total <strong>{valid ? formatMoney(valid.total, valid.currency) : currentQuote?.error ? 'Unavailable' : 'Calculating…'}</strong></span>{!!valid?.discountAmount && <small>Discount included: {formatMoney(valid.discountAmount, valid.currency)}</small>}</div>
        {(error || currentQuote?.error) && <p className="store-error" role="alert">{error || currentQuote?.error}</p>}
        <div className="order-editor-actions"><button type="button" className="store-secondary" disabled={busy} onClick={close}>Cancel</button><button className="store-button" disabled={busy || !valid || !dirty || !!catalogueError}>{busy ? 'Saving…' : 'Save changes'}</button></div>
      </div>
    </form>
  </dialog>;
}
