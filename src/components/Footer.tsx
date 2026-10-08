import Link from 'next/link';
import { CATEGORIES } from '@/lib/format';
import { SITE_NAME } from '@/lib/site';
import { Container } from './Container';
import { Year } from './Year';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line py-10 text-sm text-muted">
      <Container className="flex flex-col gap-6 sm:flex-row sm:justify-between">
        <div>
          <p className="font-semibold text-fg">Portable digital</p>
          <p className="mt-1 max-w-xs">Product engineering, infrastructure and support for growing teams.</p>
        </div>
        <ul className="grid grid-cols-2 gap-x-8 gap-y-1.5">
          {CATEGORIES.map((category) => (
            <li key={category.value}>
              <Link href={`/services?category=${category.value}`} className="hover:text-fg">
                {category.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
      <Container className="mt-8">
        © <Year /> {SITE_NAME} · <Link href="/admin" className="hover:text-fg">Administration ↗</Link>
      </Container>
    </footer>
  );
}
