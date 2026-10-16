'use client';
import { useMemo, useState } from 'react';
import { storeApi, StoreError, type StoreUser } from '@/lib/store-client';
import { formatMoney } from '@/lib/format';
import { AcceptedCards } from './AcceptedCards';
import { DataNotice } from './DataNotice';

// ISO 3166-1 alpha-2: провайдер принимает страну только двухбуквенным кодом.
export const COUNTRY_CODES =
  'AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' ');

interface Props {
  order: { orderNumber: string; total: number; currency: string };
  user: StoreUser;
  label?: string;
  className?: string;
}

/**
 * Оплата заказа через WemoPay: бэкенд заводит платёж и отдаёт ссылку на
 * страницу оплаты провайдера, куда мы и уводим клиента. Провайдер требует
 * фамилию и адрес плательщика — если их нет в профиле, бэкенд отвечает 422
 * `PAYER_DETAILS_REQUIRED`, мы спрашиваем недостающее, сохраняем в профиль и
 * повторяем: в следующий раз кнопка ведёт сразу к оплате.
 */
export function PayButton({ order, user, label, className = 'store-button' }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [askDetails, setAskDetails] = useState(false);
  const countries = useMemo(() => {
    const names = new Intl.DisplayNames(['en'], { type: 'region' });
    return COUNTRY_CODES.map(code => ({ code, name: names.of(code) ?? code })).sort((a, b) => a.name.localeCompare(b.name));
  }, []);
  const [first, ...rest] = user.name.trim().split(/\s+/);

  async function pay() {
    const { redirectUrl } = await storeApi<{ redirectUrl: string | null }>('payments/initiate', 'POST', { orderNumber: order.orderNumber });
    if (!redirectUrl) throw new Error('The payment page is not available right now. Please try again in a minute.');
    window.location.assign(redirectUrl);
  }

  async function run(work: () => Promise<void>) {
    setBusy(true);
    setError('');
    try {
      await work();
    } catch (e) {
      if (e instanceof StoreError && e.code === 'PAYER_DETAILS_REQUIRED') setAskDetails(true);
      else setError((e as Error).message);
      setBusy(false);
    }
    // При успехе кнопка остаётся занятой: страница уже уходит к провайдеру.
  }

  if (askDetails) {
    return (
      <form
        className="store-form"
        onSubmit={e => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          const value = (key: string) => String(form.get(key) ?? '').trim();
          void run(async () => {
            await storeApi('auth/me', 'PATCH', {
              firstName: value('firstName'),
              lastName: value('lastName'),
              billingAddress: { addressLine1: value('addressLine1'), city: value('city'), postalCode: value('postalCode'), countryCode: value('countryCode') },
            });
            await pay();
          });
        }}
      >
        <div>
          <h2>Billing details</h2>
          <DataNotice data="your name and billing address" purpose="process your card payment with our payment provider, WemoPay (they are also saved to your profile for next time)" />
        </div>
        <div className="store-form-grid">
          <label>First name<input name="firstName" required maxLength={40} defaultValue={first} autoComplete="given-name" /></label>
          <label>Last name<input name="lastName" required maxLength={40} defaultValue={rest.join(' ')} autoComplete="family-name" /></label>
        </div>
        <label>Address<input name="addressLine1" required maxLength={200} autoComplete="address-line1" /></label>
        <div className="store-form-grid">
          <label>City<input name="city" required maxLength={100} autoComplete="address-level2" /></label>
          <label>Postcode<input name="postalCode" required maxLength={20} autoComplete="postal-code" /></label>
        </div>
        <label>
          Country
          <select name="countryCode" required defaultValue="" autoComplete="country">
            <option value="" disabled>Select a country</option>
            {countries.map(country => <option key={country.code} value={country.code}>{country.name}</option>)}
          </select>
        </label>
        {error && <p role="alert" className="store-error">{error}</p>}
        <AcceptedCards />
        <button className="store-button" disabled={busy}>{busy ? 'Opening secure payment…' : `Pay ${formatMoney(order.total, order.currency)} now →`}</button>
      </form>
    );
  }

  return (
    <>
      <button type="button" className={className} disabled={busy} onClick={() => run(pay)}>
        {busy ? 'Opening secure payment…' : label ?? `Pay ${formatMoney(order.total, order.currency)} now →`}
      </button>
      <AcceptedCards />
      {error && <p role="alert" className="store-error">{error}</p>}
    </>
  );
}
