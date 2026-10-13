'use client';
import { useMemo, useState } from 'react';
import { storeApi, type StoreUser } from '@/lib/store-client';
import { dateLabel } from './shared';

export function AccountProfile({ section, user, onSave, onPasswordChanged, onLogout, signingOut }: { section: 'profile' | 'security'; user: StoreUser; onSave: (user: StoreUser) => void; onPasswordChanged: () => void; onLogout: () => void; signingOut: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [visible, setVisible] = useState(false);
  const [first, ...last] = user.name.split(' ');
  const countries = useMemo(() => {
    const names = new Intl.DisplayNames(['en'], { type: 'region' });
    const codes = 'AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' ');
    return codes.map(code => ({ code, name: names.of(code) ?? code })).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  return <section className="account-settings"><div className="account-settings-intro"><p className="account-kicker">{section === 'profile' ? 'THE DETAILS THAT MATTER' : 'KEEP IT YOURS'}</p><h2>{section === 'profile' ? 'A familiar face.' : 'Your account. Your control.'}</h2><p>{section === 'profile' ? 'Keep your contact and billing details up to date. They will be ready when your next project is.' : 'Choose a strong, unique password. Changing it signs you out on every device.'}</p>{user.createdAt && <small>With Portable since {dateLabel(user.createdAt)}</small>}</div>
    <div>
      <form className="store-form account-form" onSubmit={async e => {
        e.preventDefault(); const form = e.currentTarget; const data = new FormData(form); const value = (key: string) => String(data.get(key) ?? '').trim(); setError(''); setSuccess('');
        if (section === 'security' && data.get('newPassword') !== data.get('confirmPassword')) { setError('The new passwords do not match.'); return; }
        setBusy(true);
        try {
          if (section === 'profile') {
            const saved = await storeApi<StoreUser>('auth/me', 'PATCH', { firstName: value('firstName'), lastName: value('lastName'), billingAddress: { addressLine1: value('addressLine1'), city: value('city'), postalCode: value('postalCode'), countryCode: value('countryCode') } });
            onSave(saved); setSuccess('Your details have been saved.');
          } else { await storeApi('auth/password', 'POST', { currentPassword: data.get('currentPassword'), newPassword: data.get('newPassword') }); form.reset(); onPasswordChanged(); }
        } catch (err) { setError(err instanceof Error ? err.message : 'We could not save your changes. Please try again.'); }
        finally { setBusy(false); }
      }}>
        {section === 'profile' ? <><div className="account-form-title"><span>01</span><h3>Personal details</h3></div><div className="store-form-grid"><label>First name<input name="firstName" required maxLength={40} autoComplete="given-name" defaultValue={first} /></label><label>Last name<input name="lastName" required maxLength={40} autoComplete="family-name" defaultValue={last.join(' ')} /></label></div><label>Email address<input type="email" value={user.email} disabled /><small>Your sign-in email. Contact support if you need to change it.</small></label>
          <div className="account-form-title"><span>02</span><h3>Billing address</h3></div><label>Street address<input name="addressLine1" required maxLength={200} autoComplete="street-address" defaultValue={user.billingAddress?.addressLine1} /></label><div className="store-form-grid"><label>City<input name="city" required maxLength={100} autoComplete="address-level2" defaultValue={user.billingAddress?.city} /></label><label>Postcode<input name="postalCode" required maxLength={20} autoComplete="postal-code" defaultValue={user.billingAddress?.postalCode} /></label></div><label>Country<select name="countryCode" required autoComplete="country" defaultValue={user.billingAddress?.countryCode ?? ''}><option value="" disabled>Select a country</option>{countries.map(c => <option value={c.code} key={c.code}>{c.name}</option>)}</select></label><p className="account-form-help">Used to process your payments. Updating your details does not change past orders.</p></> : <><div className="account-form-title"><span>01</span><h3>Change your password</h3></div><label>Current password<input name="currentPassword" type={visible ? 'text' : 'password'} autoComplete="current-password" required maxLength={128} /></label><label>New password<input name="newPassword" type={visible ? 'text' : 'password'} autoComplete="new-password" required minLength={8} maxLength={128} /><small>At least 8 characters. A longer passphrase is a good choice.</small></label><label>Confirm new password<input name="confirmPassword" type={visible ? 'text' : 'password'} autoComplete="new-password" required minLength={8} maxLength={128} /></label><label className="store-check"><input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />Show passwords</label></>}
        {error && <p className="store-error" role="alert">{error}</p>}{success && <p className="store-notice" role="status">{success}</p>}<div className="account-form-footer"><button className="store-button" disabled={busy}>{busy ? 'Saving…' : section === 'profile' ? 'Save details ↗' : 'Update password ↗'}</button><span>{section === 'profile' ? 'Your information stays private.' : 'You will need to sign in again.'}</span></div>
      </form>
      {section === 'security' && <div className="account-session"><div><h3>Sign out everywhere</h3><p>End all current sessions, including this one.</p></div><button className="store-secondary" onClick={onLogout} disabled={signingOut}>{signingOut ? 'Signing out…' : 'Sign out everywhere ↗'}</button></div>}
    </div>
  </section>;
}
