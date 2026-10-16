'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSelection } from './SelectionProvider';
import { formatMoney, rateNotes, ratePrice, rateTitle } from '@/lib/format';
import type { Service } from '@/lib/types';
import { storeApi } from '@/lib/store-client';

export function Checkout({ service }: { service: Service }) {
  const { add, busy } = useSelection();
  const [rateIndex, setRateIndex] = useState(0);
  const rate = service.pricing[rateIndex];
  const [units, setUnits] = useState(rate?.minUnits || 1);
  const [milestones, setMilestones] = useState<string[]>(rate?.milestones.map(m => m.key) ?? []);
  const [quote, setQuote] = useState<{ total: number; currency: string } | null>(null);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!rate) return;
    let active = true;
    storeApi<{ total: number; currency: string }>('estimate/price', 'POST', { items: [{ serviceId: service.id, model: rate.model, units, milestoneKeys: milestones }] })
      .then(value => { if (active) { setQuote(value); setError(''); } })
      .catch(e => { if (active) { setQuote(null); setError(e.message); } });
    return () => { active = false; };
  }, [service.id, rate, units, milestones]);
  if (!rate) return <div className="store-panel"><h2>A scope built around you</h2><Link className="store-button" href="/contact">Discuss your project →</Link></div>;
  return <div className="store-checkout"><div>
    <span className="store-eyebrow">BUILD YOUR SELECTION</span><h1>Make it your own.</h1><p className="store-muted">Choose the scope for {service.title}. Add more services whenever you like.</p>
        <section className="store-panel store-form"><h2>Make it your own</h2>
          <label>Plan<select value={rateIndex} onChange={e => { const index = Number(e.target.value); setRateIndex(index); setUnits(service.pricing[index].minUnits || 1); setMilestones(service.pricing[index].milestones.map(m => m.key)); setQuote(null); }}>
            {service.pricing.map((r, i) => <option value={i} key={i}>{rateTitle(r)} · {ratePrice(r, service.currency)}</option>)}
          </select></label>
          <label>{rate.model === 'hourly' || rate.model === 'mixed' ? 'Number of hours' : rate.model === 'retainer' ? 'Number of periods' : 'Number of projects'}<input type="number" min={rate.minUnits || 1} max={rate.maxUnits || undefined} value={units} onChange={e => { setUnits(Number(e.target.value)); setQuote(null); }} /></label>
          {/* Условия тарифа рядом с количеством: ставка, минимальный заказ суммой, округление неполного часа. */}
          {rateNotes(rate, service.currency).length > 0 && <ul className="store-muted text-sm">{[ratePrice(rate, service.currency), ...rateNotes(rate, service.currency)].map(note => <li key={note}>{note}</li>)}</ul>}
          {rate.milestones.map(m => <label className="store-check" key={m.key}><input type="checkbox" checked={m.required || milestones.includes(m.key)} disabled={m.required} onChange={e => { setMilestones(e.target.checked ? [...milestones, m.key] : milestones.filter(key => key !== m.key)); setQuote(null); }} />{m.title} · {formatMoney(m.amount, service.currency)}{m.required ? ' (included)' : ''}</label>)}
          <p className="store-muted">Calculated using the current service rates.</p><strong className="store-total">{quote ? formatMoney(quote.total, quote.currency) : 'Calculating…'}</strong>
        </section>

    <div className="selection-next"><button className="store-button" disabled={busy || !quote || !Number.isInteger(units)} onClick={async () => {
      setError('');
      try { await add({ serviceId: service.id, model: rate.model, units, milestoneKeys: milestones }); setAdded(true); }
      catch (e) { setError((e as Error).message); }
    }}>{busy ? 'Saving…' : 'Add to selection +'}</button><Link className="store-link" href="/selection">View selected services →</Link></div>
    {added && <p className="store-muted" role="status">Service added. <Link href="/services" className="store-link">Choose another service →</Link></p>}
    {error && <p role="alert" className="store-error">{error}</p>}
    </div><aside className="store-panel store-summary"><span className="store-eyebrow">YOUR NEXT CHAPTER</span><h2>{service.title}</h2><p className="store-muted">{service.summary}</p><ul>{service.features.map(feature => <li key={feature}>↗ {feature}</li>)}</ul><div className="store-row"><span>Delivery</span><span>{service.deliveryTime || 'Agreed together'}</span></div></aside></div>;
}
