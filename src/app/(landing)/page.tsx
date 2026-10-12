import type { Metadata } from 'next';
import { Vantage } from './Vantage';
import { Suspense } from 'react';
import { connection } from 'next/server';
import Link from 'next/link';
import { getFeaturedServices } from '@/lib/api';
import { ServiceGrid, ServiceGridSkeleton } from '@/components/ServiceCard';
import { Container } from '@/components/Container';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: { absolute: 'Portable digital — Hard Problems. Quiet Delivery.' },
  description:
    'Legacy systems, tangled integrations, tight deadlines. We take on the parts others avoid and ship them without the drama.',
  alternates: { canonical: '/' },
};

/**
 * Ставит `motion-pending` до первой отрисовки, иначе вход мигнул бы готовым
 * кадром. Снимает класс `Vantage` по `animationend` карточки; таймер — страховка,
 * если анимация так и не завершится (вкладка в фоне, CSS не загрузился).
 */
const MOTION_SCRIPT = `(function(){try{
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var d=document.documentElement;d.classList.add('motion-pending');
window.__vantageMotionTimer=setTimeout(function(){d.classList.remove('motion-pending')},3500);
}catch(e){}})();`;

export default function LandingPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: MOTION_SCRIPT }} />
      <Vantage />
      <Container className="store-home-section">
        <div className="store-heading"><div><span className="store-eyebrow">01 / WHAT WE DO</span><h2 className="store-display">Your next<br /><span>digital advantage.</span></h2></div><Link href="/services" className="store-secondary">All services ↗</Link></div>
        <Suspense fallback={<ServiceGridSkeleton />}><Featured /></Suspense>
      </Container>
      <Container className="store-home-section">
        <section id="about"><span className="store-eyebrow">02 / HOW IT WORKS</span><h2 className="store-display">Less friction.<br /><span>More forward motion.</span></h2><div className="store-steps">{[['01', 'Choose your service', 'Clear scope, transparent pricing and a delivery timeline before you start.'], ['02', 'Make it yours', 'Choose your scope, tell us what you need and confirm your order.'], ['03', 'Build what comes next', 'We take care of delivery. Follow the progress from your account.']].map(([n, title, copy]) => <article key={n}><span>{n} /</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
      </Container><Footer />
    </>
  );
}

async function Featured() {
  // Каталог только по запросу: иначе пререндер главной ходил в API, и сборка
  // падала без живого бэкенда — в CI его нет.
  await connection();
  const services = await getFeaturedServices().catch(() => null);
  if (!services) return <div className="store-panel"><p>The catalogue is temporarily unavailable.</p><Link href="/services" className="store-link">View catalogue →</Link></div>;
  if (!services.length) return <div className="store-panel">New services are on the way. <Link href="/contact">Discuss your project →</Link></div>;
  return <ServiceGrid services={services} />;
}
