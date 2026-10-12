import Link from 'next/link';
import { CATEGORIES } from '@/lib/format';
import { SITE_NAME } from '@/lib/site';
import { Container } from './Container';
import { Year } from './Year';
import { COMPANY_NAME, COMPANY_NUMBER, legalDocuments } from '@/lib/legal';
import { AcceptedCards } from './AcceptedCards';
import { Brand } from './Brand';
import './footer-wordmark.css';

export function Footer() {
  return (
    <footer className="site-footer">
      <Container>
        <div className="site-footer-main">
          <div className="site-footer-intro">
            <Link href="/" aria-label="Portable digital home" className="site-footer-brand"><Brand /></Link>
            <p>Product engineering, infrastructure<br className="hidden sm:block" /> and support for growing teams.</p>
            <Link href="/contact" className="site-footer-contact">Let’s build something <span aria-hidden="true">↗</span></Link>
          </div>
          <nav aria-label="Footer services" className="site-footer-nav">
            <h2>Services</h2>
            <ul>
          {CATEGORIES.map((category) => (
            <li key={category.value}>
              <Link href={`/services?category=${category.value}`}>
                {category.label}
              </Link>
            </li>
          ))}
            </ul>
          </nav>
          <nav aria-label="Legal" className="site-footer-nav">
            <h2>Legal & company</h2>
            <ul>{legalDocuments.map((document) => <li key={document.slug}><Link href={`/legal/${document.slug}`}>{document.title}</Link></li>)}</ul>
          </nav>
        </div>
        <div className="site-footer-bottom">
          <div className="site-footer-company"><span>{COMPANY_NAME}</span><span>Company No. {COMPANY_NUMBER}</span><AcceptedCards /></div>
          <div className="site-footer-meta"><span>© <Year /> {SITE_NAME}</span><Link href="/admin">Administration <span aria-hidden="true">↗</span></Link></div>
        </div>
      </Container>
      <div className="site-footer-wordmark" aria-hidden="true"><span>Portable</span></div>
    </footer>
  );
}
