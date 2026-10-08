import Link from 'next/link';
import { categoryLabel, formatMoney } from '@/lib/format';
import type { Service } from '@/lib/types';

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className={`store-service-card group store-service-${service.category}`}
    >
      <div className="store-service-art" aria-hidden="true"><div className="store-service-image" style={{ backgroundImage: `url('${{ development: '/videos/services-development.jpg', design: '/videos/services-development.jpg', infrastructure: '/videos/services-infrastructure.jpg', data: '/videos/services-engineering.jpg', monitoring: '/videos/services-infrastructure.jpg', support: '/videos/services-engineering.jpg' }[service.category]}')` }} /><span className="store-art-caption">PD / {service.category.toUpperCase()}</span>{service.featured && <span className="store-art-featured">SELECTED</span>}</div>
      <div className="store-service-body">
      <span className="store-eyebrow">
        {categoryLabel(service.category)}
      </span>
      <h3 className="mt-3 text-xl font-medium leading-snug tracking-tight">{service.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-muted">{service.summary}</p>
      <div className="mt-auto flex items-end justify-between gap-3 pt-6 text-sm">
        <div>
          {service.priceFrom > 0 ? (
            <p className="font-medium">from {formatMoney(service.priceFrom, service.currency)}</p>
          ) : (
            <p className="font-medium">On request</p>
          )}
          {service.deliveryTime ? <p className="text-xs text-muted">{service.deliveryTime}</p> : null}
        </div>
        <span aria-hidden className="store-service-arrow">
          ↗
        </span>
      </div>
      </div>
    </Link>
  );
}

export function ServiceGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="h-60 animate-pulse rounded-2xl border border-line bg-surface" />
      ))}
    </div>
  );
}

export function ServiceGrid({ services }: { services: Service[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
