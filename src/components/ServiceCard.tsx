import Link from 'next/link';
import { categoryLabel, formatMoney } from '@/lib/format';
import type { Service } from '@/lib/types';
import { ServiceIllustration } from './ServiceIllustration';
import { ServiceReveal } from './ServiceReveal';
import './service-cards.css';

export function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  return <Link href={`/services/${service.slug}`} className="practice-card" id={`service-${service.slug}`}>
    <div className="practice-caption"><span>FIG {String(index + 1).padStart(2, '0')}</span><span>{categoryLabel(service.category)}</span></div>
    <div className="practice-art"><ServiceIllustration category={service.category} slug={service.slug} /></div>
    <div className="practice-copy"><h3>{service.title}</h3><p>{service.summary}</p></div>
    <div className="practice-meta"><span>{service.priceFrom > 0 ? `From ${formatMoney(service.priceFrom, service.currency)}` : 'On request'}</span>{service.deliveryTime && <span>{service.deliveryTime}</span>}</div>
    <span className="practice-link">Explore service</span>
  </Link>;
}
export function ServiceGridSkeleton({ count = 6 }: { count?: number }) {
  return <div className="practice-grid" aria-busy="true" aria-label="Loading services">{Array.from({ length: count }, (_, index) => <div key={index} className="practice-skeleton"><div /><div /><div /></div>)}</div>;
}
export function ServiceGrid({ services, offset = 0 }: { services: Service[]; offset?: number }) {
  return <ServiceReveal>{services.map((service, index) => <ServiceCard key={service.id} service={service} index={offset + index} />)}</ServiceReveal>;
}
