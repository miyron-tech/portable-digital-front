import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { API_URL } from './env';
import type {
  CategoryCount,
  Paginated,
  Service,
  ServiceCategory,
  SitemapEntry,
} from './types';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Каталог правится в админке, поэтому кэш короткий. `expire` меньше 5 минут
 * выводит эти данные из пререндера: сборке не нужен живой бекенд, а страница
 * всё равно рендерится на сервере — при запросе, внутри `<Suspense>`.
 */
function catalogueCache() {
  cacheTag('catalogue');
  cacheLife({ stale: 30, revalidate: 60, expire: 120 });
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new ApiError(res.status, `GET ${path} → ${res.status}`);
  return (await res.json()) as T;
}

export async function getFeaturedServices(): Promise<Service[]> {
  'use cache';
  catalogueCache();
  return get<Service[]>('/services/featured');
}

export async function getCategories(): Promise<CategoryCount[]> {
  'use cache';
  catalogueCache();
  return get<CategoryCount[]>('/services/categories');
}

export interface ServiceQuery {
  category?: ServiceCategory;
  search?: string;
  page?: number;
}

export async function getServices(query: ServiceQuery): Promise<Paginated<Service>> {
  'use cache';
  catalogueCache();
  const params = new URLSearchParams();
  if (query.category) params.set('category', query.category);
  if (query.search) params.set('search', query.search);
  if (query.page && query.page > 1) params.set('page', String(query.page));
  const qs = params.toString();
  return get<Paginated<Service>>(`/services${qs ? `?${qs}` : ''}`);
}

/** `null` — услуги нет или она снята с публикации. */
export async function getService(slug: string): Promise<Service | null> {
  'use cache';
  catalogueCache();
  try {
    return await get<Service>(`/services/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  'use cache';
  catalogueCache();
  return get<SitemapEntry[]>('/services/sitemap');
}
