import type { Metadata } from 'next';
import { Container } from '@/components/Container';
import { LeadForm } from '@/components/LeadForm';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Describe your project and get a scope and price estimate within one business day.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <Container className="grid gap-12 py-16 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Tell us about your project</h1>
        <p className="mt-4 text-muted">
          A few sentences are enough. We read every request ourselves and come back with questions, a suggested scope
          and a price — usually within one business day.
        </p>
        <ul className="mt-8 space-y-3 text-sm text-muted">
          <li>• No obligation and no sales calls unless you ask for one.</li>
          <li>• Attach briefs, mockups or specs — PDF, images, docs, up to 5 files.</li>
          <li>• NDA available on request.</li>
        </ul>
      </div>
      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
        <LeadForm />
      </div>
    </Container>
  );
}
