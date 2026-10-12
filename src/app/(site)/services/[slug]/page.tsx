import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Container } from '@/components/Container';
import { LeadForm } from '@/components/LeadForm';
import { getService } from '@/lib/api';
import { categoryLabel, formatMoney, rateNotes, ratePrice, rateTitle } from '@/lib/format';
import type { Service, ServiceRate } from '@/lib/types';

export async function generateMetadata({ params }: PageProps<'/services/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug).catch(() => null);
  if (!service) return { title: 'Service not found' };
  return {
    title: service.seo?.metaTitle || service.title,
    description: service.seo?.metaDescription || service.summary,
    keywords: service.seo?.keywords,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: { title: service.title, description: service.summary },
  };
}

export default function ServicePage({ params }: PageProps<'/services/[slug]'>) {
  return (
    <Container className="py-12">
      <Link href="/services" className="text-sm text-muted hover:text-fg">
        ← All services
      </Link>
      <Suspense fallback={<ServiceSkeleton />}>
        <ServiceDetails params={params} />
      </Suspense>
    </Container>
  );
}

async function ServiceDetails({ params }: { params: PageProps<'/services/[slug]'>['params'] }) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  return (
    <article className="mt-6 grid gap-12 lg:grid-cols-[1fr_380px]">
      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-accent">{categoryLabel(service.category)}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">{service.title}</h1>
        <p className="mt-5 text-lg text-muted">{service.summary}</p>

        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 text-sm">
          {service.priceFrom > 0 ? (
            <div>
              <dt className="text-muted">Starting at</dt>
              <dd className="mt-1 text-xl font-semibold">{formatMoney(service.priceFrom, service.currency)}</dd>
            </div>
          ) : null}
          {service.deliveryTime ? (
            <div>
              <dt className="text-muted">Delivery</dt>
              <dd className="mt-1 text-xl font-semibold">{service.deliveryTime}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-10 space-y-4 leading-relaxed whitespace-pre-line">{service.description}</div>

        {service.features.length ? (
          <section className="mt-12">
            <h2 className="text-xl font-semibold">What is included</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {service.features.map((feature) => (
                <li key={feature} className="flex gap-3 rounded-xl border border-line bg-surface p-4 text-sm">
                  <span aria-hidden className="text-accent">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {service.pricing.length ? <Pricing service={service} /> : null}
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-lg font-semibold">Ready to get started?</h2>
          <p className="mt-1 mb-6 text-sm text-muted">Choose a plan and start your project online.</p>
          <Link href={`/checkout/${service.slug}`} className="store-button">Configure your service →</Link>
          <p className="mt-8 mb-4 text-sm text-muted">Need advice? Tell us about your project.</p>
          <LeadForm service={service.title} />
        </div>
      </aside>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(service) }}
      />
    </article>
  );
}

function Pricing({ service }: { service: Service }) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold">Pricing</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {service.pricing.map((rate) => (
          <RateCard key={rate.model} rate={rate} currency={service.currency} />
        ))}
      </div>
    </section>
  );
}

function RateCard({ rate, currency }: { rate: ServiceRate; currency: string }) {
  const notes = rateNotes(rate, currency);
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="text-sm text-muted">{rateTitle(rate)}</p>
      <p className="mt-1 text-xl font-semibold">{ratePrice(rate, currency)}</p>
      {notes.length ? (
        <ul className="mt-3 space-y-1 text-sm text-muted">
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}
      {rate.milestones.length ? (
        <ul className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          {rate.milestones.map((milestone) => (
            <li key={milestone.key} className="flex justify-between gap-3">
              <span>
                {milestone.title}
                {milestone.required ? <span className="ml-1 text-xs text-muted">(base)</span> : null}
              </span>
              <span className="shrink-0 font-medium">{formatMoney(milestone.amount, currency)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ServiceSkeleton() {
  return (
    <div className="mt-6 grid animate-pulse gap-12 lg:grid-cols-[1fr_380px]" aria-busy>
      <div className="space-y-4">
        <div className="h-4 w-24 rounded bg-line" />
        <div className="h-12 w-3/4 rounded bg-line" />
        <div className="h-20 rounded bg-line" />
        <div className="h-64 rounded bg-line" />
      </div>
      <div className="h-96 rounded-2xl bg-line" />
    </div>
  );
}

/** `<` экранируется, чтобы текст из админки не закрыл тег `<script>`. */
function jsonLd(service: Service) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.summary,
    serviceType: categoryLabel(service.category),
    ...(service.priceFrom > 0
      ? {
          offers: {
            '@type': 'Offer',
            price: (service.priceFrom / 100).toFixed(2),
            priceCurrency: service.currency,
          },
        }
      : {}),
  }).replace(/</g, '\\u003c');
}
