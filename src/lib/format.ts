import type { BillingPeriod, PricingModel, Service, ServiceCategory, ServiceRate } from './types';

export const CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: 'development', label: 'Development' },
  { value: 'design', label: 'Design' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'data', label: 'Data & AI' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'support', label: 'Support' },
];

export function isCategory(value: unknown): value is ServiceCategory {
  return CATEGORIES.some((category) => category.value === value);
}

export function categoryLabel(category: ServiceCategory): string {
  return CATEGORIES.find((item) => item.value === category)?.label ?? category;
}

/** Суммы в API целочисленные, в минорных единицах (центах). */
export function formatMoney(minor: number, currency: string): string {
  const major = minor / 100;
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency,
    maximumFractionDigits: Number.isInteger(major) ? 0 : 2,
  }).format(major);
}

const MODEL_LABELS: Record<PricingModel, string> = {
  fixed: 'Fixed price',
  hourly: 'Hourly',
  mixed: 'Base + hourly',
  retainer: 'Retainer',
};

const PERIOD_LABELS: Record<BillingPeriod, string> = {
  month: 'month',
  quarter: 'quarter',
  year: 'year',
};

export function rateTitle(rate: ServiceRate): string {
  return rate.label || MODEL_LABELS[rate.model];
}

/** Главная строка цены тарифа: «€45 / hour», «€4,900», «€2,000 / month». */
export function ratePrice(rate: ServiceRate, currency: string): string {
  const money = (minor: number) => formatMoney(minor, currency);
  switch (rate.model) {
    case 'hourly':
      return `${money(rate.amount)} / hour`;
    case 'fixed':
      return money(rate.amount);
    case 'mixed':
      return `${money(rate.baseAmount)} + ${money(rate.amount)} / hour`;
    case 'retainer':
      return `${money(rate.amount)} / ${PERIOD_LABELS[rate.period ?? 'month']}`;
  }
}

/**
 * Правило учёта неполного часа. Объявляется рядом с каждой почасовой ценой:
 * без него ставка за час не говорит, сколько стоит работа на 20 минут.
 */
export const HOURLY_ROUNDING_NOTE =
  'Time is logged in 15-minute increments; a started increment is billed in full.';

const isHourly = (rate: ServiceRate) => rate.model === 'hourly' || rate.model === 'mixed';

/**
 * Минимальный заказ суммой, а не только числом часов: «€272 (8 hours)».
 * Для фиксированной цены минимума нет — `null`.
 */
export function minimumOrder(rate: ServiceRate, currency: string): string | null {
  const units = Math.max(1, rate.minUnits || 1);
  if (isHourly(rate)) {
    const total = (rate.model === 'mixed' ? rate.baseAmount : 0) + rate.amount * units;
    return `${formatMoney(total, currency)} (${units} ${units === 1 ? 'hour' : 'hours'})`;
  }
  if (rate.model === 'retainer' && units > 1) {
    const period = PERIOD_LABELS[rate.period ?? 'month'];
    return `${formatMoney(rate.amount * units, currency)} (${units} ${period}s)`;
  }
  return null;
}

/**
 * Цена «от» для карточки и шапки услуги. `priceFrom` у почасовой услуги — это
 * ставка за час; без единицы «From €34» читается как цена всей работы.
 * Поэтому подставляем цену того тарифа, которому равен `priceFrom`, с его
 * единицей: «From €34 / hour», «From €4,900», «From €490 / month».
 */
export function startingPrice(service: Pick<Service, 'priceFrom' | 'currency' | 'pricing'>): string {
  const byModel = (model: ServiceRate['model']) =>
    service.pricing.find((rate) => rate.model === model && rate.amount === service.priceFrom);
  const rate = byModel('fixed') ?? byModel('retainer') ?? byModel('hourly');
  return `From ${rate ? ratePrice(rate, service.currency) : formatMoney(service.priceFrom, service.currency)}`;
}

/** Пояснения к тарифу: минимальный заказ, округление, включённые часы, скидки за объём. */
export function rateNotes(rate: ServiceRate, currency: string): string[] {
  const notes: string[] = [];
  const minimum = minimumOrder(rate, currency);
  if (isHourly(rate)) {
    if (minimum) notes.push(`Minimum order ${minimum}`);
    notes.push(HOURLY_ROUNDING_NOTE);
  }
  if (rate.model === 'retainer') {
    if (rate.includedHours > 0) notes.push(`${rate.includedHours} hours included`);
    if (rate.overageAmount > 0) {
      notes.push(`${formatMoney(rate.overageAmount, currency)} / hour beyond that`);
    }
    if (minimum) notes.push(`Minimum commitment ${minimum}`);
  }
  for (const tier of rate.tiers) {
    notes.push(`−${tier.discountPercent}% from ${tier.minHours} hours`);
  }
  return notes;
}
