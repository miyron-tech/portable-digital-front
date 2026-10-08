'use client';

import { Container } from '@/components/Container';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container className="py-32 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-3 text-muted">We could not load this page. Please try again.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-fg"
      >
        Try again
      </button>
    </Container>
  );
}
