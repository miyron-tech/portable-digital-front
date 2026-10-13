'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { PayButton } from '../PayButton';
import { storeApi, StoreError, termsLine, type StoreMessage, type StoreOrder, type StorePayment, type StoreUser } from '@/lib/store-client';
import { formatMoney } from '@/lib/format';
import { dateLabel, OrderStatus, paymentLabel } from './shared';

export function OrderWorkspace({ order, user, initialTab, onBack, onRefresh, onRead }: { order: StoreOrder; user: StoreUser; initialTab: 'details' | 'messages'; onBack: () => void; onRefresh: () => Promise<void>; onRead: () => void }) {
  const [tab, setTab] = useState(initialTab);
  const [payment, setPayment] = useState<StorePayment | null>(null);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const paid = order.payment?.isPaid || ['paid', 'in_progress', 'in_review', 'completed'].includes(order.status);
  const steps = ['awaiting_payment', 'paid', 'in_progress', 'in_review', 'completed'];
  const step = steps.indexOf(order.status);
  const paymentState = payment?.status ?? order.payment?.status;
  async function sync() {
    setSyncing(true); setError('');
    try { setPayment(await storeApi<StorePayment>(`payments/status/${order.orderNumber}?sync=1`)); await onRefresh(); }
    catch (e) { if (e instanceof StoreError && e.status === 404) setError('No payment has been started for this order yet.'); else setError('We could not check your payment. Please try again.'); }
    finally { setSyncing(false); }
  }
  return <section className="account-project"><button className="account-back" onClick={onBack}>← Back to {initialTab === 'messages' ? 'messages' : 'orders'}</button><div className="account-project-heading"><div><p className="account-kicker">ORDER /{order.orderNumber} · {dateLabel(order.createdAt)}</p><h2>{order.items[0]?.title ?? 'Your project'}</h2></div><OrderStatus status={order.status} /></div>
    <div className="account-project-tabs" role="group" aria-label="Order sections"><button aria-pressed={tab === 'details'} onClick={() => setTab('details')}>Project details</button><button aria-pressed={tab === 'messages'} onClick={() => setTab('messages')}>Conversation {order.unreadCount ? <span className="account-count">{order.unreadCount}</span> : null}</button><Link href={`/orders/${order.orderNumber}`}>Payment page ↗</Link></div>
    {tab === 'messages' ? <Conversation order={order} onRead={onRead} /> : <>
      {order.status !== 'cancelled' && <ol className="account-progress" aria-label="Project progress">{['Awaiting payment', 'Confirmed', 'In progress', 'In review', 'Completed'].map((label, i) => <li key={label} className={i <= step ? 'reached' : ''} aria-current={i === step ? 'step' : undefined}><span>{i < step ? '✓' : String(i + 1).padStart(2, '0')}</span>{label}</li>)}</ol>}
      <div className="account-project-grid"><div><h3 className="account-detail-label">Scope of work</h3>{order.items.map((item, i) => <div className="account-scope" key={i}><div><strong>{item.title}</strong><small>{item.units} {item.model === 'hourly' || item.model === 'mixed' ? 'hours' : item.units === 1 ? 'unit' : 'units'} · {item.model === 'fixed' ? 'Fixed price' : item.model === 'hourly' ? 'Hourly' : item.model === 'retainer' ? 'Retainer' : 'Service'}{item.notes ? ` · ${item.notes}` : ''}</small></div>{item.pricing && <span>{formatMoney(item.pricing.total, order.currency)}</span>}</div>)}{order.note && <div className="account-project-note"><h3>Your project brief</h3><p>{order.note}</p></div>}<div className="account-project-note"><h3>Keep everything in the loop.</h3><p>Questions, references, feedback — share them with the team in your project conversation.</p><button className="account-text-button" onClick={() => setTab('messages')}>Open conversation ↗</button></div></div>
        <aside className="account-payment"><p className="account-kicker">ORDER SUMMARY</p><div className="account-summary-row"><span>Services</span><span>{formatMoney(order.subtotal ?? order.total, order.currency)}</span></div>{!!order.discountAmount && <div className="account-summary-row"><span>Discount</span><span>−{formatMoney(order.discountAmount, order.currency)}</span></div>}<div className="account-payment-total"><span>Total</span><strong>{formatMoney(order.total, order.currency)}</strong></div><p className="account-payment-state">{paymentState ? paymentLabel(paymentState) : paid ? 'Payment received' : 'Awaiting payment'}</p>{(payment?.paidAt || order.payment?.paidAt) && <p className="account-form-help">Paid {dateLabel(payment?.paidAt ?? order.payment?.paidAt)}</p>}
          {order.status === 'awaiting_payment' && !paid && <PayButton order={order} user={user} />}
          {order.status !== 'cancelled' && <button className="account-text-button" onClick={sync} disabled={syncing}>{syncing ? 'Checking…' : 'Check payment status ↻'}</button>}{error && <p className="store-error" role="alert">{error}</p>}{termsLine(order) && <p className="account-terms">{termsLine(order)}</p>}<Link href="/legal/refund-cancellation" className="account-text-button">Refund & cancellation policy ↗</Link>
        </aside>
      </div>
    </>}
  </section>;
}

function Conversation({ order, onRead }: { order: StoreOrder; onRead: () => void }) {
  const [messages, setMessages] = useState<StoreMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [body, setBody] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const read = useRef(onRead);
  useEffect(() => { read.current = onRead; }, [onRead]);
  useEffect(() => {
    let active = true;
    const load = async () => {
      if (document.hidden) return;
      try { const data = await storeApi<{ items: StoreMessage[] }>(`orders/${order.orderNumber}/messages`); if (active) { setMessages(data.items); setError(''); read.current(); } }
      catch { if (active) setError('We could not load the conversation. Please try again.'); }
      finally { if (active) setLoading(false); }
    };
    void load(); const timer = setInterval(load, 15000);
    return () => { active = false; clearInterval(timer); };
  }, [order.orderNumber, reload]);
  return <div className="account-chat"><div className="account-chat-intro"><h3>Your project conversation</h3><p>Talk directly with the Portable team. Messages and files stay together with this order.</p></div><div className="account-chat-feed" aria-label="Project messages" aria-busy={loading}>
    {loading ? <p role="status">Loading conversation…</p> : !messages.length ? <div className="account-empty"><h3>Start the conversation.</h3><p>Tell us a little more about your project or share your first references.</p></div> : messages.map(m => <article key={m.id} className={`account-message account-message-${m.authorRole}`}><header><span>{m.authorRole === 'admin' ? 'PORTABLE TEAM' : 'YOU'} <strong>{m.authorName}</strong></span><time dateTime={m.createdAt}>{dateLabel(m.createdAt, true)}</time></header>{m.body && <p>{m.body}</p>}{m.attachments.map(f => <a className="account-attachment" key={f.index} href={`/api/store/orders/${order.orderNumber}/messages/${m.id}/files/${f.index}`} download><span aria-hidden="true">↓</span><span>{f.originalName}<small>{Math.max(1, Math.round(f.size / 1024))} KB</small></span></a>)}{m.authorRole === 'customer' && <small className="account-read-status">{m.readByAdminAt ? 'Read by the team' : 'Sent'}</small>}</article>)}
    </div>{error && <div className="store-error" role="alert">{error} <button className="store-link" onClick={() => setReload(r => r + 1)}>Try again</button></div>}
    <form className="account-compose store-form" onSubmit={async e => {
      e.preventDefault(); if (!body.trim() && !files.length || busy) return; setBusy(true); setError('');
      try { const form = new FormData(); form.set('body', body.trim()); files.forEach(file => form.append('files', file)); const message = await storeApi<StoreMessage>(`orders/${order.orderNumber}/messages`, 'POST', form); setMessages(items => items.some(m => m.id === message.id) ? items : [...items, message]); setBody(''); setFiles([]); if (input.current) input.current.value = ''; }
      catch (e) { setError(e instanceof Error ? e.message : 'We could not send your message. Please try again.'); }
      finally { setBusy(false); }
    }}><label htmlFor="project-message">Your message<textarea id="project-message" rows={4} maxLength={5000} placeholder="A question, an update, an idea…" value={body} onChange={e => setBody(e.target.value)} disabled={busy} /></label><div className="account-compose-actions"><label className="account-file-label">Attach files<input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" disabled={busy} onChange={e => { const next = Array.from(e.target.files ?? []); if (next.length > 5 || next.some(f => f.size > 10 * 1024 * 1024) || next.reduce((n, f) => n + f.size, 0) > 20 * 1024 * 1024) { setError('Use up to 5 files, 10 MB each and 20 MB in total.'); e.target.value = ''; setFiles([]); } else { setFiles(next); setError(''); } }} /></label><span>{body.length}/5000</span><button className="store-button" disabled={busy || loading || !body.trim() && !files.length}>{busy ? 'Sending…' : 'Send message ↗'}</button></div>{files.length > 0 && <ul className="account-file-list">{files.map((f, i) => <li key={`${f.name}-${i}`}><span>{f.name}</span><button type="button" disabled={busy} onClick={() => setFiles(items => items.filter((_, n) => n !== i))} aria-label={`Remove ${f.name}`}>×</button></li>)}</ul>}<p className="account-form-help">JPG, PNG, WebP or PDF. Up to 5 files, 10 MB each and 20 MB in total.</p></form>
  </div>;
}
