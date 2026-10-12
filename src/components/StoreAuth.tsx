'use client';
import { DataNotice } from './DataNotice';
import { useState } from 'react';
import Link from 'next/link';
import { storeApi, type StoreUser } from '@/lib/store-client';

export function StoreAuth({ onLogin, admin = false }: { onLogin: (user: StoreUser) => void; admin?: boolean }) {
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return <form className="store-panel store-form" onSubmit={async event => {
    event.preventDefault(); setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const result = await storeApi<{ user: StoreUser }>(`auth/${register ? 'register' : 'login'}`, 'POST', { email: form.get('email'), password: form.get('password'), ...(register ? { name: form.get('name') } : {}) });
      if (admin && result.user.role !== 'admin') { await storeApi('auth/logout', 'POST'); throw new Error('An administrator account is required.'); }
      onLogin(result.user);
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }}>
    <span className="store-eyebrow">{admin ? 'STORE MANAGEMENT' : 'YOUR ACCOUNT'}</span>
    <h2>{register ? 'Create an account' : 'Sign in'}</h2>
    <p className="store-muted">{admin ? 'Your services and orders, in one place.' : 'Keep your orders and contact details in one place.'}</p>
    {register && <label>Name<input name="name" required minLength={2} maxLength={120} autoComplete="name" /></label>}
    <label>Email<input name="email" type="email" required autoComplete="email" /></label>
    <label>Password<input name="password" type="password" required minLength={register ? 8 : 1} autoComplete={register ? 'new-password' : 'current-password'} /></label>
    {register && <DataNotice data="your name, email and a securely hashed password" purpose="run your account and your orders">{' '}and the <Link href="/legal/terms-of-service" className="underline">Terms of Service</Link> for account use.</DataNotice>}
    {error && <p role="alert" className="store-error">{error}</p>}
    <button className="store-button" disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account →' : 'Sign in →'}</button>
    {!admin && <button type="button" className="store-link" onClick={() => { setRegister(!register); setError(''); }}>{register ? 'Already have an account? Sign in' : 'New here? Create an account'}</button>}
  </form>;
}
