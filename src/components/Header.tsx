import Link from 'next/link';
import { Container } from './Container';
import { Brand } from './Brand';
import { SelectionLink } from './SelectionLink';

const NAV = [
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact' },
  { href: '/account', label: 'Account' },
];

export function Header() {
  return (
    <header className="site-glass-header sticky top-0 z-30">
      <Container className="site-header-inner flex min-h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Brand />
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-muted transition hover:text-fg">
              {item.label}
            </Link>
          ))}
          <SelectionLink />
        </nav>
      </Container>
    </header>
  );
}
