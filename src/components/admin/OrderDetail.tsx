'use client';
import { useCallback, useEffect, useState } from 'react';
import { storeApi, orderLabels, termsLine, type StoreOrder } from '@/lib/store-client';
import { formatMoney } from '@/lib/format';
import { Conversation } from '../account/OrderWorkspace';
import { dateLabel, OrderStatus, paymentLabel } from '../account/shared';
import { useUnsavedChanges } from './useUnsavedChanges';

const transitions: Record<string, string[]> = { awaiting_payment: ['cancelled'], paid: ['in_progress', 'cancelled'], in_progress: ['in_review', 'cancelled'], in_review: ['in_progress', 'completed', 'cancelled'], completed: [], cancelled: [] };
export function OrderDetail({ number, onClose, onChanged }: { number: string; onClose: () => void; onChanged: () => void }) {
  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'details' | 'messages'>('details');
  const [draft, setDraft] = useState({ dirty: false, busy: false });
  const allowLeave = useUnsavedChanges(draft.dirty, busy || draft.busy);
  const draftChange = useCallback((dirty: boolean, sending: boolean) => setDraft({ dirty, busy: sending }), []);
  const read = useCallback(() => setOrder(o => o?.unreadCount ? { ...o, unreadCount: 0 } : o), []);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setOrder(await storeApi<StoreOrder>(`orders/${number}`)); }
    catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }, [number]);
  useEffect(() => { const timer = setTimeout(() => void load(), 0); return () => clearTimeout(timer); }, [load]);
  async function changeStatus(status: string) {
    if (!order || busy) return;
    if ((status === 'cancelled' || status === 'completed') && !window.confirm(status === 'cancelled' ? `Cancel order #${order.orderNumber}? This cannot be undone here. Cancelling the order does not refund a payment.` : `Mark order #${order.orderNumber} as completed? This cannot be undone here.`)) return;
    setBusy(true); setError(''); setNotice('');
    try { await storeApi(`orders/${order.id}/status`, 'PATCH', { status }); await load(); onChanged(); setNotice(`Order marked ${orderLabels[status].toLowerCase()}.`); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  return <section className="admin-order"><div className="store-row"><button className="store-secondary" disabled={busy || draft.busy} onClick={() => { if (allowLeave()) onClose(); }}>← Back to orders</button><button className="store-secondary" disabled={loading || busy} onClick={load}>Refresh order</button></div>
    {error && <p role="alert" className="store-error">{error}</p>}{notice && <p role="status" className="store-notice">{notice}</p>}
    {!order ? <p role="status">{loading ? 'Loading order…' : 'Order could not be loaded. Try refreshing.'}</p> : <><div className="admin-detail-heading"><div><span className="store-eyebrow">ORDER · {dateLabel(order.createdAt, true)}</span><h2>#{order.orderNumber}</h2></div><OrderStatus status={order.status} /></div>
      <div className="store-toolbar"><div className="store-tabs"><button aria-pressed={tab === 'details'} disabled={draft.busy} onClick={() => { if (tab === 'details' || allowLeave()) { setTab('details'); setDraft({ dirty: false, busy: false }); } }}>Order details</button><button aria-pressed={tab === 'messages'} onClick={() => setTab('messages')}>Conversation {order.unreadCount ? `(${order.unreadCount} unread)` : ''}</button></div></div>
      {tab === 'messages' ? <Conversation key={number} order={order} admin onRead={read} onDraftChange={draftChange} /> : <><div className="admin-detail-grid"><div className="store-panel"><h3>Scope of work</h3>{order.items.map((item, i) => <div className="admin-order-item" key={i}><div><strong>{item.title}</strong><p className="store-muted">{item.units} {item.model === 'hourly' || item.model === 'mixed' ? 'hours' : 'units'} · {item.model ?? 'Service'}</p>{item.notes && <p className="admin-description">{item.notes}</p>}</div>{item.pricing && <strong>{formatMoney(item.pricing.total, order.currency)}</strong>}</div>)}{order.note && <><h3>Project brief</h3><p className="admin-description">{order.note}</p></>}</div>
      <aside className="store-panel"><h3>Customer</h3><dl className="admin-facts"><div><dt>Name</dt><dd>{order.customer.name}</dd></div><div><dt>Email</dt><dd><a href={`mailto:${order.customer.email}`}>{order.customer.email}</a></dd></div>{order.customer.phone && <div><dt>Phone</dt><dd>{order.customer.phone}</dd></div>}{order.customer.company && <div><dt>Company</dt><dd>{order.customer.company}</dd></div>}</dl><h3>Payment summary</h3><dl className="admin-facts"><div><dt>Subtotal</dt><dd>{formatMoney(order.subtotal ?? order.total, order.currency)}</dd></div>{!!order.discountAmount && <div><dt>Discount</dt><dd>−{formatMoney(order.discountAmount, order.currency)}</dd></div>}<div><dt>Total</dt><dd><strong>{formatMoney(order.total, order.currency)}</strong></dd></div><div><dt>Payment</dt><dd>{paymentLabel(order.payment?.status)}</dd></div>{order.payment?.paidAt && <div><dt>Paid</dt><dd>{dateLabel(order.payment.paidAt, true)}</dd></div>}</dl>{termsLine(order) && <p className="account-form-help">{termsLine(order)}</p>}</aside></div>
      <div className="store-panel"><h3>Order status</h3><p className="store-muted">Last updated {dateLabel(order.updatedAt, true)}</p><div className="store-actions">{(transitions[order.status] ?? []).map(status => <button key={status} className={status === 'cancelled' ? 'store-secondary admin-danger' : 'store-secondary'} disabled={busy || loading} onClick={() => void changeStatus(status)}>{status === 'cancelled' ? 'Cancel order' : `Mark ${orderLabels[status].toLowerCase()}`}</button>)}{!(transitions[order.status]?.length) && <p>No further status changes are available.</p>}</div></div></>}
    </>}
  </section>;
}
