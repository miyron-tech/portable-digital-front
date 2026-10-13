'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { StoreAuth } from './StoreAuth';
import { AccountProfile } from './account/AccountProfile';
import { OrderWorkspace } from './account/OrderWorkspace';
import { OrderStatus, dateLabel, paymentLabel } from './account/shared';
import { storeApi, StoreError, type StoreOrder, type StoreUser } from '@/lib/store-client';
import { formatMoney } from '@/lib/format';
import './account/account.css';

type Section = 'orders' | 'messages' | 'profile' | 'security';
const sections: { key: Section; label: string }[] = [{ key: 'orders', label: 'Projects & orders' }, { key: 'messages', label: 'Messages' }, { key: 'profile', label: 'Your details' }, { key: 'security', label: 'Security' }];

export function Account() {
  const [user, setUser] = useState<StoreUser | null>(null);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [section, setSection] = useState<Section>('orders');
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [ready, setReady] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const refresh = useCallback(async () => {
    setLoadingOrders(true); setError('');
    try { setOrders(await storeApi<StoreOrder[]>('orders')); }
    catch (e) { if (e instanceof StoreError && e.status === 401) setUser(null); else setError('We could not load your orders. Please try again.'); }
    finally { setLoadingOrders(false); }
  }, []);
  useEffect(() => {
    let active = true;
    storeApi<StoreUser>('auth/me').then(u => { if (active) setUser(u); }).catch(e => { if (active && !(e instanceof StoreError && e.status === 401)) setError('We could not load your account. Please try again.'); }).finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);
  useEffect(() => { if (user?.id) void refresh(); }, [user?.id, refresh]);
  useEffect(() => {
    if (!user) return;
    const update = () => { if (!document.hidden) void refresh(); };
    const timer = setInterval(update, 60000); window.addEventListener('focus', update);
    return () => { clearInterval(timer); window.removeEventListener('focus', update); };
  }, [user, refresh]);
  async function logout() {
    setSigningOut(true); setError('');
    try { await storeApi('auth/logout', 'POST'); setUser(null); setOrders([]); setSelected(null); setNotice('You have been signed out.'); }
    catch { setError('We could not sign you out. Please try again.'); }
    finally { setSigningOut(false); }
  }
  if (!ready) return <div className="account-loading" role="status">Opening your workspace<span>Gathering your account and orders…</span></div>;
  if (!user) return <div className="store-auth-wrap">{notice && <p className="store-notice" role="status">{notice}</p>}{error && <p className="store-error" role="alert">{error}</p>}<StoreAuth onLogin={u => { setUser(u); setError(''); setNotice(''); setSection('orders'); }} /></div>;
  const unread = orders.reduce((n, o) => n + (o.unreadCount ?? 0), 0);
  const activeOrders = orders.filter(o => ['paid', 'in_progress', 'in_review'].includes(o.status));
  const unpaid = orders.filter(o => o.status === 'awaiting_payment');
  const current = orders.find(o => o.orderNumber === selected);
  const filtered = orders.filter(o => `${o.orderNumber} ${o.items.map(i => i.title).join(' ')}`.toLowerCase().includes(search.toLowerCase()) && (filter === 'all' || filter === 'active' && activeOrders.includes(o) || filter === 'unpaid' && o.status === 'awaiting_payment' || o.status === filter)).sort((a, b) => sort === 'oldest' ? (a.createdAt ?? '').localeCompare(b.createdAt ?? '') : (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  return <div className="account">
    <header className="account-heading"><div><p className="account-kicker">PORTABLE / YOUR WORKSPACE</p><h1>A little more<br />space to build.</h1><p className="account-intro">Welcome back, {user.name.split(' ')[0]}. Everything we are working on, together.</p></div><div className="account-identity"><span className="account-monogram" aria-hidden="true">{user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</span><div><strong>{user.name}</strong><span>{user.email}</span><button onClick={logout} disabled={signingOut}>{signingOut ? 'Signing out…' : 'Sign out ↗'}</button></div></div></header>
    <nav className="account-nav" aria-label="Account sections">{sections.map(s => <button key={s.key} aria-current={section === s.key ? 'page' : undefined} onClick={() => { setSection(s.key); setSelected(null); setError(''); }}>{s.label}{s.key === 'messages' && unread > 0 && <span className="account-count" aria-label={`${unread} unread messages`}>{unread}</span>}</button>)}<Link href="/services">Start something new <span aria-hidden="true">↗</span></Link></nav>
    {error && <div className="store-error" role="alert">{error} <button className="store-link" onClick={refresh}>Try again</button></div>}
    {(section === 'profile' || section === 'security') ? <AccountProfile key={section} section={section} user={user} onSave={setUser} onPasswordChanged={() => { setUser(null); setOrders([]); setSelected(null); setNotice('Password updated. All sessions have ended. Sign in with your new password.'); }} onLogout={logout} signingOut={signingOut} /> : current ? <OrderWorkspace key={current.orderNumber} order={current} user={user} initialTab={section === 'messages' ? 'messages' : 'details'} onBack={() => setSelected(null)} onRefresh={refresh} onRead={() => setOrders(items => items.map(o => o.id === current.id ? { ...o, unreadCount: 0 } : o))} /> : section === 'messages' ? <section className="account-section">
      <div className="account-section-heading"><div><p className="account-kicker">KEEP THE CONVERSATION GOING</p><h2>A direct line to the team.</h2><p>Every conversation stays with its project. Open an order to read, reply or share a file.</p></div><button className="account-text-button" onClick={refresh} disabled={loadingOrders}>{loadingOrders ? 'Refreshing…' : 'Refresh ↻'}</button></div>
      {orders.length ? <div className="account-conversations">{[...orders].sort((a, b) => (b.unreadCount ?? 0) - (a.unreadCount ?? 0)).map(o => <button key={o.id} className="account-conversation" onClick={() => setSelected(o.orderNumber)}><span className="account-order-number">/{o.orderNumber}</span><span><strong>{o.items[0]?.title ?? 'Project conversation'}</strong><small>{o.unreadCount ? `${o.unreadCount} unread ${o.unreadCount === 1 ? 'message' : 'messages'}` : 'Open conversation'}</small></span><OrderStatus status={o.status} /><span aria-hidden="true">↗</span></button>)}</div> : <Empty loading={loadingOrders} />}
    </section> : <section className="account-section">
      <div className="account-overview"><p><strong>{activeOrders.length}</strong> {activeOrders.length === 1 ? 'project' : 'projects'} underway <span aria-hidden="true">/</span> <strong>{unpaid.length}</strong> awaiting payment <span aria-hidden="true">/</span> <strong>{orders.filter(o => o.status === 'completed').length}</strong> completed</p><button className="account-text-button" onClick={refresh} disabled={loadingOrders}>{loadingOrders ? 'Refreshing…' : 'Refresh ↻'}</button></div>
      {unpaid.length > 0 && <div className="account-attention"><span className="account-status-dot" /><p>{unpaid.length === 1 ? 'One order is ready for the next step.' : `${unpaid.length} orders are ready for the next step.`} <span>Complete payment to get things moving.</span></p><button onClick={() => { setFilter('unpaid'); setSearch(''); }}>View orders <span aria-hidden="true">↗</span></button></div>}
      <div className="account-orders-heading"><div><p className="account-kicker">YOUR WORK, IN ONE PLACE</p><h2>Projects & orders <sup>{orders.length.toString().padStart(2, '0')}</sup></h2></div><label className="account-search"><span className="sr-only">Search orders</span><span aria-hidden="true">⌕</span><input type="search" placeholder="Find an order or service" value={search} onChange={e => setSearch(e.target.value)} /></label></div>
      <div className="account-filters"><div role="group" aria-label="Filter orders">{[['all', 'All orders'], ['active', 'In motion'], ['unpaid', 'Awaiting payment'], ['completed', 'Completed'], ['cancelled', 'Cancelled']].map(([v, label]) => <button key={v} aria-pressed={filter === v} onClick={() => setFilter(v)}>{label}</button>)}</div><label><span className="sr-only">Sort orders</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label></div>
      {loadingOrders && !orders.length ? <Empty loading /> : !orders.length ? <Empty /> : !filtered.length ? <div className="account-empty"><h3>No orders match.</h3><p>Try a different search or clear your filters.</p><button className="account-text-button" onClick={() => { setFilter('all'); setSearch(''); }}>Clear filters ↗</button></div> : <div className="account-orders"><div className="account-table-head" aria-hidden="true"><span>PROJECT / ORDER</span><span>STATUS</span><span>TOTAL</span><span /></div>{filtered.map(o => <article className="account-order" key={o.id}>
          <div className="account-order-main"><span className="account-order-number">/{o.orderNumber} <i>·</i> {dateLabel(o.createdAt)}</span><button className="account-project-title" onClick={() => setSelected(o.orderNumber)}>{o.items[0]?.title ?? 'Your project'}</button>{o.items.length > 1 && <small>+ {o.items.length - 1} more {o.items.length === 2 ? 'service' : 'services'}</small>}<span className="account-order-caption">{o.unreadCount ? <button onClick={() => { setSection('messages'); setSelected(o.orderNumber); }}>{o.unreadCount} new {o.unreadCount === 1 ? 'message' : 'messages'} ↗</button> : paymentLabel(o.payment?.status)}</span></div>
          <OrderStatus status={o.status} /><strong className="account-order-total">{formatMoney(o.total, o.currency)}</strong><button className="account-open" onClick={() => setSelected(o.orderNumber)} aria-label={`Open order ${o.orderNumber}`}><span className="account-open-label">{o.status === 'awaiting_payment' ? 'View & pay' : 'Open project'}</span><span aria-hidden="true">↗</span></button>
        </article>)}</div>}
      <div className="account-bottom-note"><span>A good project starts with a conversation.</span><Link href="/contact">Have something in mind? Let’s talk ↗</Link></div>
    </section>}
  </div>;
}
function Empty({ loading = false }: { loading?: boolean }) { return <div className="account-empty" role={loading ? 'status' : undefined}><span className="account-kicker">{loading ? 'ONE MOMENT' : 'A CLEAN SLATE'}</span><h3>{loading ? 'Gathering your projects…' : 'Your next idea belongs here.'}</h3><p>{loading ? 'Your orders will appear shortly.' : 'Explore our services, start a project and follow its progress here.'}</p>{!loading && <Link href="/services" className="store-secondary">Explore services ↗</Link>}</div>; }
