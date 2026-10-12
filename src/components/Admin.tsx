'use client';
import { useCallback, useEffect, useState } from 'react';
import { StoreAuth } from './StoreAuth';
import { storeApi, orderLabels, type StoreUser, type StoreOrder } from '@/lib/store-client';
import { CATEGORIES, formatMoney } from '@/lib/format';
import type { Service, Paginated } from '@/lib/types';

type AdminService = Service & { published: boolean };
const transitions: Record<string, string[]> = { awaiting_payment: ['cancelled'], paid: ['in_progress', 'cancelled'], in_progress: ['in_review', 'cancelled'], in_review: ['in_progress', 'completed', 'cancelled'], completed: [], cancelled: [] };
export function Admin() {
  const [user, setUser] = useState<StoreUser | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<'services' | 'orders'>('services');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [services, setServices] = useState<AdminService[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [editing, setEditing] = useState<AdminService | 'new' | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      if (tab === 'services') { const data = await storeApi<Paginated<AdminService>>(`services/admin/all?page=${page}`); setServices(data.items); setPages(data.pages); }
      else { const data = await storeApi<Paginated<StoreOrder>>(`orders/all?page=${page}`); setOrders(data.items); setPages(data.pages); }
    } catch (e) { setError((e as Error).message); } finally { setLoading(false); }
  }, [tab, page]);
  useEffect(() => { storeApi<StoreUser>('auth/me').then(u => { if (u.role === 'admin') setUser(u); }).catch(() => null).finally(() => setReady(true)); }, []);
  useEffect(() => {
    const timer = setTimeout(() => { if (user) void load(); }, 0);
    return () => clearTimeout(timer);
  }, [user, load]);
  async function mutate(work: () => Promise<void>) { setBusy(true); setError(''); setNotice(''); try { await work(); await load(); setNotice('Changes saved successfully.'); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }
  if (!ready) return <p>Checking access…</p>;
  if (!user) return <div className="store-auth-wrap"><StoreAuth admin onLogin={setUser} /></div>;
  const item = editing && editing !== 'new' ? editing : null;
  return <>
    <div className="store-heading"><div><span className="store-eyebrow">PORTABLE DIGITAL / CONTROL ROOM</span><h1>Your control room.</h1><p className="store-muted">Manage your catalogue. Keep every project moving.</p></div><button className="store-secondary" onClick={() => mutate(async () => { await storeApi('auth/logout', 'POST'); setUser(null); })}>Sign out</button></div>
    <div className="store-toolbar"><div className="store-tabs">{(['services', 'orders'] as const).map(t => <button key={t} aria-pressed={tab === t} onClick={() => { setTab(t); setPage(1); setEditing(null); }}>{t === 'services' ? 'Services' : 'Orders'}</button>)}</div><div className="store-actions"><button className="store-secondary" disabled={loading} onClick={load}>Refresh ↻</button>{tab === 'services' && <button className="store-button" onClick={() => setEditing('new')}>+ Add service</button>}</div></div>
    {error && <p className="store-error" role="alert">{error}</p>}{notice && <p className="store-notice" role="status">{notice}</p>}
    {editing && <form key={item?.id || 'new'} className="store-panel store-form" onSubmit={event => {
      event.preventDefault(); const form = new FormData(event.currentTarget);
      void mutate(async () => {
        const pricing = item ? item.pricing.map((rate, index) => ({ ...rate, amount: Math.round(Number(form.get(`rate-${index}`)) * 100), ...(rate.period ? {} : { period: undefined }), ...(rate.maxUnits == null ? { maxUnits: undefined } : {}) })) : [{ model: 'fixed', amount: Math.round(Number(form.get('price')) * 100) }];
        await storeApi(item ? `services/${item.id}` : 'services', item ? 'PATCH' : 'POST', {
          title: form.get('title'), slug: form.get('slug'), summary: form.get('summary'), description: form.get('description'), category: form.get('category'),
          priceFrom: Math.round(Number(form.get('price')) * 100), currency: form.get('currency'), deliveryTime: form.get('deliveryTime'),
          features: String(form.get('features')).split('\n').map(v => v.trim()).filter(Boolean), pricing,
          published: form.get('published') === 'on', featured: form.get('featured') === 'on',
        }); setEditing(null);
      });
    }}><div className="store-row"><h2>{item ? 'Edit service' : 'New service'}</h2><button type="button" className="store-link" onClick={() => setEditing(null)}>Close ×</button></div>
      <div className="store-form-grid"><label>Title<input name="title" defaultValue={item?.title} required minLength={3} maxLength={120} /></label><label>Page slug<input name="slug" defaultValue={item?.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="website-development" /></label>
      <label>Category<select name="category" defaultValue={item?.category || 'development'}>{CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></label><label>Currency<select name="currency" defaultValue={item?.currency || 'EUR'}>{Array.from(new Set(['EUR', 'USD', 'KZT', 'RUB', ...(item ? [item.currency] : [])])).map(c => <option key={c}>{c}</option>)}</select></label>
      <label>Starting price {item ? '' : '(fixed plan)'}<input name="price" type="number" required min="0" step="0.01" defaultValue={item ? item.priceFrom / 100 : undefined} /></label><label>Delivery time<input name="deliveryTime" maxLength={60} defaultValue={item?.deliveryTime} placeholder="2–4 weeks" /></label></div>
      <label>Summary<textarea name="summary" required minLength={10} maxLength={300} defaultValue={item?.summary} rows={2} /></label><label>Description<textarea name="description" required minLength={20} defaultValue={item?.description} rows={5} /></label>
      <label>Features — one per line<textarea name="features" defaultValue={item?.features.join('\n')} rows={4} /></label>
      {item?.pricing.map((rate, i) => <label key={i}>Plan price: {rate.label || rate.model} ({item.currency})<input name={`rate-${i}`} type="number" required min="0" step="0.01" defaultValue={rate.amount / 100} /></label>)}
      <div className="store-actions"><label className="store-check"><input type="checkbox" name="published" defaultChecked={item?.published ?? true} />Published</label><label className="store-check"><input type="checkbox" name="featured" defaultChecked={item?.featured ?? false} />Featured</label></div><button className="store-button" disabled={busy}>{busy ? 'Saving…' : 'Save service →'}</button>
    </form>}
    {loading ? <p role="status">Loading…</p> : tab === 'services' ? <div className="store-panel store-table-wrap"><table className="store-table"><thead><tr><th>Service</th><th>Starting at</th><th>Visibility</th><th>Actions</th></tr></thead><tbody>{services.map(s => <tr key={s.id}><td><strong>{s.title}</strong><small>/{s.slug}</small></td><td>{formatMoney(s.priceFrom, s.currency)}</td><td><span className="store-badge">{s.published ? 'Published' : 'Draft'}</span></td><td><button className="store-link" onClick={() => setEditing(s)}>Edit ↗</button><button className="store-link" disabled={busy} onClick={() => mutate(async () => { await storeApi(`services/${s.id}`, 'PATCH', { published: !s.published }); })}>{s.published ? 'Unpublish' : 'Publish'}</button></td></tr>)}</tbody></table>{!services.length && <p>No services yet. Add your first one.</p>}</div> : <div className="store-order-list">{orders.map(order => <article className="store-panel" key={order.id}><div className="store-row"><h2>{order.orderNumber}</h2><span className="store-badge">{orderLabels[order.status]}</span></div><p>{order.customer.name} · {order.customer.email}</p><p className="store-muted">{order.items.map(i => `${i.title} × ${i.units}`).join(', ')}</p><div className="store-row"><strong>{formatMoney(order.total, order.currency)}</strong><div className="store-actions">{(transitions[order.status] || []).map(status => <button className="store-secondary" disabled={busy} key={status} onClick={() => mutate(async () => { await storeApi(`orders/${order.id}/status`, 'PATCH', { status }); })}>{orderLabels[status]}</button>)}</div></div></article>)}{!orders.length && <div className="store-panel">Orders will appear here when a customer checks out.</div>}</div>}
    <div className="store-pagination"><button disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>← Previous</button><span>{page} / {pages}</span><button disabled={page >= pages || loading} onClick={() => setPage(page + 1)}>Next →</button></div>
  </>;
}
