import type { Service } from '@/lib/types';
import { ServiceGrid, ServiceGridSkeleton } from './ServiceCard';
export function ServiceStories({ services, offset = 0 }: { services: Service[]; offset?: number }) {
  return <ServiceGrid services={services} offset={offset} />;
}
export function ServiceStoriesSkeleton() { return <ServiceGridSkeleton />; }
