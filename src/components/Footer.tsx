import Link from 'next/link';
import { CATEGORIES } from '@/lib/format';
import { Container } from './Container';
import { Year } from './Year';
import { COMPANY_NAME, COMPANY_NUMBER, COMPANY_ADDRESS, COMPANY_JURISDICTION, legalDocuments } from '@/lib/legal';
import { AcceptedCards } from './AcceptedCards';
import { Brand } from './Brand';
import './footer-wordmark.css';

export function Footer() {
  return (
    <footer className="site-footer">
      <Container>
        <div className="site-footer-main">
          <div className="site-footer-intro">
            <Link href="/" aria-label="Portable digital home" className="site-footer-brand">
              <Brand />
            </Link>
            <p>
              Product engineering, infrastructure<br className="hidden sm:block" /> and support for growing teams.
            </p>
            <Link href="/contact" className="site-footer-contact">
              Let’s build something <span aria-hidden="true">↗</span>
            </Link>
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
            <ul>
              {legalDocuments.map((document) => (
                <li key={document.slug}>
                  <Link href={`/legal/${document.slug}`}>{document.title}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="site-footer-bottom">
          <div className="site-footer-company">
            <p className="site-footer-company-name">{COMPANY_NAME}</p>
            <p>Company No. {COMPANY_NUMBER} <span className="site-footer-divider" aria-hidden="true">·</span> Registered in {COMPANY_JURISDICTION}</p>
            <address><span className="site-footer-address-label">Registered office</span>{COMPANY_ADDRESS}</address>
          </div>
          <div className="site-footer-meta">
            <AcceptedCards className="site-footer-payments" />
            <p>© <Year /> {COMPANY_NAME}. All rights reserved.</p>
          </div>
        </div>
      </Container>
      
      <div className="site-footer-wordmark" aria-hidden="true">
        <span>Portable</span>
      </div>
    </footer>
  );
}