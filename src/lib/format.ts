import type { BillingPeriod, PricingModel, ServiceCategory, ServiceRate } from './types';

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

/** Пояснения к тарифу: минимум часов, включённые часы, скидки за объём. */
export function rateNotes(rate: ServiceRate, currency: string): string[] {
  const notes: string[] = [];
  if ((rate.model === 'hourly' || rate.model === 'mixed') && rate.minUnits > 1) {
    notes.push(`Minimum ${rate.minUnits} hours`);
  }
  if (rate.model === 'retainer') {
    if (rate.includedHours > 0) notes.push(`${rate.includedHours} hours included`);
    if (rate.overageAmount > 0) {
      notes.push(`${formatMoney(rate.overageAmount, currency)} / hour beyond that`);
    }
    if (rate.minUnits > 1) notes.push(`Minimum ${rate.minUnits} periods`);
  }
  for (const tier of rate.tiers) {
    notes.push(`−${tier.discountPercent}% from ${tier.minHours} hours`);
  }
  return notes;
}
