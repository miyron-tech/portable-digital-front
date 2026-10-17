'use client';
import Link from 'next/link';
import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { useSelection } from './SelectionProvider';

export function SelectionLink({ onNavigate }: { onNavigate?: () => void }) {
  return <Suspense fallback={<Link href="/selection" className="selection-link"><span className="selection-link-full">Selected services</span><span className="selection-link-short">Selection</span></Link>}><SelectionNavigation onNavigate={onNavigate} /></Suspense>;
}

function SelectionNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const { selection, loading, error } = useSelection();
  const pathname = usePathname();
  const count = selection?.items.length ?? 0;
  return <Link href="/selection" className="selection-link" onClick={onNavigate}
    aria-current={pathname === '/selection' ? 'page' : undefined}
    aria-label={`Selected services${loading ? ', loading' : error ? ', unavailable' : `, ${count}`}`}>
    <span className="selection-link-full">Selected services</span><span className="selection-link-short">Selection</span>
    {count > 0 && <span className="selection-count" aria-live="polite">{count}</span>}
  </Link>;
}
