export type ServiceCategory =
  | 'development'
  | 'design'
  | 'infrastructure'
  | 'data'
  | 'monitoring'
  | 'support';

export type PricingModel = 'hourly' | 'fixed' | 'mixed' | 'retainer';
export type BillingPeriod = 'month' | 'quarter' | 'year';

export interface VolumeTier {
  minHours: number;
  discountPercent: number;
}

export interface ServiceMilestone {
  key: string;
  title: string;
  /** В минорных единицах валюты услуги. */
  amount: number;
  required: boolean;
}

/** Все суммы — в минорных единицах `Service.currency`. */
export interface ServiceRate {
  model: PricingModel;
  amount: number;
  baseAmount: number;
  includedHours: number;
  overageAmount: number;
  period?: BillingPeriod | null;
  minUnits: number;
  maxUnits?: number | null;
  tiers: VolumeTier[];
  milestones: ServiceMilestone[];
  label?: string;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  category: ServiceCategory;
  priceFrom: number;
  currency: string;
  deliveryTime?: string;
  pricing: ServiceRate[];
  features: string[];
  tags: string[];
  featured: boolean;
  seo?: { metaTitle?: string; metaDescription?: string; keywords: string[] };
  updatedAt?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CategoryCount {
  category: ServiceCategory;
  count: number;
}

export interface SitemapEntry {
  slug: string;
  updatedAt?: string;
}
