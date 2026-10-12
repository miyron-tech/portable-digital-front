import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/Container';
import { COMPANY_NAME, LEGAL_VERSION, legalDocuments } from '@/lib/legal';

export function generateStaticParams() {
  return legalDocuments.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const document = legalDocuments.find((item) => item.slug === slug);
  if (!document) notFound();
  return { title: document.title, description: document.description, alternates: { canonical: `/legal/${slug}` }, robots: { index: false, follow: true } };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const document = legalDocuments.find((item) => item.slug === slug);
  if (!document) notFound();
  return (
    <Container className="py-12 sm:py-20">
      <div className="mb-10 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">{COMPANY_NAME} · Legal</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{document.title}</h1>
        <p className="mt-5 text-lg text-muted">{document.description}</p>
        <p className="mt-4 text-sm text-muted">Draft version · {LEGAL_VERSION}</p>
        <p className="mt-6 rounded-xl border border-line bg-surface p-5 text-sm leading-6 text-muted" role="note">Draft for review. Company address, direct contact details and operational arrangements are being verified. These documents are not yet final terms for live paid services. Your mandatory legal rights are unaffected.</p>
      </div>
      <div className="grid items-start gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
        <aside className="rounded-xl border border-line p-5 lg:sticky lg:top-24">
          <nav aria-label="Legal documents" className="flex flex-col gap-3 text-sm">
            {legalDocuments.map((item) => <Link key={item.slug} href={`/legal/${item.slug}`} aria-current={item.slug === slug ? 'page' : undefined} className={item.slug === slug ? 'font-semibold text-fg' : 'text-muted hover:text-fg'}>{item.title}</Link>)}
          </nav>
          <a href="#contents" className="mt-6 block border-t border-line pt-4 text-sm text-muted hover:text-fg">On this page ↓</a>
        </aside>
        <article className="min-w-0 max-w-3xl">
          <nav id="contents" aria-label="On this page" className="mb-10 border-b border-line pb-8">
            <h2 className="text-sm font-semibold">Contents</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted">
              {document.sections.map((section, index) => <li key={section.title}><a href={`#section-${index + 1}`} className="hover:text-fg">{section.title}</a></li>)}
            </ol>
          </nav>
          {document.sections.map((section, index) => <section key={section.title} id={`section-${index + 1}`} className="mb-10 scroll-mt-24">
            <h2 className="mb-4 text-xl font-semibold tracking-tight">{index + 1}. {section.title}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-4 leading-7 text-muted">{paragraph}</p>)}
          </section>)}
          <div className="flex flex-wrap gap-5 border-t border-line pt-6 text-sm">
            <Link href="/contact" className="underline underline-offset-4">Contact us</Link>
            {slug === 'company-details' && <a href="https://find-and-update.company-information.service.gov.uk/company/16974578" className="underline underline-offset-4">Companies House record ↗</a>}
            {slug === 'privacy-policy' && <a href="https://ico.org.uk/make-a-complaint/" className="underline underline-offset-4">Contact the ICO ↗</a>}
          </div>
        </article>
      </div>
    </Container>
  );
}
