import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Container } from '@/components/Container';
import { ServiceGrid, ServiceGridSkeleton } from '@/components/ServiceCard';
import { Unavailable } from '@/components/Unavailable';
import { getServices } from '@/lib/api';
import { CATEGORIES, isCategory } from '@/lib/format';
import type { ServiceCategory } from '@/lib/types';
import { ServicesHero } from '@/components/ServicesHero';
import './services.css';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Development, design, infrastructure, data, monitoring and support packages with transparent pricing.',
  alternates: { canonical: '/services' },
};

type Filters = { category?: ServiceCategory; search?: string; page: number };

function readFilters(params: Record<string, string | string[] | undefined>): Filters {
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  const category = first(params.category);
  const search = first(params.q)?.trim().slice(0, 100);
  const page = Number.parseInt(first(params.page) ?? '1', 10);
  return {
    category: isCategory(category) ? category : undefined,
    search: search || undefined,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

function href(filters: Partial<Filters>) {
  const params = new URLSearchParams();
  if (filters.category) params.set('category', filters.category);
  if (filters.search) params.set('q', filters.search);
  if (filters.page && filters.page > 1) params.set('page', String(filters.page));
  const qs = params.toString();
  return qs ? `/services?${qs}#catalogue` : '/services#catalogue';
}

export default function ServicesPage({ searchParams }: PageProps<'/services'>) {
  return (
    <div className="services-page"><ServicesHero />
    <Container className="services-capabilities"><span>THE RIGHT EXPERTISE.<br /><strong>RIGHT WHEN YOU NEED IT.</strong></span><div>Development</div><div>Design</div><div>Infrastructure</div><div>Data & AI</div></Container>
    <Container className="services-catalogue">
      <div id="catalogue" className="services-section-heading"><div><span className="store-eyebrow">01 / FIND YOUR NEXT MOVE</span><h2>Expertise. <span>On demand.</span></h2></div><p>A clear scope. A considered approach.<br />Pick your starting point. We’ll handle the complexity.</p></div>
      <Suspense fallback={<CatalogueFallback />}>
        <Catalogue searchParams={searchParams} />
      </Suspense>
    </Container>
    <Container className="services-bottom"><div className="services-bottom-art" /><div><span className="store-eyebrow">NOT EVERY PROJECT FITS A BOX.</span><h2>Let’s build<br /><span>your kind of different.</span></h2><p>Complex integrations. An ambitious idea. A fresh start.<br />Tell us where you want to go.</p><Link href="/contact" className="store-button">Talk about your project <span>↗</span></Link></div><span className="services-bottom-index">PD / NEXT</span></Container>
    </div>
  );
}

function CatalogueFallback() {
  return (
    <>
      <div className="mt-10 h-10" />
      <div className="mt-8">
        <ServiceGridSkeleton />
      </div>
    </>
  );
}

async function Catalogue({ searchParams }: { searchParams: PageProps<'/services'>['searchParams'] }) {
  const filters = readFilters(await searchParams);
  const result = await getServices(filters).catch(() => null);

  return (
    <>
      <div className="services-filters">
        <nav aria-label="Categories" className="flex flex-wrap gap-2">
          <FilterLink active={!filters.category} href={href({ search: filters.search })}>
            All services
          </FilterLink>
          {CATEGORIES.map((category) => (
            <FilterLink
              key={category.value}
              active={filters.category === category.value}
              href={href({ category: category.value, search: filters.search })}
            >
              {category.label}
            </FilterLink>
          ))}
        </nav>
        <form action="/services#catalogue" className="services-search">
          {filters.category ? <input type="hidden" name="category" value={filters.category} /> : null}
          <input
            type="search"
            name="q"
            defaultValue={filters.search}
            placeholder="Search services"
            aria-label="Search services"
            className="w-full rounded-full border border-line bg-surface px-4 py-2 text-sm outline-none focus:border-accent lg:w-64"
          />
          <button type="submit" className="rounded-full border border-line px-4 py-2 text-sm hover:border-fg/40">
            Search
          </button>
        </form>
      </div>

      <div className="mt-8">
        {result && <div className="services-result-count"><span>{String(result.total).padStart(2, '0')} SERVICES {filters.category ? `/ ${CATEGORIES.find(c => c.value === filters.category)?.label.toUpperCase()}` : '/ ALL CAPABILITIES'}</span><span>Scope → Configure → Launch</span></div>}
        {!result ? (
          <Unavailable />
        ) : result.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
            Nothing matches these filters.{' '}
            <Link href="/services" className="text-accent hover:underline">
              Reset filters
            </Link>
          </div>
        ) : (
          <>
            <ServiceGrid services={result.items} />
            {result.pages > 1 ? (
              <nav aria-label="Pagination" className="mt-10 flex justify-center gap-2">
                {Array.from({ length: result.pages }, (_, index) => index + 1).map((page) => (
                  <FilterLink key={page} active={page === result.page} href={href({ ...filters, page })}>
                    {page}
                  </FilterLink>
                ))}
              </nav>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}

function FilterLink({ active, href, children }: { active: boolean; href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
        active ? 'border-accent bg-accent text-accent-fg' : 'border-line bg-surface hover:border-accent/50'
      }`}
    >
      {children}
    </Link>
  );
}
