'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PayButton } from './PayButton';
import { StoreAuth } from './StoreAuth';
import { storeApi, orderLabels, type StoreOrder, type StoreUser } from '@/lib/store-client';
import { formatMoney } from '@/lib/format';
export function Account() {
  const [user, setUser] = useState<StoreUser | null>(null);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  useEffect(() => { storeApi<StoreUser>('auth/me').then(setUser).catch(() => null).finally(() => setReady(true)); }, []);
  useEffect(() => { if (user) storeApi<StoreOrder[]>('orders').then(setOrders).catch(e => setError(e.message)); }, [user]);
  if (!ready) return <p>Loading your account…</p>;
  if (!user) return <div className="store-auth-wrap"><StoreAuth onLogin={setUser} /></div>;
  return <><div className="store-heading"><div><span className="store-eyebrow">YOUR ACCOUNT</span><h1>My orders.</h1><p className="store-muted">{user.name} · {user.email}</p></div><button className="store-secondary" onClick={async () => { try { await storeApi('auth/logout', 'POST'); setUser(null); setOrders([]); } catch (e) { setError((e as Error).message); } }}>Sign out</button></div>{error && <p role="alert" className="store-error">{error}</p>}<div className="store-order-list">{orders.map(order => <article className="store-panel" key={order.id}><div className="store-row"><h2>{order.orderNumber}</h2><span className="store-badge">{orderLabels[order.status]}</span></div><p>{order.items.map(item => `${item.title} × ${item.units}`).join(', ')}</p><strong>{formatMoney(order.total, order.currency)}</strong>{order.status === 'awaiting_payment' && <div className="store-order-pay"><PayButton order={order} user={user} label="Pay now →" /><Link className="store-link" href={`/orders/${order.orderNumber}`}>Payment status</Link></div>}</article>)}{!orders.length && !error && <div className="store-panel"><h2>Your next project starts here.</h2><Link href="/services" className="store-button">Explore services →</Link></div>}</div></>;
}
