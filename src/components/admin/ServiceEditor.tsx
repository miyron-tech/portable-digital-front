'use client';
import { useRef, useState } from 'react';
import { CATEGORIES, formatMoney } from '@/lib/format';
import { storeApi, StoreError } from '@/lib/store-client';
import type { Service, ServiceRate, PricingModel } from '@/lib/types';
import { useUnsavedChanges } from './useUnsavedChanges';

export type AdminService = Service & { published: boolean; icon?: string; order?: number };
type Rate = { model: PricingModel; label: string; amount: string; baseAmount: string; includedHours: string; overageAmount: string; minUnits: string; maxUnits: string; period: string; tiers: { minHours: string; discountPercent: string }[]; milestones: { key: string; title: string; amount: string; required: boolean }[] };
const models: PricingModel[] = ['fixed', 'hourly', 'mixed', 'retainer'];
const money = (value = 0) => String(value / 100);
const minor = (value: string) => Math.round(Number(value) * 100);
function draftRate(rate?: ServiceRate, model: PricingModel = 'fixed'): Rate {
  return { model: rate?.model ?? model, label: rate?.label ?? '', amount: money(rate?.amount), baseAmount: money(rate?.baseAmount), includedHours: String(rate?.includedHours ?? 0), overageAmount: money(rate?.overageAmount), minUnits: String(rate?.minUnits ?? 1), maxUnits: rate?.maxUnits == null ? '' : String(rate.maxUnits), period: rate?.period ?? 'month', tiers: (rate?.tiers ?? []).map(t => ({ minHours: String(t.minHours), discountPercent: String(t.discountPercent) })), milestones: (rate?.milestones ?? []).map(m => ({ ...m, amount: money(m.amount) })) };
}

export function ServiceEditor({ service, duplicate, onClose, onSaved }: { service?: AdminService; duplicate?: boolean; onClose: () => void; onSaved: () => void }) {
  const [initial] = useState({ title: duplicate ? `${service?.title ?? ''} (copy)`.slice(0, 120) : service?.title ?? '', slug: duplicate ? `${service?.slug}-copy` : service?.slug ?? '', category: service?.category ?? 'development', currency: service?.currency ?? 'EUR', price: money(service?.priceFrom), deliveryTime: service?.deliveryTime ?? '', summary: service?.summary ?? '', description: service?.description ?? '', features: service?.features.join('\n') ?? '', published: duplicate ? false : service?.published ?? false, featured: duplicate ? false : service?.featured ?? false, rates: service ? service.pricing.map(r => draftRate(r)) : [draftRate()] });
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const allowLeave = useUnsavedChanges(dirty, busy);
  function set<K extends keyof typeof draft>(key: K, value: typeof draft[K]) { setDraft(d => ({ ...d, [key]: value })); setErrors(e => ({ ...e, [key]: '' })); }
  function rateSet(index: number, patch: Partial<Rate>) { setDraft(d => ({ ...d, rates: d.rates.map((r, i) => i === index ? { ...r, ...patch } : r) })); }
  function field(name: string, label: string, value: string, change: (value: string) => void, props: React.InputHTMLAttributes<HTMLInputElement> = {}) {
    return <label>{label}<input {...props} name={name} value={value} onChange={e => { change(e.target.value); setErrors(old => ({ ...old, [name]: '' })); }} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-error` : undefined} />{errors[name] && <small id={`${name}-error`} className="admin-field-error">{errors[name]}</small>}</label>;
  }
  const number = (name: string, label: string, value: string, change: (v: string) => void, integer = false, min = 0, optional = false, max?: number) => field(name, label, value, change, { type: 'number', required: !optional, min, max, step: integer ? 1 : 0.01 });
  function validate() {
    const next: Record<string, string> = {};
    for (const element of Array.from(form.current?.elements ?? [])) {
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
        if (!element.validity.valid) next[element.name] = element.validationMessage;
        if (element.required && !element.value.trim()) next[element.name] = 'This field is required.';
        if ('minLength' in element && element.minLength > 0 && element.value.trim().length < element.minLength) next[element.name] = `Use at least ${element.minLength} characters.`;
      }
    }
    draft.rates.forEach((r, i) => {
      if (r.maxUnits && Number(r.maxUnits) < Number(r.minUnits)) next[`rate-${i}-maxUnits`] = 'Maximum must be at least the minimum.';
      r.milestones.forEach((m, j) => { if (r.milestones.some((other, k) => k !== j && other.key === m.key)) next[`rate-${i}-milestone-${j}-key`] = 'Use a unique key for each stage.'; });
      r.tiers.forEach((t, j) => { if (r.tiers.some((other, k) => k !== j && other.minHours === t.minHours)) next[`rate-${i}-tier-${j}-minHours`] = 'Use a unique hours threshold.'; });
    });
    setErrors(next);
    if (Object.keys(next).length) { requestAnimationFrame(() => (form.current?.querySelector('[aria-invalid="true"]') as HTMLElement)?.focus()); return false; }
    return true;
  }
  async function save() {
    if (busy || !validate()) return;
    if (service && !duplicate && service.published && !draft.published && !window.confirm(`Unpublish “${service.title}”? It will no longer be available in the catalogue.`)) return;
    setBusy(true); setError('');
    const pricing = draft.rates.map(r => ({ model: r.model, label: r.label.trim(), amount: minor(r.amount), baseAmount: minor(r.baseAmount), includedHours: Number(r.includedHours), overageAmount: minor(r.overageAmount), minUnits: Number(r.minUnits), ...(r.maxUnits ? { maxUnits: Number(r.maxUnits) } : {}), ...(r.model === 'retainer' ? { period: r.period } : {}), tiers: r.tiers.map(t => ({ minHours: Number(t.minHours), discountPercent: Number(t.discountPercent) })), milestones: r.milestones.map(m => ({ ...m, title: m.title.trim(), amount: minor(m.amount) })) }));
    try {
      await storeApi(service && !duplicate ? `services/${service.id}` : 'services', service && !duplicate ? 'PATCH' : 'POST', { title: draft.title.trim(), slug: draft.slug, category: draft.category, currency: draft.currency, priceFrom: minor(draft.price), deliveryTime: draft.deliveryTime.trim(), summary: draft.summary.trim(), description: draft.description.trim(), features: draft.features.split('\n').map(s => s.trim()).filter(Boolean), published: draft.published, featured: draft.featured, pricing, ...(duplicate ? { tags: service?.tags ?? [], seo: service?.seo, icon: service?.icon, order: service?.order } : {}) });
      onSaved();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not save service.';
      setError(message);
      if (e instanceof StoreError && (e.status === 409 || /slug/i.test(message))) setErrors(old => ({ ...old, slug: 'This address is already used or invalid. Choose another slug.' }));
    } finally { setBusy(false); }
  }
  return <section className="admin-editor"><div className="store-row"><div><span className="store-eyebrow">{duplicate ? 'DUPLICATE AS DRAFT' : service ? 'EDIT SERVICE' : 'NEW SERVICE'}</span><h2>{draft.title || 'Untitled service'}</h2></div><button className="store-secondary" disabled={busy} onClick={() => { if (allowLeave()) onClose(); }}>Close ×</button></div>
    <form ref={form} className="store-form" noValidate onSubmit={e => { e.preventDefault(); void save(); }}>
      <fieldset disabled={busy} className="admin-fields"><div className="store-form-grid">
        {field('title', 'Title', draft.title, v => set('title', v), { required: true, minLength: 3, maxLength: 120 })}
        {field('slug', 'Page slug', draft.slug, v => set('slug', v), { required: true, pattern: '[a-z0-9]+(-[a-z0-9]+)*', placeholder: 'website-development' })}
        <label>Category<select value={draft.category} onChange={e => set('category', e.target.value as typeof draft.category)}>{CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></label>
        <label>Currency<select value={draft.currency} onChange={e => set('currency', e.target.value)}>{Array.from(new Set(['EUR', 'USD', 'KZT', 'RUB', draft.currency])).map(c => <option key={c}>{c}</option>)}</select></label>
        {number('price', `Catalogue starting price (${draft.currency})`, draft.price, v => set('price', v))}
        {field('deliveryTime', 'Delivery time', draft.deliveryTime, v => set('deliveryTime', v), { maxLength: 60 })}
      </div><p className="account-form-help">The catalogue starting price is displayed separately from checkout plans.</p>
      {(['summary', 'description', 'features'] as const).map(key => <label key={key}>{key === 'features' ? 'Features — one per line' : key === 'summary' ? 'Summary' : 'Description'}<textarea name={key} value={draft[key]} onChange={e => set(key, e.target.value)} required={key !== 'features'} minLength={key === 'summary' ? 10 : key === 'description' ? 20 : undefined} maxLength={key === 'summary' ? 300 : undefined} rows={key === 'summary' ? 2 : 5} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${key}-error` : undefined} />{errors[key] && <small id={`${key}-error`} className="admin-field-error">{errors[key]}</small>}</label>)}
      <div className="store-row"><div><h3>Pricing plans</h3><p className="account-form-help">One plan per billing model. All prices are in {draft.currency}.</p></div><button type="button" className="store-secondary" disabled={draft.rates.length >= models.length} onClick={() => set('rates', [...draft.rates, draftRate(undefined, models.find(m => !draft.rates.some(r => r.model === m))!)])}>+ Add plan</button></div>
      {!draft.rates.length && <p className="store-notice">Without a pricing plan this service is enquiry-only.</p>}
      {draft.rates.map((r, i) => <section key={i} className="admin-rate"><div className="store-row"><h3>Plan {i + 1}</h3><button type="button" className="store-link" onClick={() => { if (window.confirm('Remove this pricing plan? The change takes effect when you save.')) set('rates', draft.rates.filter((_, n) => n !== i)); }}>Remove plan</button></div><div className="store-form-grid">
        <label>Billing model<select value={r.model} onChange={e => rateSet(i, { model: e.target.value as PricingModel })}>{models.map(m => <option key={m} value={m} disabled={draft.rates.some((other, n) => n !== i && other.model === m)}>{m === 'mixed' ? 'Mixed — base + hourly' : m[0].toUpperCase() + m.slice(1)}</option>)}</select></label>
        {field(`rate-${i}-label`, 'Plan name', r.label, v => rateSet(i, { label: v }), { maxLength: 80 })}
        {number(`rate-${i}-amount`, r.model === 'hourly' || r.model === 'mixed' ? 'Hourly price' : r.model === 'retainer' ? 'Price per period' : 'Project price', r.amount, v => rateSet(i, { amount: v }))}
        {r.model === 'mixed' && number(`rate-${i}-baseAmount`, 'Base price', r.baseAmount, v => rateSet(i, { baseAmount: v }))}
        {r.model === 'retainer' && <><label>Billing period<select value={r.period} onChange={e => rateSet(i, { period: e.target.value })}>{['month', 'quarter', 'year'].map(p => <option key={p}>{p}</option>)}</select></label>{number(`rate-${i}-includedHours`, 'Included hours', r.includedHours, v => rateSet(i, { includedHours: v }), true)}{number(`rate-${i}-overageAmount`, 'Extra hour price', r.overageAmount, v => rateSet(i, { overageAmount: v }))}</>}
        {number(`rate-${i}-minUnits`, 'Minimum units / hours', r.minUnits, v => rateSet(i, { minUnits: v }), true, 1)}
        {number(`rate-${i}-maxUnits`, 'Maximum (blank = unlimited)', r.maxUnits, v => rateSet(i, { maxUnits: v }), true, 1, true)}
      </div>
      {(r.model !== 'fixed' || r.tiers.length > 0) && <div className="admin-subsection"><h4>Volume discounts</h4>{r.tiers.map((t, j) => <div className="admin-rate-row" key={j}>{number(`rate-${i}-tier-${j}-minHours`, 'From hours', t.minHours, v => rateSet(i, { tiers: r.tiers.map((o, n) => n === j ? { ...o, minHours: v } : o) }), true, 1)}{number(`rate-${i}-tier-${j}-discountPercent`, 'Discount (%)', t.discountPercent, v => rateSet(i, { tiers: r.tiers.map((o, n) => n === j ? { ...o, discountPercent: v } : o) }), true, 0, false, 90)}<button type="button" className="store-link" onClick={() => rateSet(i, { tiers: r.tiers.filter((_, n) => n !== j) })}>Remove discount</button></div>)}<button type="button" className="store-link" disabled={r.tiers.length >= 10} onClick={() => rateSet(i, { tiers: [...r.tiers, { minHours: '', discountPercent: '' }] })}>+ Add volume discount</button></div>}
      {(r.model === 'fixed' || r.model === 'mixed' || r.milestones.length > 0) && <div className="admin-subsection"><h4>Project stages</h4><p className="account-form-help">When stages are present, their selected total replaces the fixed project price or mixed base price.</p>{r.milestones.map((m, j) => <div className="admin-stage" key={j}><div className="store-form-grid">{field(`rate-${i}-milestone-${j}-key`, 'Stage key', m.key, v => rateSet(i, { milestones: r.milestones.map((o, n) => n === j ? { ...o, key: v } : o) }), { required: true, pattern: '[a-z0-9]+(-[a-z0-9]+)*' })}{field(`rate-${i}-milestone-${j}-title`, 'Stage title', m.title, v => rateSet(i, { milestones: r.milestones.map((o, n) => n === j ? { ...o, title: v } : o) }), { required: true, minLength: 2, maxLength: 120 })}{number(`rate-${i}-milestone-${j}-amount`, 'Stage price', m.amount, v => rateSet(i, { milestones: r.milestones.map((o, n) => n === j ? { ...o, amount: v } : o) }))}<label className="store-check"><input type="checkbox" checked={m.required} onChange={e => rateSet(i, { milestones: r.milestones.map((o, n) => n === j ? { ...o, required: e.target.checked } : o) })} />Required stage</label></div><button type="button" className="store-link" onClick={() => { if (window.confirm('Remove this stage from the plan?')) rateSet(i, { milestones: r.milestones.filter((_, n) => n !== j) }); }}>Remove stage</button></div>)}<button type="button" className="store-link" disabled={r.milestones.length >= 30} onClick={() => rateSet(i, { milestones: [...r.milestones, { key: '', title: '', amount: '', required: false }] })}>+ Add stage</button></div>}
      </section>)}
      <div className="store-actions"><label className="store-check"><input type="checkbox" checked={draft.published} onChange={e => set('published', e.target.checked)} />Published</label><label className="store-check"><input type="checkbox" checked={draft.featured} onChange={e => set('featured', e.target.checked)} />Featured</label></div>
      </fieldset>
      {error && <p className="store-error" role="alert">{error}</p>}{Object.values(errors).some(Boolean) && <p className="store-error" role="alert">Please check the highlighted fields.</p>}
      <div className="admin-save-bar"><span>{dirty ? 'Unsaved changes' : duplicate ? 'Copy has not been saved' : 'Ready to edit'}</span><div className="store-actions"><button type="button" className="store-secondary" onClick={() => setPreview(v => !v)}>{preview ? 'Hide preview' : 'Preview'}</button><button className="store-button" disabled={busy}>{busy ? 'Saving…' : duplicate ? 'Create copy' : 'Save service'}</button></div></div>
    </form>
    {preview && <article className="store-panel admin-preview" aria-label="Service preview"><span className="store-eyebrow">UNSAVED PREVIEW · {draft.published ? 'PUBLISHED ON SAVE' : 'DRAFT'}</span><h2>{draft.title || 'Untitled service'}</h2><p>{draft.summary}</p><strong>From {formatMoney(minor(draft.price), draft.currency)}</strong><p>{draft.deliveryTime}</p><p className="admin-description">{draft.description}</p><ul>{draft.features.split('\n').filter(Boolean).map((f, i) => <li key={i}>{f}</li>)}</ul>{draft.rates.map((r, i) => <div className="admin-preview-plan" key={i}><strong>{r.label || r.model}</strong><p>{formatMoney(minor(r.amount), draft.currency)} {r.model === 'hourly' || r.model === 'mixed' ? '/ hour' : r.model === 'retainer' ? `/ ${r.period}` : '/ project'}{r.model === 'mixed' ? ` + ${formatMoney(minor(r.baseAmount), draft.currency)} base` : ''}</p>{r.model === 'retainer' && <p>{r.includedHours} hours included · {formatMoney(minor(r.overageAmount), draft.currency)} / extra hour</p>}<p>Minimum {r.minUnits}{r.maxUnits ? ` · Maximum ${r.maxUnits}` : ''}</p>{r.milestones.map((m, j) => <p key={j}>{m.title} — {formatMoney(minor(m.amount), draft.currency)}{m.required ? ' (required)' : ''}</p>)}{r.tiers.map((t, j) => <p key={j}>{t.discountPercent}% discount from {t.minHours} hours</p>)}</div>)}</article>}
  </section>;
}
