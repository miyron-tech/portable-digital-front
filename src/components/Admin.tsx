'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StoreAuth } from './StoreAuth';
import { storeApi, orderLabels, type StoreUser, type StoreOrder } from '@/lib/store-client';
import { CATEGORIES, formatMoney } from '@/lib/format';
import type { Paginated } from '@/lib/types';
import { ServiceEditor, type AdminService } from './admin/ServiceEditor';
import { OrderDetail } from './admin/OrderDetail';
import { dateLabel, OrderStatus, paymentLabel } from './account/shared';
import './admin/admin.css';

type Filters = { search: string; category: string; visibility: string; status: string };
const emptyFilters: Filters = { search: '', category: '', visibility: '', status: '' };
export function Admin() {
  const router = useRouter();
  const [user, setUser] = useState<StoreUser | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<'services' | 'orders'>('services');
  const [filters, setFilters] = useState(emptyFilters);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [services, setServices] = useState<AdminService[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [editing, setEditing] = useState<{ service?: AdminService; duplicate?: boolean } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    storeApi<StoreUser>('auth/me').then(u => { if (active && u.role === 'admin') setUser(u); }).catch(() => null).finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    let active = true;
    if (!user || editing || selected) return;
    const timer = setTimeout(async () => {
      setLoading(true); setError('');
      const params = new URLSearchParams({ page: String(page) });
      if (filters.search) params.set('search', filters.search);
      if (tab === 'services') { if (filters.category) params.set('category', filters.category); if (filters.visibility) params.set('visibility', filters.visibility); }
      else if (filters.status) params.set('status', filters.status);
      try {
        if (tab === 'services') {
          const data = await storeApi<Paginated<AdminService>>(`services/admin/all?${params}`);
          if (active) { setServices(data.items); setPages(data.pages); setTotal(data.total); if (page > data.pages) setPage(data.pages); }
        } else {
          const data = await storeApi<Paginated<StoreOrder>>(`orders/all?${params}`);
          if (active) { setOrders(data.items); setPages(data.pages); setTotal(data.total); if (page > data.pages) setPage(data.pages); }
        }
      } catch (e) { if (active) setError((e as Error).message); }
      finally { if (active) setLoading(false); }
    }, 0);
    return () => { active = false; clearTimeout(timer); };
  }, [tab, filters, page, user, revision, editing, selected]);
  function filter(key: keyof Filters, value: string) { setLoading(true); setPage(1); setFilters(f => ({ ...f, [key]: value })); setNotice(''); }
  async function publish(service: AdminService) {
    if (busy || (service.published && !window.confirm(`Unpublish “${service.title}”? It will no longer be available in the catalogue.`))) return;
    setBusy(service.id); setError(''); setNotice('');
    try { await storeApi(`services/${service.id}`, 'PATCH', { published: !service.published }); setRevision(n => n + 1); setNotice(`“${service.title}” ${service.published ? 'unpublished' : 'published'}.`); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(null); }
  }
  if (!ready) return <p role="status">Checking access…</p>;
  if (!user) return <div className="store-auth-wrap"><StoreAuth admin onLogin={setUser} /></div>;
  if (editing) return <div className="admin-root"><ServiceEditor service={editing.service} duplicate={editing.duplicate} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); setRevision(n => n + 1); setNotice('Service saved successfully.'); }} /></div>;
  if (selected) return <div className="admin-root"><OrderDetail number={selected} onClose={() => { setSelected(null); setRevision(n => n + 1); }} onChanged={() => setRevision(n => n + 1)} /></div>;
  return <div className="admin-root">
    <div className="store-heading"><div><span className="store-eyebrow">PORTABLE DIGITAL / CONTROL ROOM</span><h1>Your control room.</h1><p className="store-muted">Manage your catalogue. Keep every project moving.</p></div><button className="store-secondary" disabled={!!busy} onClick={async () => { setBusy('logout'); setError(''); try { await storeApi('auth/logout', 'POST'); router.push('/account'); router.refresh(); } catch (e) { setError((e as Error).message); } finally { setBusy(null); } }}>Sign out</button></div>
    <div className="store-toolbar"><div className="store-tabs">{(['services', 'orders'] as const).map(t => <button key={t} disabled={!!busy} aria-pressed={tab === t} onClick={() => { if (tab !== t) { setLoading(true); setTab(t); setPage(1); setFilters(emptyFilters); setQuery(''); setNotice(''); setError(''); } }}>{t === 'services' ? 'Services' : 'Orders'}</button>)}</div><div className="store-actions"><button className="store-secondary" disabled={loading || !!busy} onClick={() => setRevision(n => n + 1)}>Refresh ↻</button>{tab === 'services' && <button className="store-button" disabled={!!busy} onClick={() => setEditing({})}>+ Add service</button>}</div></div>
    <form className="store-form admin-filters" onSubmit={e => { e.preventDefault(); filter('search', query.trim()); }}><label className="admin-search">{tab === 'services' ? 'Search services' : 'Order number, customer name or email'}<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={tab === 'services' ? 'Search catalogue…' : 'Search orders…'} /></label><button className="store-secondary" type="submit">Search</button>
      {tab === 'services' ? <><label>Category<select value={filters.category} onChange={e => filter('category', e.target.value)}><option value="">All categories</option>{CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></label><label>Visibility<select value={filters.visibility} onChange={e => filter('visibility', e.target.value)}><option value="">All services</option><option value="published">Published</option><option value="draft">Drafts</option></select></label></> : <label>Status<select value={filters.status} onChange={e => filter('status', e.target.value)}><option value="">All statuses</option>{Object.entries(orderLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>}
      {Object.values(filters).some(Boolean) && <button className="store-link" type="button" onClick={() => { setLoading(true); setFilters(emptyFilters); setQuery(''); setPage(1); }}>Clear filters</button>}
    </form>
    {error && <p className="store-error" role="alert">{error} <button className="store-link" onClick={() => setRevision(n => n + 1)}>Try again</button></p>}{notice && <p className="store-notice" role="status">{notice}</p>}
    {loading ? <p role="status" className="admin-empty">Loading {tab}…</p> : error ? null : <><p className="admin-result-count" role="status">{total} {tab === 'services' ? 'services' : 'orders'} found</p>{tab === 'services' ? <div className="store-panel store-table-wrap"><table className="store-table"><thead><tr><th>Service</th><th>Category / Plans</th><th>Starting at</th><th>Visibility</th><th>Actions</th></tr></thead><tbody>{services.map(s => <tr key={s.id}><td><strong>{s.title}</strong><small>/{s.slug}</small>{s.featured && <small>Featured</small>}</td><td>{CATEGORIES.find(c => c.value === s.category)?.label}<small>{s.pricing.map(r => r.label || r.model).join(', ') || 'Enquiry-only'}</small></td><td>{formatMoney(s.priceFrom, s.currency)}</td><td><span className={`store-badge admin-visibility-${s.published ? 'published' : 'draft'}`}>{s.published ? 'Published' : 'Draft'}</span></td><td><div className="admin-table-actions"><button className="store-link" disabled={!!busy} onClick={() => setEditing({ service: s })}>Edit / Preview ↗</button><button className="store-link" disabled={!!busy} onClick={() => setEditing({ service: s, duplicate: true })}>Duplicate</button><button className="store-link" disabled={!!busy} onClick={() => void publish(s)}>{busy === s.id ? 'Saving…' : s.published ? 'Unpublish' : 'Publish'}</button>{s.published && <a className="store-link" href={`/services/${s.slug}`} target="_blank" rel="noreferrer">View live ↗</a>}</div></td></tr>)}</tbody></table>{!services.length && <p className="admin-empty">No services match these filters.</p>}</div> : <div className="store-panel store-table-wrap"><table className="store-table"><thead><tr><th>Order / Customer</th><th>Status / Payment</th><th>Total</th><th>Created</th><th>Actions</th></tr></thead><tbody>{orders.map(order => <tr key={order.id}><td><strong>#{order.orderNumber} · {order.customer.name}</strong><small>{order.customer.email}</small><small>{order.items.map(i => i.title).join(', ')}</small></td><td><OrderStatus status={order.status} /><small>{paymentLabel(order.payment?.status)}</small></td><td>{formatMoney(order.total, order.currency)}</td><td>{dateLabel(order.createdAt)}</td><td><button className="store-link" onClick={() => setSelected(order.orderNumber)}>Open order ↗</button>{!!order.unreadCount && <span className="admin-unread">{order.unreadCount} unread</span>}</td></tr>)}</tbody></table>{!orders.length && <p className="admin-empty">No orders match these filters.</p>}</div>}</>}
    {!error && <div className="store-pagination"><button disabled={page <= 1 || loading || !!busy} onClick={() => { setLoading(true); setPage(p => p - 1); }}>← Previous</button><span>{page} / {pages}</span><button disabled={page >= pages || loading || !!busy} onClick={() => { setLoading(true); setPage(p => p + 1); }}>Next →</button></div>}
  </div>;
}
