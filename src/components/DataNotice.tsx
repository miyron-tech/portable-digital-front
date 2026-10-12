import Link from 'next/link';
import type { ReactNode } from 'react';
import { COMPANY_NAME, COMPANY_NUMBER } from '@/lib/legal';

/**
 * Пояснение у формы, собирающей персональные данные: кто продавец, что берём,
 * зачем, и ссылка на политику. Продавец подставляется из `legal.ts`, чтобы у
 * всех форм он был один и тот же.
 */
export function DataNotice({
  data,
  purpose,
  children,
  className = 'store-muted text-sm',
}: {
  data: string;
  purpose: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <p className={className}>
      {COMPANY_NAME} (company no. {COMPANY_NUMBER}) collects {data} to {purpose}. See our{' '}
      <Link href="/legal/privacy-policy" className="underline underline-offset-4">Privacy Policy</Link>
      {children ?? '.'}
    </p>
  );
}
