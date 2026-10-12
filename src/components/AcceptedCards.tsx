/**
 * Принимаемые карты — в подвале и рядом с оплатой. Список один на сайт: после
 * ответа эквайера правится только `ACCEPTED_CARDS`. Показывать карту, которую
 * мерчант не принимает, нельзя — человек узнает об этом уже на оплате.
 */
export const ACCEPTED_CARDS = ['visa', 'mastercard'] as const;
type Card = (typeof ACCEPTED_CARDS)[number];

const NAMES: Record<Card, string> = { visa: 'Visa', mastercard: 'Mastercard' };

function Logo({ card }: { card: Card }) {
  switch (card) {
    case 'visa':
      return (
        <svg viewBox="0 0 48 16" aria-hidden="true" className="h-3.5 w-auto">
          <text x="24" y="13.5" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="15.5" fontStyle="italic" fontWeight="900" letterSpacing="-0.5" fill="#1A1F71">VISA</text>
        </svg>
      );
    case 'mastercard':
      return (
        <svg viewBox="0 0 32 20" aria-hidden="true" className="h-5 w-auto">
          <circle cx="12" cy="10" r="8" fill="#EB001B" />
          <circle cx="20" cy="10" r="8" fill="#F79E1B" />
          <path d="M16 3.07a8 8 0 0 1 0 13.86 8 8 0 0 1 0-13.86Z" fill="#FF5F00" />
        </svg>
      );
  }
}

export function AcceptedCards({ label = 'We accept', className = '' }: { label?: string; className?: string }) {
  const names = ACCEPTED_CARDS.map((card) => NAMES[card]).join(' and ');
  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs text-muted ${className}`}>
      <span>{label}</span>
      <ul className="flex items-center gap-2" aria-label={`${label} ${names}`}>
        {ACCEPTED_CARDS.map((card) => (
          <li key={card} title={NAMES[card]} className="flex h-7 w-11 items-center justify-center rounded bg-white/95">
            <Logo card={card} />
          </li>
        ))}
      </ul>
    </div>
  );
}
