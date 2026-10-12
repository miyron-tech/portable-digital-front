import Link from 'next/link';
import { Container } from '@/components/Container';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

export default function NotFound() {
  return (
    <>
    <Header />
    <Container className="py-32 text-center">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 text-muted">The page may have moved, or the service is no longer offered.</p>
      <Link href="/services" className="mt-8 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-fg">
        Browse services
      </Link>
    </Container>
    <Footer />
    </>
  );
}
