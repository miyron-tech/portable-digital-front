import type { PricingModel } from './types';

export interface SelectionItem {
  id: string;
  serviceId: string;
  slug: string;
  title: string;
  model: PricingModel;
  units: number;
  extraHours: number;
  milestones: { key: string; title: string; amount: number }[];
  pricing: { total: number };
  available: boolean;
  priceChanged: boolean;
}

export interface Selection {
  id: string | null;
  currency: string;
  items: SelectionItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  unavailableCount: number;
}

export interface ServiceSelection {
  serviceId: string;
  model: PricingModel;
  units: number;
  extraHours?: number;
  milestoneKeys?: string[];
}
